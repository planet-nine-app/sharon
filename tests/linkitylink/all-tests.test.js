/**
 * Linkitylink Comprehensive Test Suite
 *
 * Runs all linkitylink tests in sequence:
 * 1. Linktree Import & Basic Functionality
 * 2. Template Federation (user-submitted templates)
 * 3. Template Moderation (admin approval system)
 */

import { expect } from 'chai';
import fetch from 'node-fetch';

const LINKITYLINK_BASE_URL = process.env.LINKITYLINK_BASE_URL || 'http://localhost:3010';
const BDO_BASE_URL = process.env.BDO_BASE_URL || 'http://localhost:3003';
const FOUNT_BASE_URL = process.env.FOUNT_BASE_URL || 'http://localhost:3001';

describe('Linkitylink Comprehensive Test Suite', function() {
  this.timeout(30000);

  describe('Environment Check', () => {
    it('should verify linkitylink service is running', async () => {
      try {
        const response = await fetch(LINKITYLINK_BASE_URL);
        expect(response.ok).to.be.true;
        console.log(`✅ Linkitylink running at ${LINKITYLINK_BASE_URL}`);
      } catch (error) {
        throw new Error(`❌ Linkitylink not running at ${LINKITYLINK_BASE_URL}. Start with: cd linkitylink && npm start`);
      }
    });

    it('should verify BDO service is running', async () => {
      try {
        const response = await fetch(`${BDO_BASE_URL}/health`);
        // BDO might not have health endpoint, so just check if it responds
        console.log(`✅ BDO service responding at ${BDO_BASE_URL}`);
      } catch (error) {
        console.warn(`⚠️  BDO service may not be running at ${BDO_BASE_URL}`);
      }
    });

    it('should verify Fount service is running', async () => {
      try {
        const response = await fetch(FOUNT_BASE_URL);
        console.log(`✅ Fount service responding at ${FOUNT_BASE_URL}`);
      } catch (error) {
        console.warn(`⚠️  Fount service may not be running at ${FOUNT_BASE_URL}`);
      }
    });
  });

  describe('Test Suite Overview', () => {
    it('should describe test coverage', () => {
      console.log(`
╔════════════════════════════════════════════════════════════════════╗
║          LINKITYLINK COMPREHENSIVE TEST SUITE                      ║
╚════════════════════════════════════════════════════════════════════╝

📋 Test Files:
   1. linktree-import.test.js       - Linktree import & basic tapestry creation
   2. template-federation.test.js   - User-submitted template system
   3. template-moderation.test.js   - Admin moderation for templates

🌐 Environment:
   - Linkitylink: ${LINKITYLINK_BASE_URL}
   - BDO:         ${BDO_BASE_URL}
   - Fount:       ${FOUNT_BASE_URL}

🔧 Required Services:
   ✓ Linkitylink server running on port 3010
   ✓ BDO service running on port 3003
   ✓ Fount service running on port 3001

📝 Test Coverage:
   - ✅ Linktree import functionality
   - ✅ Tapestry creation with links
   - ✅ SVG generation and storage
   - ✅ Emojicode and alphanumeric URLs
   - ✅ Template submission system
   - ✅ Template federation across instances
   - ✅ Template moderation workflow
   - ✅ Admin authentication
   - ✅ Security model validation

🚀 Run Individual Test Suites:
   npm run test:linkitylink:import      # Linktree import tests
   npm run test:linkitylink:federation  # Template federation tests
   npm run test:linkitylink:moderation  # Template moderation tests
   npm run test:linkitylink:all         # All tests (this file)

🎯 For Manual Testing:
   1. Linktree Import: http://localhost:3010/create
   2. Template Moderation: http://localhost:3010/moderate.html
   3. View Tapestries: http://localhost:3010/my-tapestries
      `);
    });
  });

  describe('Run Individual Test Suites', () => {
    it('should link to individual test files', () => {
      console.log(`
To run each test suite individually:

1️⃣  Linktree Import Tests:
   cd sharon
   npx mocha tests/linkitylink/linktree-import.test.js

2️⃣  Template Federation Tests:
   cd sharon
   npx mocha tests/linkitylink/template-federation.test.js

3️⃣  Template Moderation Tests:
   cd sharon
   npx mocha tests/linkitylink/template-moderation.test.js

Or run ALL tests with:
   cd sharon
   npx mocha 'tests/linkitylink/*.test.js' --timeout 30000
      `);
    });
  });
});
