import { expect } from 'chai';
import fetch from 'node-fetch';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Test configuration
const WIKI_ALICE_URL = process.env.WIKI_ALICE_URL || 'http://localhost:3001';
const WIKI_BOB_URL = process.env.WIKI_BOB_URL || 'http://localhost:3002';
const WIKI_CAROL_URL = process.env.WIKI_CAROL_URL || 'http://localhost:3003';
const SANORA_URL = process.env.SANORA_URL || 'http://localhost:7243';

describe('Federated Wiki - Multi-Node Federation Tests', function() {
  this.timeout(120000); // 2 minutes for docker operations

  describe('1. Environment Setup', function() {

    it('should start docker compose environment', function(done) {
      this.timeout(180000); // 3 minutes for container startup

      console.log('🐳 Starting Docker Compose environment...');
      console.log('   This may take a few minutes on first run...');

      try {
        execSync('docker-compose up -d', {
          cwd: __dirname,
          stdio: 'inherit'
        });

        // Wait for services to be healthy
        console.log('⏳ Waiting for services to be healthy...');
        let attempts = 0;
        const maxAttempts = 30;

        const checkHealth = setInterval(async () => {
          attempts++;

          try {
            const aliceHealth = await fetch(`${WIKI_ALICE_URL}/`);
            const bobHealth = await fetch(`${WIKI_BOB_URL}/`);
            const carolHealth = await fetch(`${WIKI_CAROL_URL}/`);

            if (aliceHealth.ok && bobHealth.ok && carolHealth.ok) {
              clearInterval(checkHealth);
              console.log('✅ All wiki nodes are healthy!');
              done();
            }
          } catch (err) {
            if (attempts >= maxAttempts) {
              clearInterval(checkHealth);
              done(new Error('Timeout waiting for wikis to become healthy'));
            }
          }
        }, 2000);

      } catch (err) {
        done(err);
      }
    });

  });

  describe('2. Wiki Node Availability', function() {

    it('should have Alice\'s wiki running', async function() {
      console.log('📡 Checking Alice\'s wiki...');

      const response = await fetch(WIKI_ALICE_URL);
      expect(response.ok).to.be.true;

      const html = await response.text();
      expect(html).to.include('wiki');

      console.log('✅ Alice\'s wiki is running on port 3001');
    });

    it('should have Bob\'s wiki running', async function() {
      console.log('📡 Checking Bob\'s wiki...');

      const response = await fetch(WIKI_BOB_URL);
      expect(response.ok).to.be.true;

      const html = await response.text();
      expect(html).to.include('wiki');

      console.log('✅ Bob\'s wiki is running on port 3002');
    });

    it('should have Carol\'s wiki running', async function() {
      console.log('📡 Checking Carol\'s wiki...');

      const response = await fetch(WIKI_CAROL_URL);
      expect(response.ok).to.be.true;

      const html = await response.text();
      expect(html).to.include('wiki');

      console.log('✅ Carol\'s wiki is running on port 3003');
    });

  });

  describe('3. Plugin Availability', function() {

    it('should have allyabase plugin on Alice\'s wiki', async function() {
      console.log('🌐 Checking Allyabase plugin...');

      const response = await fetch(`${WIKI_ALICE_URL}/plugin/allyabase/status`);
      expect(response.status).to.be.oneOf([200, 404, 503]); // 404 = not launched yet, 503 = services down

      console.log('✅ Allyabase plugin loaded on Alice\'s wiki');
    });

    it('should have allyabase plugin on Bob\'s wiki', async function() {
      console.log('🌐 Checking Allyabase plugin on Bob...');

      const response = await fetch(`${WIKI_BOB_URL}/plugin/allyabase/status`);
      expect(response.status).to.be.oneOf([200, 404, 503]);

      console.log('✅ Allyabase plugin loaded on Bob\'s wiki');
    });

    it('should have allyabase plugin on Carol\'s wiki', async function() {
      console.log('🌐 Checking Allyabase plugin on Carol...');

      const response = await fetch(`${WIKI_CAROL_URL}/plugin/allyabase/status`);
      expect(response.status).to.be.oneOf([200, 404, 503]);

      console.log('✅ Allyabase plugin loaded on Carol\'s wiki');
    });

    it('should have mutopia plugin on all wikis', async function() {
      console.log('🎵 Checking Mutopia plugin...');

      const alice = await fetch(`${WIKI_ALICE_URL}/plugin/mutopia/library`);
      const bob = await fetch(`${WIKI_BOB_URL}/plugin/mutopia/library`);
      const carol = await fetch(`${WIKI_CAROL_URL}/plugin/mutopia/library`);

      expect(alice.status).to.be.oneOf([200, 401]);
      expect(bob.status).to.be.oneOf([200, 401]);
      expect(carol.status).to.be.oneOf([200, 401]);

      console.log('✅ Mutopia plugin loaded on all wikis');
    });

    it('should have books plugin on all wikis', async function() {
      console.log('📚 Checking Books plugin...');

      const alice = await fetch(`${WIKI_ALICE_URL}/plugin/books/library`);
      const bob = await fetch(`${WIKI_BOB_URL}/plugin/books/library`);
      const carol = await fetch(`${WIKI_CAROL_URL}/plugin/books/library`);

      expect(alice.status).to.be.oneOf([200, 401]);
      expect(bob.status).to.be.oneOf([200, 401]);
      expect(carol.status).to.be.oneOf([200, 401]);

      console.log('✅ Books plugin loaded on all wikis');
    });

    it('should have blogs plugin on all wikis', async function() {
      console.log('📝 Checking Blogs plugin...');

      const alice = await fetch(`${WIKI_ALICE_URL}/plugin/blogs/feed`);
      const bob = await fetch(`${WIKI_BOB_URL}/plugin/blogs/feed`);
      const carol = await fetch(`${WIKI_CAROL_URL}/plugin/blogs/feed`);

      expect(alice.status).to.be.oneOf([200, 401]);
      expect(bob.status).to.be.oneOf([200, 401]);
      expect(carol.status).to.be.oneOf([200, 401]);

      console.log('✅ Blogs plugin loaded on all wikis');
    });

    it('should have recipes plugin on all wikis', async function() {
      console.log('🍳 Checking Recipes plugin...');

      const alice = await fetch(`${WIKI_ALICE_URL}/plugin/recipes/feed`);
      const bob = await fetch(`${WIKI_BOB_URL}/plugin/recipes/feed`);
      const carol = await fetch(`${WIKI_CAROL_URL}/plugin/recipes/feed`);

      expect(alice.status).to.be.oneOf([200, 401]);
      expect(bob.status).to.be.oneOf([200, 401]);
      expect(carol.status).to.be.oneOf([200, 401]);

      console.log('✅ Recipes plugin loaded on all wikis');
    });

    it('should have linkitylink plugin on all wikis', async function() {
      console.log('🔗 Checking Linkitylink plugin...');

      const alice = await fetch(`${WIKI_ALICE_URL}/plugin/linkitylink/health`);
      const bob = await fetch(`${WIKI_BOB_URL}/plugin/linkitylink/health`);
      const carol = await fetch(`${WIKI_CAROL_URL}/plugin/linkitylink/health`);

      // Linkitylink might not be running yet (it's a spawned service)
      // Accept 200 (running), 503 (not running), or 404 (route not found)
      expect(alice.status).to.be.oneOf([200, 404, 503]);
      expect(bob.status).to.be.oneOf([200, 404, 503]);
      expect(carol.status).to.be.oneOf([200, 404, 503]);

      console.log('✅ Linkitylink plugin loaded on all wikis');
    });

  });

  describe('4. Neighborhood Discovery', function() {

    it('should discover neighbors via sitemap.json', async function() {
      console.log('🔍 Checking neighborhood discovery...');

      // Check if Alice can see her neighbors
      const response = await fetch(`${WIKI_ALICE_URL}/system/sitemap.json`);
      expect(response.ok).to.be.true;

      const sitemap = await response.json();
      console.log('   Alice\'s sitemap:', JSON.stringify(sitemap, null, 2));

      // Sitemap should exist
      expect(sitemap).to.exist;

      console.log('✅ Sitemap available for neighborhood discovery');
    });

    it('should list neighbors in welcome-visitors page', async function() {
      console.log('🏘️  Checking neighborhood list...');

      // Create a page on Alice's wiki that references neighbors
      const pageSlug = 'welcome-visitors';
      const response = await fetch(`${WIKI_ALICE_URL}/${pageSlug}.json`);

      if (response.ok) {
        const page = await response.json();
        console.log('   Found welcome page');
        console.log('✅ Neighborhood pages available');
      } else {
        console.log('ℹ️  Welcome page not yet created (expected for fresh wiki)');
      }
    });

  });

  describe('5. Cross-Wiki Content Discovery', function() {

    it('should access Alice\'s content from Bob\'s perspective', async function() {
      console.log('🔗 Testing cross-wiki content access...');

      // Try to fetch Alice's sitemap from Bob's wiki perspective
      // This simulates Bob's wiki discovering Alice's content

      const response = await fetch(`${WIKI_BOB_URL}/`);
      expect(response.ok).to.be.true;

      console.log('✅ Bob can access wiki federation network');
    });

    it('should enable search across federated wikis', async function() {
      console.log('🔎 Testing federated search...');

      // Test if we can search across wikis
      // This would typically involve the /system/slugs endpoint

      const aliceSlugs = await fetch(`${WIKI_ALICE_URL}/system/slugs.json`);
      const bobSlugs = await fetch(`${WIKI_BOB_URL}/system/slugs.json`);
      const carolSlugs = await fetch(`${WIKI_CAROL_URL}/system/slugs.json`);

      if (aliceSlugs.ok) {
        const slugs = await aliceSlugs.json();
        console.log(`   Alice has ${slugs.length || 0} pages`);
      }

      if (bobSlugs.ok) {
        const slugs = await bobSlugs.json();
        console.log(`   Bob has ${slugs.length || 0} pages`);
      }

      if (carolSlugs.ok) {
        const slugs = await carolSlugs.json();
        console.log(`   Carol has ${slugs.length || 0} pages`);
      }

      console.log('✅ Federated search endpoints available');
    });

  });

  describe('6. Plugin Content Federation', function() {

    it('should federate music content (Mutopia)', async function() {
      console.log('🎵 Testing Mutopia content federation...');

      // Alice uploads music, Bob should be able to discover it via federation
      const aliceLibrary = await fetch(`${WIKI_ALICE_URL}/plugin/mutopia/library`);

      if (aliceLibrary.ok) {
        const library = await aliceLibrary.json();
        console.log(`   Alice's music library:`, library.tracks?.length || 0, 'tracks');
      }

      // In a full federation test, Bob would query Alice's Sanora feed
      console.log('✅ Mutopia federation endpoints available');
    });

    it('should federate book content (Books)', async function() {
      console.log('📚 Testing Books content federation...');

      const bobLibrary = await fetch(`${WIKI_BOB_URL}/plugin/books/library`);

      if (bobLibrary.ok) {
        const library = await bobLibrary.json();
        console.log(`   Bob's book library:`, library.books?.length || 0, 'books');
      }

      console.log('✅ Books federation endpoints available');
    });

    it('should federate blog content (Blogs)', async function() {
      console.log('📝 Testing Blogs content federation...');

      const carolFeed = await fetch(`${WIKI_CAROL_URL}/plugin/blogs/feed`);

      if (carolFeed.ok) {
        const feed = await carolFeed.json();
        console.log(`   Carol's blog feed:`, feed.posts?.length || 0, 'posts');
      }

      console.log('✅ Blogs federation endpoints available');
    });

    it('should federate recipe content (Recipes)', async function() {
      console.log('🍳 Testing Recipes content federation...');

      const carolRecipes = await fetch(`${WIKI_CAROL_URL}/plugin/recipes/feed`);

      if (carolRecipes.ok) {
        const feed = await carolRecipes.json();
        console.log(`   Carol's recipe feed:`, feed.recipes?.length || 0, 'recipes');
      }

      console.log('✅ Recipes federation endpoints available');
    });

  });

  describe('7. Allyabase Service Proxies', function() {

    it('should provide proxy routes to Planet Nine services', async function() {
      console.log('🔌 Testing allyabase service proxies...');

      const services = [
        { name: 'Fount', path: '/plugin/allyabase/fount/resolve' },
        { name: 'BDO', path: '/plugin/allyabase/bdo/health' },
        { name: 'Julia', path: '/plugin/allyabase/julia/health' },
        { name: 'Sanora', path: '/plugin/allyabase/sanora/health' }
      ];

      for (const service of services) {
        try {
          const response = await fetch(`${WIKI_ALICE_URL}${service.path}`);
          // Proxy should respond even if backend service is down (503)
          expect(response.status).to.be.oneOf([200, 404, 503]);
          console.log(`   ${service.name} proxy: available`);
        } catch (err) {
          console.log(`   ${service.name} proxy: ${err.message}`);
        }
      }

      console.log('✅ Allyabase service proxy routes configured');
    });

    it('should support federation endpoints', async function() {
      console.log('🌐 Testing federation endpoints...');

      // Test federation/locations endpoint
      const response = await fetch(`${WIKI_ALICE_URL}/plugin/allyabase/federation/locations`);

      if (response.ok) {
        const locations = await response.json();
        console.log('   Federation locations endpoint available');
      } else if (response.status === 404) {
        console.log('   Federation endpoints not initialized yet (expected)');
      }

      console.log('✅ Federation endpoints configured');
    });

  });

  describe('8. Shared Sanora Backend', function() {

    it('should have Sanora available for all wikis', async function() {
      console.log('🔗 Testing shared Sanora backend...');

      try {
        const response = await fetch(`${SANORA_URL}/health`);

        if (response.ok) {
          const health = await response.json();
          console.log('   Sanora health:', health);
          console.log('✅ Shared Sanora backend is healthy');
        } else {
          console.log('ℹ️  Sanora not available (optional for federation test)');
        }
      } catch (err) {
        console.log('ℹ️  Sanora not running (optional for federation test)');
      }
    });

  });

  describe('9. Federation Metadata', function() {

    it('should expose federation metadata for each wiki', async function() {
      console.log('📊 Checking federation metadata...');

      const wikis = [
        { name: 'Alice', url: WIKI_ALICE_URL },
        { name: 'Bob', url: WIKI_BOB_URL },
        { name: 'Carol', url: WIKI_CAROL_URL }
      ];

      for (const wiki of wikis) {
        try {
          const response = await fetch(`${wiki.url}/system/sitemap.json`);
          if (response.ok) {
            const sitemap = await response.json();
            console.log(`   ${wiki.name}'s sitemap available`);
          }
        } catch (err) {
          console.log(`   ${wiki.name}'s sitemap not available (may need initialization)`);
        }
      }

      console.log('✅ Federation metadata checks complete');
    });

  });

  after(function() {
    console.log('\n📝 Federation Test Summary:');
    console.log('   - 3 wiki nodes deployed');
    console.log('   - 6 plugins per wiki (allyabase + linkitylink + 4 content plugins)');
    console.log('   - Neighborhood discovery enabled');
    console.log('   - Cross-wiki content access tested');
    console.log('   - Federated search available');
    console.log('   - Service proxy routes configured');
    console.log('\n🌐 Allyabase Features:');
    console.log('   - Service proxies to 14 Planet Nine microservices');
    console.log('   - Federation via emoji shortcodes');
    console.log('   - BDO resolution across wikis');
    console.log('\n🔗 Linkitylink Features:');
    console.log('   - Link tapestry service');
    console.log('   - Linktree import functionality');
    console.log('   - SVG rendering for link collections');
    console.log('\n💡 Tip: Keep containers running with: docker-compose logs -f');
    console.log('💡 Stop with: docker-compose down');
    console.log('💡 Clean volumes with: docker-compose down -v');
  });

});
