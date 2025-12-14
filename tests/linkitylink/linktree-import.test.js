import { expect } from 'chai';
import fetch from 'node-fetch';

// Test configuration
const LINKITYLINK_URL = process.env.LINKITYLINK_URL || 'http://localhost:3010';
const BDO_BASE_URL = process.env.BDO_BASE_URL || 'http://localhost:3003';
const LINKTREE_URL = 'https://linktr.ee/thefledgecollective';

describe('Linkitylink - Linktree Import', function() {
  this.timeout(30000); // Allow time for fetching Linktree

  let linktreeData;
  let tapestryResult;

  describe('1. Fetch and Parse Linktree', function() {

    it('should fetch the Linktree page', async function() {
      console.log(`📡 Fetching: ${LINKTREE_URL}`);

      const response = await fetch(LINKTREE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      expect(response.ok).to.be.true;
      expect(response.status).to.equal(200);

      const html = await response.text();
      expect(html).to.be.a('string');
      expect(html).to.include('__NEXT_DATA__');

      console.log(`✅ Linktree page fetched (${html.length} bytes)`);

      // Parse __NEXT_DATA__
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
      expect(nextDataMatch).to.not.be.null;

      const nextData = JSON.parse(nextDataMatch[1]);
      expect(nextData).to.have.property('props');

      linktreeData = nextData;
      console.log(`✅ __NEXT_DATA__ parsed successfully`);
    });

    it('should extract links from __NEXT_DATA__', function() {
      expect(linktreeData).to.exist;

      const accountData = linktreeData.props.pageProps.account;
      expect(accountData).to.have.property('username');
      expect(accountData).to.have.property('profilePictureUrl');
      expect(accountData).to.have.property('links');

      const links = accountData.links;
      expect(links).to.be.an('array');
      expect(links.length).to.be.greaterThan(0);

      console.log(`✅ Found ${links.length} links for @${accountData.username}`);
      console.log(`   Profile: ${accountData.profilePictureUrl}`);

      // Verify link structure
      const firstLink = links[0];
      expect(firstLink).to.have.property('title');
      expect(firstLink).to.have.property('url');

      console.log(`   First link: "${firstLink.title}" → ${firstLink.url}`);
    });

  });

  describe('2. Create Tapestry via Glyphenge', function() {

    it('should call Glyphenge POST /create endpoint', async function() {
      expect(linktreeData).to.exist;

      const accountData = linktreeData.props.pageProps.account;
      const links = accountData.links
        .filter(link => link.url && link.title)
        .map(link => ({
          title: link.title,
          url: link.url
        }));

      const payload = {
        title: `@${accountData.username}'s Links`,
        links: links,
        source: 'linktree',
        sourceUrl: LINKTREE_URL
      };

      console.log(`📤 Sending ${links.length} links to Linkitylink...`);

      const response = await fetch(`${LINKITYLINK_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      expect(response.ok).to.be.true;
      expect(response.status).to.equal(200);

      const result = await response.json();
      expect(result).to.have.property('success');
      expect(result.success).to.be.true;

      tapestryResult = result;
      console.log(`✅ Linkitylink responded successfully`);
    });

    it('should return a valid emojicode', function() {
      expect(tapestryResult).to.exist;
      expect(tapestryResult).to.have.property('emojicode');

      const emojicode = tapestryResult.emojicode;
      expect(emojicode).to.be.a('string');

      // Emojicodes should be non-empty (8 emoji, but some are compound characters)
      expect(emojicode.length).to.be.greaterThan(0);

      console.log(`🎨 Emojicode: ${emojicode}`);
    });

    it('should return BDO metadata', function() {
      expect(tapestryResult).to.exist;
      expect(tapestryResult).to.have.property('uuid');
      expect(tapestryResult).to.have.property('pubKey');
      expect(tapestryResult).to.have.property('emojicode');

      expect(tapestryResult.uuid).to.be.a('string');
      expect(tapestryResult.pubKey).to.match(/^0[23]/); // Valid secp256k1 pubKey
      expect(tapestryResult.emojicode).to.be.a('string');

      console.log(`✅ BDO UUID: ${tapestryResult.uuid}`);
      console.log(`   PubKey: ${tapestryResult.pubKey.substring(0, 20)}...`);
      console.log(`   Emojicode: ${tapestryResult.emojicode}`);
    });

    it('should construct URLs from identifiers (client-side)', function() {
      expect(tapestryResult).to.exist;
      expect(tapestryResult).to.have.property('emojicode');
      expect(tapestryResult).to.have.property('pubKey');

      // Construct URLs client-side using environment variables
      const emojicodeUrl = `${LINKITYLINK_URL}?emojicode=${encodeURIComponent(tapestryResult.emojicode)}`;
      const alphanumericIdentifier = tapestryResult.pubKey.substring(0, 16);
      const alphanumericUrl = `${LINKITYLINK_URL}/t/${alphanumericIdentifier}`;
      const bdoUrl = `${BDO_BASE_URL}/emoji/${encodeURIComponent(tapestryResult.emojicode)}`;

      // Store constructed URLs for later tests
      tapestryResult.emojicodeUrl = emojicodeUrl;
      tapestryResult.alphanumericUrl = alphanumericUrl;
      tapestryResult.bdoUrl = bdoUrl;

      // Verify URLs use correct base URLs (port consistency)
      expect(emojicodeUrl).to.include(LINKITYLINK_URL);
      expect(alphanumericUrl).to.include(LINKITYLINK_URL);
      expect(bdoUrl).to.include(BDO_BASE_URL);

      console.log(`✅ Client-side URL construction successful`);
      console.log(`   Emojicode URL: ${emojicodeUrl}`);
      console.log(`   Alphanumeric URL: ${alphanumericUrl}`);
      console.log(`   BDO URL: ${bdoUrl}`);
    });

    it('should have created a public BDO with SVG content', async function() {
      expect(tapestryResult).to.exist;
      expect(tapestryResult).to.have.property('emojicode');

      // Construct BDO URL using configured base (for Docker environment support)
      const emojicode = encodeURIComponent(tapestryResult.emojicode);
      const bdoUrl = `${BDO_BASE_URL}/emoji/${emojicode}`;

      console.log(`🔍 Fetching BDO from: ${bdoUrl}`);

      const response = await fetch(bdoUrl);
      expect(response.ok).to.be.true;

      const bdoData = await response.json();
      expect(bdoData).to.have.property('bdo');
      expect(bdoData.bdo).to.have.property('svgContent');
      expect(bdoData.bdo).to.have.property('links');

      const svgContent = bdoData.bdo.svgContent;
      expect(svgContent).to.be.a('string');
      expect(svgContent).to.include('<svg');
      expect(svgContent).to.include('</svg>');

      const links = bdoData.bdo.links;
      expect(links).to.be.an('array');
      expect(links.length).to.be.greaterThan(0);

      console.log(`✅ BDO contains ${links.length} links`);
      console.log(`   SVG size: ${svgContent.length} bytes`);
      console.log(`   SVG includes: ${svgContent.includes('gradient') ? 'gradients' : 'basic shapes'}`);
    });

    it('should be viewable at emojicode URL', async function() {
      expect(tapestryResult).to.exist;
      expect(tapestryResult).to.have.property('emojicodeUrl');

      console.log(`🌐 Checking Linkitylink display: ${tapestryResult.emojicodeUrl}`);

      const response = await fetch(tapestryResult.emojicodeUrl);
      expect(response.ok).to.be.true;

      const html = await response.text();
      expect(html).to.include('<svg');
      expect(html).to.include('</svg>');

      console.log(`✅ Tapestry is viewable at emojicode URL`);
    });

    it('should be viewable at alphanumeric URL', async function() {
      expect(tapestryResult).to.exist;
      expect(tapestryResult).to.have.property('alphanumericUrl');

      console.log(`🔗 Checking alphanumeric URL: ${tapestryResult.alphanumericUrl}`);

      const response = await fetch(tapestryResult.alphanumericUrl);
      expect(response.ok).to.be.true;

      const html = await response.text();
      expect(html).to.include('<svg');
      expect(html).to.include('</svg>');

      console.log(`✅ Tapestry is viewable at alphanumeric URL (easier to share!)`);
    });

  });

  describe('3. Summary', function() {

    it('should display complete test results', function() {
      expect(tapestryResult).to.exist;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`🎉 Linktree Import Complete!`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Source: ${LINKTREE_URL}`);
      console.log(`Emojicode: ${tapestryResult.emojicode}`);
      console.log(`View with emojicode: ${tapestryResult.emojicodeUrl}`);
      console.log(`View with alphanumeric: ${tapestryResult.alphanumericUrl}`);
      console.log(`BDO: ${tapestryResult.bdoUrl}`);
      console.log(`${'='.repeat(60)}\n`);
    });

  });
});
