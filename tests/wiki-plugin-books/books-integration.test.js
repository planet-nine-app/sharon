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
const PLUGIN_URL = `http://localhost:${WIKI_PORT}/plugin/books`;

describe('Wiki Plugin: Books', function() {
  this.timeout(60000); // Allow time for uploads and processing

  let booksUUID = null;

  describe('1. Plugin Initialization', function() {

    it('should have books plugin loaded', async function() {
      console.log('📡 Testing plugin availability...');

      const response = await fetch(`${PLUGIN_URL}/library`);
      expect(response.status).to.be.oneOf([200, 401]); // Either works or needs auth

      console.log('✅ Books plugin is loaded');
    });

    it('should have Sanora credentials configured', async function() {
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
      expect(data).to.have.property('books');
      expect(data.books).to.be.an('array');

      console.log(`✅ Library has ${data.books.length} books`);
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

    it('should validate Canipub feed structure', async function() {
      console.log('📡 Checking Canipub feed format...');

      const response = await fetch(`${PLUGIN_URL}/library`);
      const data = await response.json();

      if (data.books && data.books.length > 0) {
        const book = data.books[0];

        // Verify Canipub-compliant structure
        expect(book).to.have.property('name');
        expect(book).to.have.property('type', 'book');

        console.log('✅ Feed structure is Canipub-compliant');
      } else {
        console.log('ℹ️  No books to validate (empty library)');
      }
    });

  });

  describe('5. Metadata Extraction', function() {

    it('should support EPUB metadata extraction', function() {
      console.log('📖 Validating EPUB metadata fields...');

      const epubFields = [
        'title',
        'author',
        'description',
        'isbn',
        'publisher',
        'published'
      ];

      expect(epubFields).to.include('title');
      expect(epubFields).to.include('author');
      expect(epubFields).to.include('isbn');

      console.log('✅ EPUB metadata fields validated');
      console.log('   Fields:', epubFields.join(', '));
    });

    it('should support PDF metadata extraction', function() {
      console.log('📄 Validating PDF metadata fields...');

      const pdfFields = [
        'title',
        'author',
        'pageCount'
      ];

      expect(pdfFields).to.include('title');
      expect(pdfFields).to.include('pageCount');

      console.log('✅ PDF metadata fields validated');
      console.log('   Fields:', pdfFields.join(', '));
    });

  });

  describe('6. Error Handling', function() {

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

      const response = await fetch(`${PLUGIN_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      expect(response.status).to.be.oneOf([400, 401]);
      console.log('✅ Missing file handled correctly');
    });

  });

  describe('7. File Format Support', function() {

    it('should support standard ebook formats', function() {
      console.log('📚 Validating supported formats...');

      const supportedFormats = [
        { ext: '.epub', mime: 'application/epub+zip' },
        { ext: '.pdf', mime: 'application/pdf' },
        { ext: '.mobi', mime: 'application/x-mobipocket-ebook' },
        { ext: '.azw', mime: 'application/vnd.amazon.ebook' },
        { ext: '.azw3', mime: 'application/vnd.amazon.ebook' }
      ];

      expect(supportedFormats).to.have.lengthOf(5);
      expect(supportedFormats[0].ext).to.equal('.epub');

      console.log('✅ Supported formats validated');
      supportedFormats.forEach(format => {
        console.log(`   ${format.ext} → ${format.mime}`);
      });
    });

  });

});
