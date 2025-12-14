# Linkitylink Tests

Comprehensive integration tests for Linkitylink - Planet Nine's privacy-first link page service.

## Test Files

- **linktree-import.test.js** - Linktree import functionality and basic tapestry creation
- **template-federation.test.js** - User-submitted template system and cross-instance sharing
- **template-moderation.test.js** - Admin moderation workflow for user templates
- **all-tests.test.js** - Comprehensive test suite runner with environment checks

## Running Tests

```bash
# From sharon directory
cd sharon

# Run ALL linkitylink tests
npm run test:linkitylink:all

# Run individual test suites
npm run test:linkitylink:import      # Linktree import tests
npm run test:linkitylink:federation  # Template federation tests
npm run test:linkitylink:moderation  # Template moderation tests

# Run against specific docker base
npm run test:linkitylink:base1  # Test against Base 1
npm run test:linkitylink:base2  # Test against Base 2
npm run test:linkitylink:base3  # Test against Base 3

# Or run with mocha directly
npx mocha 'tests/linkitylink/*.test.js' --timeout 30000
```

## Environment Variables

- `LINKITYLINK_BASE_URL` - Linkitylink service URL (default: http://localhost:3010)
- `BDO_BASE_URL` - BDO service URL (default: http://localhost:3003)
- `FOUNT_BASE_URL` - Fount service URL (default: http://localhost:3001)

## Test Coverage

### 1. Linktree Import & Basic Functionality
✅ Linktree import from https://linktr.ee/thefledgecollective
✅ Link parsing from Next.js SSR data
✅ Tapestry creation with BDO storage
✅ SVG generation (18KB+ files)
✅ Emojicode generation
✅ Alphanumeric URL support
✅ Dual URL access (emojicode + alphanumeric)

### 2. Template Federation
✅ Template submission via MAGIC spell (600 MP)
✅ Template BDO creation and indexing
✅ Template indexing in BDO filesystem
✅ Emojicode mapping for templates
✅ Template querying via BDO service
✅ Multi-instance template sharing
✅ Payment integration for template creators

### 3. Template Moderation
✅ Pending status for new templates
✅ Templates hidden from public endpoint until approved
✅ Admin authentication via Fount nineum check
✅ Admin-only access to pending templates
✅ Template approval/rejection workflow
✅ Security model validation
✅ Moderation UI page verification

## Prerequisites

### Required Services
1. **Linkitylink** running on port 3010
   ```bash
   cd linkitylink
   npm start
   ```

2. **BDO** running on port 3003
   ```bash
   cd bdo
   npm start
   ```

3. **Fount** running on port 3001 (for admin checks)
   ```bash
   cd fount
   npm start
   ```

4. **Internet connection** (for Linktree fetch in import tests)

## Manual Testing

### Linktree Import
1. Visit http://localhost:3010/create
2. Enter a Linktree URL: https://linktr.ee/username
3. Click "Import Links"
4. Verify links are parsed and displayed
5. Create tapestry and verify both URL formats work

### Template Submission
1. Use The Advancement app to submit a template
2. Cast `submitLinkitylinkTemplate` spell (600 MP)
3. Verify template appears in pending state
4. Check that template is NOT in public `/templates` endpoint

### Template Moderation
1. Visit http://localhost:3010/moderate.html
2. Enter admin public key (must have admin nineum)
3. View pending templates
4. Approve or reject templates
5. Verify approved templates appear in public endpoint
6. Verify rejected templates stay hidden

## Admin Setup

To test moderation features, you need an admin user:

```bash
# 1. Create/get a Fount user
# 2. Grant admin nineum via Fount API
PUT http://localhost:3001/user/{fountUUID}/nineum/admin
Body: {
  "timestamp": "...",
  "toUserUUID": "{targetUserUUID}",
  "signature": "..."
}

# 3. Use that user's pubKey in moderate.html
```

## Troubleshooting

**Tests fail with "Service not running"**
- Verify linkitylink is running: `curl http://localhost:3010`
- Verify BDO is running: `curl http://localhost:3003`
- Check service logs for errors

**Admin tests fail with 403**
- This is expected if no admin nineum is granted
- Tests gracefully handle this and verify security model
- For full testing, grant admin nineum as described above

**Template tests fail**
- Ensure BDO service has write permissions for filesystem
- Check BDO logs for errors
- Verify template index directory exists: `bdo/data/bdo/templates/`

## See Also

- [DOCKER-TESTING.md](./DOCKER-TESTING.md) - Docker-based testing guide
- [linkitylink/CLAUDE.md](../../linkitylink/CLAUDE.md) - Linkitylink documentation
- [linkitylink/public/moderate.html](../../linkitylink/public/moderate.html) - Moderation UI

## Last Updated

December 10, 2025 - Added template moderation test suite and comprehensive testing guide
