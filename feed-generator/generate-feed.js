#!/usr/bin/env node

/**
 * Feed Generator - LLM-powered feed generation for digital artifacts
 *
 * Scans a folder of digital artifacts (books, blog posts, music) and generates
 * feeds in the appropriate format (Libris, Scribus, or Canimus)
 *
 * Usage:
 *   node generate-feed.js <folder> <type> [--output feed.json]
 *
 * Types:
 *   - books (generates Libris feed)
 *   - posts (generates Scribus feed)
 *   - music (generates Canimus feed)
 */

import fs from 'fs/promises';
import path from 'path';
import { Anthropic } from '@anthropic-ai/sdk';

const SUPPORTED_TYPES = {
  books: 'libris',
  posts: 'scribus',
  music: 'canimus'
};

// File extensions to scan
const FILE_EXTENSIONS = {
  books: ['.epub', '.pdf', '.mobi', '.azw3', '.txt', '.md'],
  posts: ['.md', '.html', '.txt'],
  music: ['.mp3', '.flac', '.m4a', '.ogg', '.wav']
};

// Configuration
const config = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFilesPerBatch: 20
};

class FeedGenerator {
  constructor(apiKey) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async scanFolder(folderPath, type) {
    const extensions = FILE_EXTENSIONS[type];
    const files = [];

    async function scan(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            const stats = await fs.stat(fullPath);
            files.push({
              path: fullPath,
              name: entry.name,
              ext,
              size: stats.size,
              relativePath: path.relative(folderPath, fullPath)
            });
          }
        }
      }
    }

    await scan(folderPath);
    return files;
  }

  async extractMetadata(file, type) {
    // For small text files, read content
    let content = '';
    if (file.size < config.maxFileSize && ['.txt', '.md', '.html'].includes(file.ext)) {
      try {
        content = await fs.readFile(file.path, 'utf-8');
      } catch (err) {
        console.warn(`Could not read ${file.name}:`, err.message);
      }
    }

    const spec = SUPPORTED_TYPES[type];
    const specName = spec.charAt(0).toUpperCase() + spec.slice(1);

    const prompt = this.buildExtractionPrompt(type, file, content);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const jsonText = message.content[0].text;
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (err) {
      console.error(`Error extracting metadata from ${file.name}:`, err.message);
      return this.generateFallbackMetadata(file, type);
    }
  }

  buildExtractionPrompt(type, file, content) {
    const prompts = {
      books: `Extract book metadata from the following file and return ONLY a valid JSON object following the Libris specification.

File: ${file.name}
${content ? 'Content preview:\n' + content.substring(0, 2000) : 'Binary file'}

Return a JSON object with these fields:
{
  "type": "book",
  "name": "book title",
  "subtitle": "subtitle if any",
  "author": {
    "name": "author name"
  },
  "summary": "brief description",
  "genre": ["genre1", "genre2"],
  "language": "en",
  "isbn": "if found",
  "release-date": "YYYY-MM-DD if found"
}

Only respond with the JSON object, no explanation.`,

      posts: `Extract blog post metadata from the following file and return ONLY a valid JSON object following the Scribus specification.

File: ${file.name}
${content ? 'Content:\n' + content.substring(0, 2000) : 'Could not read file'}

Return a JSON object with these fields:
{
  "type": "post",
  "title": "post title",
  "subtitle": "subtitle if any",
  "author": {
    "name": "author name"
  },
  "summary": "brief description",
  "published-date": "YYYY-MM-DDTHH:mm:ssZ if found",
  "categories": ["category1"],
  "tags": ["tag1", "tag2"],
  "word-count": estimated word count,
  "language": "en"
}

Only respond with the JSON object, no explanation.`,

      music: `Extract music metadata from the following file and return ONLY a valid JSON object following the Canimus specification.

File: ${file.name}

Return a JSON object with these fields:
{
  "type": "track",
  "name": "track title",
  "artist": {
    "name": "artist name"
  },
  "album": {
    "name": "album name" if found
  },
  "genre": ["genre1"],
  "duration": estimated duration in seconds,
  "track": track number if found
}

Only respond with the JSON object, no explanation.`
    };

    return prompts[type];
  }

  generateFallbackMetadata(file, type) {
    const baseName = path.basename(file.name, file.ext);

    const fallbacks = {
      books: {
        type: 'book',
        name: baseName,
        author: { name: 'Unknown' },
        language: 'en'
      },
      posts: {
        type: 'post',
        title: baseName,
        author: { name: 'Unknown' },
        language: 'en'
      },
      music: {
        type: 'track',
        name: baseName,
        artist: { name: 'Unknown' }
      }
    };

    return fallbacks[type];
  }

  async generateFeed(folderPath, type, options = {}) {
    const feedName = options.name || path.basename(folderPath);
    const feedUrl = options.url || `https://example.com/${SUPPORTED_TYPES[type]}.json`;

    console.log(`Scanning ${folderPath} for ${type}...`);
    const files = await this.scanFolder(folderPath, type);
    console.log(`Found ${files.length} files`);

    const items = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing ${i + 1}/${files.length}: ${file.name}`);

      const metadata = await this.extractMetadata(file, type);

      // Add file path information
      metadata.url = options.baseUrl
        ? `${options.baseUrl}/${file.relativePath}`
        : file.relativePath;

      items.push(metadata);

      // Rate limiting - pause between API calls
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const feed = {
      type: 'feed',
      name: feedName,
      url: feedUrl,
      links: [
        {
          rel: 'self',
          type: 'application/json',
          href: feedUrl
        },
        {
          rel: 'current',
          type: 'application/json',
          href: feedUrl
        }
      ],
      items
    };

    return feed;
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node generate-feed.js <folder> <type> [options]');
    console.error('Types: books, posts, music');
    console.error('Options:');
    console.error('  --output <file>     Output file (default: feed.json)');
    console.error('  --name <name>       Feed name');
    console.error('  --url <url>         Feed URL');
    console.error('  --base-url <url>    Base URL for items');
    process.exit(1);
  }

  const folderPath = args[0];
  const type = args[1];

  if (!SUPPORTED_TYPES[type]) {
    console.error(`Invalid type: ${type}`);
    console.error(`Supported types: ${Object.keys(SUPPORTED_TYPES).join(', ')}`);
    process.exit(1);
  }

  // Parse options
  const options = {};
  let outputFile = 'feed.json';

  for (let i = 2; i < args.length; i += 2) {
    const option = args[i];
    const value = args[i + 1];

    switch (option) {
      case '--output':
        outputFile = value;
        break;
      case '--name':
        options.name = value;
        break;
      case '--url':
        options.url = value;
        break;
      case '--base-url':
        options.baseUrl = value;
        break;
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable not set');
    process.exit(1);
  }

  try {
    const generator = new FeedGenerator(apiKey);
    const feed = await generator.generateFeed(folderPath, type, options);

    await fs.writeFile(outputFile, JSON.stringify(feed, null, 2));
    console.log(`\nFeed generated successfully: ${outputFile}`);
    console.log(`Total items: ${feed.items.length}`);
  } catch (err) {
    console.error('Error generating feed:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default FeedGenerator;
