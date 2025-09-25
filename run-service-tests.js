#!/usr/bin/env node

/**
 * Service Test Runner
 *
 * Runs tests for all individual microservices
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SERVICE_CATEGORIES = [
  'addie', 'bdo', 'continuebee', 'dolores', 'fount',
  'joan', 'julia', 'pn-pref', 'sanora', 'covenant', 'aretha'
];

async function runServiceTests() {
  console.log('🔧 Running Planet Nine Service Tests\n');

  let passed = 0;
  let failed = 0;

  for (const service of SERVICE_CATEGORIES) {
    const servicePath = path.join(__dirname, 'tests', service);

    if (!fs.existsSync(servicePath)) {
      console.log(`⚠️  ${service} - No tests found`);
      continue;
    }

    console.log(`Testing ${service}...`);

    const result = await runTest(servicePath);

    if (result.success) {
      console.log(`✅ ${service} passed\n`);
      passed++;
    } else {
      console.log(`❌ ${service} failed\n`);
      failed++;
    }
  }

  console.log(`\n📊 Service Test Summary:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

async function runTest(testPath) {
  return new Promise((resolve) => {
    const child = spawn('npm', ['test'], {
      cwd: testPath,
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

if (require.main === module) {
  runServiceTests().catch(console.error);
}