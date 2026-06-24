# Wiki Plugin Testing Suite

Comprehensive integration tests for all Federated Wiki plugins in the Planet Nine ecosystem.

## Overview

The Planet Nine ecosystem includes four distributed content plugins for Federated Wiki:

| Plugin | Purpose | Feed Spec | Port | Status |
|--------|---------|-----------|------|--------|
| **mutopia** | Music distribution | Canimus (RSS) | 6030 | ✅ Tested |
| **books** | Ebook publishing | Canipub (JSON) | 6040 | ✅ Tested |
| **blogs** | Blog posts | Caniblog (JSON) | 6050 | ✅ Tested |
| **recipes** | Recipe sharing | Canicook (JSON) | 6060 | ✅ Tested |

All plugins follow the **Service-Bundling Plugin Pattern** and integrate with Sanora for content storage.

## Quick Start

### Run All Plugin Tests

```bash
cd sharon
npm run test:wiki-plugins
```

### Run Individual Plugin Tests

```bash
# Music plugin (Mutopia)
npm run test:mutopia

# Books plugin
npm run test:books

# Blogs plugin
npm run test:blogs

# Recipes plugin
npm run test:recipes
```

## Test Environment

### Requirements

1. **Federated Wiki** running with plugins installed
2. **Sanora** service (port 7243) for content storage
3. **Node.js** 18+ with ES modules support

### Environment Variables

```bash
# Wiki server port (default: 3000)
export WIKI_PORT=3000

# Sanora service port (default: 7243)
export SANORA_PORT=7243
```

### With Wiki Proxy (Test Environment)

```bash
# Test against Base 1 (port 5124)
WIKI_PORT=5124 npm run test:mutopia

# Test against Base 2 (port 5224)
WIKI_PORT=5224 npm run test:books

# Test against Base 3 (port 5324)
WIKI_PORT=5324 npm run test:blogs
```

## Test Coverage

Each plugin test suite includes:

### ✅ Plugin Initialization
- Plugin loaded and available
- Sanora credentials configured
- Endpoints registered correctly

### ✅ Content Retrieval
- Empty library/feed returns correctly
- Feed structure validation
- Content listing

### ✅ Sanora Integration
- Proxy routes working
- Service communication
- Error handling

### ✅ Feed Specification Validation
- Canimus (Mutopia) - RSS feed structure
- Canipub (Books) - JSON book metadata
- Caniblog (Blogs) - JSON post format
- Canicook (Recipes) - JSON recipe structure

### ✅ Content Processing
- **Mutopia**: ZIP archive parsing, RSS feed extraction
- **Books**: EPUB/PDF metadata extraction
- **Blogs**: Markdown ↔ HTML conversion, XSS protection
- **Recipes**: Ingredient parsing, ISO 8601 duration formatting

### ✅ Error Handling
- Authentication requirements
- Missing file/content validation
- Invalid format handling
- Service unavailability

## Plugin-Specific Features

### Mutopia (Music)

**Tested Features:**
- Canimus archive upload (ZIP with RSS + audio files)
- Audio format support (MP3, M4A, OGG, FLAC, WAV)
- RSS feed parsing with iTunes extensions
- Track metadata extraction
- Album grouping

**Endpoints:**
- `POST /plugin/mutopia/upload` - Upload archive
- `GET /plugin/mutopia/library` - List music
- `/plugin/mutopia/sanora/*` - Proxy to Sanora
- `/plugin/mutopia/dolores/*` - Proxy to Dolores

**Test File:** `tests/wiki-plugin-mutopia/mutopia-integration.test.js`

### Books

**Tested Features:**
- EPUB metadata extraction (title, author, ISBN, publisher)
- PDF metadata extraction (title, author, page count)
- MOBI/AZW format support
- MIME type detection
- File format validation

**Endpoints:**
- `POST /plugin/books/upload` - Upload book
- `GET /plugin/books/library` - List books
- `/plugin/books/sanora/*` - Proxy to Sanora

**Test File:** `tests/wiki-plugin-books/books-integration.test.js`

### Blogs

**Tested Features:**
- Markdown to HTML conversion (marked library)
- HTML to Markdown conversion (turndown library)
- HTML sanitization (XSS protection)
- Reading time calculation (200 WPM)
- URL slug generation
- Word count

**Endpoints:**
- `POST /plugin/blogs/publish` - Publish post
- `GET /plugin/blogs/feed` - List posts
- `/plugin/blogs/sanora/*` - Proxy to Sanora

**Test File:** `tests/wiki-plugin-blogs/blogs-integration.test.js`

### Recipes

**Tested Features:**
- Ingredient text parsing
- Instruction formatting
- ISO 8601 duration formatting (PT15M, PT1H30M)
- Duration calculation (prep + cook = total)
- Difficulty levels (easy, medium, hard)
- Cuisine and course types

**Endpoints:**
- `POST /plugin/recipes/publish` - Publish recipe
- `GET /plugin/recipes/feed` - List recipes
- `/plugin/recipes/sanora/*` - Proxy to Sanora

**Test File:** `tests/wiki-plugin-recipes/recipes-integration.test.js`

## Test Output

Each test suite provides detailed console output:

```
Wiki Plugin: Mutopia (Music)
  1. Plugin Initialization
    📡 Testing plugin availability...
    ✅ Mutopia plugin is loaded
    ✅ Plugin credentials configured

  2. Library Retrieval
    📚 Fetching library...
    ✅ Library has 0 tracks

  3. Sanora Integration
    🔗 Testing Sanora proxy...
    ✅ Sanora proxy working

  4. Feed Validation
    📡 Checking Canimus feed format...
    ℹ️  No tracks to validate (empty library)

  5. Error Handling
    🔒 Testing authentication...
    ✅ Authentication required for uploads

  6. Archive Processing
    🎵 Validating Canimus archive requirements...
    ✅ Archive format requirements validated
```

## Future Enhancements

### Upload Testing (Requires Auth)
- [ ] Actual file upload with authentication
- [ ] Multiple file uploads
- [ ] Large file handling
- [ ] Concurrent uploads

### Federation Testing
- [ ] Cross-plugin content discovery
- [ ] Federated feed subscriptions
- [ ] Content syndication
- [ ] Emojicodes for federation

### Advanced Features
- [ ] Content versioning
- [ ] Draft management
- [ ] Collections/playlists
- [ ] Search and filtering
- [ ] Social features (comments, likes)

## Architecture

### Service-Bundling Plugin Pattern

All plugins follow this pattern:

```
wiki-plugin-{name}/
├── client/
│   └── {name}.js        # SVG-based UI
├── server/
│   └── server.js        # Express middleware
├── package.json
├── index.js             # Plugin entry
├── factory.json         # Wiki plugin metadata
└── .{name}-credentials.json  # Sanora credentials (git-ignored)
```

### Integration Flow

```
User → Wiki UI → Plugin Client (SVG)
                      ↓
                 HTTP Request
                      ↓
         Plugin Server (Express middleware)
                      ↓
              Sanora API (products)
                      ↓
               BDO (storage)
```

### Feed Generation

```
GET /plugin/{name}/library
         ↓
Query Sanora feed endpoint
         ↓
GET /feeds/{type}/{uuid}
         ↓
Filter products by category
         ↓
Convert to feed spec format
         ↓
Return JSON/RSS feed
```

## Related Documentation

### Plugin Documentation
- [Mutopia CLAUDE.md](../../third-party/wiki-plugin-mutopia/CLAUDE.md)
- [Books CLAUDE.md](../../third-party/wiki-plugin-books/CLAUDE.md)
- [Blogs CLAUDE.md](../../third-party/wiki-plugin-blogs/CLAUDE.md)
- [Recipes CLAUDE.md](../../third-party/wiki-plugin-recipes/CLAUDE.md)

### Feed Specifications
- [Canimus (Music)](../../allyabase/specs/canimus.md)
- [Canipub (Books)](../../allyabase/specs/canipub.md)
- [Caniblog (Blogs)](../../allyabase/specs/caniblog.md)
- [Canicook (Recipes)](../../allyabase/specs/canicook.md)

### Service Documentation
- [Sanora (Products)](../../sanora/CLAUDE.md)
- [BDO (Storage)](../../bdo/CLAUDE.md)
- [Federated Wiki](../../third-party/wiki/README.md)

## Continuous Integration

### GitHub Actions

```yaml
name: Wiki Plugin Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:wiki-plugins
```

### Local CI

```bash
# Run all tests
./test-wiki-plugins.sh

# Run with coverage
npm run test:wiki-plugins --coverage
```

## Contributing

To add tests for a new plugin:

1. Create test directory: `tests/wiki-plugin-{name}/`
2. Create test file: `{name}-integration.test.js`
3. Create README: `README.md`
4. Add npm script to `package.json`
5. Update this document

---

**Part of The Advancement** - Rebuilding platforms for communities 💚

**Last Updated:** February 5, 2026
