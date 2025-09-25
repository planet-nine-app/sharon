import bdo from 'bdo-js';
import { should } from 'chai';
import sessionless from 'sessionless-node';
import { TEST_USERS } from './test-users.js';

should();

console.log(bdo);

// Use our test users with proper keys
const alice = TEST_USERS.alice;
const bob = TEST_USERS.bob;

const savedUser = {};
const savedUser2 = {};
let keys = { privateKey: alice.privateKey, pubKey: alice.publicKey };
let keys2 = { privateKey: bob.privateKey, pubKey: bob.publicKey };
let keysToReturn = keys;
const hash = 'firstHash';
const anotherHash = 'secondHash';
let baseId;

// Use nginx routing
bdo.baseURL = `http://nginx:80/bdo/`;

// Helper to switch users and setup sessionless
const switchToUser = async (user) => {
  const testKeys = { privateKey: user.privateKey, pubKey: user.publicKey };
  const saveKeys = (k) => { /* no-op, keys already defined */ };
  const getKeys = () => testKeys;
  await sessionless.generateKeys(saveKeys, getKeys);
  return testKeys;
};

it('should register a user (alice)', async () => {
  keysToReturn = await switchToUser(alice);

  const newBDO = {
    foo: 'bar',
    baz: 'new'
  };
  const uuid = await bdo.createUser(hash, newBDO, (k) => { keys = k; keysToReturn = k; }, () => { return keys; });
  console.log('Alice UUID:', uuid);
  savedUser.uuid = uuid;
  savedUser.uuid.length.should.equal(36);
});

it('should register another user (bob)', async () => {
  keysToReturn = await switchToUser(bob);

  const newBDO = {
    foo: 'bar',
    baz: 'another'
  };
  const uuid = await bdo.createUser(anotherHash, newBDO, (k) => { keys2 = k; keysToReturn = k;}, () => { return keysToReturn; });
  console.log('Bob UUID:', uuid);
  savedUser2.uuid = uuid;
  savedUser2.uuid.length.should.equal(36);
});

it('should save bdo', async () => {
  keysToReturn = keys;
  await switchToUser(alice);

  const newBDO = {
    foo: 'bar',
    baz: 'updated'
  };
  const res = await bdo.updateBDO(savedUser.uuid, hash, newBDO);
  res.bdo.baz.should.equal('updated');
});

it('should get bdo', async () => {
  await switchToUser(alice);

  const res = await bdo.getBDO(savedUser.uuid, hash);
  res.bdo.baz.should.equal('updated');
});

it('should save a public bdo', async () => {
  keysToReturn = keys2;
  await switchToUser(bob);

  const pubBDO = {
    foo: 'bar',
    baz: 'public'
  };
  const res = await bdo.updateBDO(savedUser2.uuid, anotherHash, pubBDO, true);
  res.bdo.baz.should.equal('public');
  keysToReturn = keys;
});

it('should get a public bdo', async () => {
  await switchToUser(alice);

  const res = await bdo.getBDO(savedUser.uuid, hash, keys2.pubKey);
  res.bdo.baz.should.equal('public');
});

it('should save a base', async () => {
  keysToReturn = keys2;
  await switchToUser(bob);

  baseId = sessionless.generateUUID();

  const bases = {};
  bases[baseId] = {
    name: 'FOO',
    description: 'here is the first description',
    location: {
      latitude: 10.50900,
      longitude: 133.90483,
      postalCode: '12345'
    },
    soma: {
      lexary: [
        'parties'
      ],
      photary: [
        'music'
      ],
      viewary: [
        'rip the system'
      ]
    },
    dns: {
      dolores: 'https://dev.dolores.allyabase.com'
    },
    joined: true
  };

  const res = await bdo.saveBases(savedUser2.uuid, anotherHash, bases);
  baseId = Object.keys(res)[0];
  res[baseId].name.should.equal('FOO');
  keysToReturn = keys;
});

it('should get bases', async () => {
  keysToReturn = keys2;
  await switchToUser(bob);

  const res = await bdo.getBases(savedUser2.uuid, anotherHash);
  console.log('getBases response:', res);
  if (res && Array.isArray(res)) {
    res.length.should.be.greaterThan(0);
    res[0].name.should.equal('FOO');
  } else if (res && typeof res === 'object') {
    Object.keys(res).length.should.be.greaterThan(0);
    const firstBaseId = Object.keys(res)[0];
    res[firstBaseId].name.should.equal('FOO');
  } else {
    throw new Error(`Expected bases response but got: ${JSON.stringify(res)}`);
  }
  keysToReturn = keys;
});

it('should delete a user', async () => {
  await switchToUser(alice);

  const res = await bdo.deleteUser(savedUser.uuid);
  res.should.equal(true);
});

it('should delete another user', async () => {
  keysToReturn = keys2;
  await switchToUser(bob);

  const res = await bdo.deleteUser(savedUser2.uuid);
  res.should.equal(true);
});