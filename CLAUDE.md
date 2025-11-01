# Sharon - Planet Nine Integration Test Harness

## Overview

Sharon is the comprehensive integration test harness for the Planet Nine ecosystem. It provides centralized testing infrastructure for all microservices, protocols, and system-level integration tests.

**Location**: `/sharon/`

## Core Features

### 🧪 **Centralized Testing**
- **Service Tests**: Individual microservice test suites
- **Protocol Tests**: MAGIC protocol, sessionless auth, teleportation
- **Integration Tests**: Cross-service workflows
- **MAGIC Spell Tests**: Comprehensive spell testing for all services

### 🔄 **Test Orchestration**
- **Unified Test Runner**: Single command to run all tests
- **Service-Specific Runners**: Individual service test execution
- **Protocol Validators**: Protocol compliance testing
- **Docker Support**: Containerized test environments

## Test Structure

```
sharon/
├── tests/
│   ├── fount/          # Fount service tests + MAGIC spells
│   ├── bdo/            # BDO service tests + MAGIC spells
│   ├── covenant/       # Covenant service tests + MAGIC spells
│   ├── prof/           # Prof service tests + MAGIC spells
│   ├── addie/          # Addie service tests + MAGIC spells
│   ├── julia/          # Julia service tests + MAGIC spells
│   ├── sanora/         # Sanora service tests + MAGIC spells
│   ├── dolores/        # Dolores service tests + MAGIC spells
│   ├── joan/           # Joan service tests + MAGIC spells
│   ├── pref/           # Pref service tests + MAGIC spells
│   ├── aretha/         # Aretha service tests + MAGIC spells
│   ├── continuebee/    # Continuebee service tests + MAGIC spells
│   ├── magic/          # MAGIC protocol tests
│   ├── sessionless/    # Sessionless auth tests
│   └── teleportation/  # Teleportation protocol tests
├── run-all-tests.js          # Master test runner
├── run-service-tests.js       # Service test runner
├── run-protocol-tests.js      # Protocol test runner
├── run-magic-spell-tests.js   # MAGIC spell test runner (NEW)
└── package.json
```

## Test Scripts

### Run All Tests
```bash
npm test                    # Run all tests
npm run test:all           # Same as above
```

### Run Test Categories
```bash
npm run test:services      # All service tests
npm run test:protocols     # All protocol tests
npm run test:magic-spells  # All MAGIC spell tests (NEW)
```

### Run Individual Service Tests
```bash
npm run test:fount
npm run test:bdo
npm run test:covenant
# ... etc for each service
```

### Run Individual MAGIC Spell Tests (NEW)
```bash
npm run test:fount:magic
npm run test:bdo:magic
npm run test:covenant:magic
npm run test:prof:magic
npm run test:addie:magic
npm run test:julia:magic
npm run test:sanora:magic
npm run test:dolores:magic
npm run test:joan:magic
npm run test:pref:magic
npm run test:aretha:magic
npm run test:continuebee:magic
```

### Run Specialized Tests
```bash
npm run test:sanora:orders        # Sanora orders webpage with AuthTeam
npm run test:the-advancement      # The Advancement payment flows (NEW)
```

## MAGIC Spell Testing (October 2025)

Sharon now includes comprehensive MAGIC spell tests for all 12 services that have been converted to the MAGIC protocol.

### MAGIC Test Coverage
- **12 Services**: All Planet Nine services with MAGIC conversion
- **64 Total Spells**: Every converted REST endpoint
- **120 Tests**: 10 tests per service (success + error cases)
- **Unified Runner**: `run-magic-spell-tests.js` runs all MAGIC tests

### Test Files
Each service has a `magic-spells.js` test file:
- Fount: `/tests/fount/mocha/magic-spells.js`
- All others: `/tests/{service}/magic-spells.js`

### Running MAGIC Tests

**All services:**
```bash
npm run test:magic-spells
```

Output shows:
- ✨ Total services tested (12)
- 🔮 Total spells tested (64)
- ✅ Services passed
- ❌ Services failed
- Summary statistics

**Individual service:**
```bash
npm run test:fount:magic
```

### Test Requirements

MAGIC spell tests require:
1. **All Planet Nine services running** on localhost
2. **Correct ports**:
   - Fount: 3006
   - BDO: 3003
   - Covenant: 3011
   - Prof: 3012
   - Addie: 3004
   - Julia: 3005
   - Sanora: 3002
   - Dolores: 3007
   - Joan: 3008
   - Pref: 3009
   - Aretha: 3010
   - Continuebee: 3001

3. **Dependencies installed**:
   - `sessionless-node` (local file dependency)
   - `fount-js` (local file dependency)
   - Mocha, Chai

## Dependencies

Sharon uses local file dependencies for Planet Nine libraries:

```json
{
  "sessionless-node": "file:../sessionless/src/javascript/node",
  "fount-js": "file:../fount/src/client/javascript"
}
```

This ensures tests use the latest local versions of these libraries.

## Docker Support

Sharon includes Docker Compose configuration for running tests in isolated environments:

```bash
npm run env:start        # Start test environment
npm run env:test         # Run tests in Docker
npm run env:logs         # View logs
npm run env:stop         # Stop environment
npm run env:clean        # Clean up containers
```

## Test Results

Tests output to console with clear pass/fail indicators:
- ✅ Passed tests
- ❌ Failed tests
- 📊 Summary statistics
- Detailed error messages for failures

## Sanora Orders Webpage Tests (October 2025)

Sharon now includes comprehensive tests for the Sanora orders dashboard with AuthTeam authentication.

### Test Coverage
- **32 Tests** covering all aspects of the orders webpage
- **AuthTeam Authentication**: Color sequence challenge generation and completion
- **Session Management**: 1-hour session timeout verification
- **Orders Display**: Order cards, shipping addresses, status badges
- **Database Integration**: `getAllOrders()` method testing
- **Security**: Session-based access control, unique tokens, random sequences

### Running Orders Tests

```bash
npm run test:sanora:orders
```

### Features Tested
1. **AuthTeam Challenge**: Random color sequence generation (5 colors)
2. **Challenge Completion**: Session token validation and authentication
3. **Access Control**: Redirect unauthenticated users to `/authteam`
4. **Orders Dashboard**: Display all orders with proper HTML structure
5. **Shipping Addresses**: Highlighted address section with all fields
6. **Status Badges**: Color-coded badges (pending, processing, shipped, delivered, cancelled)
7. **UI/UX**: Gradient background, responsive grid, refresh button
8. **Database**: getAllOrders() method with deduplication and sorting
9. **Integration**: Purchase spell flow with shipping addresses in components

### Test File
- **Location**: `/tests/sanora/orders-webpage.test.js`
- **Documentation**: `/tests/sanora/ORDERS-TESTS-README.md`

### Requirements
- Sanora service running on port 7243
- Redis database with orders data
- Session middleware configured

## The Advancement Payment Flow Tests (October 2025)

Sharon now includes comprehensive integration tests for The Advancement iOS and Android apps, focusing on Stripe payment processing via Addie.

### Test Coverage
- **32 Tests** covering complete payment flows
- **Stripe Connected Accounts**: Create Express accounts for sellers to receive funds
- **Payment Methods**: Save cards via SetupIntent, retrieve saved cards
- **Payment Splits**: Affiliate commission distribution (90% creator, 10% affiliate)
- **Transfer Processing**: Post-payment fund distribution to Connected Accounts
- **Stripe Issuing**: Virtual debit cards for the unbanked

### Running The Advancement Tests

```bash
npm run test:the-advancement
```

### Key Test Scenarios

1. **User Creation**:
   - Alice (buyer with virtual card)
   - Bob (seller/affiliate receiving 10% commission)
   - Carl (product creator receiving 90% revenue)

2. **Connected Account Setup**:
   - Create Stripe Express accounts
   - Generate onboarding links
   - Check account status (details submitted, charges/payouts enabled)
   - Refresh onboarding links

3. **Payment Method Management**:
   - Create SetupIntent for saving cards
   - Retrieve saved payment methods
   - Delete payment methods

4. **Purchase with Affiliate Split**:
   - Create payment intent with payee metadata
   - Bob receives $5 (10% of $50 product)
   - Carl receives $45 (90% of $50 product)
   - Process transfers after payment confirmation

5. **Virtual Cards for Unbanked**:
   - Create Stripe Issuing cardholder
   - Issue virtual debit card
   - Set spending limits ($1000/month)
   - View card transactions

### Test Files
- **Location**: `/tests/the-advancement/payment-flows.test.js`
- **Documentation**: `/tests/the-advancement/README.md`

### Requirements
- Addie service running on port 3004
- Stripe API keys configured:
  - `STRIPE_KEY=sk_test_...`
  - `STRIPE_PUBLISHING_KEY=pk_test_...`
- sessionless-node dependency installed

### Integration with The Advancement App

These tests validate the complete flow from The Advancement app:
- **iOS**: `/the-advancement/src/The Advancement/Shared (App)/PaymentMethodViewController.swift`
- **Android**: `/the-advancement/src/android/app/src/main/java/app/planetnine/theadvancement/ui/payment/PaymentMethodActivity.kt`

Both apps use the same Addie endpoints tested here for:
- Saving cards for purchases
- Creating seller accounts to receive affiliate commissions
- Issuing virtual cards for users without traditional banking

## Test Structure (Updated)

```
sharon/
├── tests/
│   ├── fount/          # Fount service tests + MAGIC spells
│   ├── bdo/            # BDO service tests + MAGIC spells
│   ├── covenant/       # Covenant service tests + MAGIC spells
│   ├── prof/           # Prof service tests + MAGIC spells
│   ├── addie/          # Addie service tests + MAGIC spells
│   ├── julia/          # Julia service tests + MAGIC spells
│   ├── sanora/         # Sanora service tests + MAGIC spells
│   ├── dolores/        # Dolores service tests + MAGIC spells
│   ├── joan/           # Joan service tests + MAGIC spells
│   ├── pref/           # Pref service tests + MAGIC spells
│   ├── aretha/         # Aretha service tests + MAGIC spells
│   ├── continuebee/    # Continuebee service tests + MAGIC spells
│   ├── the-advancement/ # The Advancement payment flows (NEW)
│   ├── magic/          # MAGIC protocol tests
│   ├── sessionless/    # Sessionless auth tests
│   └── teleportation/  # Teleportation protocol tests
├── run-all-tests.js          # Master test runner
├── run-service-tests.js       # Service test runner
├── run-protocol-tests.js      # Protocol test runner
├── run-magic-spell-tests.js   # MAGIC spell test runner
└── package.json
```

## Last Updated
October 31, 2025 - Added comprehensive The Advancement payment flow tests (32 tests) covering Stripe Connected Accounts, payment methods, affiliate splits, transfers, and virtual cards for the unbanked. Total: 64 spells, 184 tests across all services and applications.
