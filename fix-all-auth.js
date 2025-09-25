#!/usr/bin/env node
/**
 * Fix authentication issues across all Sharon tests
 * Applies the alice/bob/caitlyn/dave pattern to all services
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const TEST_USERS_CODE = `// Simple test users
export const TEST_USERS = {
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
  caitlyn: {
    name: 'caitlyn',
    privateKey: 'a59aa3dff33b4298aacc94e5fa5babf045b37b85400054a578fe2625f937ba1a',
    publicKey: '0347925e7e43772e6712b66e4c96d637d6adb5721fba2985fe32c4d7345e673580'
  },
  dave: {
    name: 'dave',
    privateKey: '8a4020082f7c6e5e8629d7d48321f23cb53da1968b2ffbb73301ee4d12d0552a',
    publicKey: '02813ccb7bdea552e011e276994fa863a66192c2481fa6b6cfe9f0c5747207eed9'
  }
};`;

const SERVICES = ['julia', 'dolores', 'sanora', 'addie', 'covenant'];

async function fixService(service) {
  const testDir = `/sharon/tests/${service}/mocha`;
  const userFile = `${testDir}/test-users.js`;

  try {
    // Create test users file
    await fs.writeFile(userFile, TEST_USERS_CODE);
    console.log(`✅ Created ${userFile}`);

    // Check if client.js exists and needs fixing
    const clientFile = `${testDir}/client.js`;
    try {
      let content = await fs.readFile(clientFile, 'utf8');

      // Skip if already has TEST_USERS import
      if (content.includes('TEST_USERS')) {
        console.log(`⚠️  ${clientFile} already has TEST_USERS`);
        return;
      }

      // Add import and helper function
      const imports = `import { TEST_USERS } from './test-users.js';\n`;
      const helper = `
// Use predefined test users
const alice = TEST_USERS.alice;
const bob = TEST_USERS.bob;
const caitlyn = TEST_USERS.caitlyn;

// Helper to switch active user
const switchToUser = async (user) => {
  const saveKeys = (keys) => { /* no-op, keys already defined */ };
  const getKeys = () => ({ privateKey: user.privateKey, pubKey: user.publicKey });
  await sessionless.generateKeys(saveKeys, getKeys);
};
`;

      // Find insertion point after imports
      const lines = content.split('\n');
      let insertPoint = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertPoint = i + 1;
        } else if (lines[i].trim() === '' && insertPoint > 0) {
          break;
        }
      }

      // Insert the new imports and helper
      lines.splice(insertPoint, 0, imports);
      lines.splice(insertPoint + 1, 0, helper);

      await fs.writeFile(clientFile, lines.join('\n'));
      console.log(`✅ Updated ${clientFile} with auth helpers`);

    } catch (e) {
      console.log(`⚠️  ${clientFile} doesn't exist or couldn't be read`);
    }

  } catch (error) {
    console.error(`❌ Error fixing ${service}:`, error.message);
  }
}

async function main() {
  console.log('🔧 Fixing authentication across all Sharon services...\n');

  for (const service of SERVICES) {
    await fixService(service);
  }

  console.log('\n🎉 Auth fix pattern applied to all services!');
  console.log('📝 Manual updates may still be needed for specific test cases');
}

main().catch(console.error);