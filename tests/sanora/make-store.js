#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function scanArtifacts(artifactPath) {
  console.log(`\n📁 Scanning for artifacts in: ${artifactPath}`);

  const artifacts = {
    books: [],
    music: [],
    posts: []
  };

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(fullPath);
        }
      } else {
        const ext = path.extname(file).toLowerCase();

        // Books
        if (['.epub', '.pdf', '.mobi', '.azw3'].includes(ext)) {
          artifacts.books.push(fullPath);
        }
        // Music
        else if (['.mp3', '.flac', '.m4a', '.ogg', '.wav'].includes(ext)) {
          artifacts.music.push(fullPath);
        }
        // Blog posts
        else if (['.md', '.html'].includes(ext)) {
          // Exclude README files
          if (!file.toLowerCase().includes('readme')) {
            artifacts.posts.push(fullPath);
          }
        }
      }
    }
  }

  scanDirectory(artifactPath);

  console.log(`  ✅ Found ${artifacts.books.length} books`);
  console.log(`  ✅ Found ${artifacts.music.length} music files`);
  console.log(`  ✅ Found ${artifacts.posts.length} blog posts`);

  return artifacts;
}

async function generateFeeds(artifacts, storeName, artifactPath) {
  console.log('\n📚 Generating feeds...');

  const feedGeneratorPath = path.join(__dirname, '../../feed-generator');
  const storeDir = path.join(artifactPath, '.store');
  const feedsDir = path.join(storeDir, 'feeds');

  // Create .store directory
  fs.mkdirSync(feedsDir, { recursive: true });

  const feeds = {};

  // Generate books feed
  if (artifacts.books.length > 0) {
    console.log('  📖 Generating Libris feed for books...');
    const outputPath = path.join(feedsDir, 'libris-feed.json');

    // Create temporary directory with books
    const tempBooksDir = path.join(storeDir, 'temp-books');
    fs.mkdirSync(tempBooksDir, { recursive: true });

    for (const book of artifacts.books) {
      fs.copyFileSync(book, path.join(tempBooksDir, path.basename(book)));
    }

    execSync(
      `node ${feedGeneratorPath}/generate-feed.js ${tempBooksDir} books --output ${outputPath} --name "${storeName} Books" --base-url "http://localhost:8080/books"`,
      { stdio: 'inherit' }
    );

    feeds.books = 'libris-feed.json';

    // Cleanup temp directory
    fs.rmSync(tempBooksDir, { recursive: true, force: true });
  }

  // Generate posts feed
  if (artifacts.posts.length > 0) {
    console.log('  📝 Generating Scribus feed for blog posts...');
    const outputPath = path.join(feedsDir, 'scribus-feed.json');

    const tempPostsDir = path.join(storeDir, 'temp-posts');
    fs.mkdirSync(tempPostsDir, { recursive: true });

    for (const post of artifacts.posts) {
      fs.copyFileSync(post, path.join(tempPostsDir, path.basename(post)));
    }

    execSync(
      `node ${feedGeneratorPath}/generate-feed.js ${tempPostsDir} posts --output ${outputPath} --name "${storeName} Blog" --base-url "http://localhost:8080/posts"`,
      { stdio: 'inherit' }
    );

    feeds.posts = 'scribus-feed.json';

    fs.rmSync(tempPostsDir, { recursive: true, force: true });
  }

  // Generate music feed
  if (artifacts.music.length > 0) {
    console.log('  🎵 Generating Canimus feed for music...');
    const outputPath = path.join(feedsDir, 'canimus-feed.json');

    const tempMusicDir = path.join(storeDir, 'temp-music');
    fs.mkdirSync(tempMusicDir, { recursive: true });

    for (const track of artifacts.music) {
      fs.copyFileSync(track, path.join(tempMusicDir, path.basename(track)));
    }

    execSync(
      `node ${feedGeneratorPath}/generate-feed.js ${tempMusicDir} music --output ${outputPath} --name "${storeName} Music" --base-url "http://localhost:8080/music"`,
      { stdio: 'inherit' }
    );

    feeds.music = 'canimus-feed.json';

    fs.rmSync(tempMusicDir, { recursive: true, force: true });
  }

  console.log('  ✅ Feeds generated successfully');
  return feeds;
}

function createStoreHTML(storeName, feeds, artifacts) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${storeName} - Planet Nine Store</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a0033 0%, #2d1b4e 100%);
      color: #7fff7f;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 48px;
      margin-bottom: 10px;
      text-align: center;
      text-shadow: 0 0 20px #7fff7f;
    }

    .subtitle {
      text-align: center;
      font-size: 18px;
      margin-bottom: 40px;
      opacity: 0.8;
    }

    .feeds-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 60px;
    }

    .feed-card {
      background: rgba(125, 255, 125, 0.1);
      border: 2px solid #7fff7f;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .feed-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(125, 255, 125, 0.3);
    }

    .feed-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .feed-title {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .feed-count {
      font-size: 16px;
      margin-bottom: 20px;
      opacity: 0.7;
    }

    .feed-link {
      display: inline-block;
      background: #7fff7f;
      color: #1a0033;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .feed-link:hover {
      background: #9fffaf;
      transform: scale(1.05);
    }

    .info-section {
      background: rgba(125, 255, 125, 0.05);
      border: 1px solid rgba(125, 255, 125, 0.3);
      border-radius: 12px;
      padding: 30px;
      margin-top: 40px;
    }

    .info-section h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }

    .info-section p {
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .info-section code {
      background: rgba(125, 255, 125, 0.2);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    footer {
      text-align: center;
      margin-top: 60px;
      opacity: 0.6;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${storeName}</h1>
    <div class="subtitle">Privacy-First Digital Artifact Store</div>

    <div class="feeds-grid">
      ${feeds.books ? `
      <div class="feed-card">
        <div class="feed-icon">📚</div>
        <div class="feed-title">Books</div>
        <div class="feed-count">${artifacts.books.length} items</div>
        <a href="/feeds/${feeds.books}" class="feed-link">📡 Subscribe</a>
      </div>
      ` : ''}

      ${feeds.posts ? `
      <div class="feed-card">
        <div class="feed-icon">✍️</div>
        <div class="feed-title">Blog Posts</div>
        <div class="feed-count">${artifacts.posts.length} items</div>
        <a href="/feeds/${feeds.posts}" class="feed-link">📡 Subscribe</a>
      </div>
      ` : ''}

      ${feeds.music ? `
      <div class="feed-card">
        <div class="feed-icon">🎵</div>
        <div class="feed-title">Music</div>
        <div class="feed-count">${artifacts.music.length} items</div>
        <a href="/feeds/${feeds.music}" class="feed-link">📡 Subscribe</a>
      </div>
      ` : ''}
    </div>

    <div class="info-section">
      <h2>About This Store</h2>
      <p>
        This is a local Planet Nine store serving federated feeds for digital artifacts.
        All feeds follow modern syndication specifications (Libris for books, Scribus for posts, Canimus for music).
      </p>
      <p>
        <strong>Feed URLs:</strong><br>
        ${feeds.books ? `• Books (Libris): <code>http://localhost:8080/feeds/${feeds.books}</code><br>` : ''}
        ${feeds.posts ? `• Posts (Scribus): <code>http://localhost:8080/feeds/${feeds.posts}</code><br>` : ''}
        ${feeds.music ? `• Music (Canimus): <code>http://localhost:8080/feeds/${feeds.music}</code><br>` : ''}
      </p>
      <p>
        <strong>To deploy this store to Digital Ocean:</strong><br>
        <code>node deploy-store.js ${storeName} . --project allyabase</code>
      </p>
    </div>

    <footer>
      Powered by Planet Nine 🌍💚
    </footer>
  </div>
</body>
</html>`;
}

function startServer(artifactPath, storeName, feeds, artifacts, port = 8080) {
  const storeDir = path.join(artifactPath, '.store');
  const feedsDir = path.join(storeDir, 'feeds');

  // Create index.html
  const indexHTML = createStoreHTML(storeName, feeds, artifacts);
  fs.writeFileSync(path.join(storeDir, 'index.html'), indexHTML);

  const server = http.createServer((req, res) => {
    const url = req.url;

    // Serve index page
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(indexHTML);
      return;
    }

    // Serve feeds
    if (url.startsWith('/feeds/')) {
      const feedFile = url.replace('/feeds/', '');
      const feedPath = path.join(feedsDir, feedFile);

      if (fs.existsSync(feedPath)) {
        const feedData = fs.readFileSync(feedPath, 'utf8');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(feedData);
        return;
      }
    }

    // Serve artifacts
    if (url.startsWith('/books/') || url.startsWith('/music/') || url.startsWith('/posts/')) {
      const [, type, filename] = url.split('/');
      const artifactList = artifacts[type] || [];
      const artifact = artifactList.find(a => path.basename(a) === filename);

      if (artifact && fs.existsSync(artifact)) {
        const stat = fs.statSync(artifact);
        const ext = path.extname(artifact).toLowerCase();

        // Determine content type
        const contentTypes = {
          '.epub': 'application/epub+zip',
          '.pdf': 'application/pdf',
          '.mobi': 'application/x-mobipocket-ebook',
          '.mp3': 'audio/mpeg',
          '.flac': 'audio/flac',
          '.m4a': 'audio/mp4',
          '.ogg': 'audio/ogg',
          '.wav': 'audio/wav',
          '.md': 'text/markdown',
          '.html': 'text/html'
        };

        res.writeHead(200, {
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
          'Content-Length': stat.size,
          'Access-Control-Allow-Origin': '*'
        });

        const stream = fs.createReadStream(artifact);
        stream.pipe(res);
        return;
      }
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  server.listen(port, () => {
    console.log('\n==================================');
    console.log('🎉 Local Store Running!');
    console.log('==================================\n');
    console.log(`Store URL: http://localhost:${port}`);
    console.log(`\nFeed URLs:`);
    if (feeds.books) console.log(`  📚 Books: http://localhost:${port}/feeds/${feeds.books}`);
    if (feeds.posts) console.log(`  ✍️  Posts: http://localhost:${port}/feeds/${feeds.posts}`);
    if (feeds.music) console.log(`  🎵 Music: http://localhost:${port}/feeds/${feeds.music}`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down store server...');
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });
}

async function makeStore(storeName, artifactPath, options = {}) {
  try {
    console.log('\n==================================');
    console.log(`Creating Planet Nine Store: ${storeName}`);
    console.log('==================================\n');

    // Scan for artifacts
    const artifacts = await scanArtifacts(artifactPath);

    const totalArtifacts = artifacts.books.length + artifacts.music.length + artifacts.posts.length;
    if (totalArtifacts === 0) {
      throw new Error('No artifacts found! Make sure the directory contains .epub, .mp3, or .md files');
    }

    // Generate feeds
    const feeds = await generateFeeds(artifacts, storeName, artifactPath);

    // Start HTTP server
    const port = options.port || 8080;
    startServer(artifactPath, storeName, feeds, artifacts, port);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// CLI usage - ES module entry point check
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const storeName = process.argv[2];
  const artifactPath = process.argv[3] || '.';

  if (!storeName) {
    console.error('Usage: node make-store.js <store-name> [artifact-path] [options]');
    console.error('');
    console.error('Arguments:');
    console.error('  <store-name>      Name for your store');
    console.error('  [artifact-path]   Path to directory containing artifacts (default: current directory)');
    console.error('');
    console.error('Options:');
    console.error('  --port <p>  Port to run server on (default: 8080)');
    console.error('');
    console.error('Examples:');
    console.error('  node make-store.js my-bookstore');
    console.error('  node make-store.js music-shop ./albums --port 3000');
    console.error('');
    console.error('The store will be available at http://localhost:8080');
    process.exit(1);
  }

  const options = {};
  for (let i = 4; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--port') {
      options.port = parseInt(process.argv[++i]);
    }
  }

  makeStore(storeName, path.resolve(artifactPath), options);
}

export { makeStore };
