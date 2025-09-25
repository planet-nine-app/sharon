#!/usr/bin/env node
import sessionless from 'sessionless-node';

// Simple key storage for generation
let generatedKeys = {};
const saveKeys = (keys) => { generatedKeys = keys; };
const getKeys = () => generatedKeys;

console.log('// Generated test keys for alice, bob, caitlyn, dave');
console.log('export const TEST_USERS = {');

const users = ['alice', 'bob', 'caitlyn', 'dave'];
for (const name of users) {
  await sessionless.generateKeys(saveKeys, getKeys);
  const keys = getKeys();
  console.log(`  ${name}: {`);
  console.log(`    name: '${name}',`);
  console.log(`    privateKey: '${keys.privateKey}',`);
  console.log(`    publicKey: '${keys.pubKey}'`);
  console.log(`  }${name === 'dave' ? '' : ','}`);
}

console.log('};');
console.log('');
console.log('export default TEST_USERS;');