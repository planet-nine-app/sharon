#!/usr/bin/env node

/**
 * Serve Store - Lightweight HTTP server for existing .store directory
 *
 * Usage: node serve-store.js [artifact-path] [--port 8080]
 *
 * This script serves an already-generated .store directory without
 * regenerating feeds. Use this to restart the server after running
 * make-store.js.
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function startServer(artifactPath, port = 8080) {
  const storeDir = path.join(artifactPath, '.store');
  const feedsDir = path.join(storeDir, 'feeds');

  // Check if .store directory exists
  if (!fs.existsSync(storeDir)) {
    console.error('❌ Error: .store directory not found!');
    console.error('   Run make-store.js first to generate feeds.');
    process.exit(1);
  }

  // Load index.html
  let indexHTML = '';
  const indexPath = path.join(storeDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    indexHTML = fs.readFileSync(indexPath, 'utf8');
  } else {
    console.warn('⚠️  Warning: index.html not found, serving simple page');
    indexHTML = '<html><body><h1>Store</h1><p>Feeds available at /feeds/</p></body></html>';
  }

  // Scan for artifacts (needed for serving files)
  const artifacts = {
    books: [],
    music: [],
    posts: []
  };

  function scanDirectory(dir, type) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, type);
      } else {
        artifacts[type].push(fullPath);
      }
    }
  }

  // Scan artifact directory
  scanDirectory(artifactPath, 'books');
  scanDirectory(artifactPath, 'music');
  scanDirectory(artifactPath, 'posts');

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

    // Serve artifacts by type prefix (/books/, /music/, /posts/)
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

    // Serve arbitrary paths (for nested directories like "/Artist Name Album Name/track.m4a")
    // This handles Canimus feed URLs with full directory paths
    const decodedPath = decodeURIComponent(url);
    const fullPath = path.join(artifactPath, decodedPath);

    // Security check: ensure the path is within artifactPath
    const resolvedPath = path.resolve(fullPath);
    const resolvedArtifactPath = path.resolve(artifactPath);

    if (resolvedPath.startsWith(resolvedArtifactPath) && fs.existsSync(resolvedPath)) {
      const stat = fs.statSync(resolvedPath);

      // Only serve files, not directories
      if (stat.isFile()) {
        const ext = path.extname(resolvedPath).toLowerCase();

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

        const stream = fs.createReadStream(resolvedPath);
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
    console.log('🎉 Store Server Running!');
    console.log('==================================\n');
    console.log(`Store URL: http://localhost:${port}`);
    console.log(`\nFeeds available at:`);
    if (fs.existsSync(path.join(feedsDir, 'libris-feed.json'))) {
      console.log(`  📚 Books: http://localhost:${port}/feeds/libris-feed.json`);
    }
    if (fs.existsSync(path.join(feedsDir, 'scribus-feed.json'))) {
      console.log(`  ✍️  Posts: http://localhost:${port}/feeds/scribus-feed.json`);
    }
    if (fs.existsSync(path.join(feedsDir, 'canimus-feed.json'))) {
      console.log(`  🎵 Music: http://localhost:${port}/feeds/canimus-feed.json`);
    }
    console.log(`\nPress Ctrl+C to stop the server\n`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });
}

// CLI
const args = process.argv.slice(2);
const artifactPath = args[0] || '.';
let port = 8080;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port') {
    port = parseInt(args[i + 1]);
  }
}

startServer(path.resolve(artifactPath), port);
