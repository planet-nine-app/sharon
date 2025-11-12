# Babelfish Test Quick Start

## Run Test in 3 Steps

### Step 1: Get Matrix Credentials (5 minutes)

1. **Create two Matrix accounts** at https://app.element.io
2. **Get access tokens** (Element → Avatar → Settings → Help & About → Access Token)
3. **Create two rooms** and get room IDs (Room Settings → Advanced → Internal room ID)
4. **Turn OFF encryption** in both rooms
5. **Invite both users to both rooms**

See `/babelfish/docs/MATRIX-SETUP.md` for detailed instructions.

### Step 2: Start Babelfish with TEST_MODE

```bash
cd /path/to/babelfish
TEST_MODE=true npm start
```

You should see:
```
⚠️  TEST MODE ENABLED - Authentication bypassed
✅ Babelfish bridge active on port 3011
```

### Step 3: Run Test

```bash
cd /path/to/sharon

# Set Matrix credentials
export MATRIX_TOKEN_1='syt_YWxpY2U_...'
export MATRIX_ROOM_1='!abc123:matrix.org'
export MATRIX_TOKEN_2='syt_Ym9i_...'
export MATRIX_ROOM_2='!def456:matrix.org'

# Run test
npm run test:babelfish
```

## Expected Output

```
🐟 Babelfish Matrix Bridge Test
============================================================

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

10 passing (8s)
```

## Test Message Relay Manually

After the test creates a bridge, test it manually:

1. **Open Element in two browser windows**
   - Window 1: First Matrix account
   - Window 2: Second Matrix account

2. **Send message in Room 1** (Window 1):
   ```
   Hello from Room 1!
   ```

3. **Check Room 2** (Window 2) - you should see:
   ```
   [MATRIX] username:
   Hello from Room 1!
   ```

4. **Send message back from Room 2**:
   ```
   Hello back from Room 2!
   ```

5. **Check Room 1** - message should appear!

## Troubleshooting

### "Missing required environment variables"

Make sure all 4 variables are set:
```bash
export MATRIX_TOKEN_1='...'
export MATRIX_ROOM_1='...'
export MATRIX_TOKEN_2='...'
export MATRIX_ROOM_2='...'
```

### "Connection refused to Babelfish"

Start Babelfish with TEST_MODE:
```bash
cd /path/to/babelfish
TEST_MODE=true npm start
```

### Messages not relaying

Check Babelfish logs for:
```
📨 Matrix message received in !abc...
🌉 Relaying via bridge: Sharon Test Matrix Bridge
✅ Message relayed to matrix
```

If you see errors:
- Verify Matrix tokens are valid
- Ensure encryption is OFF in rooms
- Check users are members of rooms

## More Information

- **Complete Test Docs**: `tests/babelfish/README.md`
- **Matrix Setup Guide**: `/babelfish/docs/MATRIX-SETUP.md`
- **Babelfish Quick Start**: `/babelfish/QUICKSTART.md`
- **Integration Summary**: `/babelfish/docs/INTEGRATION-SUMMARY.md`

## What This Tests

✅ **Bridge Creation**: Matrix-to-Matrix bridge setup
✅ **Configuration Validation**: Bridge config validation
✅ **Client Initialization**: Matrix SDK client setup
✅ **Statistics**: Bridge tracking and stats
✅ **Error Handling**: Invalid configs and credentials

**Note**: The test creates a bridge but doesn't automatically send messages. You need to manually test message relay using Element (see instructions above).

---

**Time to run**: ~8 seconds (excluding manual testing)
**Prerequisites**: Babelfish running with TEST_MODE, Matrix credentials
