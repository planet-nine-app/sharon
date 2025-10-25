# Sanora Orders Webpage Tests

## Overview

Comprehensive integration tests for the Sanora orders dashboard webpage with AuthTeam authentication.

**Test File**: `orders-webpage.test.js`

## Features Tested

### 🔐 AuthTeam Authentication
- Challenge generation with random color sequences
- Session token creation and storage
- Challenge completion validation
- Session authentication persistence
- 1-hour session timeout

### 📦 Orders Dashboard
- Protected route access control
- Order display with proper HTML structure
- Color-coded status badges (pending, processing, shipped, delivered, cancelled)
- Shipping address highlighting
- Responsive grid layout
- Refresh functionality

### 🚚 Shipping Address Integration
- Display addresses from spell components
- Highlighted address section (yellow background)
- All address fields (recipient, street, city, state, zip, country, phone)
- Integration with purchase spell flow

### 🗄️ Database Integration
- `getAllOrders()` method verification
- Order retrieval and deduplication
- Sorting by creation date
- Error handling

### 🎨 UI/UX
- Gradient background styling
- Responsive design
- Refresh button
- Empty state display
- Order cards with proper structure

### 🔒 Security
- Session-based authentication
- Redirect unauthenticated users to AuthTeam
- Unique auth tokens per challenge
- Random color sequence generation
- Session expiration after 1 hour

## Running Tests

### Run Sanora Orders Tests Only
```bash
cd sharon
npm run test:sanora:orders
```

### Run All Sanora Tests
```bash
npm run test:sanora
```

### Run All Sharon Tests
```bash
npm test
```

## Requirements

### Running Services
Tests require Sanora running on:
- **Port**: 7243 (default)
- **URL**: http://127.0.0.1:7243

Override with environment variable:
```bash
SANORA_URL=http://localhost:7243 npm run test:sanora:orders
```

### Dependencies
- `mocha` - Test framework
- `chai` - Assertion library
- `node-fetch` - HTTP requests
- `sessionless-node` - Cryptographic signatures

## Test Coverage

### Test Suites (9 total)
1. **Setup**: Create test order
2. **AuthTeam Challenge Generation**: Generate challenge page
3. **AuthTeam Completion**: Validate and complete challenge
4. **Orders Page Access Control**: Authentication requirements
5. **Orders Display**: Order cards and structure
6. **Session Expiration**: Timeout verification
7. **Database Integration**: getAllOrders() method
8. **UI/UX Features**: Design and layout
9. **Error Handling**: Graceful failure
10. **Security**: Session and token management
11. **Integration**: Purchase flow compatibility

### Total Tests
**32 tests** covering:
- ✅ AuthTeam challenge generation
- ✅ Challenge completion
- ✅ Session authentication
- ✅ Access control (authenticated vs unauthenticated)
- ✅ Orders display with shipping addresses
- ✅ Status badge styling
- ✅ Database integration
- ✅ UI/UX features
- ✅ Error handling
- ✅ Security measures
- ✅ Integration with purchase flow

## Expected Output

```
  Sanora Orders Webpage Tests
    Setup: Create Test Order
✅ Test user created: abc-123-def
✅ Test order prepared: xyz-789-uvw
      ✓ should create a test order in database

    AuthTeam Challenge Generation
✅ AuthTeam challenge generated
   Auth Token: 8f7e6d5c4b3a2918
   Color Sequence: red → blue → green → yellow → purple
      ✓ should generate AuthTeam challenge page
✅ Challenge stored in session
      ✓ should store challenge in session with expiration

    AuthTeam Completion
✅ Invalid auth token rejected
      ✓ should reject invalid auth token
✅ AuthTeam challenge completed successfully
      ✓ should complete AuthTeam challenge with valid token
✅ Session authentication set successfully
      ✓ should set session authentication after completion

    Orders Page Access Control
✅ Unauthenticated requests redirected to AuthTeam
      ✓ should redirect unauthenticated requests to /authteam
✅ Authenticated access granted to orders page
      ✓ should allow authenticated access to orders page

    Orders Display
✅ Orders page displays correctly
      ✓ should display empty state when no orders exist
✅ Order cards have proper HTML structure
      ✓ should display order cards with proper structure
✅ Shipping address section present
      ✓ should display shipping addresses when present
✅ Status badge styles defined
      ✓ should display color-coded status badges

    Session Expiration
✅ Session expiration logic verified (1 hour timeout)
      ✓ should expire session after 1 hour

    Database Integration
✅ Database getAllOrders() method working
      ✓ should retrieve all orders via getAllOrders()
✅ Shipping address from spell components handled
      ✓ should handle orders with shipping addresses from spell components

    UI/UX Features
✅ Refresh button present
      ✓ should include refresh button
✅ Responsive grid layout verified
      ✓ should use responsive grid layout
✅ Gradient background styling present
      ✓ should have gradient background styling

    Error Handling
✅ Error handling structure verified
      ✓ should handle database errors gracefully
✅ Expired challenge tokens handled
      ✓ should handle expired challenge tokens

    Security
✅ Session required for orders access
      ✓ should require session for orders access
✅ Unique auth tokens generated per challenge
      ✓ should generate unique auth tokens per challenge
✅ Random color sequences generated
      ✓ should generate random color sequences

    Integration
✅ Integration with purchase flow verified
      ✓ should work with complete purchase flow

📋 SANORA ORDERS WEBPAGE TESTS COMPLETE
==========================================
✅ AuthTeam authentication working
✅ Orders dashboard accessible
✅ Shipping addresses displayed
✅ Session management functional
✅ Database integration confirmed

  32 passing (5s)
```

## Implementation Details

### AuthTeam Flow
1. User visits `/orders`
2. Redirected to `/authteam` (if not authenticated)
3. Color sequence challenge generated (5 random colors)
4. Session stores challenge with 5-minute expiration
5. User completes sequence
6. Session marked as authenticated (1-hour duration)
7. Redirected to `/orders`

### Orders Page
- Displays all orders from `db.getAllOrders()`
- Shows shipping addresses in highlighted section
- Color-coded status badges
- Responsive grid layout
- Auto-refresh button

### Shipping Address Display
Orders with `shippingAddress` in components show:
```html
<div class="address-section">
  <div class="address-label">📮 SHIPPING ADDRESS</div>
  <div class="address-text">
    John Doe<br>
    123 Main Street Apt 4B<br>
    New York, NY 10001<br>
    US
    <br>📞 555-0123
  </div>
</div>
```

## Integration with Purchase Flow

The orders webpage integrates with the complete purchase flow:

1. **Purchase Spell**: User casts purchase spell with `shippingAddress` in components
2. **MAGIC Protocol**: Address flows through to serviceResponses
3. **Order Creation**: Order stored with shipping address
4. **Orders Webpage**: Merchant views order with highlighted shipping address

## Troubleshooting

### Tests Fail to Connect
**Error**: `ECONNREFUSED 127.0.0.1:7243`

**Solution**: Start Sanora service:
```bash
cd sanora
npm start
```

### Session Cookie Issues
**Error**: `Invalid auth token`

**Solution**: Session cookies are required. Tests handle this automatically using `node-fetch` cookie persistence.

### Database Errors
**Error**: `getAllOrders is not a function`

**Solution**: Ensure Sanora database module has the `getAllOrders()` method (added in October 2025).

## Files Modified

### Sanora Service
- `/sanora/src/server/node/sanora.js` - Added 3 endpoints:
  - `GET /authteam` (line 872)
  - `POST /authteam/complete` (line 1070)
  - `GET /orders` (line 1100)

### Database Module
- `/sanora/src/server/node/src/persistence/db.js` - Added method:
  - `getAllOrders()` (line 161)

### Test Files
- `/sharon/tests/sanora/orders-webpage.test.js` - New test file (32 tests)
- `/sharon/package.json` - Added test script: `test:sanora:orders`

## Last Updated
October 24, 2025 - Created comprehensive orders webpage tests for Sanora with AuthTeam authentication and shipping address display verification.
