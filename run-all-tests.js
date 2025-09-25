#!/usr/bin/env node

/**
 * Sharon - Master Test Runner
 *
 * Runs all Planet Nine ecosystem tests in the optimal order:
 * 1. Protocol tests (foundational)
 * 2. Service tests (individual microservices)
 * 3. System tests (cross-service integration)
 *
 * Options:
 *   --verbose, -v    Show detailed test output
 *   --quiet, -q      Suppress all but essential output
 *   --output=format  Output format: 'detailed', 'summary', 'minimal'
 *   --no-color       Disable colored output
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { HtmlReporter } from './lib/html-reporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  quiet: args.includes('--quiet') || args.includes('-q'),
  noColor: args.includes('--no-color'),
  output: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'summary'
};

const COLORS = {
  RESET: '\x1b[0m',
  BRIGHT: '\x1b[1m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m'
};

const TEST_CATEGORIES = [
  {
    name: 'Protocol Tests',
    color: COLORS.CYAN,
    categories: ['sessionless', 'magic', 'teleportation'],
    description: 'Core protocol validation'
  },
  {
    name: 'Service Tests',
    color: COLORS.BLUE,
    categories: ['fount', 'bdo', 'julia', 'addie', 'sanora', 'dolores', 'covenant'],
    description: 'Individual microservice tests'
  },
  {
    name: 'System Tests',
    color: COLORS.MAGENTA,
    categories: ['permissions', 'cross-service', 'client-server'],
    description: 'Cross-service integration tests'
  }
];

// Utility function to apply colors conditionally
function colorize(color, text) {
  return options.noColor ? text : `${color}${text}${COLORS.RESET}`;
}

// Logging functions based on verbosity level
const logger = {
  always: (msg) => console.log(msg),
  info: (msg) => !options.quiet && console.log(msg),
  verbose: (msg) => options.verbose && console.log(msg),
  debug: (msg) => options.verbose && console.log(colorize(COLORS.CYAN, `[DEBUG] ${msg}`))
};

function showHelp() {
  console.log(`
${COLORS.BRIGHT}${COLORS.GREEN}🚀 Sharon - Planet Nine Test Suite${COLORS.RESET}

Usage: node run-all-tests.js [options]

Options:
  --verbose, -v        Show detailed test output and debug information
  --quiet, -q          Suppress all but essential output (errors and summary)
  --output=format      Output format: 'detailed', 'summary', 'minimal'
  --no-color           Disable colored output
  --help, -h           Show this help message

Output Formats:
  detailed   Show full test output with timing and debug info
  summary    Show test results with basic timing (default)
  minimal    Show only pass/fail status per category

Examples:
  node run-all-tests.js                    # Run with default summary output
  node run-all-tests.js --verbose          # Show detailed output
  node run-all-tests.js --quiet            # Minimal console output
  node run-all-tests.js --output=minimal   # Just show ✅/❌ per test
`);
}

async function main() {
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  logger.always(colorize(COLORS.BRIGHT + COLORS.GREEN, '🚀 Sharon - Planet Nine Test Suite'));

  if (options.verbose) {
    logger.verbose(`Options: ${JSON.stringify(options, null, 2)}`);
  }

  logger.info(''); // Empty line

  // Initialize HTML reporter
  const htmlReporter = new HtmlReporter();

  const startTime = Date.now();
  let totalTests = 0;
  let passedCategories = 0;
  let failedCategories = 0;
  const detailedResults = [];

  for (const testGroup of TEST_CATEGORIES) {
    logger.info(colorize(COLORS.BRIGHT + testGroup.color, `📋 ${testGroup.name}`));
    logger.info(`   ${testGroup.description}`);
    logger.info('');

    for (const category of testGroup.categories) {
      const categoryPath = path.join(__dirname, 'tests', category);

      if (!fs.existsSync(categoryPath)) {
        logger.info(`   ${colorize(COLORS.YELLOW, `⚠️  ${category} - No tests found`)}`);
        continue;
      }

      if (options.output !== 'minimal') {
        logger.info(`   ${colorize(COLORS.BRIGHT, `Testing ${category}...`)}`);
      }

      const result = await runCategoryTests(categoryPath, category);

      detailedResults.push({
        category,
        group: testGroup.name,
        ...result
      });

      // Add result to HTML reporter
      htmlReporter.addResult(
        category,
        result.success ? 'passed' : 'failed',
        result.duration,
        result.output || result.error || ''
      );

      if (result.success) {
        const message = options.output === 'minimal' ?
          `✅ ${category}` :
          `✅ ${category} passed (${result.duration}ms)`;
        logger.info(`   ${colorize(COLORS.GREEN, message)}`);
        passedCategories++;
      } else {
        const message = options.output === 'minimal' ?
          `❌ ${category}` :
          `❌ ${category} failed (${result.duration}ms)`;
        logger.always(`   ${colorize(COLORS.RED, message)}`);
        failedCategories++;
      }

      totalTests++;
    }

    if (options.output !== 'minimal') {
      logger.info(''); // Empty line between groups
    }
  }

  const totalTime = Date.now() - startTime;

  console.log(colorize(COLORS.BRIGHT, '📊 Test Summary'));
  console.log(`   Total Categories: ${totalTests}`);
  console.log(`   ${colorize(COLORS.GREEN, `Passed: ${passedCategories}`)}`);
  console.log(`   ${colorize(COLORS.RED, `Failed: ${failedCategories}`)}`);
  console.log(`   Duration: ${totalTime}ms\n`);

  // Generate HTML report
  try {
    htmlReporter.setSummary({
      totalTests,
      passed: passedCategories,
      failed: failedCategories,
      duration: totalTime
    });

    const reportInfo = await htmlReporter.saveReport();
    console.log(colorize(COLORS.CYAN, `📄 HTML report generated: ${reportInfo.filename}`));
    console.log(colorize(COLORS.CYAN, `   Saved to: ${reportInfo.filepath}`));
    console.log('');
  } catch (error) {
    console.log(colorize(COLORS.YELLOW, `⚠️  Failed to generate HTML report: ${error.message}`));
  }

  if (failedCategories > 0) {
    console.log(colorize(COLORS.RED + COLORS.BRIGHT, '💥 Some tests failed!'));
    process.exit(1);
  } else {
    console.log(colorize(COLORS.GREEN + COLORS.BRIGHT, '🎉 All tests passed!'));
    process.exit(0);
  }
}

async function runCategoryTests(categoryPath, categoryName) {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const testRunner = path.join(categoryPath, 'test-runner.js');
    const packageJson = path.join(categoryPath, 'package.json');

    let command, args, options;

    if (fs.existsSync(testRunner)) {
      // Use custom test runner
      command = 'node';
      args = [testRunner];
      options = { cwd: categoryPath };
    } else if (fs.existsSync(packageJson)) {
      // Use npm test
      command = 'npm';
      args = ['test'];
      options = { cwd: categoryPath };
    } else {
      // Fallback to direct mocha
      command = 'npx';
      args = ['mocha', '**/*.test.js', '--timeout', '30000'];
      options = { cwd: categoryPath };
    }

    // Configure stdio based on verbosity settings
    let stdio;
    if (options.verbose) {
      stdio = 'inherit'; // Show all output in real-time
    } else if (options.quiet) {
      stdio = ['pipe', 'pipe', 'pipe']; // Capture all output, only show on errors
    } else {
      stdio = ['pipe', 'pipe', 'pipe']; // Capture output for summary mode
    }

    const child = spawn(command, args, {
      ...options,
      stdio
    });

    let output = '';

    // Only capture output if not using inherit stdio
    if (stdio !== 'inherit') {
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        output += data.toString();
      });
    }

    child.on('close', (code) => {
      const duration = Date.now() - startTime;

      // Show error output based on verbosity settings
      if (code !== 0 && output.trim() && !options.verbose && !options.quiet && options.output === 'summary') {
        // In verbose mode, errors are already shown via inherit stdio
        // In quiet mode, suppress error details
        // In minimal mode, suppress detailed error output
        console.log(`     ${colorize(COLORS.RED, 'Error output:')}`);
        console.log(output.split('\n').map(line => `     ${line}`).join('\n'));
      }

      resolve({
        success: code === 0,
        duration,
        output
      });
    });

    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      if (!options.quiet) {
        console.log(`     ${colorize(COLORS.RED, `Execution error: ${error.message}`)}`);
      }
      resolve({
        success: false,
        duration,
        output: error.message
      });
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}