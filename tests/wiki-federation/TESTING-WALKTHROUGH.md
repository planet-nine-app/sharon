# Federation Testing Walkthrough

Complete step-by-step guide to testing all 6 plugins across 3 federated wikis.

## 🚀 Part 1: Start the Federation (1 minute)

```bash
cd sharon/tests/wiki-federation

# One command to start everything
./start-federation.sh --setup

# First run: Builds Docker image (~2-3 minutes)
# - Installs wiki-security-sessionless
# - Installs all 6 plugins
# - Creates custom image

# Wait for success message:
# ✅ Alice's wiki is ready (port 3001)
# ✅ Bob's wiki is ready (port 3002)
# ✅ Carol's wiki is ready (port 3003)
```

**Note:** The first time you run this, Docker will build a custom image that includes:
- Base federated wiki (dobbs/farm)
- wiki-security-sessionless module
- All 6 plugins

This takes 2-3 minutes. Subsequent runs use the cached image and start in ~30 seconds.

**What just happened:**
- ✅ Created 3 independent wiki nodes (separate Docker containers)
- ✅ Installed 6 plugins on each wiki
- ✅ Configured them as federated neighbors
- ✅ Created owner.json files for sessionless authentication
- ✅ Started shared Sanora backend (port 7243)

**Verify owner.json files:**
```bash
# Check that owner.json was created for each wiki
cat data/alice/status/owner.json
cat data/bob/status/owner.json
cat data/carol/status/owner.json

# All should show the same owner with pubKey:
# 03493f885965c30f36788427eb0376c12ae8fc19118a872c9a06cec9d1dea504db
```

## 🌐 Part 2: Open Everything (1 minute)

```bash
# Open all three wikis
open http://localhost:3001  # Alice
open http://localhost:3002  # Bob
open http://localhost:3003  # Carol

# Open the feed viewer
open feed-viewer.html
```

**You should see:**
- 3 browser tabs with empty wikis (default "Welcome Visitors" pages)
- 1 browser tab with the feed viewer interface

## 📝 Part 3: Test Alice's Wiki - Music Focus (5 minutes)

Alice's wiki specializes in **Mutopia (music)** but has all plugins.

### 3.1 Basic Wiki Functionality

**In Alice's wiki tab (localhost:3001):**

1. **Create a test page:**
   - Click the wiki logo
   - You'll see "Welcome Visitors" page
   - Click the edit icon (pencil) or flag
   - Click "add paragraph"
   - Type: "This is Alice's test page"
   - Click the page name to fork/claim it

2. **View the page:**
   - You should see your text
   - Page is now in your browser's local storage
   - Other wikis won't see it yet (we'll test federation later)

### 3.2 Test Allyabase Plugin (Service Proxies)

**What it does:** Provides proxy routes to 14 Planet Nine microservices

**Test it:**
```bash
# In terminal - test proxy routes
curl http://localhost:3001/plugin/allyabase/status

# Expected: JSON with service status or 404 (service not configured yet)
```

**In browser:**
- Navigate to: `http://localhost:3001/plugin/allyabase/status`
- You should see JSON or a 404 (both mean plugin is loaded)

**What to verify:**
- ✅ Plugin responds (not "plugin not found" error)
- ✅ Returns valid response (JSON or proper error)

### 3.3 Test Linkitylink Plugin (Link Tapestries)

**What it does:** Creates visual link tapestries and imports from Linktree

**Test it:**
```bash
# Test health endpoint
curl http://localhost:3001/plugin/linkitylink/health

# Expected: 200 (running) or 503 (not started yet)
```

**In wiki:**
- Create a page with links
- The linkitylink plugin can render these as SVG tapestries
- (Advanced feature - basic test is endpoint availability)

**What to verify:**
- ✅ Health endpoint responds
- ✅ Plugin is loaded

### 3.4 Test Mutopia Plugin (Music)

**What it does:** Distribute music via Canimus RSS feeds

**Test without content:**
```bash
# Test feed endpoint
curl http://localhost:3001/plugin/mutopia/feed

# Expected: Empty RSS feed or 401 (auth required)
```

**In feed viewer:**
1. Select "Alice's Wiki"
2. Click "Fetch Canimus"
3. See result (empty feed or auth required)

**With content (if you have .mp3 files):**

This requires:
- Sanora running with your music files
- Mutopia configured to point to Sanora
- Authentication set up

**For now, verify:**
- ✅ Feed endpoint exists (`/plugin/mutopia/feed`)
- ✅ Returns valid RSS structure (even if empty)
- ✅ Shows up in feed viewer

### 3.5 Test Books Plugin

```bash
curl http://localhost:3001/plugin/books/library

# Expected: JSON with books array (empty or auth required)
```

**In feed viewer:**
- Click "Fetch Canipub"
- Should see JSON structure

### 3.6 Test Blogs Plugin

```bash
curl http://localhost:3001/plugin/blogs/feed

# Expected: JSON with posts array
```

**In feed viewer:**
- Click "Fetch Caniblog"
- Should see JSON structure

### 3.7 Test Recipes Plugin

```bash
curl http://localhost:3001/plugin/recipes/feed

# Expected: JSON with recipes array
```

**In feed viewer:**
- Click "Fetch Canicook"
- Should see JSON structure

### 3.8 Test All Feeds at Once

**In feed viewer:**
- Select "Alice's Wiki"
- Click "🔄 Fetch All Feeds"
- All 4 feeds should load simultaneously

**What to verify:**
- ✅ All feeds respond (not 404)
- ✅ Each shows correct format (RSS for music, JSON for others)
- ✅ Status indicators show success or expected errors (401/503)

## 📚 Part 4: Test Bob's Wiki - Books Focus (5 minutes)

Bob's wiki specializes in **Books** but has all plugins.

### 4.1 Switch to Bob's Wiki

**In feed viewer:**
- Click "📚 Bob's Wiki (3002)" button
- Button should highlight (become active)

### 4.2 Test All Bob's Feeds

**In feed viewer:**
- Click "🔄 Fetch All Feeds"
- Compare results to Alice's wiki

**What to verify:**
- ✅ All same plugins available on Bob's wiki
- ✅ All feeds respond with same structure
- ✅ Bob's wiki is independent (not sharing state with Alice)

### 4.3 Create Content on Bob's Wiki

**In Bob's wiki tab (localhost:3002):**

1. Create a new page:
   - Click flag/edit
   - Add a paragraph: "This is Bob's bookstore"
   - Save/fork the page

2. Create another page:
   - Type a title in the search box
   - Click "create new page"
   - Add content about books

**What to verify:**
- ✅ Bob's wiki works independently
- ✅ Content doesn't appear on Alice's wiki yet
- ✅ Bob can create pages freely

## 📝 Part 5: Test Carol's Wiki - Blogs/Recipes Focus (5 minutes)

Carol's wiki specializes in **Blogs and Recipes**.

### 5.1 Switch to Carol's Wiki

**In feed viewer:**
- Click "📝 Carol's Wiki (3003)" button

### 5.2 Test All Carol's Feeds

**In feed viewer:**
- Click "🔄 Fetch All Feeds"

**What to verify:**
- ✅ All plugins available
- ✅ Independent from Alice and Bob
- ✅ All feeds respond correctly

### 5.3 Create Blog-Like Content

**In Carol's wiki tab (localhost:3003):**

1. Create a blog post:
   - Create new page: "My First Blog Post"
   - Add paragraphs with blog content
   - Add a date
   - Save/fork

2. Create a recipe:
   - Create new page: "Chocolate Chip Cookies"
   - Add ingredients list
   - Add instructions
   - Save/fork

## 🔗 Part 6: Test Federation (10 minutes)

Now test that the wikis can discover each other and share content.

### 6.1 Check Sitemap Endpoints

Each wiki exposes a sitemap showing its pages:

```bash
# Alice's pages
curl http://localhost:3001/system/sitemap.json

# Bob's pages
curl http://localhost:3002/system/sitemap.json

# Carol's pages
curl http://localhost:3003/system/sitemap.json
```

**Expected:** JSON with page slugs

### 6.2 Check Neighborhood Configuration

Wikis should know about their neighbors:

```bash
# Check Alice knows about Bob and Carol
cat config/alice.json

# Should see:
# "neighbors": ["bob.localhost", "carol.localhost"]
```

### 6.3 Test Cross-Wiki Page Access

**In Alice's wiki:**

1. Try to access Bob's page:
   - In URL bar: `http://localhost:3001/view/bob.localhost/welcome-visitors`
   - Or click on Bob's wiki in the neighborhood roster (if visible)

2. You should see:
   - Bob's page content
   - Rendered on Alice's wiki
   - This is federation in action!

**Try the reverse:**
- In Bob's wiki, access Alice's pages
- In Carol's wiki, access both Alice and Bob's pages

### 6.4 Test Neighborhood Search

**In any wiki:**

1. Click the search icon
2. Type a search term
3. Results should include:
   - Local pages (from this wiki)
   - Federated pages (from neighbor wikis)

### 6.5 Test Page Forking

**Cross-wiki fork test:**

1. In Alice's wiki, view Bob's page
2. Click the flag to fork it
3. Edit the content
4. Save

**What happened:**
- ✅ Alice now has her own copy of Bob's page
- ✅ Bob's original is unchanged
- ✅ Alice's version is independent
- ✅ This is federated wiki's core feature!

## 📊 Part 7: Test Feed Viewer Comprehensively (5 minutes)

### 7.1 Compare Feeds Across Wikis

**Goal:** Verify all wikis have identical plugin infrastructure

**Steps:**

1. **Alice's wiki:**
   - Click "🎵 Alice's Wiki (3001)"
   - Click "🔄 Fetch All Feeds"
   - Note the status of each feed

2. **Bob's wiki:**
   - Click "📚 Bob's Wiki (3002)"
   - Click "🔄 Fetch All Feeds"
   - Compare to Alice's results

3. **Carol's wiki:**
   - Click "📝 Carol's Wiki (3003)"
   - Click "🔄 Fetch All Feeds"
   - Compare to Alice and Bob

**Expected results:**
- ✅ All wikis return same feed structure
- ✅ All wikis have all 4 feeds available
- ✅ Status codes are consistent (all 200, or all 401, etc.)

### 7.2 Test Individual Feeds

**For each feed type:**

1. **Canimus (Music/RSS):**
   - Fetch on all 3 wikis
   - Verify RSS/XML format
   - Check for proper RSS structure (`<rss>`, `<channel>`, etc.)

2. **Canipub (Books/JSON):**
   - Fetch on all 3 wikis
   - Verify JSON format
   - Check for `{"books": [...]}` structure

3. **Caniblog (Blogs/JSON):**
   - Fetch on all 3 wikis
   - Verify JSON format
   - Check for `{"posts": [...]}` structure

4. **Canicook (Recipes/JSON):**
   - Fetch on all 3 wikis
   - Verify JSON format
   - Check for `{"recipes": [...]}` structure

### 7.3 Check Load Times

**In feed viewer after fetching:**

Look at the statistics for each feed:
- Load time should be < 500ms for local testing
- All feeds should load in roughly the same time
- Slow feeds might indicate issues

### 7.4 Test Error Handling

**Intentionally break something:**

```bash
# Stop one wiki
docker-compose stop wiki-alice

# Try to fetch from Alice in feed viewer
# Should see clear error message
```

**Then fix it:**
```bash
docker-compose start wiki-alice
# Wait 30 seconds for startup
# Retry fetching - should work now
```

## 🧪 Part 8: Run Automated Tests (2 minutes)

Verify everything works programmatically:

```bash
# Run the full test suite
npm run test:federation

# Expected: 20+ tests passing
# Tests verify:
# - All wikis are running
# - All plugins are available
# - All feeds respond correctly
# - Federation metadata is correct
```

**What to verify:**
- ✅ All tests pass
- ✅ No timeout errors
- ✅ No connection refused errors

## 🔍 Part 9: Test Advanced Features (Optional)

### 9.1 Test Allyabase Service Proxies

If you have other Planet Nine services running:

```bash
# Test proxy to Fount (if running on 3006)
curl http://localhost:3001/plugin/allyabase/fount/resolve

# Test proxy to BDO (if running on 3003)
curl http://localhost:3001/plugin/allyabase/bdo/health

# Test proxy to Sanora (if running on 7243)
curl http://localhost:3001/plugin/allyabase/sanora/health
```

### 9.2 Test Linkitylink Tapestries

If you want to test link tapestry creation:

```bash
# Create tapestry via API
curl -X POST http://localhost:3001/plugin/linkitylink/create \
  -H "Content-Type: application/json" \
  -d '{
    "links": [
      {"title": "Link 1", "url": "https://example.com/1"},
      {"title": "Link 2", "url": "https://example.com/2"}
    ]
  }'
```

### 9.3 Test with Real Content (Advanced)

**If you have actual media files:**

1. **Music testing:**
   - Upload .mp3 files to Sanora
   - Configure Mutopia to point to Sanora
   - Refresh Canimus feed
   - Should see tracks in RSS feed

2. **Books testing:**
   - Upload .epub or .pdf files
   - Configure Books plugin
   - Refresh Canipub feed
   - Should see books in JSON feed

3. **Blogs testing:**
   - Create blog posts in Sanora
   - Refresh Caniblog feed
   - Should see posts in JSON feed

4. **Recipes testing:**
   - Create recipes in Sanora
   - Refresh Canicook feed
   - Should see recipes in JSON feed

## ✅ Success Checklist

### Basic Federation (Required)
- [ ] All 3 wikis start successfully
- [ ] All 3 wikis are accessible in browser
- [ ] Each wiki shows "Welcome Visitors" page
- [ ] Feed viewer loads successfully

### Plugin Availability (Required)
- [ ] All 4 feeds respond on Alice's wiki
- [ ] All 4 feeds respond on Bob's wiki
- [ ] All 4 feeds respond on Carol's wiki
- [ ] Allyabase status endpoint works
- [ ] Linkitylink health endpoint works

### Feed Format (Required)
- [ ] Canimus returns RSS/XML format
- [ ] Canipub returns JSON format
- [ ] Caniblog returns JSON format
- [ ] Canicook returns JSON format

### Federation Features (Required)
- [ ] Sitemap endpoints work on all wikis
- [ ] Can view pages across wikis
- [ ] Can fork pages from other wikis
- [ ] Neighborhood configuration is correct

### Automated Tests (Required)
- [ ] `npm run test:federation` passes all tests
- [ ] No timeout errors
- [ ] No connection errors

### Advanced Features (Optional)
- [ ] Service proxies work (if services running)
- [ ] Link tapestries can be created
- [ ] Real content uploads work
- [ ] Cross-wiki search works

## 🐛 Troubleshooting Guide

### Wiki Won't Start
```bash
# Check logs
docker-compose logs wiki-alice

# Common issues:
# - Port already in use (kill other process)
# - Docker not running (start Docker Desktop)
# - Permission errors (check file permissions)
```

### Plugin Not Found (404)
```bash
# Verify plugin is linked
ls -la plugins/

# Should see symlinks:
# wiki-plugin-allyabase -> ../../../third-party/...
# wiki-plugin-linkitylink -> ../../../third-party/...
# etc.

# If missing, re-run setup:
./setup.sh
```

### Feed Returns 401 Unauthorized
**This is expected!** Most feeds require authentication. The test verifies:
- ✅ Plugin is loaded
- ✅ Endpoint exists
- ✅ Returns proper auth challenge

To test with auth, you'd need:
- Sessionless keypair
- Signed requests
- Proper headers

### Feed Returns 503 Service Unavailable
The plugin is loaded but backend service isn't running:
```bash
# Check if Sanora is running
curl http://localhost:7243/health

# If not, check docker-compose:
docker-compose ps
```

### Federation Not Working
```bash
# Check neighborhood configuration
cat config/alice.json
cat config/bob.json
cat config/carol.json

# Should all have neighbors listed

# Check wikis can reach each other
curl http://localhost:3001/system/sitemap.json
curl http://localhost:3002/system/sitemap.json
curl http://localhost:3003/system/sitemap.json
```

### Feed Viewer Shows CORS Errors
This is a browser security feature. For testing:
1. Open browser dev tools (F12)
2. Look at Network tab
3. Even with CORS error, you can see the response
4. Or run tests via command line (no CORS there)

## 📝 Testing Script

Here's a complete testing script you can run:

```bash
#!/bin/bash
# test-federation.sh - Complete federation test

echo "🚀 Starting federation..."
./start-federation.sh --setup

echo ""
echo "⏳ Waiting for wikis to be ready..."
sleep 5

echo ""
echo "🧪 Testing Alice's wiki feeds..."
curl -s http://localhost:3001/plugin/mutopia/feed > /dev/null && echo "✅ Canimus" || echo "❌ Canimus"
curl -s http://localhost:3001/plugin/books/library > /dev/null && echo "✅ Canipub" || echo "❌ Canipub"
curl -s http://localhost:3001/plugin/blogs/feed > /dev/null && echo "✅ Caniblog" || echo "❌ Caniblog"
curl -s http://localhost:3001/plugin/recipes/feed > /dev/null && echo "✅ Canicook" || echo "❌ Canicook"

echo ""
echo "🧪 Testing Bob's wiki feeds..."
curl -s http://localhost:3002/plugin/mutopia/feed > /dev/null && echo "✅ Canimus" || echo "❌ Canimus"
curl -s http://localhost:3002/plugin/books/library > /dev/null && echo "✅ Canipub" || echo "❌ Canipub"
curl -s http://localhost:3002/plugin/blogs/feed > /dev/null && echo "✅ Caniblog" || echo "❌ Caniblog"
curl -s http://localhost:3002/plugin/recipes/feed > /dev/null && echo "✅ Canicook" || echo "❌ Canicook"

echo ""
echo "🧪 Testing Carol's wiki feeds..."
curl -s http://localhost:3003/plugin/mutopia/feed > /dev/null && echo "✅ Canimus" || echo "❌ Canimus"
curl -s http://localhost:3003/plugin/books/library > /dev/null && echo "✅ Canipub" || echo "❌ Canipub"
curl -s http://localhost:3003/plugin/blogs/feed > /dev/null && echo "✅ Caniblog" || echo "❌ Caniblog"
curl -s http://localhost:3003/plugin/recipes/feed > /dev/null && echo "✅ Canicook" || echo "❌ Canicook"

echo ""
echo "🔗 Testing federation endpoints..."
curl -s http://localhost:3001/system/sitemap.json > /dev/null && echo "✅ Alice sitemap" || echo "❌ Alice sitemap"
curl -s http://localhost:3002/system/sitemap.json > /dev/null && echo "✅ Bob sitemap" || echo "❌ Bob sitemap"
curl -s http://localhost:3003/system/sitemap.json > /dev/null && echo "✅ Carol sitemap" || echo "❌ Carol sitemap"

echo ""
echo "✨ Test complete!"
echo ""
echo "🌐 Open feed viewer: open feed-viewer.html"
echo "🧪 Run full tests: npm run test:federation"
```

Save as `test-federation.sh`, make executable, and run:
```bash
chmod +x test-federation.sh
./test-federation.sh
```

## 🎓 What You've Learned

After completing this walkthrough, you've verified:

1. **Multi-node deployment** - 3 independent wikis running
2. **Plugin infrastructure** - 6 plugins on each wiki
3. **Feed formats** - RSS for music, JSON for books/blogs/recipes
4. **Federation** - Wikis can share and fork content
5. **Service proxies** - Allyabase routes to microservices
6. **Link tapestries** - Linkitylink creates visual link collections
7. **Testing tools** - Feed viewer for visual verification
8. **Automated tests** - Mocha/Chai test suite

## 📚 Next Steps

After mastering the basics:

1. **Add real content** - Upload actual music/books/blogs/recipes
2. **Test with Planet Nine services** - Connect to full service stack
3. **Scale up** - Add more wiki nodes
4. **Custom plugins** - Create your own wiki plugins
5. **Production deploy** - Use real domains and HTTPS

---

**Part of The Advancement** - Federated wiki testing guide 💚

**Quick Start:** `./start-federation.sh --setup && open feed-viewer.html` 🚀
