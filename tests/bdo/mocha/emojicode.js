import bdo from 'bdo-js';
import { should } from 'chai';
import sessionless from 'sessionless-node';
import { TEST_USERS } from './test-users.js';
import fetch from 'node-fetch';

should();

// Use our test users with proper keys
const alice = TEST_USERS.alice;
const caitlyn = TEST_USERS.caitlyn;

const savedUser = {};
const savedUser2 = {};
let keys = { privateKey: alice.privateKey, pubKey: alice.publicKey };
let keys2 = { privateKey: caitlyn.privateKey, pubKey: caitlyn.publicKey };
let keysToReturn = keys;
const hash = 'emojicodeTestHash1';
const anotherHash = 'emojicodeTestHash2';

// Use nginx routing
bdo.baseURL = `http://nginx:80/bdo/`;
const directBDOURL = 'http://nginx:80/bdo';

// Helper to switch users and setup sessionless
const switchToUser = async (user) => {
  const testKeys = { privateKey: user.privateKey, pubKey: user.publicKey };
  const saveKeys = (k) => { /* no-op, keys already defined */ };
  const getKeys = () => testKeys;
  await sessionless.generateKeys(saveKeys, getKeys);
  return testKeys;
};

// Helper to validate emojicode format
const isValidEmojicodeFormat = (emojicode) => {
  if (!emojicode || typeof emojicode !== 'string') return false;

  // Convert to array of emoji characters (handles multi-byte UTF-8)
  const emojiArray = [...emojicode];

  // Must be exactly 8 emoji
  return emojiArray.length === 8;
};

// Helper to extract base emoji (first 3)
const getBaseEmoji = (emojicode) => {
  return [...emojicode].slice(0, 3).join('');
};

// Helper to extract unique emoji (last 5)
const getUniqueEmoji = (emojicode) => {
  return [...emojicode].slice(3, 8).join('');
};

let aliceEmojicode;
let caitlynEmojicode;

describe('Emojicode System', () => {
  describe('Setup', () => {
    it('should register alice', async () => {
      keysToReturn = await switchToUser(alice);

      const newBDO = {
        foo: 'bar',
        description: 'Alice test BDO'
      };
      const uuid = await bdo.createUser(hash, newBDO, (k) => { keys = k; keysToReturn = k; }, () => { return keys; });
      console.log('Alice UUID:', uuid);
      savedUser.uuid = uuid;
      savedUser.uuid.length.should.equal(36);
    });

    it('should register caitlyn', async () => {
      keysToReturn = await switchToUser(caitlyn);

      const newBDO = {
        foo: 'bar',
        description: 'Caitlyn test BDO'
      };
      const uuid = await bdo.createUser(anotherHash, newBDO, (k) => { keys2 = k; keysToReturn = k; }, () => { return keysToReturn; });
      console.log('Caitlyn UUID:', uuid);
      savedUser2.uuid = uuid;
      savedUser2.uuid.length.should.equal(36);
    });
  });

  describe('Automatic Emojicode Assignment', () => {
    it('should automatically assign emojicode when saving public BDO (alice)', async () => {
      keysToReturn = keys;
      await switchToUser(alice);

      const pubBDO = {
        foo: 'bar',
        description: 'Alice public BDO with emojicode',
        isPublic: true
      };

      // Save as public BDO (pub=true)
      const res = await bdo.updateBDO(savedUser.uuid, hash, pubBDO, true);
      res.bdo.description.should.equal('Alice public BDO with emojicode');

      console.log('✅ Alice public BDO saved, emojicode should be assigned');
    });

    it('should automatically assign emojicode when saving public BDO (caitlyn)', async () => {
      keysToReturn = keys2;
      await switchToUser(caitlyn);

      const pubBDO = {
        foo: 'baz',
        description: 'Caitlyn public BDO with emojicode',
        isPublic: true
      };

      // Save as public BDO (pub=true)
      const res = await bdo.updateBDO(savedUser2.uuid, anotherHash, pubBDO, true);
      res.bdo.description.should.equal('Caitlyn public BDO with emojicode');

      console.log('✅ Caitlyn public BDO saved, emojicode should be assigned');
    });
  });

  describe('Emojicode Retrieval', () => {
    it('should retrieve emojicode for alice pubKey', async () => {
      await switchToUser(alice);

      const res = await fetch(`${directBDOURL}/pubkey/${keys.pubKey}/emojicode`);
      res.status.should.equal(200);

      const data = await res.json();
      console.log('Alice emojicode data:', data);

      data.should.have.property('emojicode');
      data.should.have.property('pubKey');
      data.should.have.property('createdAt');

      data.pubKey.should.equal(keys.pubKey);

      // Validate emojicode format
      isValidEmojicodeFormat(data.emojicode).should.be.true;

      console.log(`✅ Alice emojicode: ${data.emojicode}`);
      console.log(`   Base emoji: ${getBaseEmoji(data.emojicode)}`);
      console.log(`   Unique emoji: ${getUniqueEmoji(data.emojicode)}`);
      console.log(`   Created at: ${new Date(data.createdAt).toISOString()}`);

      // Save for later tests
      aliceEmojicode = data.emojicode;
    });

    it('should retrieve emojicode for caitlyn pubKey', async () => {
      await switchToUser(caitlyn);

      const res = await fetch(`${directBDOURL}/pubkey/${keys2.pubKey}/emojicode`);
      res.status.should.equal(200);

      const data = await res.json();
      console.log('Caitlyn emojicode data:', data);

      data.should.have.property('emojicode');
      data.should.have.property('pubKey');
      data.should.have.property('createdAt');

      data.pubKey.should.equal(keys2.pubKey);

      // Validate emojicode format
      isValidEmojicodeFormat(data.emojicode).should.be.true;

      console.log(`✅ Caitlyn emojicode: ${data.emojicode}`);
      console.log(`   Base emoji: ${getBaseEmoji(data.emojicode)}`);
      console.log(`   Unique emoji: ${getUniqueEmoji(data.emojicode)}`);
      console.log(`   Created at: ${new Date(data.createdAt).toISOString()}`);

      // Save for later tests
      caitlynEmojicode = data.emojicode;
    });

    it('should have same base emoji for both users', async () => {
      const aliceBase = getBaseEmoji(aliceEmojicode);
      const caitlynBase = getBaseEmoji(caitlynEmojicode);

      console.log(`Alice base: ${aliceBase}`);
      console.log(`Caitlyn base: ${caitlynBase}`);

      aliceBase.should.equal(caitlynBase);
      console.log(`✅ Both users share the same base emoji: ${aliceBase}`);
    });

    it('should have different unique emoji for each user', async () => {
      const aliceUnique = getUniqueEmoji(aliceEmojicode);
      const caitlynUnique = getUniqueEmoji(caitlynEmojicode);

      console.log(`Alice unique: ${aliceUnique}`);
      console.log(`Caitlyn unique: ${caitlynUnique}`);

      aliceUnique.should.not.equal(caitlynUnique);
      console.log('✅ Each user has unique emoji identifier');
    });
  });

  describe('BDO Retrieval by Emojicode', () => {
    it('should retrieve alice BDO by emojicode', async () => {
      await switchToUser(alice);

      console.log(`Fetching alice BDO with emojicode: ${aliceEmojicode}`);

      const res = await fetch(`${directBDOURL}/emoji/${encodeURIComponent(aliceEmojicode)}`);
      res.status.should.equal(200);

      const data = await res.json();
      console.log('Alice BDO retrieved by emojicode:', data);

      data.should.have.property('emojicode');
      data.should.have.property('pubKey');
      data.should.have.property('bdo');
      data.should.have.property('createdAt');

      data.emojicode.should.equal(aliceEmojicode);
      data.pubKey.should.equal(keys.pubKey);
      data.bdo.description.should.equal('Alice public BDO with emojicode');

      console.log('✅ Successfully retrieved Alice BDO by emojicode');
    });

    it('should retrieve caitlyn BDO by emojicode', async () => {
      await switchToUser(caitlyn);

      console.log(`Fetching caitlyn BDO with emojicode: ${caitlynEmojicode}`);

      const res = await fetch(`${directBDOURL}/emoji/${encodeURIComponent(caitlynEmojicode)}`);
      res.status.should.equal(200);

      const data = await res.json();
      console.log('Caitlyn BDO retrieved by emojicode:', data);

      data.should.have.property('emojicode');
      data.should.have.property('pubKey');
      data.should.have.property('bdo');
      data.should.have.property('createdAt');

      data.emojicode.should.equal(caitlynEmojicode);
      data.pubKey.should.equal(keys2.pubKey);
      data.bdo.description.should.equal('Caitlyn public BDO with emojicode');

      console.log('✅ Successfully retrieved Caitlyn BDO by emojicode');
    });

    it('should return 404 for non-existent emojicode', async () => {
      const fakeEmojicode = '🚫🚫🚫🚫🚫🚫🚫🚫';

      const res = await fetch(`${directBDOURL}/emoji/${encodeURIComponent(fakeEmojicode)}`);
      res.status.should.equal(404);

      const data = await res.json();
      data.should.have.property('error');

      console.log('✅ Correctly returns 404 for non-existent emojicode');
    });
  });

  describe('Cross-User Access', () => {
    it('should allow alice to retrieve caitlyn BDO by emojicode', async () => {
      // Switch to alice
      await switchToUser(alice);

      // Fetch caitlyn's public BDO using her emojicode
      const res = await fetch(`${directBDOURL}/emoji/${encodeURIComponent(caitlynEmojicode)}`);
      res.status.should.equal(200);

      const data = await res.json();
      data.pubKey.should.equal(keys2.pubKey);
      data.bdo.description.should.equal('Caitlyn public BDO with emojicode');

      console.log('✅ Alice can access Caitlyn public BDO via emojicode');
    });

    it('should allow caitlyn to retrieve alice BDO by emojicode', async () => {
      // Switch to caitlyn
      await switchToUser(caitlyn);

      // Fetch alice's public BDO using her emojicode
      const res = await fetch(`${directBDOURL}/emoji/${encodeURIComponent(aliceEmojicode)}`);
      res.status.should.equal(200);

      const data = await res.json();
      data.pubKey.should.equal(keys.pubKey);
      data.bdo.description.should.equal('Alice public BDO with emojicode');

      console.log('✅ Caitlyn can access Alice public BDO via emojicode');
    });
  });

  describe('Emojicode Query Parameter', () => {
    it('should retrieve alice BDO using emojicode query param', async () => {
      await switchToUser(alice);

      // Use the standard bdo-js getBDO method but with emojicode query param
      // We'll use direct fetch to test the query parameter
      const timestamp = Date.now();
      const message = `${savedUser.uuid}${timestamp}${hash}`;
      const signature = sessionless.sign(message);

      const url = `${directBDOURL}/user/${savedUser.uuid}/bdo?timestamp=${timestamp}&hash=${hash}&signature=${signature}&emojicode=${encodeURIComponent(aliceEmojicode)}`;
      console.log('Fetching with emojicode query param:', url);

      const res = await fetch(url);
      res.status.should.equal(200);

      const data = await res.json();
      console.log('Retrieved BDO using emojicode query param:', data);

      data.should.have.property('bdo');
      data.should.have.property('uuid');
      data.uuid.should.equal(savedUser.uuid);
      data.bdo.description.should.equal('Alice public BDO with emojicode');

      console.log('✅ Successfully retrieved BDO using emojicode query parameter');
    });

    it('should retrieve caitlyn BDO using emojicode query param', async () => {
      await switchToUser(caitlyn);

      // Use direct fetch to test the emojicode query parameter
      const timestamp = Date.now();
      const message = `${savedUser2.uuid}${timestamp}${anotherHash}`;
      const signature = sessionless.sign(message);

      const url = `${directBDOURL}/user/${savedUser2.uuid}/bdo?timestamp=${timestamp}&hash=${anotherHash}&signature=${signature}&emojicode=${encodeURIComponent(caitlynEmojicode)}`;
      console.log('Fetching with emojicode query param:', url);

      const res = await fetch(url);
      res.status.should.equal(200);

      const data = await res.json();
      console.log('Retrieved BDO using emojicode query param:', data);

      data.should.have.property('bdo');
      data.should.have.property('uuid');
      data.uuid.should.equal(savedUser2.uuid);
      data.bdo.description.should.equal('Caitlyn public BDO with emojicode');

      console.log('✅ Successfully retrieved BDO using emojicode query parameter');
    });

    it('should return 404 for invalid emojicode query param', async () => {
      await switchToUser(alice);

      const timestamp = Date.now();
      const message = `${savedUser.uuid}${timestamp}${hash}`;
      const signature = sessionless.sign(message);

      const fakeEmojicode = '🚫🚫🚫🚫🚫🚫🚫🚫';
      const url = `${directBDOURL}/user/${savedUser.uuid}/bdo?timestamp=${timestamp}&hash=${hash}&signature=${signature}&emojicode=${encodeURIComponent(fakeEmojicode)}`;

      const res = await fetch(url);
      res.status.should.equal(404);

      const data = await res.json();
      data.should.have.property('error');
      data.error.should.equal('Emojicode not found');

      console.log('✅ Correctly returns 404 for invalid emojicode query param');
    });
  });

  describe('Cleanup', () => {
    it('should delete alice', async () => {
      await switchToUser(alice);

      const res = await bdo.deleteUser(savedUser.uuid);
      res.should.equal(true);

      console.log('✅ Alice deleted');
    });

    it('should delete caitlyn', async () => {
      keysToReturn = keys2;
      await switchToUser(caitlyn);

      const res = await bdo.deleteUser(savedUser2.uuid);
      res.should.equal(true);

      console.log('✅ Caitlyn deleted');
    });
  });
});
