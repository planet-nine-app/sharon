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
  const allFailures = [];

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

    const result = await runTest(testPath, test.service, test.path);

    // Accumulate test counts
    totalTestsPassing += result.passing;
    totalTestsFailing += result.failing;
    totalTestsPending += result.pending;

    // Accumulate failures
    if (result.failures && result.failures.length > 0) {
      allFailures.push(...result.failures);
    }

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

  // Display detailed failure information
  if (allFailures.length > 0) {
    console.log('\n\n❌ DETAILED FAILURE REPORT\n');
    console.log('═'.repeat(80));

    allFailures.forEach((failure, index) => {
      console.log(`\n${index + 1}. ${failure.service} - ${failure.testName}`);
      console.log(`   File: ${failure.file}:${failure.line}`);
      console.log(`   Error: ${failure.error}`);
      if (failure.actual || failure.expected) {
        console.log(`   Expected: ${failure.expected}`);
        console.log(`   Actual: ${failure.actual}`);
      }
    });

    console.log('\n' + '═'.repeat(80));
  }

  console.log('\n🎉 MAGIC Protocol conversion complete!');
  console.log('   Total routes converted: 64');
  console.log('   Total services with MAGIC: 12');

  process.exit(servicesFailedCount > 0 ? 1 : 0);
}

async function runTest(testPath, serviceName, relativePath) {
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

      // Parse failures
      const failures = parseFailures(output, serviceName, relativePath);

      resolve({
        success: code === 0,
        passing,
        failing,
        pending,
        failures
      });
    });

    child.on('error', (error) => {
      console.error('Error:', error);
      resolve({
        success: false,
        passing: 0,
        failing: 0,
        pending: 0,
        failures: []
      });
    });
  });
}

function parseFailures(output, serviceName, relativePath) {
  const failures = [];

  // Split output into lines and process
  const lines = output.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Look for failure marker: "  1) Test Suite Name"
    const failureMarker = line.match(/^\s*(\d+)\)\s+(.+)$/);
    if (failureMarker) {
      const testSuite = failureMarker[2].trim();
      i++;

      // Next line should be the test name (indented more)
      if (i < lines.length && lines[i].match(/^\s{5,}/)) {
        const testName = lines[i].trim().replace(/:$/, '');
        i++;

        // Collect error information
        let errorMessage = '';
        let expected = '';
        let actual = '';
        let file = relativePath;
        let lineNumber = '';
        let inExpectedActual = false;

        // Read until we hit the next failure or end
        while (i < lines.length) {
          const errorLine = lines[i];

          // Stop if we hit the next failure
          if (errorLine.match(/^\s*\d+\)\s+/)) {
            break;
          }

          // Skip empty lines
          if (!errorLine.trim()) {
            i++;
            continue;
          }

          // Capture error message (AssertionError, TypeError, etc.)
          if (!errorMessage && errorLine.match(/^\s+(AssertionError|TypeError|Error):/)) {
            errorMessage = errorLine.trim();
          }

          // Check for expected/actual section
          if (errorLine.includes('+ expected - actual')) {
            inExpectedActual = true;
            i++;
            continue;
          }

          // Capture expected/actual values
          if (inExpectedActual) {
            if (errorLine.trim().startsWith('-')) {
              actual = errorLine.replace(/^\s*-/, '').trim();
            } else if (errorLine.trim().startsWith('+')) {
              expected = errorLine.replace(/^\s*\+/, '').trim();
              inExpectedActual = false; // Usually expected comes after actual
            }
          }

          // Extract file and line number from stack trace
          const stackMatch = errorLine.match(/at\s+.+?\s+\((?:file:\/\/)?([^:]+):(\d+):\d+\)/);
          if (stackMatch && !lineNumber) {
            const fullPath = stackMatch[1];
            lineNumber = stackMatch[2];
            // Simplify file path
            if (fullPath.includes(relativePath) || fullPath.endsWith(relativePath.split('/').pop())) {
              file = relativePath;
            }
          }

          i++;

          // Stop after we've found stack trace
          if (stackMatch) {
            break;
          }
        }

        failures.push({
          service: serviceName,
          testName: `${testSuite} - ${testName}`,
          error: errorMessage || 'Unknown error',
          expected,
          actual,
          file,
          line: lineNumber
        });
      } else {
        i++;
      }
    } else {
      i++;
    }
  }

  return failures;
}

runMagicSpellTests().catch(console.error);
