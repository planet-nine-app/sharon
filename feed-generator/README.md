# Feed Generator

LLM-powered feed generator for digital artifacts. Automatically scans folders and generates feeds following modern syndication specifications.

## Supported Feed Types

- **Libris** (Books) - Based on Canimus specification
- **Scribus** (Blog Posts) - Based on Canimus specification
- **Canimus** (Music) - Original Canimus specification

## Installation

```bash
cd /Users/zachbabb/Work/planet-nine/tools/feed-generator
npm install
```

## Prerequisites

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY="your-api-key"
```

## Usage

Basic usage:

```bash
node generate-feed.js <folder> <type> [options]
```

### Types

- `books` - Generate Libris feed for books
- `posts` - Generate Scribus feed for blog posts
- `music` - Generate Canimus feed for music

### Options

- `--output <file>` - Output file (default: feed.json)
- `--name <name>` - Feed name (default: folder name)
- `--url <url>` - Feed URL
- `--base-url <url>` - Base URL for items

### Examples

Generate a book feed:

```bash
node generate-feed.js ./my-books books --output libris-feed.json --name "My Library"
```

Generate a blog feed:

```bash
node generate-feed.js ./blog-posts posts \\
  --output scribus-feed.json \\
  --name "My Blog" \\
  --url "https://example.com/feed.json" \\
  --base-url "https://example.com/posts"
```

Generate a music feed:

```bash
node generate-feed.js ./music music --output canimus-feed.json
```

## How It Works

1. **Scan** - Recursively scans the specified folder for relevant file types
2. **Extract** - Uses Claude AI to extract metadata from each file
3. **Generate** - Builds a valid feed JSON following the appropriate specification

## File Types

### Books
- `.epub`, `.pdf`, `.mobi`, `.azw3`, `.txt`, `.md`

### Blog Posts
- `.md`, `.html`, `.txt`

### Music
- `.mp3`, `.flac`, `.m4a`, `.ogg`, `.wav`

## Feed Specifications

- [Libris Specification](../../specs/libris.md)
- [Scribus Specification](../../specs/scribus.md)
- [Canimus Specification](https://github.com/PlaidWeb/Canimus)

## Integration

This tool can be integrated into base deploy scripts to automatically generate feeds from uploaded artifacts.

## License

MIT
