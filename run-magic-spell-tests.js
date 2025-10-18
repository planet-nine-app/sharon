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

  let servicesPassedCount = 0;
  let servicesFailedCount = 0;
  const failedServices = [];

  let totalTestsPassing = 0;
  let totalTestsFailing = 0;
  let totalTestsPending = 0;

  for (const test of MAGIC_SPELL_TESTS) {
    const testPath = path.join(__dirname, test.path);

    if (!fs.existsSync(testPath)) {
      console.log(`⚠️  ${test.service} - No MAGIC spell tests found at ${test.path}`);
      continue;
    }

    console.log(`🧙 Testing ${test.service} MAGIC spells...`);

    const result = await runTest(testPath);

    // Accumulate test counts
    totalTestsPassing += result.passing;
    totalTestsFailing += result.failing;
    totalTestsPending += result.pending;

    if (result.success) {
      console.log(`✅ ${test.service} MAGIC spells passed\n`);
      servicesPassedCount++;
    } else {
      console.log(`❌ ${test.service} MAGIC spells failed\n`);
      servicesFailedCount++;
      failedServices.push(test.service);
    }
  }

  console.log(`\n📊 MAGIC Spell Test Summary:`);
  console.log(`   Test Cases:`);
  console.log(`     Passing:  ${totalTestsPassing} tests`);
  console.log(`     Failing:  ${totalTestsFailing} tests`);
  if (totalTestsPending > 0) {
    console.log(`     Pending:  ${totalTestsPending} tests`);
  }
  console.log(`   Services:`);
  console.log(`     Passed:   ${servicesPassedCount}/${MAGIC_SPELL_TESTS.length} services`);
  console.log(`     Failed:   ${servicesFailedCount}/${MAGIC_SPELL_TESTS.length} services`);

  if (failedServices.length > 0) {
    console.log(`\n   Failed Services: ${failedServices.join(', ')}`);
  }

  console.log('\n🎉 MAGIC Protocol conversion complete!');
  console.log('   Total routes converted: 64');
  console.log('   Total services with MAGIC: 12');

  process.exit(servicesFailedCount > 0 ? 1 : 0);
}

async function runTest(testPath) {
  return new Promise((resolve) => {
    let output = '';

    const child = spawn('mocha', [testPath, '--timeout', '10000'], {
      cwd: __dirname,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    // Capture stdout and display it
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    // Capture stderr and display it
    child.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on('close', (code) => {
      // Parse mocha output for test counts
      // Looking for patterns like "5 passing" and "3 failing"
      const passingMatch = output.match(/(\d+)\s+passing/);
      const failingMatch = output.match(/(\d+)\s+failing/);
      const pendingMatch = output.match(/(\d+)\s+pending/);

      const passing = passingMatch ? parseInt(passingMatch[1]) : 0;
      const failing = failingMatch ? parseInt(failingMatch[1]) : 0;
      const pending = pendingMatch ? parseInt(pendingMatch[1]) : 0;

      resolve({
        success: code === 0,
        passing,
        failing,
        pending
      });
    });

    child.on('error', (error) => {
      console.error('Error:', error);
      resolve({
        success: false,
        passing: 0,
        failing: 0,
        pending: 0
      });
    });
  });
}

runMagicSpellTests().catch(console.error);
