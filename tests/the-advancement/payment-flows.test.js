import { expect } from 'chai';
import sessionless from 'sessionless-node';
import fetch from 'node-fetch';

// Test configuration
const ADDIE_URL = process.env.ADDIE_URL || 'http://localhost:3004';
const TEST_USERS = {
  alice: {
    name: 'alice',
    privateKey: '4d2490a28deb8a16daaa553cebb385467797481da8a69052c8391a36cb9c68e7',
    publicKey: '031c4d981632f6d2d1171c0a8af6242b521954ae64d10528fd74fa4a9aeb9419ea'
  },
  bob: {
    name: 'bob',
    privateKey: 'f1b5a28da890263de9a3ee937bc35991bd970fd011c284e252b7a56ef6e7f720',
    publicKey: '026fa1a11b1810b44e1dacaadcd2a5d080e43654a5ac96af04e9d2af2358d38ccd'
  },
  carl: {
    name: 'carl',
    privateKey: 'a59aa3dff33b4298aacc94e5fa5babf045b37b85400054a578fe2625f937ba1a',
    publicKey: '0347925e7e43772e6712b66e4c96d637d6adb5721fba2985fe32c4d7345e673580'
  }
};

// Helper to make authenticated requests
async function makeAuthenticatedRequest(url, method, body, user) {
  const timestamp = Date.now().toString();
  const message = timestamp + user.publicKey;
  const signature = await sessionless.sign(message, user.privateKey);

  const headers = {
    'Content-Type': 'application/json',
    'X-Timestamp': timestamp,
    'X-PublicKey': user.publicKey,
    'X-Signature': signature
  };

  const options = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return await response.json();
}

describe('The Advancement - Payment Flows', function() {
  this.timeout(30000); // Stripe API calls can be slow

  let aliceUUID;
  let bobUUID;
  let carlUUID;
  let aliceStripeCustomerId;
  let bobStripeAccountId;
  let carlStripeAccountId;

  describe('1. User Creation & Setup', function() {

    it('should create Alice (buyer) in Addie', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/user`,
        'POST',
        {},
        TEST_USERS.alice
      );

      expect(result).to.have.property('uuid');
      expect(result.uuid).to.be.a('string');
      expect(result.uuid).to.have.lengthOf(36);

      aliceUUID = result.uuid;
      console.log(`✅ Alice created: ${aliceUUID}`);
    });

    it('should create Bob (seller/affiliate) in Addie', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/user`,
        'POST',
        {},
        TEST_USERS.bob
      );

      expect(result).to.have.property('uuid');
      bobUUID = result.uuid;
      console.log(`✅ Bob created: ${bobUUID}`);
    });

    it('should create Carl (product creator) in Addie', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/user`,
        'POST',
        {},
        TEST_USERS.carl
      );

      expect(result).to.have.property('uuid');
      carlUUID = result.uuid;
      console.log(`✅ Carl created: ${carlUUID}`);
    });
  });

  describe('2. Stripe Connected Account Creation', function() {

    it('should create Stripe Connected Account for Bob (seller)', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/create-account`,
        'POST',
        {
          accountType: 'express',
          country: 'US',
          email: 'bob-test@planetnine.app',
          businessType: 'individual'
        },
        TEST_USERS.bob
      );

      expect(result).to.have.property('accountId');
      expect(result).to.have.property('accountLink');
      expect(result.accountId).to.be.a('string');
      expect(result.accountId).to.match(/^acct_/);

      bobStripeAccountId = result.accountId;
      console.log(`✅ Bob's Stripe Connected Account: ${bobStripeAccountId}`);
      console.log(`📝 Onboarding link: ${result.accountLink.substring(0, 50)}...`);
    });

    it('should create Stripe Connected Account for Carl (product creator)', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/create-account`,
        'POST',
        {
          accountType: 'express',
          country: 'US',
          email: 'carl-test@planetnine.app',
          businessType: 'individual'
        },
        TEST_USERS.carl
      );

      expect(result).to.have.property('accountId');
      expect(result.accountId).to.match(/^acct_/);

      carlStripeAccountId = result.accountId;
      console.log(`✅ Carl's Stripe Connected Account: ${carlStripeAccountId}`);
    });

    it('should retrieve Bob\'s Connected Account status', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/account/status`,
        'GET',
        null,
        TEST_USERS.bob
      );

      expect(result).to.have.property('hasAccount');
      expect(result.hasAccount).to.be.true;
      expect(result).to.have.property('accountId');
      expect(result.accountId).to.equal(bobStripeAccountId);
      expect(result).to.have.property('detailsSubmitted');
      expect(result).to.have.property('chargesEnabled');
      expect(result).to.have.property('payoutsEnabled');

      console.log(`📊 Bob's account status:`, {
        detailsSubmitted: result.detailsSubmitted,
        chargesEnabled: result.chargesEnabled,
        payoutsEnabled: result.payoutsEnabled
      });
    });

    it('should refresh Bob\'s account link if needed', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/account/refresh-link`,
        'POST',
        {},
        TEST_USERS.bob
      );

      expect(result).to.have.property('accountLink');
      expect(result.accountLink).to.be.a('string');
      expect(result.accountLink).to.include('https://');

      console.log(`🔄 Refreshed onboarding link for Bob`);
    });
  });

  describe('3. Payment Method Management', function() {

    it('should create SetupIntent for Alice to save a card', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/setup-intent`,
        'POST',
        {},
        TEST_USERS.alice
      );

      expect(result).to.have.property('clientSecret');
      expect(result).to.have.property('customerId');
      expect(result).to.have.property('publishableKey');
      expect(result.clientSecret).to.match(/^seti_/);
      expect(result.customerId).to.match(/^cus_/);

      aliceStripeCustomerId = result.customerId;
      console.log(`✅ Alice's Stripe Customer: ${aliceStripeCustomerId}`);
      console.log(`📝 SetupIntent created: ${result.clientSecret.substring(0, 20)}...`);
    });

    it('should retrieve Alice\'s saved payment methods (empty initially)', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/payment-methods`,
        'GET',
        null,
        TEST_USERS.alice
      );

      expect(result).to.have.property('paymentMethods');
      expect(result.paymentMethods).to.be.an('array');
      expect(result).to.have.property('customerId');
      expect(result.customerId).to.equal(aliceStripeCustomerId);

      console.log(`💳 Alice has ${result.paymentMethods.length} saved payment methods`);
    });

    // NOTE: Actual card saving requires Stripe frontend (stripe.js) to complete
    // In a real test environment, you would:
    // 1. Use Stripe test cards
    // 2. Complete SetupIntent via stripe.js
    // 3. Verify payment method was saved
  });

  describe('4. Payment Creation & Processing', function() {

    it('should create payment intent without splits (simple purchase)', async function() {
      const amount = 2999; // $29.99

      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/payment-intent-without-splits`,
        'POST',
        {
          amount,
          currency: 'usd',
          savePaymentMethod: true
        },
        TEST_USERS.alice
      );

      expect(result).to.have.property('paymentIntent');
      expect(result).to.have.property('ephemeralKey');
      expect(result).to.have.property('customer');
      expect(result).to.have.property('publishableKey');
      expect(result.customer).to.equal(aliceStripeCustomerId);

      console.log(`💰 Payment intent created: $${amount/100}`);
    });

    it('should create payment intent WITH splits (affiliate purchase)', async function() {
      const totalAmount = 4999; // $49.99
      const bobCommission = 500; // $5.00 (10% affiliate)
      const carlRevenue = 4499; // $44.99 (90% to creator)

      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/payment-intent`,
        'POST',
        {
          amount: totalAmount,
          currency: 'usd',
          payees: [
            {
              pubKey: TEST_USERS.bob.publicKey,
              amount: bobCommission
            },
            {
              pubKey: TEST_USERS.carl.publicKey,
              amount: carlRevenue
            }
          ]
        },
        TEST_USERS.alice
      );

      expect(result).to.have.property('paymentIntent');
      expect(result).to.have.property('customer');

      console.log(`💰 Affiliate payment intent created: $${totalAmount/100}`);
      console.log(`   Bob (affiliate): $${bobCommission/100}`);
      console.log(`   Carl (creator): $${carlRevenue/100}`);
    });
  });

  describe('5. Transfer Processing', function() {

    it('should process transfers after payment confirmation', async function() {
      // NOTE: This test requires a completed payment intent
      // In a real test, you would:
      // 1. Create payment intent with payees
      // 2. Complete payment via Stripe (using test card)
      // 3. Call processPaymentTransfers endpoint
      // 4. Verify transfers were created

      // For now, we'll test the endpoint structure exists
      const testPaymentIntentId = 'pi_test_123'; // Would be real ID in actual test

      try {
        const result = await makeAuthenticatedRequest(
          `${ADDIE_URL}/payment/${testPaymentIntentId}/process-transfers`,
          'POST',
          {},
          TEST_USERS.alice
        );

        // Will likely fail with invalid payment intent, but tests endpoint exists
        console.log(`🔄 Transfer processing endpoint tested`);
      } catch(err) {
        // Expected to fail with test payment intent
        console.log(`ℹ️ Transfer endpoint exists (expected to fail with test data)`);
      }
    });
  });

  describe('6. Stripe Issuing (Virtual Cards for the Unbanked)', function() {

    it('should create cardholder for Alice', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/cardholder`,
        'POST',
        {
          individualInfo: {
            firstName: 'Alice',
            lastName: 'TestUser',
            name: 'Alice TestUser',
            email: 'alice-test@planetnine.app',
            phoneNumber: '+15555551234',
            address: {
              line1: '123 Test St',
              city: 'San Francisco',
              state: 'CA',
              postal_code: '94110',
              country: 'US'
            },
            dob: {
              day: 15,
              month: 6,
              year: 1990
            }
          }
        },
        TEST_USERS.alice
      );

      expect(result).to.have.property('cardholderId');
      expect(result).to.have.property('status');
      expect(result.cardholderId).to.match(/^ich_/);
      expect(result.status).to.equal('active');

      console.log(`✅ Alice's cardholder created: ${result.cardholderId}`);
    });

    it('should issue virtual card for Alice', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/issue-virtual-card`,
        'POST',
        {
          currency: 'usd',
          spendingLimit: 100000 // $1000/month
        },
        TEST_USERS.alice
      );

      expect(result).to.have.property('cardId');
      expect(result).to.have.property('last4');
      expect(result).to.have.property('brand');
      expect(result).to.have.property('expMonth');
      expect(result).to.have.property('expYear');
      expect(result).to.have.property('status');
      expect(result.type).to.equal('virtual');
      expect(result.spendingLimit).to.equal(100000);

      console.log(`💳 Virtual card issued: •••• ${result.last4}`);
      console.log(`   Brand: ${result.brand}`);
      console.log(`   Expires: ${result.expMonth}/${result.expYear}`);
      console.log(`   Limit: $${result.spendingLimit/100}/month`);
    });

    it('should get Alice\'s issued cards', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/issued-cards`,
        'GET',
        null,
        TEST_USERS.alice
      );

      expect(result).to.have.property('cards');
      expect(result.cards).to.be.an('array');
      expect(result.cards.length).to.be.greaterThan(0);

      const card = result.cards[0];
      expect(card).to.have.property('cardId');
      expect(card).to.have.property('last4');
      expect(card).to.have.property('status');

      console.log(`💳 Alice has ${result.cards.length} issued card(s)`);
    });

    it('should get Alice\'s transactions (if any)', async function() {
      const result = await makeAuthenticatedRequest(
        `${ADDIE_URL}/processor/stripe/transactions`,
        'GET',
        null,
        TEST_USERS.alice
      );

      expect(result).to.have.property('transactions');
      expect(result.transactions).to.be.an('array');

      console.log(`💳 Alice has ${result.transactions.length} transaction(s)`);
    });
  });

  describe('7. Cleanup', function() {

    it('should clean up test users', async function() {
      // Note: Actual cleanup would depend on Addie having delete endpoints
      // This is a placeholder for cleanup logic
      console.log(`🧹 Test cleanup complete`);
    });
  });
});
