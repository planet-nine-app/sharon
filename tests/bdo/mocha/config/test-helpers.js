/**
 * Test Helpers - Utilities for Sharon test suite
 */

import sessionless from 'sessionless-node';
import { TEST_USERS } from './test-users.js';

/**
 * Get a test user's keys and setup sessionless
 * @param {string} userName - alice, bob, caitlyn, or dave
 * @returns {Object} - {user, sessionless, keys}
 */
export function getTestUser(userName = 'alice') {
  const user = TEST_USERS[userName];
  if (!user) {
    throw new Error(`Unknown test user: ${userName}. Available: alice, bob, caitlyn, dave`);
  }

  const keys = {
    privateKey: user.privateKey,
    pubKey: user.publicKey
  };

  return {
    user,
    keys,
    name: userName
  };
}

/**
 * Setup sessionless with static test keys
 * @param {string} userName - alice, bob, caitlyn, or dave
 * @returns {Promise} - configured sessionless instance
 */
export async function setupTestSessionless(userName = 'alice') {
  const testUser = getTestUser(userName);

  const saveKeys = (keys) => {
    // Keys are already saved as static test keys
  };

  const getKeys = () => testUser.keys;

  await sessionless.generateKeys(saveKeys, getKeys);
  return sessionless;
}

/**
 * Get all test users for multi-user scenarios
 */
export function getAllTestUsers() {
  return Object.keys(TEST_USERS).map(name => ({
    name,
    ...getTestUser(name)
  }));
}

export default {
  getTestUser,
  setupTestSessionless,
  getAllTestUsers,
  TEST_USERS
};