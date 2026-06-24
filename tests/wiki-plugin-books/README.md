# Books Plugin Tests

Integration tests for `wiki-plugin-books` - the distributed book platform for federated wiki using the Canipub feed specification.

## Overview

Books allows users to upload ebooks (EPUB, PDF, MOBI) through Federated Wiki. The plugin:

- Manages its own Sanora user account
- Extracts metadata from EPUB and PDF files
- Uploads books to Sanora as products
- Generates Canipub-compliant book feeds
- Proxies requests to Sanora service

## Test Coverage

### 1. Plugin Initialization ✅
- Plugin loaded and available
- Sanora credentials configured
- Endpoints registered

### 2. Library Retrieval ✅
- Empty library returns correctly
- Feed structure validation
- Book listing

### 3. Sanora Integration ✅
- Proxy routes working
- Service communication
- Error handling

### 4. Feed Validation ✅
- Canipub feed structure
- Book metadata
- JSON compliance

### 5. Metadata Extraction ✅
- EPUB metadata fields
- PDF metadata fields
- Fallback handling

### 6. Error Handling ✅
- Authentication requirements
- Missing file handling
- Invalid file format

### 7. File Format Support ✅
- EPUB support
- PDF support
- MOBI/AZW support
- MIME type detection

## Running Tests

```bash
# From sharon directory
npm run test:books

# Or with custom ports
WIKI_PORT=3000 SANORA_PORT=7243 npm run test:books

# With wiki proxy (test-wiki environment)
WIKI_PORT=5124 npm run test:books
```

## Test Requirements

### Services Running
- Federated Wiki with books plugin installed
- Sanora service (port 7243)

### Environment Variables
- `WIKI_PORT` - Wiki server port (default: 3000)
- `SANORA_PORT` - Sanora service port (default: 7243)

## Canipub Feed Specification

Books follows the Canipub (Libris) specification:

- **Feed Format**: JSON
- **File Formats**: EPUB, PDF, MOBI, AZW, AZW3
- **Metadata Fields**: title, author, isbn, pageCount, publisher
- **Content Type**: application/epub+zip, application/pdf, etc.

## Plugin Endpoints

### POST `/plugin/books/upload`
Upload book file (requires authentication)

**Request:**
- Content-Type: multipart/form-data
- Field: `book` (file)
- Optional: title, author, isbn, description, price

**Response:**
```json
{
  "success": true,
  "book": {
    "id": "product_id",
    "title": "Book Title",
    "author": "Author Name",
    "format": "epub",
    "isbn": "9781234567890",
    "pageCount": 352,
    "url": "...",
    "uploaded": "2026-02-05T12:00:00Z"
  }
}
```

### GET `/plugin/books/library`
Get all uploaded books

**Response:**
```json
{
  "success": true,
  "books": [
    {
      "type": "book",
      "name": "Book Title",
      "authors": [{"name": "Author Name"}],
      "format": "ebook",
      "pageCount": 352
    }
  ]
}
```

### Proxy Routes
- `/plugin/books/sanora/*` → Sanora service

## Supported Formats

| Format | Extension | MIME Type | Metadata |
|--------|-----------|-----------|----------|
| EPUB | .epub | application/epub+zip | Full (title, author, isbn, publisher) |
| PDF | .pdf | application/pdf | Partial (title, author, pageCount) |
| MOBI | .mobi | application/x-mobipocket-ebook | Filename only |
| AZW | .azw, .azw3 | application/vnd.amazon.ebook | Filename only |

## Future Test Coverage

- [ ] Actual file upload tests (requires auth setup)
- [ ] EPUB parsing and validation
- [ ] PDF text extraction
- [ ] Cover image extraction
- [ ] Manual metadata override
- [ ] Multiple file formats in one test
- [ ] ISBN validation
- [ ] Cross-plugin federation tests
- [ ] Book collections/series

## Related Documentation

- [Plugin CLAUDE.md](../../../third-party/wiki-plugin-books/CLAUDE.md)
- [Canipub Specification](../../../allyabase/specs/canipub.md)
- [Sanora Integration](../../../sanora/CLAUDE.md)

---

**Part of The Advancement** - Rebuilding platforms for communities 💚
