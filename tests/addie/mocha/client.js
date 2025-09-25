import addie from 'addie-js';
import { should } from 'chai';
import sessionless from 'sessionless-node';
import { TEST_USERS } from './test-users.js';

should();

console.log(addie);

addie.baseURL = `http://nginx:80/addie/`;

// Use our test users with proper keys
const alice = TEST_USERS.alice;
const bob = TEST_USERS.bob;

const savedUser = {};
let keys = { privateKey: alice.privateKey, pubKey: alice.publicKey };
let keysToReturn = keys;
const hash = 'firstHash';
const secondHash = 'secondHash';

// Helper to switch users and setup sessionless
const switchToUser = async (user) => {
  const testKeys = { privateKey: user.privateKey, pubKey: user.publicKey };
  const saveKeys = (k) => { /* no-op, keys already defined */ };
  const getKeys = () => testKeys;
  await sessionless.generateKeys(saveKeys, getKeys);
  return testKeys;
};

it('should register a user', async () => {
  await switchToUser(alice);

  const uuid = await addie.createUser((k) => { keys = k; keysToReturn = k; }, () => { return keys; });
  savedUser.uuid = uuid;
  savedUser.uuid.length.should.equal(36);
});

it('should get a user', async () => {
  await switchToUser(alice);

  const addieUser = await addie.getUserByUUID(savedUser.uuid);
  addieUser.uuid.should.equal(savedUser.uuid);
});

it('should add processor account', async () => {
  const res = await addie.addProcessorAccount(savedUser.uuid, {});
  res.should.equal('unimplemented');
});

it('should get payment intent', async () => {
  const res = await addie.getPaymentIntent(savedUser.uuid, 'processor', {});
  // This endpoint returns an error object when unimplemented
  res.should.have.property('error');
});

it('should delete a user', async () => {
  await switchToUser(alice);

  const res = await addie.deleteUser(savedUser.uuid);
  res.should.equal(true);
});
