#!/usr/bin/env node

/**
 * Fount Test Runner
 *
 * Runs all fount-related tests in the correct order:
 * 1. Server tests (ensure endpoints work)
 * 2. Client tests (ensure SDK works)
 * 3. Integration tests (ensure cross-service works)
 */

const { spawn } = require('child_process');
const path = require('path');

const TEST_CATEGORIES = [
  { name: 'Server Tests', dir: 'server', pattern: '*.test.js' },
  { name: 'Client Tests', dir: 'client', pattern: '*.test.js' },
  { name: 'Integration Tests', dir: 'integration', pattern: '*.test.js' }
];

async function runTests() {
  console.log('🚀 Starting Fount Test Suite\n');

  for (const category of TEST_CATEGORIES) {
    console.log(`📋 Running ${category.name}...`);

    const testDir = path.join(__dirname, category.dir);
    const result = await runMocha(testDir, category.pattern);

    if (result.success) {
      console.log(`✅ ${category.name} passed\n`);
    } else {
      console.log(`❌ ${category.name} failed\n`);
      process.exit(1);
    }
  }

  console.log('🎉 All Fount tests passed!');
}

function runMocha(testDir, pattern) {
  return new Promise((resolve) => {
    const mocha = spawn('npx', ['mocha', `${testDir}/${pattern}`, '--timeout', '30000'], {
      stdio: 'inherit',
      cwd: __dirname
    });

    mocha.on('close', (code) => {
      resolve({ success: code === 0 });
    });

    mocha.on('error', (error) => {
      console.error('Error running tests:', error);
      resolve({ success: false });
    });
  });
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };