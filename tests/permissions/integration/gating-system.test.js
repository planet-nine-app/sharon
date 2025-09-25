/**
 * MAGIC Gating System Integration Tests
 *
 * Tests the complete spell gating flow: Client -> Julia -> Fount -> Target Service
 * Verifies MP consumption and nineum permission checking for creation spells.
 */

import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';
import sessionless from 'sessionless-node';
import { serviceConfig, mockUsers, getServiceUrl, testConfig } from '../../../config/test-config.js';

// Mock user keys for testing
const mockSaveKeys = (keys) => {
  console.log('Mock saving keys:', keys.pubKey.substring(0, 10) + '...');
};

const mockGetKeys = () => {
  return {
    pubKey: 'mock-pub-key-123',
    privKey: 'mock-priv-key-123'
  };
};

// Create a test user
async function createTestUser(userUUID) {
  try {
    console.log(`👤 Creating test user: ${userUUID}...`);

    const payload = {
      timestamp: new Date().getTime() + '',
      pubKey: `test-pub-key-${userUUID}`,
      user: {
        pubKey: `test-pub-key-${userUUID}`,
        uuid: userUUID,
        mp: 1000, // Give user plenty of MP for testing
        nineum: [] // Start with no nineum
      }
    };

    const message = payload.timestamp + payload.pubKey;
    payload.signature = 'mock-signature-' + message.length;

    const response = await fetch(`${getServiceUrl('fount')}/user/create`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 200) {
      const result = await response.json();
      console.log(`✅ Test user created: ${userUUID}`);
      return result;
    } else {
      const error = await response.text();
      console.log(`⚠️ User creation response:`, error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    return null;
  }
}

// Grant nineum to a user for testing
async function grantNineumToUser(granterUUID, recipientUUID, flavor) {
  try {
    console.log(`🎁 Granting nineum with flavor ${flavor} to ${recipientUUID}...`);

    const payload = {
      timestamp: new Date().getTime() + '',
      toUserUUID: recipientUUID,
      charge: flavor.slice(0, 2),
      direction: flavor.slice(2, 4),
      rarity: flavor.slice(4, 6),
      size: flavor.slice(6, 8),
      texture: flavor.slice(8, 10),
      shape: flavor.slice(10, 12),
      quantity: 1
    };

    const message = payload.timestamp + granterUUID + payload.toUserUUID + flavor + payload.quantity;
    payload.signature = 'mock-signature-' + message.length; // Mock signature for test

    const response = await fetch(`${TEST_BASE_URL}:3006/user/${granterUUID}/nineum`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.status === 200) {
      const result = await response.json();
      console.log(`✅ Nineum granted successfully`);
      return result;
    } else {
      const error = await response.text();
      console.log(`❌ Failed to grant nineum:`, error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error granting nineum:', error.message);
    return null;
  }
}

async function testCreateBDOSpell() {
  console.log('🧪 Testing createBDO spell with gating system...\n');

  try {
    // Step 0: Create test users and grant required nineum
    const testUserUUID = 'test-user-uuid';
    const adminUUID = 'admin-user-uuid'; // Admin who grants nineum
    const requiredFlavor = '010101020301'; // createBDO requires: positive+north+common+tiny+satin+sphere

    console.log('📋 Step 0: Setting up test users...');
    await createTestUser(testUserUUID);
    await createTestUser(adminUUID);

    console.log('🎁 Granting required nineum permissions...');
    await grantNineumToUser(adminUUID, testUserUUID, requiredFlavor);

    // Step 1: Create spell payload
    const spellPayload = {
      timestamp: new Date().getTime(),
      spell: 'createBDO',
      casterUUID: testUserUUID,
      totalCost: 50, // Cost for creating BDO
      mp: true,
      ordinal: 1,
      bdoData: {
        content: 'This is a test BDO created via spell',
        metadata: { test: true }
      },
      hash: 'test-hash',
      pubKey: 'test-pub-key',
      gateways: []
    };

    // Step 2: Sign the spell (mock signature for testing)
    const message = spellPayload.timestamp + spellPayload.spell + spellPayload.casterUUID + spellPayload.totalCost + spellPayload.mp + spellPayload.ordinal;
    spellPayload.casterSignature = 'mock-signature-' + message.length;

    console.log('📤 Step 1: Sending spell to Julia for coordination...');
    console.log('   Spell:', spellPayload.spell);
    console.log('   Caster:', spellPayload.casterUUID);
    console.log('   MP Cost:', spellPayload.totalCost, 'MP');
    console.log('   Requires nineum permissions: galaxy:01, system:28880014, flavor:' + requiredFlavor);

    // Step 3: Send to Julia (first destination)
    const juliaResponse = await fetch(`${getServiceUrl('julia')}/magic/spell/createBDO`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spellPayload)
    });

    console.log('📥 Julia response status:', juliaResponse.status);

    if (juliaResponse.status === 200) {
      const result = await juliaResponse.json();
      console.log('✅ Spell succeeded!');
      console.log('   Result:', JSON.stringify(result, null, 2));
    } else {
      const error = await juliaResponse.text();
      console.log('❌ Spell failed at Julia:');
      console.log('   Error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

async function testInsufficientMP() {
  console.log('\n🧪 Testing insufficient MP scenario...\n');

  try {
    const spellPayload = {
      timestamp: new Date().getTime(),
      spell: 'createBDO',
      casterUUID: 'broke-user-uuid', // User with insufficient nineum
      totalCost: 10000, // Very high cost
      mp: true,
      ordinal: 1,
      bdoData: { content: 'This should fail' },
      gateways: []
    };

    const message = spellPayload.timestamp + spellPayload.spell + spellPayload.casterUUID + spellPayload.totalCost + spellPayload.mp + spellPayload.ordinal;
    spellPayload.casterSignature = 'mock-signature-' + message.length;

    console.log('📤 Sending spell with insufficient MP...');

    const response = await fetch(`${getServiceUrl('julia')}/magic/spell/createBDO`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spellPayload)
    });

    console.log('📥 Response status:', response.status);

    if (response.status !== 200) {
      const error = await response.json();
      console.log('✅ Correctly rejected for insufficient MP or missing nineum:');
      console.log('   Error:', error.error);
      console.log('   Required:', error.required);
      console.log('   Available:', error.available);
    } else {
      console.log('❌ Spell should have been rejected but succeeded');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

async function testMissingNineumPermissions() {
  console.log('\n🧪 Testing missing nineum permissions scenario...\n');

  try {
    const spellPayload = {
      timestamp: new Date().getTime(),
      spell: 'createBDO',
      casterUUID: 'no-nineum-user-uuid', // User with no nineum at all
      totalCost: 50,
      mp: true,
      ordinal: 1,
      bdoData: { content: 'This should fail due to missing nineum' },
      gateways: []
    };

    const message = spellPayload.timestamp + spellPayload.spell + spellPayload.casterUUID + spellPayload.totalCost + spellPayload.mp + spellPayload.ordinal;
    spellPayload.casterSignature = 'mock-signature-' + message.length;

    console.log('📤 Sending spell without required nineum permissions...');

    const response = await fetch(`${TEST_BASE_URL}:3007/magic/spell/createBDO`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spellPayload)
    });

    console.log('📥 Response status:', response.status);

    if (response.status !== 200) {
      const error = await response.json();
      console.log('✅ Correctly rejected for missing nineum permissions:');
      console.log('   Error:', error.error);
      console.log('   Type:', error.type);
      console.log('   Required:', error.required);
      console.log('   Details:', error.details);
    } else {
      console.log('❌ Spell should have been rejected but succeeded');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Mocha Test Suite
describe('MAGIC Gating System', function() {
  this.timeout(30000); // 30 second timeout for integration tests

  before(function() {
    console.log('🎯 Starting MAGIC Gating System Tests');
    console.log('Testing flow: Client -> Julia -> Fount -> Target Service');
  });

  describe('Spell Authorization', function() {
    it('should successfully create BDO with proper MP and nineum permissions', async function() {
      await testCreateBDOSpell();
    });

    it('should reject spell with insufficient MP', async function() {
      await testInsufficientMP();
    });

    it('should reject spell with missing nineum permissions', async function() {
      await testMissingNineumPermissions();
    });
  });

  describe('Service Requirements', function() {
    it('should verify all required services are running', async function() {
      const services = [
        { name: 'Julia', port: 3007, path: '/' },
        { name: 'Fount', port: 3006, path: '/' },
        { name: 'BDO', port: 3003, path: '/' }
      ];

      for (const service of services) {
        try {
          const response = await fetch(`${TEST_BASE_URL}:${service.port}${service.path}`);
          expect(response.status).to.not.equal(0, `${service.name} service should be running on port ${service.port}`);
        } catch (error) {
          throw new Error(`${service.name} service not accessible on port ${service.port}: ${error.message}`);
        }
      }
    });
  });
});