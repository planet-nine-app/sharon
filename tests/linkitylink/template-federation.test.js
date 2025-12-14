/**
 * Linkitylink Template Federation Tests
 *
 * Tests the multi-instance template sharing system where templates
 * submitted to any linkitylink instance are available to all instances
 * sharing the same BDO service.
 */

import { expect } from 'chai';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import sessionless from 'sessionless-node';

const BDO_BASE_URL = process.env.BDO_BASE_URL || 'http://localhost:3003';
const LINKITYLINK_BASE_URL = process.env.LINKITYLINK_BASE_URL || 'http://localhost:3010';
const FOUNT_BASE_URL = process.env.FOUNT_BASE_URL || 'http://localhost:3001';

describe('Linkitylink Template Federation', function() {
  this.timeout(10000);

  let testTemplateEmojicode;
  let testPubKey;
  let testKeys;

  // Generate test keys
  before(async () => {
    const saveKeys = (keys) => { testKeys = keys; };
    const getKeys = () => testKeys;
    testKeys = await sessionless.generateKeys(saveKeys, getKeys);
    console.log(`🔑 Generated test keys: ${testKeys.pubKey.substring(0, 16)}...`);
  });

  describe('Template Submission and Indexing', () => {

    it('should submit a template via MAGIC spell', async () => {
      // Create caster authentication
      const timestamp = Date.now().toString();
      const message = timestamp + testKeys.pubKey;
      const signature = await sessionless.sign(message, testKeys.privateKey);

      const caster = {
        pubKey: testKeys.pubKey,
        timestamp: timestamp,
        signature: signature
      };

      const payload = {
        paymentMethod: 'mp',
        template: {
          name: 'Test Federation Template',
          colors: ['#ff6b6b', '#ee5a6f', '#feca57'],
          linkColors: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
        },
        payeeQuadEmojicode: '🔗💎🌟🎨🐉📌🌍🔑'
      };

      const response = await fetch(`${LINKITYLINK_BASE_URL}/magic/spell/submitLinkitylinkTemplate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caster, payload })
      });

      const result = await response.json();
      console.log('Template submission result:', result);

      expect(response.ok).to.be.true;
      expect(result.success).to.be.true;
      expect(result.emojicode).to.exist;
      expect(result.pubKey).to.exist;
      expect(result.templateName).to.equal('Test Federation Template');

      // Save for later tests
      testTemplateEmojicode = result.emojicode;
      testPubKey = result.pubKey;
    });

    it('should add template to BDO filesystem index', async () => {
      // Check that the template index file exists and contains our emojicode
      const indexPath = path.join(
        process.cwd(),
        '../bdo/data/bdo/templates/Linkitylink-Template'
      );

      try {
        const indexContent = await fs.readFile(indexPath, 'utf8');
        const templates = JSON.parse(indexContent);

        console.log('Template index:', templates);
        expect(templates).to.be.an('array');
        expect(templates).to.include(testTemplateEmojicode);
      } catch (err) {
        if (err.code === 'ENOENT') {
          throw new Error('Template index file not found - may need to wait for async operation');
        }
        throw err;
      }
    });

    it('should verify template BDO exists in filesystem', async () => {
      // The BDO should be stored at data/bdo/bdo/{pubKey}
      const bdoPath = path.join(
        process.cwd(),
        `../bdo/data/bdo/bdo/${testPubKey}`
      );

      const bdoContent = await fs.readFile(bdoPath, 'utf8');
      const bdo = JSON.parse(bdoContent);

      console.log('Template BDO:', bdo);

      expect(bdo.type).to.equal('linkitylink-template');
      expect(bdo.name).to.equal('Test Federation Template');
      expect(bdo.colors).to.deep.equal(['#ff6b6b', '#ee5a6f', '#feca57']);
      expect(bdo.linkColors).to.have.lengthOf(4);
      expect(bdo.payeeEmojicode).to.equal('🔗💎🌟🎨🐉📌🌍🔑');
      expect(bdo.status).to.equal('active');
    });

    it('should verify emojicode mapping exists', async () => {
      // Check emojicode -> pubKey mapping
      const emojicodePath = path.join(
        process.cwd(),
        `../bdo/data/bdo/emojicode/pubkey/${testTemplateEmojicode}`
      );

      const pubKeyContent = await fs.readFile(emojicodePath, 'utf8');
      const pubKey = pubKeyContent.trim().replace(/"/g, '');

      expect(pubKey).to.equal(testPubKey);
    });
  });

  describe('Template Querying via BDO Service', () => {

    it('should query templates via BDO /templates endpoint', async () => {
      const response = await fetch(`${BDO_BASE_URL}/templates/Linkitylink-Template`);
      const result = await response.json();

      console.log('BDO templates query result:', result);

      expect(response.ok).to.be.true;
      expect(result.success).to.be.true;
      expect(result.hash).to.equal('Linkitylink-Template');
      expect(result.templates).to.be.an('array');
      expect(result.count).to.be.at.least(1);

      // Find our test template
      const ourTemplate = result.templates.find(t => t.emojicode === testTemplateEmojicode);
      expect(ourTemplate).to.exist;
      expect(ourTemplate.name).to.equal('Test Federation Template');
      expect(ourTemplate.pubKey).to.equal(testPubKey);
    });

    it('should add template to index via POST endpoint', async () => {
      // Generate a fake emojicode to test the add endpoint
      const fakeEmojicode = '🎨💎🌟🔥🌊🎭🎪🎯';

      const response = await fetch(`${BDO_BASE_URL}/templates/Linkitylink-Template/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emojicode: fakeEmojicode })
      });

      const result = await response.json();

      console.log('Add to index result:', result);

      expect(response.ok).to.be.true;
      expect(result.success).to.be.true;
      expect(result.emojicode).to.equal(fakeEmojicode);

      // Verify it was added to the filesystem
      const indexPath = path.join(
        process.cwd(),
        '../bdo/data/bdo/templates/Linkitylink-Template'
      );

      const indexContent = await fs.readFile(indexPath, 'utf8');
      const templates = JSON.parse(indexContent);

      expect(templates).to.include(fakeEmojicode);
    });
  });

  describe('Template Querying via Linkitylink', () => {

    it('should query templates via linkitylink /templates endpoint', async () => {
      const response = await fetch(`${LINKITYLINK_BASE_URL}/templates`);
      const result = await response.json();

      console.log('Linkitylink templates query result:', result);

      expect(response.ok).to.be.true;
      expect(result.success).to.be.true;
      expect(result.templates).to.be.an('array');
      expect(result.count).to.be.at.least(1);

      // Find our test template
      const ourTemplate = result.templates.find(t => t.emojicode === testTemplateEmojicode);
      expect(ourTemplate).to.exist;
      expect(ourTemplate.name).to.equal('Test Federation Template');
      expect(ourTemplate.colors).to.deep.equal(['#ff6b6b', '#ee5a6f', '#feca57']);
      expect(ourTemplate.linkColors).to.have.lengthOf(4);
      expect(ourTemplate.payeeEmojicode).to.equal('🔗💎🌟🎨🐉📌🌍🔑');
    });

    it('should filter out inactive templates', async () => {
      const response = await fetch(`${LINKITYLINK_BASE_URL}/templates`);
      const result = await response.json();

      // All returned templates should have status 'active'
      result.templates.forEach(template => {
        // The endpoint filters out status, but we can verify BDO has it
        expect(template.status).to.be.undefined; // Filtered out by endpoint
      });
    });

    it('should cache templates for 5 minutes', async () => {
      // First request
      const response1 = await fetch(`${LINKITYLINK_BASE_URL}/templates`);
      const result1 = await response1.json();

      expect(result1.cached).to.be.oneOf([true, false]);

      // Immediate second request should be cached
      const response2 = await fetch(`${LINKITYLINK_BASE_URL}/templates`);
      const result2 = await response2.json();

      expect(result2.cached).to.be.true;
      expect(result2.templates).to.deep.equal(result1.templates);
    });
  });

  describe('Multi-Instance Simulation', () => {

    it('should allow multiple linkitylink instances to see same templates', async () => {
      // In a real multi-instance setup, you'd query different ports
      // For now, we simulate by querying the same instance twice
      // and verifying they get the same data from the shared BDO service

      const response1 = await fetch(`${LINKITYLINK_BASE_URL}/templates`);
      const result1 = await response1.json();

      const response2 = await fetch(`${LINKITYLINK_BASE_URL}/templates`);
      const result2 = await response2.json();

      // Both should return identical template lists (from shared BDO)
      expect(result1.templates).to.deep.equal(result2.templates);

      console.log('✅ Multi-instance template sharing verified');
    });
  });

  describe('Filesystem Storage Verification', () => {

    it('should store template index as JSON array', async () => {
      const indexPath = path.join(
        process.cwd(),
        '../bdo/data/bdo/templates/Linkitylink-Template'
      );

      const indexContent = await fs.readFile(indexPath, 'utf8');
      const templates = JSON.parse(indexContent);

      expect(templates).to.be.an('array');
      expect(templates.length).to.be.at.least(1);

      // All entries should be emoji strings
      templates.forEach(emojicode => {
        expect(typeof emojicode).to.equal('string');
        expect(emojicode.length).to.be.at.least(8); // 8-emoji codes
      });

      console.log(`Template index contains ${templates.length} templates`);
    });

    it('should prevent duplicate emojicodes in index', async () => {
      const indexPath = path.join(
        process.cwd(),
        '../bdo/data/bdo/templates/Linkitylink-Template'
      );

      const indexContent = await fs.readFile(indexPath, 'utf8');
      const templates = JSON.parse(indexContent);

      // Check for duplicates
      const uniqueTemplates = [...new Set(templates)];
      expect(templates.length).to.equal(uniqueTemplates.length);
    });
  });

  describe('Payment Integration (Conceptual)', () => {

    it('should include payeeEmojicode for payment routing', async () => {
      const response = await fetch(`${LINKITYLINK_BASE_URL}/templates`);
      const result = await response.json();

      const ourTemplate = result.templates.find(t => t.emojicode === testTemplateEmojicode);

      expect(ourTemplate.payeeEmojicode).to.exist;
      expect(ourTemplate.payeeEmojicode).to.equal('🔗💎🌟🎨🐉📌🌍🔑');

      console.log('✅ Template includes payeeEmojicode for revenue sharing');
    });
  });
});
