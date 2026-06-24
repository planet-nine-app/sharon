# Federation Tests - Quick Start Guide

Get up and running with federated wiki testing in 3 steps!

## 🚀 Quick Start (1 Command!)

```bash
# Option 1: Just start the federation (no tests)
./start-federation.sh

# Option 2: Start and test
./start-federation.sh --test

# Option 3: Use npm (from sharon directory)
npm run federation:start
```

That's it! 🎉

### Alternative: Manual Steps

```bash
# 1. Setup environment
npm run test:federation:setup

# 2. Start federation
npm run test:federation:up

# 3. Run tests
npm run test:federation
```

## 📊 What You Get

3 independent wiki nodes, fully federated:

| Node | URL | Primary Focus | Port |
|------|-----|--------------|------|
| **Alice** | http://localhost:3001 | 🎵 Music (Mutopia) | 3001 |
| **Bob** | http://localhost:3002 | 📚 Books | 3002 |
| **Carol** | http://localhost:3003 | 📝 Blogs & 🍳 Recipes | 3003 |

All nodes have **all 6 plugins** installed:
- 🌐 **Allyabase** (service proxies + federation)
- 🔗 **Linkitylink** (link tapestries + linktree import)
- 🎵 Mutopia (music)
- 📚 Books (ebooks)
- 📝 Blogs (posts)
- 🍳 Recipes (cooking)

## 🎯 Test Results

```
Federated Wiki - Multi-Node Federation Tests
  ✓ 1. Environment Setup
  ✓ 2. Wiki Node Availability (3 nodes)
  ✓ 3. Plugin Availability (4 plugins × 3 nodes)
  ✓ 4. Neighborhood Discovery
  ✓ 5. Cross-Wiki Content Discovery
  ✓ 6. Plugin Content Federation
  ✓ 7. Shared Sanora Backend
  ✓ 8. Federation Metadata

  20+ tests passing
```

## 🛠️ Useful Commands

### Using Scripts (Easiest)

```bash
# Start
./start-federation.sh

# Stop (preserves data)
./stop-federation.sh

# Stop and clean (removes all data)
./stop-federation.sh --clean

# Restart
./restart-federation.sh

# View logs
./start-federation.sh --logs
```

### Using NPM (from sharon/)

```bash
# Start
npm run federation:start

# Stop
npm run federation:stop

# Clean
npm run federation:clean

# Restart
npm run federation:restart

# View logs
npm run test:federation:logs
```

### Using Docker Compose Directly

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart
docker-compose restart
```

## 🌐 Access the Wikis

Once started, visit in your browser:

- **Alice's Wiki**: http://localhost:3001
- **Bob's Wiki**: http://localhost:3002
- **Carol's Wiki**: http://localhost:3003

Each wiki can discover and access content from the others!

## 📦 What Gets Installed

### Per Wiki Node:
- Federated Wiki (custom image based on dobbs/farm)
- **wiki-security-sessionless** - Sessionless authentication module
- **6 plugins** (allyabase, linkitylink, mutopia, books, blogs, recipes)
- Auto-seeding for neighborhood discovery
- Friends security mode with sessionless auth
- Service proxy routes (via allyabase)
- Link tapestry service (via linkitylink)

**Note:** First run will build the Docker image (~2-3 minutes). Subsequent runs are faster.

### Shared:
- Sanora backend (port 7243)
- Docker network for inter-wiki communication

## 🔍 Verify It's Working

### 1. Check all wikis are up:
```bash
curl http://localhost:3001  # Alice
curl http://localhost:3002  # Bob
curl http://localhost:3003  # Carol
```

### 2. Check plugins loaded:
```bash
curl http://localhost:3001/plugin/mutopia/library
curl http://localhost:3002/plugin/books/library
curl http://localhost:3003/plugin/blogs/feed
```

### 3. Check neighborhood discovery:
```bash
curl http://localhost:3001/system/sitemap.json
curl http://localhost:3002/system/sitemap.json
curl http://localhost:3003/system/sitemap.json
```

## 🎓 What the Tests Verify

✅ **Multi-node deployment** - 3 independent wikis running
✅ **Plugin availability** - All 6 plugins on all nodes
✅ **Allyabase integration** - Service proxies + federation features
✅ **Linkitylink integration** - Link tapestries + linktree import
✅ **Neighborhood discovery** - Wikis can find each other
✅ **Cross-wiki access** - Content discoverable across nodes
✅ **Federated search** - Search works across all wikis
✅ **Content federation** - Music, books, blogs, recipes all federated
✅ **Shared backend** - Sanora + 13 other services via allyabase

## 💡 Pro Tips

**Tip 1:** Keep containers running between test runs for faster iteration:
```bash
npm run test:federation:up    # Start once
npm run test:federation       # Run tests many times
npm run test:federation:down  # Stop when done
```

**Tip 2:** Watch logs in another terminal:
```bash
npm run test:federation:logs
```

**Tip 3:** Test federation manually by:
1. Create a page on Alice's wiki
2. Visit Bob's wiki
3. Search for Alice's content
4. Click through to view it

## 🐛 Troubleshooting

**Containers won't start?**
```bash
# Check for port conflicts
lsof -i :3001-3003

# Clean and restart
npm run test:federation:clean
npm run test:federation:setup
npm run test:federation:up
```

**Tests timing out?**
- First run takes longer (pulling Docker images)
- Subsequent runs are faster (~1 minute)
- Increase timeout in test file if needed

**Federation not working?**
- Check that all wikis are healthy
- Verify sitemap.json endpoints
- Check docker-compose logs

## 📚 Next Steps

After getting federation working:

1. **Test feeds visually** - Open `feed-viewer.html` to see all four Cani* feeds
2. **Create content** - Upload music, books, blog posts
3. **Test discovery** - Search across wikis
4. **Test references** - Link pages across wikis
5. **Test plugins** - Verify all plugin features work
6. **Scale up** - Add more nodes to docker-compose.yml

### 🎨 Visual Feed Testing

```bash
open feed-viewer.html
```

Test all four Cani* feeds across all wikis with a visual interface:
- 🎵 Canimus (Music/RSS)
- 📚 Canipub (Books/JSON)
- 📝 Caniblog (Blogs/JSON)
- 🍳 Canicook (Recipes/JSON)

See [FEED-VIEWER.md](./FEED-VIEWER.md) for details.

## 📖 Documentation

- **[TESTING-WALKTHROUGH.md](./TESTING-WALKTHROUGH.md)** - Complete step-by-step testing guide
- **[FEED-VIEWER.md](./FEED-VIEWER.md)** - Feed viewer tool documentation
- **[SCRIPTS-GUIDE.md](./SCRIPTS-GUIDE.md)** - All script options and workflows
- **[README.md](./README.md)** - Complete technical documentation

## 🧪 Testing Commands

```bash
# Quick feed test (all plugins, all wikis)
./test-all-feeds.sh

# Visual feed viewer
open feed-viewer.html

# Automated test suite
npm run test:federation
```

---

**Ready to test federation? Follow the [TESTING-WALKTHROUGH.md](./TESTING-WALKTHROUGH.md)!** 🚀
