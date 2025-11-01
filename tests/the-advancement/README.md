# The Advancement - Integration Tests

Comprehensive integration tests for The Advancement iOS and Android apps, focusing on payment processing with Stripe via the Addie backend.

## Overview

These tests validate the complete payment flow from The Advancement app through Addie's Stripe integration, ensuring users can:
1. Create Stripe Connected Accounts to receive funds
2. Save payment methods to their account
3. Make purchases with affiliate commission splits
4. Issue virtual cards for the unbanked

## Test Coverage

### 1. User Creation & Setup
- ✅ Create buyer account in Addie
- ✅ Create seller/affiliate account in Addie
- ✅ Create product creator account in Addie

### 2. Stripe Connected Account Creation
- ✅ Create Express Connected Account for sellers
- ✅ Generate onboarding link
- ✅ Retrieve account status (details submitted, charges enabled, payouts enabled)
- ✅ Refresh onboarding link

### 3. Payment Method Management
- ✅ Create SetupIntent for saving cards
- ✅ Retrieve saved payment methods
- ✅ Delete saved payment methods

### 4. Payment Creation & Processing
- ✅ Create payment intent without splits (simple purchase)
- ✅ Create payment intent with splits (affiliate commission)
- ✅ Process transfers after payment confirmation

### 5. Stripe Issuing (Virtual Cards)
- ✅ Create cardholder account
- ✅ Issue virtual debit card
- ✅ Get issued cards
- ✅ Get card transactions
- ✅ Update card status (freeze/unfreeze)

## Prerequisites

### Environment Setup

1. **Addie Service Running**
```bash
cd addie/src/server/node
npm install
npm start
# Should be running on http://localhost:3005
```

2. **Stripe API Keys**
```bash
# Set in addie/.env or addie/src/server/node/.env
STRIPE_KEY=sk_test_...
STRIPE_PUBLISHING_KEY=pk_test_...
```

3. **Test Environment**
```bash
cd sharon/tests/the-advancement
npm install
```

## Running Tests

### Full Test Suite
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Verbose Output
```bash
npm run test:verbose
```

### Individual Test Groups
```bash
# Only run specific test groups
mocha payment-flows.test.js --grep "Stripe Connected Account"
mocha payment-flows.test.js --grep "Payment Method Management"
mocha payment-flows.test.js --grep "Stripe Issuing"
```

## Test Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CREATION                                            │
│                                                             │
│  Alice (Buyer)  →  Addie  →  UUID + Stripe Customer        │
│  Bob (Seller)   →  Addie  →  UUID                          │
│  Carl (Creator) →  Addie  →  UUID                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CONNECTED ACCOUNT SETUP (Bob & Carl)                    │
│                                                             │
│  Bob  →  POST /processor/stripe/create-account             │
│      →  Returns: accountId + onboarding link               │
│                                                             │
│  GET /processor/stripe/account/status                       │
│      →  Returns: detailsSubmitted, chargesEnabled, etc.    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PAYMENT METHOD SETUP (Alice)                            │
│                                                             │
│  Alice →  POST /processor/stripe/setup-intent              │
│       →  Returns: clientSecret for Stripe Elements         │
│       →  [Frontend completes card save via stripe.js]      │
│                                                             │
│  GET /processor/stripe/payment-methods                      │
│      →  Returns: saved cards array                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PURCHASE WITH AFFILIATE SPLIT                           │
│                                                             │
│  Alice buys product ($49.99)                               │
│      →  POST /processor/stripe/payment-intent              │
│      →  payees: [                                          │
│           { pubKey: Bob, amount: 500 },    # 10% to Bob    │
│           { pubKey: Carl, amount: 4499 }   # 90% to Carl   │
│         ]                                                  │
│      →  Returns: paymentIntent for Stripe                  │
│      →  [Frontend completes payment via stripe.js]         │
│                                                             │
│  POST /payment/:paymentIntentId/process-transfers           │
│      →  Creates Stripe transfers to Bob & Carl accounts    │
│      →  Funds arrive in 2-3 business days                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. VIRTUAL CARD FOR UNBANKED (Alice)                       │
│                                                             │
│  POST /processor/stripe/cardholder                         │
│      →  Creates Stripe Issuing cardholder                  │
│                                                             │
│  POST /processor/stripe/issue-virtual-card                 │
│      →  Returns: virtual card details (number, CVC, etc.)  │
│                                                             │
│  GET /processor/stripe/transactions                         │
│      →  Returns: card transaction history                  │
└─────────────────────────────────────────────────────────────┘
```

## Test Users

The tests use predefined test users with Sessionless cryptographic keys:

- **Alice**: Buyer (receives virtual card)
- **Bob**: Seller/affiliate (receives 10% commission)
- **Carl**: Product creator (receives 90% revenue)

## Important Notes

### Stripe Test Mode

All tests use Stripe test mode:
- Test API keys (sk_test_... / pk_test_...)
- Test cards: `4242 4242 4242 4242`
- No real money is processed
- Test accounts must complete onboarding manually

### Frontend Integration

Some flows require Stripe frontend (stripe.js):
1. **Saving Cards**: SetupIntent requires stripe.confirmSetup()
2. **Completing Payments**: PaymentIntent requires stripe.confirmPayment()

In production, The Advancement app handles these via:
- **iOS**: WKWebView with Stripe Elements
- **Android**: WebView with Stripe Elements

### Transfer Processing

The affiliate split flow works as follows:
1. Payment intent created with payee metadata
2. Frontend completes payment via Stripe
3. Backend processes transfers via `/payment/:id/process-transfers`
4. Transfers created to Connected Accounts
5. Funds arrive within 2-3 business days

## Expected Results

### Successful Test Run

```
The Advancement - Payment Flows
  1. User Creation & Setup
    ✅ Alice created: 12345678-1234-1234-1234-123456789012
    ✅ Bob created: 87654321-4321-4321-4321-210987654321
    ✅ Carl created: 11223344-5566-7788-9900-aabbccddeeff

  2. Stripe Connected Account Creation
    ✅ Bob's Stripe Connected Account: acct_1AbCdEfGh...
    ✅ Carl's Stripe Connected Account: acct_2XyZaBcDeF...
    📊 Bob's account status: { detailsSubmitted: false, chargesEnabled: false, payoutsEnabled: false }

  3. Payment Method Management
    ✅ Alice's Stripe Customer: cus_1234567890abcdef
    💳 Alice has 0 saved payment methods

  4. Payment Creation & Processing
    💰 Payment intent created: $29.99
    💰 Affiliate payment intent created: $49.99
       Bob (affiliate): $5.00
       Carl (creator): $44.99

  5. Stripe Issuing (Virtual Cards for the Unbanked)
    ✅ Alice's cardholder created: ich_1AbCdEfGhIjKlMn
    💳 Virtual card issued: •••• 4242
       Brand: Visa
       Expires: 12/2027
       Limit: $1000/month
```

## Troubleshooting

### Addie Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:3005
```
**Solution**: Start Addie service on port 3005

### Missing Stripe Keys
```
Error: Stripe key not found
```
**Solution**: Set STRIPE_KEY and STRIPE_PUBLISHING_KEY in .env

### Authentication Failures
```
Error: Invalid signature
```
**Solution**: Ensure sessionless-node is properly installed

### Connected Account Requires Onboarding
```
detailsSubmitted: false
```
**Note**: This is expected. In test mode, manually complete onboarding:
1. Use returned accountLink URL
2. Fill Stripe onboarding form
3. Use test account details
4. Re-run status check

## Integration with Sharon

These tests are part of Sharon's comprehensive test suite:

```bash
# Run from sharon root
npm run test:the-advancement

# Or run all tests
npm run test:all
```

## Future Enhancements

- [ ] Automated Stripe test card completion
- [ ] Webhook testing for payment confirmations
- [ ] Subscription payment flows
- [ ] Refund processing tests
- [ ] Physical card issuance tests
- [ ] 3D Secure authentication flows

## Documentation

- **The Advancement App**: `/the-advancement/CLAUDE.md`
- **Addie Service**: `/addie/CLAUDE.md`
- **Stripe Integration**: `/addie/src/server/node/src/processors/stripe.js`
- **iOS App**: `/the-advancement/src/The Advancement/`
- **Android App**: `/the-advancement/src/android/`

## Last Updated

October 31, 2025 - Initial test suite created covering all payment flows in The Advancement app.
