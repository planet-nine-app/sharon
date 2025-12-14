# Linkitylink Docker Testing Guide

## Quick Start

### 1. Start Docker Environment

```bash
cd allyabase/deployment/docker
./build-flexible.sh && ./spin-up-bases.sh && node seed-ecosystem.js && node seed-sanora.js
```

### 2. Start Linkitylink Service

```bash
cd linkitylink
./start-for-docker-tests.sh
```

Or manually:
```bash
PORT=5125 BDO_BASE_URL=http://localhost:5114 node server.js
```

**Important**:
- **Clients construct URLs** (Linkitylink returns only identifiers)
- **Server fetches BDOs** (needs `BDO_BASE_URL` set to Docker port 5114)
- **Default BDO URL** is `http://localhost:3003` (local dev), must override for Docker

### 3. Run Linkitylink Test

```bash
cd sharon
npm run test:linkitylink:base1
```

## What Gets Tested

✅ **Complete Linktree Import Flow**:
1. Fetches https://linktr.ee/thefledgecollective
2. Extracts 13 links from __NEXT_DATA__
3. Creates Linkitylink tapestry via POST /create
4. Verifies emojicode generation
5. Verifies alphanumeric URL generation (/t/:uuid)
6. Confirms port consistency (uses configured base URLs)
7. Fetches BDO via emojicode
8. Validates SVG content (18KB+)
9. Confirms tapestry is viewable at both URLs

## Test Against Different Bases

```bash
# Test against Base 1 (ports 5114, 5125)
npm run test:linkitylink:base1

# Test against Base 2 (ports 5214, 5225)
npm run test:linkitylink:base2

# Test against Base 3 (ports 5314, 5325)
npm run test:linkitylink:base3
```

## Port Mappings

| Base | BDO Service | Linkitylink |
|------|-------------|-----------|
| 1    | http://localhost:5114 | http://localhost:5125 |
| 2    | http://localhost:5214 | http://localhost:5225 |
| 3    | http://localhost:5314 | http://localhost:5325 |

## Expected Output

```
Linkitylink - Linktree Import
  1. Fetch and Parse Linktree
    ✔ should fetch the Linktree page
    ✔ should extract links from __NEXT_DATA__
  2. Create Tapestry via Linkitylink
    ✔ should call Linkitylink POST /create endpoint
    ✔ should return a valid emojicode
    ✔ should return BDO metadata
    ✔ should construct URLs from identifiers (client-side)
    ✔ should have created a public BDO with SVG content
    ✔ should be viewable at emojicode URL
    ✔ should be viewable at alphanumeric URL
  3. Summary
    ✔ should display complete test results

============================================================
🎉 Linktree Import Complete!
============================================================
Source: https://linktr.ee/thefledgecollective
Emojicode: 💚☮️💚🏴‍☠️🔨🎹🐢💀💫
View with emojicode: http://localhost:5125?emojicode=...
View with alphanumeric: http://localhost:5125/t/020605557178eb64...
BDO: http://localhost:5114/emoji/...
============================================================

10 passing (2s)
```

## Troubleshooting

### "Connection refused" errors
- Make sure Docker environment is running: `docker ps | grep allyabase`
- Check services are responding: `curl http://localhost:5125`

### "Emojicode not found" errors
- BDO service might not be fully started yet
- Wait 10 seconds and try again
- Check BDO service logs: `docker logs allyabase-base1`

### Test timeout
- Increase timeout in test: `--timeout 60000`
- Check internet connection (Linktree fetch requires internet)

## Architecture Validation

This test validates the **Linkitylink server-side rendering architecture**:

1. **Thin Clients**: Clients send raw link data only
2. **Server-Side SVG**: Linkitylink generates all SVG templates
3. **BDO Integration**: Automatic public BDO creation with emojicodes
4. **Consistent Rendering**: Same templates across all platforms

This is the same architecture used by:
- Linktree Importer CLI (`linkifier/linktree-importer.js`)
- iOS Enchantment Emporium (The Advancement app)
- Future integrations (any service can create tapestries)

## Manual Testing

If automated tests fail, you can manually verify:

```bash
# 1. Check Linkitylink is running
curl http://localhost:5125

# 2. Create test tapestry
curl -X POST http://localhost:5125/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "links": [{"title": "GitHub", "url": "https://github.com"}]
  }'

# 3. Check BDO service
curl http://localhost:5114/emoji/💚☮️💚🏴‍☠️🔨🎹🐢💀💫
```

## Related Documentation

- **Test README**: `./README.md` - Complete test documentation
- **Linkitylink Service**: `/linkitylink/CLAUDE.md`
- **Docker Setup**: `/allyabase/deployment/docker/README.md`
- **BDO Emojicodes**: `/the-advancement/CLAUDE.md`

## Last Updated

January 11, 2025 - Docker environment testing support added
