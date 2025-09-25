#!/usr/bin/env node

/**
 * System Test Runner
 *
 * Runs high-level integration tests across multiple services
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SYSTEM_CATEGORIES = [
  'permissions', 'cross-service', 'client-server'
];

async function runSystemTests() {
  console.log('🌍 Running Planet Nine System Integration Tests\n');

  let passed = 0;
  let failed = 0;

  for (const system of SYSTEM_CATEGORIES) {
    const systemPath = path.join(__dirname, 'tests', system);

    if (!fs.existsSync(systemPath)) {
      console.log(`⚠️  ${system} - No tests found`);
      continue;
    }

    console.log(`Testing ${system} system...`);

    const result = await runTest(systemPath);

    if (result.success) {
      console.log(`✅ ${system} passed\n`);
      passed++;
    } else {
      console.log(`❌ ${system} failed\n`);
      failed++;
    }
  }

  console.log(`\n📊 System Test Summary:`);
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
  runSystemTests().catch(console.error);
}