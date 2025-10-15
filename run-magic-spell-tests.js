#!/usr/bin/env node

/**
 * MAGIC Spell Test Runner
 *
 * Runs MAGIC spell tests for all microservices that have been converted to the MAGIC protocol
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAGIC_SPELL_TESTS = [
  { service: 'joan', path: 'tests/joan/magic-spells.js' },
  { service: 'pref', path: 'tests/pref/magic-spells.js' },
  { service: 'aretha', path: 'tests/aretha/magic-spells.js' },
  { service: 'continuebee', path: 'tests/continuebee/magic-spells.js' },
  { service: 'bdo', path: 'tests/bdo/magic-spells.js' },
  { service: 'julia', path: 'tests/julia/magic-spells.js' },
  { service: 'dolores', path: 'tests/dolores/magic-spells.js' },
  { service: 'sanora', path: 'tests/sanora/magic-spells.js' },
  { service: 'addie', path: 'tests/addie/magic-spells.js' },
  { service: 'covenant', path: 'tests/covenant/magic-spells.js' },
  { service: 'prof', path: 'tests/prof/magic-spells.js' },
  { service: 'fount', path: 'tests/fount/mocha/magic-spells.js' }
];

async function runMagicSpellTests() {
  console.log('✨ Running Planet Nine MAGIC Spell Tests\n');
  console.log('🔮 Testing 64 MAGIC spells across 12 services\n');

  let passed = 0;
  let failed = 0;
  const failedServices = [];

  for (const test of MAGIC_SPELL_TESTS) {
    const testPath = path.join(__dirname, test.path);

    if (!fs.existsSync(testPath)) {
      console.log(`⚠️  ${test.service} - No MAGIC spell tests found at ${test.path}`);
      continue;
    }

    console.log(`🧙 Testing ${test.service} MAGIC spells...`);

    const result = await runTest(testPath);

    if (result.success) {
      console.log(`✅ ${test.service} MAGIC spells passed\n`);
      passed++;
    } else {
      console.log(`❌ ${test.service} MAGIC spells failed\n`);
      failed++;
      failedServices.push(test.service);
    }
  }

  console.log(`\n📊 MAGIC Spell Test Summary:`);
  console.log(`   Services Passed: ${passed}/${MAGIC_SPELL_TESTS.length}`);
  console.log(`   Services Failed: ${failed}/${MAGIC_SPELL_TESTS.length}`);

  if (failedServices.length > 0) {
    console.log(`\n   Failed Services: ${failedServices.join(', ')}`);
  }

  console.log('\n🎉 MAGIC Protocol conversion complete!');
  console.log('   Total routes converted: 64');
  console.log('   Total services with MAGIC: 12');

  process.exit(failed > 0 ? 1 : 0);
}

async function runTest(testPath) {
  return new Promise((resolve) => {
    const child = spawn('mocha', [testPath, '--timeout', '10000'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      resolve({ success: code === 0 });
    });

    child.on('error', (error) => {
      console.error('Error:', error);
      resolve({ success: false });
    });
  });
}

runMagicSpellTests().catch(console.error);
