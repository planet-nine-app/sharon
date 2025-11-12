# Babelfish Tests

## Overview

Tests for the Babelfish universal messaging bridge service - Planet Nine's cross-platform messaging integration.

## Tests

### Matrix Bridge Test

**File**: `matrix-bridge.test.js`

Tests the complete Matrix-to-Matrix bridging functionality:

1. **Service Health Check**: Verify Babelfish is running and responsive
2. **Bridge Creation**: Create bridge between two Matrix rooms
3. **Statistics Validation**: Verify bridge statistics and tracking
4. **Error Handling**: Test invalid configurations and credentials
5. **Manual Testing Guide**: Instructions for testing message relay

### What Gets Tested

✅ **Bridge Creation**:
- Bridge configuration validation
- Multi-platform bridge setup
- Matrix client initialization
- Bridge ID generation

✅ **Service Integration**:
- Babelfish API endpoints
- Matrix adapter registration
- Statistics tracking
- Error handling

✅ **Configuration Validation**:
- Minimum 2 platforms required
- Valid Matrix credentials
- Room access validation
- Graceful failure handling

## Running Tests

### Prerequisites

Before running tests, you need:

1. **Babelfish Server Running** with TEST_MODE enabled:
   ```bash
   cd /path/to/babelfish
   TEST_MODE=true npm start
   ```

2. **Matrix Credentials** - Two Matrix accounts with:
   - Access tokens (from Element settings)
   - Two room IDs (unencrypted rooms)
   - Both users invited to both rooms

   See `babelfish/docs/MATRIX-SETUP.md` for detailed setup instructions.

### Local Testing (Default)

```bash
# Set Matrix credentials
export MATRIX_TOKEN_1='syt_YWxpY2U_...'
export MATRIX_ROOM_1='!abc123:matrix.org'
export MATRIX_TOKEN_2='syt_Ym9i_...'
export MATRIX_ROOM_2='!def456:matrix.org'

# Run test
npm run test:babelfish
```

### Custom Babelfish URL

```bash
# Test against different Babelfish instance
BABELFISH_URL=http://localhost:3011 \
  MATRIX_TOKEN_1='...' \
  MATRIX_ROOM_1='...' \
  MATRIX_TOKEN_2='...' \
  MATRIX_ROOM_2='...' \
  npm run test:babelfish
```

### Different Homeserver

```bash
# Use different Matrix homeserver
MATRIX_HOMESERVER=https://mozilla.modular.im \
  MATRIX_TOKEN_1='...' \
  MATRIX_ROOM_1='...' \
  MATRIX_TOKEN_2='...' \
  MATRIX_ROOM_2='...' \
  npm run test:babelfish
```

## Test Output

```
Babelfish - Matrix Bridge
  1. Service Health Check
    ✓ should verify Babelfish is running
    ✓ should have Matrix adapter registered

  2. Bridge Creation
    ✓ should create a Matrix-to-Matrix bridge
    ✓ should return valid bridge configuration
    ✓ should have initialized Matrix clients

  3. Statistics Validation
    ✓ should return accurate bridge statistics
    ✓ should list created bridges

  4. Error Handling
    ✓ should reject bridge with invalid configuration
    ✓ should handle invalid Matrix credentials gracefully

  5. Manual Testing Instructions
    ✓ should provide manual testing instructions

============================================================
🎉 Bridge Test Complete!
============================================================
Bridge ID: bridge_1234567890_abc123
Status: Active and ready for messages

The bridge is now running and will relay messages between:
  Room 1: !abc123:matrix.org
  Room 2: !def456:matrix.org
============================================================

10 passing (8s)
```

## Manual Message Testing

After the automated test creates a bridge, test message relay manually:

### Step 1: Open Element in Two Windows

- **Window 1**: Log in to first Matrix account
- **Window 2**: Log in to second Matrix account

### Step 2: Send Test Message

**In Window 1 (Room 1):**
```
Hello from Room 1!
```

**Check Window 2 (Room 2):**
```
[MATRIX] username:
Hello from Room 1!
```

### Step 3: Test Bidirectional Relay

**In Window 2 (Room 2):**
```
Hello back from Room 2!
```

**Check Window 1 (Room 1):**
```
[MATRIX] username:
Hello back from Room 2!
```

### Step 4: Check Babelfish Logs

Look for message relay activity:
```
📨 Matrix message received in !abc123:matrix.org
📨 Routing message from matrix...
🌉 Relaying via bridge: Sharon Test Matrix Bridge
📤 Relaying to matrix...
✅ Message relayed to matrix
```

### Step 5: Verify Statistics

```bash
curl http://localhost:3011/stats
```

Expected response:
```json
{
  "success": true,
  "activeBridges": 1,
  "registeredAdapters": 2,
  "processedMessages": 2
}
```

## Getting Matrix Credentials

### Quick Reference

**Access Token:**
1. Element → Avatar → "All settings"
2. "Help & About" tab → "Advanced" section
3. "Access Token" → "Click to reveal"
4. Copy token (looks like `syt_YWxpY2U_...`)

**Room ID:**
1. Open room in Element
2. Room name → "Settings"
3. "Advanced" tab
4. Copy "Internal room ID" (looks like `!abc123:matrix.org`)

**Important:**
- Turn OFF encryption in test rooms
- Invite both users to both rooms
- Access tokens are sensitive - keep them secret

### Detailed Setup

For complete Matrix setup instructions, see:
- **Babelfish Quick Start**: `babelfish/QUICKSTART.md`
- **Matrix Setup Guide**: `babelfish/docs/MATRIX-SETUP.md`
- **Integration Summary**: `babelfish/docs/INTEGRATION-SUMMARY.md`

## Troubleshooting

### "Missing required environment variables"

**Problem**: Test exits immediately with environment variable error.

**Solution**: Set all required Matrix credentials:
```bash
export MATRIX_TOKEN_1='your_token_1'
export MATRIX_ROOM_1='!room1:matrix.org'
export MATRIX_TOKEN_2='your_token_2'
export MATRIX_ROOM_2='!room2:matrix.org'
```

### "Connection refused" to Babelfish

**Problem**: Cannot connect to Babelfish server.

**Solution**: Make sure Babelfish is running:
```bash
cd /path/to/babelfish
TEST_MODE=true npm start
```

### "Invalid signature" Error

**Problem**: Bridge creation fails with authentication error.

**Solution**: Start Babelfish with TEST_MODE:
```bash
TEST_MODE=true npm start
```

### Bridge Created But Messages Not Relaying

**Possible causes:**
1. **Invalid Matrix credentials** - Check access tokens are current
2. **Encrypted rooms** - Turn OFF encryption in room settings
3. **Missing room permissions** - Verify users are members of rooms
4. **Matrix client initialization failed** - Check Babelfish logs for errors

**Debug:**
```bash
# Check Babelfish logs for errors
# Look for "Failed to initialize matrix" messages

# Test Matrix tokens manually
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://matrix.org/_matrix/client/r0/account/whoami
```

### "M_UNKNOWN_TOKEN" Error

**Problem**: Matrix access token is invalid or expired.

**Solution**:
1. Log out and back into Element
2. Generate new access token
3. Update environment variables

### Bridge Not Listed

**Problem**: GET /bridges returns empty array.

**Solution**:
- In TEST_MODE, all bridges should be listed
- Verify Babelfish is running with TEST_MODE=true
- Check if bridge creation succeeded

## Architecture Validation

This test validates the **Babelfish cross-platform messaging architecture**:

1. **Unified Bridge API**: Simple REST API for creating bridges
2. **Platform Adapters**: Abstraction layer for different messaging platforms
3. **Message Router**: Intelligent routing between platforms
4. **Real-time Messaging**: Matrix SDK integration for live message relay

## Implementation Details

### Bridge Configuration Structure

```javascript
{
  "bridge": {
    "name": "My Bridge",
    "platforms": [
      {
        "type": "matrix",
        "roomId": "!abc123:matrix.org",
        "accessToken": "syt_...",
        "homeserver": "https://matrix.org"
      },
      {
        "type": "matrix",
        "roomId": "!def456:matrix.org",
        "accessToken": "syt_...",
        "homeserver": "https://matrix.org"
      }
    ]
  }
}
```

### Bridge Response

```javascript
{
  "success": true,
  "bridgeId": "bridge_1234567890_abc123",
  "bridge": {
    "id": "bridge_1234567890_abc123",
    "name": "My Bridge",
    "owner": "02test_pubkey",
    "platforms": [...],
    "createdAt": "2025-01-11T12:00:00Z",
    "active": true
  }
}
```

### Message Flow

```
User sends in Room 1
    ↓
Matrix homeserver receives
    ↓
Matrix SDK client syncs message
    ↓
Babelfish Matrix adapter receives event
    ↓
Message router finds bridge
    ↓
Router sends to Room 2 via second client
    ↓
Message appears in Room 2
```

### Message Format

Original message:
```
Hello everyone!
```

Relayed with attribution:
```
[MATRIX] alice:
Hello everyone!
```

## Future Tests

### Planned Test Coverage

**Cross-Platform Tests**:
- Matrix ↔ Discord bridging
- Discord ↔ Discord bridging
- Three-way bridges (Matrix ↔ Discord ↔ SMS)

**Advanced Features**:
- Message formatting preservation
- Attachment relay
- Reaction syncing
- User identity mapping

**Performance Tests**:
- High message volume
- Multiple concurrent bridges
- Rate limiting behavior

**Persistence Tests** (when BDO integration is added):
- Bridge persistence across restarts
- Message history storage
- Bridge configuration recovery

## Related Documentation

- **Babelfish Service**: `/babelfish/README.md`
- **Matrix Setup**: `/babelfish/docs/MATRIX-SETUP.md`
- **Quick Start**: `/babelfish/QUICKSTART.md`
- **Test Plan**: `/babelfish/TEST-PLAN.md`
- **Sharon Tests**: `/sharon/README.md`

## Last Updated

January 2025 - Initial Babelfish test suite with Matrix bridging validation
