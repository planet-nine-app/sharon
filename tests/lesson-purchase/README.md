# Lesson Purchase Flow Tests

Complete end-to-end integration test for the lesson purchase flow.

## Flow Tested

1. **Setup**: Create teacher and student users in Fount
2. **Lesson Creation**: Teacher creates lesson BDO with SVG content
3. **Purchase**: Student purchases lesson through Addie
4. **Contract Creation**: SODOTO contract created via Covenant
5. **CarrierBag Storage**: Contract saved to student's BDO carrierBag
6. **Contract Progression**: Teacher and student sign contract steps
7. **Nineum Grant**: Teacher grants nineum permission to student
8. **Permission Verification**: Check student has correct nineum
9. **Lesson Collection**: Student collects lesson to bookshelf

## Services Used

- **Fount** (`:5117`) - User management, nineum permissions
- **BDO** (`:5114`) - CarrierBag storage
- **Covenant** (`:5122`) - SODOTO contracts
- **Addie** (`:5115`) - Payment processing

## Running Tests

```bash
# From this directory
npm test

# Or from sharon root
cd /Users/zachbabb/Work/planet-nine/sharon
npm test tests/lesson-purchase
```

## Requirements

- All services must be running (Fount, BDO, Covenant, Addie)
- Services accessible on localhost ports

## Test Structure

- Two separate users with cryptographic keys (teacher and student)
- Complete flow with real signatures using sessionless-node
- Graceful handling if services aren't fully implemented yet
- Detailed logging of each step

## Expected Outcome

When all services are properly implemented and running:

✅ All steps should pass
✅ Contract should be created with emojicode
✅ Nineum should be granted and verified
✅ Lesson should be collectible with proper permissions
