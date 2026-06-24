# Mutopia Plugin Tests

Integration tests for `wiki-plugin-mutopia` - the distributed music platform for federated wiki using the Canimus feed specification.

## Overview

Mutopia allows users to upload music archives in Canimus format (ZIP with RSS feed + audio files) through Federated Wiki. The plugin:

- Manages its own Sanora user account
- Parses Canimus RSS feeds
- Extracts audio files from ZIP archives
- Uploads tracks to Sanora as products
- Generates Canimus-compliant music feeds
- Proxies requests to Sanora and Dolores services

## Test Coverage

### 1. Plugin Initialization ✅
- Plugin loaded and available
- Sanora credentials configured
- Endpoints registered

### 2. Library Retrieval ✅
- Empty library returns correctly
- Feed structure validation
- Track listing

### 3. Sanora Integration ✅
- Proxy routes working
- Service communication
- Error handling

### 4. Feed Validation ✅
- Canimus feed structure
- Track metadata
- RSS compliance

### 5. Error Handling ✅
- Authentication requirements
- Missing file handling
- Invalid archive format

### 6. Archive Processing ✅
- Canimus format validation
- Supported audio formats
- Feed file detection

## Running Tests

```bash
# From sharon directory
npm run test:mutopia

# Or with custom ports
WIKI_PORT=3000 SANORA_PORT=7243 npm run test:mutopia

# With wiki proxy (test-wiki environment)
WIKI_PORT=5124 npm run test:mutopia
```

## Test Requirements

### Services Running
- Federated Wiki with mutopia plugin installed
- Sanora service (port 7243)
- Dolores service (port 3007) - optional

### Environment Variables
- `WIKI_PORT` - Wiki server port (default: 3000)
- `SANORA_PORT` - Sanora service port (default: 7243)

## Canimus Feed Specification

Mutopia follows the [Canimus RSS specification](https://github.com/PlaidWeb/Canimus):

- **Feed Format**: RSS 2.0 with iTunes extensions
- **Audio Formats**: MP3, M4A, OGG, FLAC, WAV
- **Archive Structure**: ZIP containing feed.xml + audio files
- **Metadata Fields**: title, artist, album, duration, track order

## Plugin Endpoints

### POST `/plugin/mutopia/upload`
Upload Canimus archive (requires authentication)

**Request:**
- Content-Type: multipart/form-data
- Field: `archive` (ZIP file)

**Response:**
```json
{
  "success": true,
  "album": {
    "title": "Album Name",
    "artist": "Artist Name",
    "trackCount": 12
  },
  "tracks": [...]
}
```

### GET `/plugin/mutopia/library`
Get all uploaded music

**Response:**
```json
{
  "success": true,
  "albums": [...],
  "tracks": [...]
}
```

### Proxy Routes
- `/plugin/mutopia/sanora/*` → Sanora service
- `/plugin/mutopia/dolores/*` → Dolores service

## Future Test Coverage

- [ ] Actual file upload tests (requires auth setup)
- [ ] ZIP archive creation and parsing
- [ ] RSS feed XML validation
- [ ] Audio file format detection
- [ ] Cover art handling
- [ ] Track metadata extraction
- [ ] Album grouping logic
- [ ] Dolores audio player integration
- [ ] Cross-plugin federation tests

## Related Documentation

- [Plugin CLAUDE.md](../../../third-party/wiki-plugin-mutopia/CLAUDE.md)
- [Canimus Specification](https://github.com/PlaidWeb/Canimus)
- [Sanora Integration](../../../sanora/CLAUDE.md)
- [Dolores Service](../../../dolores/CLAUDE.md)

---

**Part of The Advancement** - Rebuilding platforms for communities 💚
