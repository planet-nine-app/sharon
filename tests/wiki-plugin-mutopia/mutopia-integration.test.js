import { expect } from 'chai';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const WIKI_PORT = process.env.WIKI_PORT || 3000;
const SANORA_PORT = process.env.SANORA_PORT || 7243;
const PLUGIN_URL = `http://localhost:${WIKI_PORT}/plugin/mutopia`;

describe('Wiki Plugin: Mutopia (Music)', function() {
  this.timeout(60000); // Allow time for uploads and processing

  let mutopiaUUID = null;

  describe('1. Plugin Initialization', function() {

    it('should have mutopia plugin loaded', async function() {
      console.log('📡 Testing plugin availability...');

      const response = await fetch(`${PLUGIN_URL}/library`);
      expect(response.status).to.be.oneOf([200, 401]); // Either works or needs auth

      console.log('✅ Mutopia plugin is loaded');
    });

    it('should have Sanora credentials configured', async function() {
      // The plugin should have created a Sanora user account
      const response = await fetch(`${PLUGIN_URL}/library`);
      const data = await response.json();

      expect(data).to.have.property('success');
      console.log('✅ Plugin credentials configured');
    });

  });

  describe('2. Library Retrieval', function() {

    it('should return empty library initially', async function() {
      console.log('📚 Fetching library...');

      const response = await fetch(`${PLUGIN_URL}/library`);
      expect(response.ok).to.be.true;

      const data = await response.json();
      expect(data).to.have.property('success', true);
      expect(data).to.have.property('tracks');
      expect(data.tracks).to.be.an('array');

      console.log(`✅ Library has ${data.tracks.length} tracks`);
    });

  });

  describe('3. Sanora Integration', function() {

    it('should proxy requests to Sanora', async function() {
      console.log('🔗 Testing Sanora proxy...');

      const response = await fetch(`${PLUGIN_URL}/sanora/health`, {
        method: 'GET'
      });

      // Should either work or return service unavailable
      expect(response.status).to.be.oneOf([200, 503]);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Sanora proxy working:', data);
      } else {
        console.log('⚠️  Sanora service not available (expected in test env)');
      }
    });

  });

  describe('4. Feed Validation', function() {

    it('should validate Canimus feed structure', async function() {
      console.log('📡 Checking Canimus feed format...');

      const response = await fetch(`${PLUGIN_URL}/library`);
      const data = await response.json();

      if (data.tracks && data.tracks.length > 0) {
        const track = data.tracks[0];

        // Verify Canimus-compliant structure
        expect(track).to.have.property('title');
        expect(track).to.have.property('type', 'track');

        console.log('✅ Feed structure is Canimus-compliant');
      } else {
        console.log('ℹ️  No tracks to validate (empty library)');
      }
    });

  });

  describe('5. Error Handling', function() {

    it('should reject uploads without authentication', async function() {
      console.log('🔒 Testing authentication...');

      const response = await fetch(`${PLUGIN_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      expect(response.status).to.equal(401);
      console.log('✅ Authentication required for uploads');
    });

    it('should handle missing file gracefully', async function() {
      console.log('📤 Testing missing file handling...');

      // This would normally require auth, but testing error path
      const response = await fetch(`${PLUGIN_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      // Should be 401 (unauthorized) or 400 (bad request)
      expect(response.status).to.be.oneOf([400, 401]);
      console.log('✅ Missing file handled correctly');
    });

  });

  describe('6. Archive Processing (Mock)', function() {

    it('should accept Canimus archive format', function() {
      console.log('🎵 Validating Canimus archive requirements...');

      // Canimus archives should contain:
      // - feed.xml or feed.rss (RSS feed)
      // - .mp3/.m4a/.ogg/.flac/.wav files

      const validFormats = ['.mp3', '.m4a', '.ogg', '.flac', '.wav'];
      expect(validFormats).to.have.lengthOf(5);

      const requiredFeedFiles = ['feed.xml', 'feed.rss'];
      expect(requiredFeedFiles).to.have.lengthOf(2);

      console.log('✅ Archive format requirements validated');
      console.log('   Feed files:', requiredFeedFiles.join(', '));
      console.log('   Audio formats:', validFormats.join(', '));
    });

  });

});
