# Glyphenge Tests

## Overview

Tests for the Glyphenge service - Planet Nine's server-side SVG rendering and link tapestry service.

## Tests

### Linktree Import Test

**File**: `linktree-import.test.js`

Tests the complete flow of importing a Linktree page and creating a Glyphenge tapestry:

1. **Fetch Linktree Page**: Fetches https://linktr.ee/thefledgecollective
2. **Parse __NEXT_DATA__**: Extracts links from Next.js server-side rendered data
3. **Create Tapestry**: Sends links to Glyphenge POST /create endpoint
4. **Validate Response**: Verifies emojicode, BDO creation, and SVG generation
5. **Verify Public BDO**: Confirms tapestry is publicly accessible via emojicode

### What Gets Tested

✅ **Linktree Fetching**:
- HTTP request with proper User-Agent
- HTML parsing and __NEXT_DATA__ extraction
- Link structure validation

✅ **Glyphenge Integration**:
- POST /create endpoint
- SVG template selection (compact/grid/dense)
- BDO creation with sessionless keys
- Public BDO with emojicode
- Alphanumeric URL paths (/t/:uuid) for easy sharing

✅ **BDO Service Integration**:
- Public BDO creation
- Emojicode generation (8 emoji characters)
- SVG content storage
- Public access via /emoji/:emojicode

✅ **Tapestry Display**:
- Glyphenge URL rendering
- SVG content verification
- Link metadata preservation

## Running Tests

### Local Development (Default)
```bash
npm run test:glyphenge
```

### Docker Test Environment

**Step 1: Start Docker Environment**
```bash
cd allyabase/deployment/docker
./build-flexible.sh
./spin-up-bases.sh
node seed-ecosystem.js
node seed-sanora.js
```

**Step 2: Run Test Against Docker (choose one base)**
```bash
# Test against Base 1
npm run test:glyphenge:base1

# Or test against Base 2
npm run test:glyphenge:base2

# Or test against Base 3
npm run test:glyphenge:base3
```

**Manual Environment Variables (if needed)**
```bash
# Base 1
GLYPHENGE_URL=http://localhost:5125 BDO_BASE_URL=http://localhost:5114 npm run test:glyphenge

# Base 2
GLYPHENGE_URL=http://localhost:5225 BDO_BASE_URL=http://localhost:5214 npm run test:glyphenge

# Base 3
GLYPHENGE_URL=http://localhost:5325 BDO_BASE_URL=http://localhost:5314 npm run test:glyphenge
```

### With Custom URLs
```bash
GLYPHENGE_URL=http://localhost:3010 BDO_BASE_URL=http://localhost:3003 npm run test:glyphenge
```

## Requirements

**Services Running**:
- Glyphenge service on port 3010 (default) or 5125 (Docker Base 1)
- BDO service on port 3003 (local default) or 5114 (Docker Base 1)

**Note**: Glyphenge defaults to `http://localhost:3003` for BDO service, perfect for local development!

**Dependencies**:
- `mocha` - Test runner
- `chai` - Assertions
- `node-fetch` - HTTP requests

## Test Output

```
Glyphenge - Linktree Import
  1. Fetch and Parse Linktree
    ✅ should fetch the Linktree page
    ✅ should extract links from __NEXT_DATA__

  2. Create Tapestry via Glyphenge
    ✅ should call Glyphenge POST /create endpoint
    ✅ should return a valid emojicode
    ✅ should return BDO metadata
    ✅ should construct URLs from identifiers (client-side)
    ✅ should have created a public BDO with SVG content
    ✅ should be viewable at emojicode URL
    ✅ should be viewable at alphanumeric URL

  3. Summary
    ✅ should display complete test results

============================================================
🎉 Linktree Import Complete!
============================================================
Source: https://linktr.ee/thefledgecollective
Emojicode: 💚🌍🔑💎🌟💎🎨🐉📌
View with emojicode: http://localhost:3010?emojicode=...
View with alphanumeric: http://localhost:3010/t/abc123...
BDO: http://localhost:3003/emoji/...
============================================================
```

## What This Tests

This test validates the complete **Glyphenge server-side rendering architecture**:

- **Thin Clients**: Clients send raw link data only (no SVG generation)
- **Centralized Rendering**: All SVG templates live on Glyphenge service
- **BDO Integration**: Glyphenge creates public BDOs with emojicodes
- **Consistent Output**: Same templates used regardless of client platform

This architecture is used by:
- **Linktree Importer CLI** (`linkifier/linktree-importer.js`)
- **iOS Enchantment Emporium** (The Advancement app)
- **Future clients**: Any service can create tapestries without SVG code

## Implementation Details

### Linktree Data Structure

Linktree pages use Next.js server-side rendering with data in `__NEXT_DATA__`:

```javascript
{
  "props": {
    "pageProps": {
      "account": {
        "username": "thefledgecollective",
        "profilePictureUrl": "https://...",
        "links": [
          {
            "title": "Website",
            "url": "https://thefledgecollective.com",
            "type": "CLASSIC"
          },
          // ... more links
        ]
      }
    }
  }
}
```

### Glyphenge Payload

```javascript
{
  "title": "@thefledgecollective's Links",
  "links": [
    {"title": "Website", "url": "https://..."},
    {"title": "Instagram", "url": "https://..."}
  ],
  "source": "linktree",
  "sourceUrl": "https://linktr.ee/thefledgecollective"
}
```

### Glyphenge Response

```javascript
{
  "success": true,
  "uuid": "abc123...",
  "pubKey": "02a1b2c3...",
  "emojicode": "💚🌍🔑💎🌟💎🎨🐉📌"
}
```

**Architecture Note**: The server returns only identifiers. **Clients construct URLs** based on their own environment:

```javascript
// Client-side URL construction (in test)
const emojicodeUrl = `${GLYPHENGE_URL}?emojicode=${encodeURIComponent(emojicode)}`;
const alphanumericUrl = `${GLYPHENGE_URL}/t/${pubKey.substring(0, 16)}`;
const bdoUrl = `${BDO_BASE_URL}/emoji/${encodeURIComponent(emojicode)}`;
```

This ensures URLs match the client's environment (local dev, Docker, or production) without requiring the server to know its deployment context.

## Alphanumeric URL Support

Glyphenge provides two ways to access tapestries:

**1. Emojicode URL** (requires emoji support):
```
http://localhost:3010?emojicode=💚🌍🔑💎🌟💎🎨🐉📌
```

**2. Alphanumeric URL** (browser-friendly):
```
http://localhost:3010/t/020605557178eb64
```

**Why Both?**
- **Emojicodes**: Human-memorable, fun to share in text/social media
- **Alphanumeric URLs**: Easier to copy/paste in browsers, no encoding issues

**Implementation**:
- Glyphenge automatically generates both URLs for every tapestry
- `/t/:identifier` route uses first 16 chars of BDO pubKey as identifier
- In-memory mapping stores pubKey → metadata for quick lookups
- No performance difference - both fetch from BDO service

**Note**: Alphanumeric URLs only work while the Glyphenge server is running (in-memory storage). For persistent sharing, use emojicodes.

## Test Development

When adding new Glyphenge tests:

1. **Create test file** in `/tests/glyphenge/`
2. **Import dependencies**: `chai`, `node-fetch`
3. **Configure timeout**: Use `this.timeout(30000)` for network requests
4. **Add script** to Sharon's `package.json`
5. **Document** in this README

## Related Documentation

- **Glyphenge Service**: `/glyphenge/README.md`
- **Linktree Importer**: `/linkifier/README.md`
- **The Advancement Docs**: `/the-advancement/docs/BROWSER-EXTENSIONS.md`
- **BDO Emojicodes**: `/the-advancement/CLAUDE.md` (BDO Emojicode section)

## Last Updated

January 11, 2025 - Initial Glyphenge test suite with Linktree import validation
