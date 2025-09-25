#!/usr/bin/env node

/**
 * Protocol Test Runner
 *
 * Runs tests for core Planet Nine protocols
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROTOCOL_CATEGORIES = [
  'sessionless', 'magic', 'teleportation', 'covenant'
];

async function runProtocolTests() {
  console.log('🌐 Running Planet Nine Protocol Tests\n');

  let passed = 0;
  let failed = 0;

  for (const protocol of PROTOCOL_CATEGORIES) {
    const protocolPath = path.join(__dirname, 'tests', protocol);

    if (!fs.existsSync(protocolPath)) {
      console.log(`⚠️  ${protocol} - No tests found`);
      continue;
    }

    console.log(`Testing ${protocol} protocol...`);

    const result = await runTest(protocolPath);

    if (result.success) {
      console.log(`✅ ${protocol} passed\n`);
      passed++;
    } else {
      console.log(`❌ ${protocol} failed\n`);
      failed++;
    }
  }

  console.log(`\n📊 Protocol Test Summary:`);
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
  runProtocolTests().catch(console.error);
}