import pnPref from "pn-pref-js";
import { should } from "chai";
import sessionless from "sessionless-node";
import { TEST_USERS } from "./test-users.js";

should();

console.log(pnPref);

pnPref.baseURL = `http://nginx:80/pn-pref/`;

console.log("After setting baseURL:", pnPref.baseURL);

// Use our test users with proper keys  
const alice = TEST_USERS.alice;
const bob = TEST_USERS.bob;

const savedUser = {};
let keys = { privateKey: alice.privateKey, pubKey: alice.publicKey };
let keysToReturn = keys;
const hash = 'firstHash';
const newPreferences = { theme: 'dark', notifications: true };

// Helper to switch users and setup sessionless
const switchToUser = async (user) => {
  const testKeys = { privateKey: user.privateKey, pubKey: user.publicKey };
  const saveKeys = (k) => { /* no-op, keys already defined */ };
  const getKeys = () => testKeys;
  await sessionless.generateKeys(saveKeys, getKeys);
  return testKeys;
};

it("should register a user", async () => {
  await switchToUser(alice);

  const uuid = await pnPref.createUser(hash, newPreferences, (k) => { keys = k; keysToReturn = k; }, () => { return keys; });
  savedUser.uuid = uuid;
  savedUser.uuid.length.should.equal(36);
});

it("should delete a user", async () => {
  await switchToUser(alice);

  const res = await pnPref.deleteUser(savedUser.uuid);
  res.should.equal(true);
});

