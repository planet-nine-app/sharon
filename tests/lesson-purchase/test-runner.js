#!/usr/bin/env node

/**
 * Lesson Purchase Flow Test Runner
 *
 * Runs the complete end-to-end lesson purchase flow test
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🎓 Starting Lesson Purchase Flow Test\n');

  const testFile = path.join(__dirname, 'lesson-purchase-flow.test.js');
  const result = await runMocha(testFile);

  if (result.success) {
    console.log('\n✅ Lesson Purchase Flow Test passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Lesson Purchase Flow Test failed');
    process.exit(1);
  }
}

function runMocha(testFile) {
  return new Promise((resolve) => {
    const mocha = spawn('npx', ['mocha', testFile, '--timeout', '30000'], {
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
runTests().catch(console.error);
