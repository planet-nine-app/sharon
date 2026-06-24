# Blogs Plugin Tests

Integration tests for `wiki-plugin-blogs` - the distributed blog platform for federated wiki using the Caniblog feed specification.

## Overview

Blogs allows users to publish blog posts through Federated Wiki. The plugin:

- Manages its own Sanora user account
- Converts Markdown ↔ HTML
- Sanitizes HTML for XSS protection
- Calculates reading time and word count
- Generates URL slugs
- Uploads posts to Sanora as products
- Generates Caniblog-compliant blog feeds
- Proxies requests to Sanora service

## Test Coverage

### 1. Plugin Initialization ✅
- Plugin loaded and available
- Sanora credentials configured
- Endpoints registered

### 2. Feed Retrieval ✅
- Empty feed returns correctly
- Feed structure validation
- Post listing

### 3. Sanora Integration ✅
- Proxy routes working
- Service communication
- Error handling

### 4. Feed Validation ✅
- Caniblog feed structure
- Post metadata
- JSON compliance

### 5. Content Processing ✅
- Markdown to HTML conversion
- HTML to Markdown conversion
- HTML sanitization (XSS protection)

### 6. Metadata Calculation ✅
- Reading time (200 WPM)
- Word count
- URL slug generation

### 7. Error Handling ✅
- Authentication requirements
- Required field validation
- Content sanitization

## Running Tests

```bash
# From sharon directory
npm run test:blogs

# Or with custom ports
WIKI_PORT=3000 SANORA_PORT=7243 npm run test:blogs

# With wiki proxy (test-wiki environment)
WIKI_PORT=5124 npm run test:blogs
```

## Test Requirements

### Services Running
- Federated Wiki with blogs plugin installed
- Sanora service (port 7243)

### Environment Variables
- `WIKI_PORT` - Wiki server port (default: 3000)
- `SANORA_PORT` - Sanora service port (default: 7243)

## Caniblog Feed Specification

Blogs follows the Caniblog (Scribus) specification:

- **Feed Format**: JSON
- **Content Formats**: Markdown, HTML
- **Metadata Fields**: title, author, summary, published-date, reading-time, tags
- **Content Storage**: HTML, Markdown, and plain text versions

## Plugin Endpoints

### POST `/plugin/blogs/publish`
Publish blog post (requires authentication)

**Request:**
```json
{
  "title": "Post Title",
  "author": "Author Name",
  "content": "# Post Content\n\nWrite here...",
  "format": "markdown",
  "tags": "tag1, tag2, tag3",
  "summary": "Brief summary",
  "visibility": "public",
  "price": 0
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": "product_id",
    "title": "Post Title",
    "slug": "post-title",
    "author": "Author Name",
    "readingTime": "5 min",
    "wordCount": 1247,
    "tags": ["tag1", "tag2"],
    "published": "2026-02-05T12:00:00Z"
  }
}
```

### GET `/plugin/blogs/feed`
Get all published posts

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "type": "post",
      "title": "Post Title",
      "authors": [{"name": "Author Name"}],
      "published-date": "2026-02-05T12:00:00Z",
      "summary": "Brief summary",
      "reading-time": "5 min"
    }
  ]
}
```

### Proxy Routes
- `/plugin/blogs/sanora/*` → Sanora service

## Content Processing

### Markdown Support
- Headers (#, ##, ###)
- Bold (**text**)
- Italic (*text*)
- Links ([text](url))
- Code blocks (```)
- Lists (-, 1.)
- Images (![alt](url))

### HTML Sanitization
Blocks dangerous tags:
- `<script>`
- `<iframe>`
- `onclick=`
- `onerror=`
- `javascript:` URLs

### Reading Time Calculation
- Standard: 200 words per minute
- Rounds up to nearest minute
- Example: 400 words = 2 min

### URL Slug Generation
- Lowercase conversion
- Special character removal
- Space to hyphen
- Multiple hyphen collapse
- Max 100 characters

## Future Test Coverage

- [ ] Actual post publishing tests (requires auth setup)
- [ ] Markdown rendering validation
- [ ] HTML sanitization edge cases
- [ ] Draft auto-save functionality
- [ ] Post scheduling
- [ ] Image upload and embedding
- [ ] Tag management
- [ ] Category support
- [ ] Series/collections
- [ ] Comments integration
- [ ] Cross-plugin federation tests

## Related Documentation

- [Plugin CLAUDE.md](../../../third-party/wiki-plugin-blogs/CLAUDE.md)
- [Caniblog Specification](../../../allyabase/specs/caniblog.md)
- [Sanora Integration](../../../sanora/CLAUDE.md)

---

**Part of The Advancement** - Rebuilding platforms for communities 💚
