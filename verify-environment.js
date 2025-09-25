#!/usr/bin/env node

/**
 * Environment Verification Script
 *
 * Quick checks to verify the test environment is working before running full tests
 */

import fetch from 'node-fetch';
import { serviceConfig, systemEndpoints } from './config/test-config.js';

const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  BRIGHT: '\x1b[1m'
};

function colorize(color, text) {
  return `${color}${text}${COLORS.RESET}`;
}

async function checkEndpoint(url, name, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET'
    });

    clearTimeout(timeoutId);

    const status = response.status;
    const ok = response.ok;

    // 404 from Express services is actually healthy - it means the service is running
    if (ok || status === 404) {
      console.log(`   ${colorize(COLORS.GREEN, '✅')} ${name} (${status})`);
      return { success: true, status, url };
    } else {
      console.log(`   ${colorize(COLORS.YELLOW, '⚠️')} ${name} (${status})`);
      return { success: false, status, url };
    }
  } catch (error) {
    const errorMsg = error.name === 'AbortError' ? 'timeout' : error.message;
    console.log(`   ${colorize(COLORS.RED, '❌')} ${name} (${errorMsg})`);
    return { success: false, error: errorMsg, url };
  }
}

async function verifyEnvironment() {
  console.log(colorize(COLORS.BRIGHT + COLORS.BLUE, '🔍 Sharon Environment Verification'));
  console.log('=====================================\n');

  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;

  // Check system endpoints first
  console.log(colorize(COLORS.BRIGHT, '🌐 System Endpoints:'));
  const systemChecks = [
    { name: 'Service Discovery', url: systemEndpoints.serviceDiscovery },
    { name: 'Health Check', url: systemEndpoints.healthCheck },
    { name: 'Base Info', url: systemEndpoints.baseInfo }
  ];

  for (const check of systemChecks) {
    const result = await checkEndpoint(check.url, check.name);
    totalChecks++;
    if (result.success) passedChecks++;
    else failedChecks++;
  }

  console.log('');

  // Check core services
  console.log(colorize(COLORS.BRIGHT, '🏗️  Core Services:'));
  const coreServices = ['fount', 'julia', 'bdo'];

  for (const serviceName of coreServices) {
    const service = serviceConfig[serviceName];
    const result = await checkEndpoint(service.url, `${service.name} (${serviceName})`);
    totalChecks++;
    if (result.success) passedChecks++;
    else failedChecks++;
  }

  console.log('');

  // Check application services
  console.log(colorize(COLORS.BRIGHT, '🚀 Application Services:'));
  const appServices = ['sanora', 'dolores', 'addie', 'covenant'];

  for (const serviceName of appServices) {
    const service = serviceConfig[serviceName];
    const result = await checkEndpoint(service.url, `${service.name} (${serviceName})`);
    totalChecks++;
    if (result.success) passedChecks++;
    else failedChecks++;
  }

  console.log('');

  // Summary
  console.log(colorize(COLORS.BRIGHT, '📊 Verification Summary:'));
  console.log(`   Total checks: ${totalChecks}`);
  console.log(`   ${colorize(COLORS.GREEN, `Passed: ${passedChecks}`)}`);
  console.log(`   ${colorize(COLORS.RED, `Failed: ${failedChecks}`)}`);

  const successRate = Math.round((passedChecks / totalChecks) * 100);
  console.log(`   Success rate: ${successRate}%`);

  console.log('');

  if (successRate >= 80) {
    console.log(colorize(COLORS.GREEN + COLORS.BRIGHT, '✅ Environment verification passed!'));
    console.log('🧪 Ready to run tests with: node run-all-tests.js');
    process.exit(0);
  } else if (successRate >= 50) {
    console.log(colorize(COLORS.YELLOW + COLORS.BRIGHT, '⚠️  Environment partially ready'));
    console.log('🧪 Some tests may fail, but you can still run: node run-all-tests.js');
    process.exit(0);
  } else {
    console.log(colorize(COLORS.RED + COLORS.BRIGHT, '❌ Environment verification failed'));
    console.log('🔧 Please check Docker containers and nginx configuration');
    process.exit(1);
  }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyEnvironment().catch(console.error);
}

export default verifyEnvironment;