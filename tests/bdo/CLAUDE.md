# Sharon BDO Test Suite

## Overview

Comprehensive test suite for the BDO (Blockchain Data Objects) service, covering core functionality, emojicode system, and cross-user interactions.

## Test Files

### `mocha/client.js`
**Main integration test suite** - Tests core BDO functionality with emojicode integration

**Test Coverage:**
- ✅ User registration (Alice, Bob)
- ✅ BDO storage and retrieval
- ✅ Public BDO sharing
- ✅ Base management
- ✅ **Emojicode reverse lookup** (`GET /pubkey/:pubKey/emojicode`)
- ✅ **BDO retrieval with emojicode query param** (`GET /user/:uuid/bdo?emojicode=...`)
- ✅ **Direct emojicode endpoint** (`GET /emoji/:emojicode`)
- ✅ User deletion

**Key Features Tested:**
- Cross-user BDO access via emojicodes
- Emojicode format validation (8 emoji)
- Authenticated requests with sessionless signatures

---

### `mocha/emojicode.js`
**Dedicated emojicode test suite** - Comprehensive testing of the emojicode system

**Test Coverage:**

#### Setup
- User registration (Alice, Caitlyn)
- Public BDO creation with automatic emojicode assignment

#### Automatic Emojicode Assignment
- ✅ Automatic generation when saving public BDOs
- ✅ Consistent behavior across multiple users

#### Emojicode Retrieval
- ✅ Reverse lookup by pubKey
- ✅ Emojicode format validation (8 emoji: 3 base + 5 unique)
- ✅ Base emoji consistency across users
- ✅ Unique emoji differentiation per user
- ✅ Creation timestamp tracking

#### BDO Retrieval by Emojicode
- ✅ Forward lookup by emojicode
- ✅ 404 handling for non-existent emojicodes
- ✅ Full response validation (emojicode, pubKey, bdo, createdAt)

#### Cross-User Access
- ✅ Alice accessing Caitlyn's public BDO via emojicode
- ✅ Caitlyn accessing Alice's public BDO via emojicode

#### Emojicode Query Parameter
- ✅ Authenticated BDO retrieval using `?emojicode=...` query param
- ✅ Signature and timestamp validation
- ✅ 404 error handling for invalid emojicodes

#### Cleanup
- User deletion and resource cleanup

---

### `mocha/test-users.js`
**Static test users** - Predefined cryptographic keys for consistent testing

**Test Users:**
- `alice` - First test user
- `bob` - Second test user
- `caitlyn` - Third test user (used in emojicode tests)
- `dave` - Fourth test user (reserved for future tests)

Each user has:
- Name
- Private key (for signing)
- Public key (for verification)

---

## Test Utilities

### Helper Functions

**`switchToUser(user)`**
- Switches sessionless context to a different test user
- Sets up proper keys for signing/verification

**`isValidEmojicodeFormat(emojicode)`**
- Validates emojicode format (exactly 8 emoji)
- Handles multi-byte UTF-8 properly

**`getBaseEmoji(emojicode)`**
- Extracts first 3 emoji (base identifier)

**`getUniqueEmoji(emojicode)`**
- Extracts last 5 emoji (unique identifier)

---

## Running Tests

### All Tests
```bash
cd sharon/tests/bdo/mocha
npm install
npm test
```

### Specific Test File
```bash
# Core integration tests
mocha client.js --timeout 30000

# Emojicode-specific tests
mocha emojicode.js --timeout 30000
```

### Individual Test
```bash
mocha client.js --timeout 30000 --grep "should get emojicode"
```

---

## Test Environment

**Requirements:**
- Node.js with ES modules support
- nginx routing to BDO service
- BDO service running on port 3003 (via nginx:80/bdo/)
- continuebee service for authentication
- Redis for BDO persistence

**Configuration:**
```javascript
bdo.baseURL = 'http://nginx:80/bdo/';
const directBDOURL = 'http://nginx:80/bdo';
```

---

## Emojicode System Testing

### What's Tested

**1. Automatic Assignment**
- Public BDOs automatically receive emojicodes
- Emojicodes follow 8-emoji format (3 base + 5 unique)

**2. Bidirectional Mapping**
- Forward lookup: emojicode → pubKey → BDO
- Reverse lookup: pubKey → emojicode

**3. Format Validation**
- Exactly 8 emoji characters
- First 3 emoji are consistent across users (base)
- Last 5 emoji are unique per user

**4. Query Parameter Support**
- `GET /user/:uuid/bdo?emojicode=...` retrieves BDO
- Emojicode automatically resolves to pubKey
- Full authentication flow with timestamp/signature

**5. Direct Access**
- `GET /emoji/:emojicode` retrieves BDO directly
- Returns: `{ emojicode, pubKey, bdo, createdAt }`

**6. Error Handling**
- 404 for non-existent emojicodes
- Proper error messages

**7. Cross-User Access**
- Public BDOs accessible via emojicode from any user
- Maintains proper authentication requirements

---

## Test Assertions

### Format Validation
```javascript
// Emojicode must be exactly 8 emoji
const emojiArray = [...emojicode];
emojiArray.length.should.equal(8);
```

### Response Structure
```javascript
// Reverse lookup
data.should.have.property('emojicode');
data.should.have.property('pubKey');
data.should.have.property('createdAt');

// Direct endpoint
data.should.have.property('emojicode');
data.should.have.property('pubKey');
data.should.have.property('bdo');
data.should.have.property('createdAt');
```

### Cross-User Access
```javascript
// Alice retrieves Bob's BDO using Bob's emojicode
data.pubKey.should.equal(bobKeys.pubKey);
data.bdo.should.have.property('foo');
```

---

## Recent Changes (October 2025)

### Emojicode System Tests
- Added comprehensive emojicode test suite (`emojicode.js`)
- Integrated emojicode tests into main suite (`client.js`)
- Added format validation helpers
- Added cross-user access tests
- Added query parameter tests

### Test Infrastructure
- Added `node-fetch` dependency for direct HTTP testing
- Added emojicode format validation utilities
- Extended test-users.js with Caitlyn and Dave

---

## Dependencies

```json
{
  "bdo-js": "^0.0.6",
  "chai": "^5.1.1",
  "mocha": "^10.7.3",
  "node-fetch": "^3.3.2",
  "sessionless-node": "^0.11.0",
  "superagent": "^10.0.0"
}
```

---

## Example Test Output

```
✅ Bob's emojicode: 🌍🔑💎🌟💎🎨🐉📌
   Base emoji: 🌍🔑💎
   Unique emoji: 🌟💎🎨🐉📌
   Created at: 2025-10-12T22:54:00.000Z

✅ Alice retrieved Bob public BDO using emojicode query param
✅ Successfully retrieved Bob BDO directly by emojicode
```

---

## Notes

- All tests use nginx routing for consistent service discovery
- Tests are designed to run in docker-compose environment
- Emojicode tests require BDO service with emojicode feature enabled
- Test users use consistent cryptographic keys for reproducibility
- Tests clean up after themselves (user deletion)
