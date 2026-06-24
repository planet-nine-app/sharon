# Federated Wiki - Multi-Node Federation Tests

Comprehensive integration tests for federated wiki with all Planet Nine plugins running across multiple nodes.

## Overview

This test suite deploys **3 independent wiki nodes** (Alice, Bob, Carol) with all **6 plugins** installed, configured as a federated neighborhood. Tests verify:

- ✅ Multi-node deployment
- ✅ Plugin availability across nodes
- ✅ Neighborhood discovery
- ✅ Cross-wiki content access
- ✅ Federated search
- ✅ Plugin content federation
- ✅ Shared backend services

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Alice's Wiki  │────▶│   Bob's Wiki    │────▶│  Carol's Wiki   │
│   Port: 3001    │◀────│   Port: 3002    │◀────│   Port: 3003    │
│                 │     │                 │     │                 │
│  🌐 Allyabase   │     │  🌐 Allyabase   │     │  🌐 Allyabase   │
│  🎵 Mutopia     │     │  📚 Books       │     │  📝 Blogs       │
│  📚 Books       │     │  🎵 Mutopia     │     │  🍳 Recipes     │
│  📝 Blogs       │     │  📝 Blogs       │     │  📚 Books       │
│  🍳 Recipes     │     │  🍳 Recipes     │     │  🎵 Mutopia     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                        ┌────────▼────────┐
                        │  Shared Sanora  │
                        │  Port: 7243     │
                        │  (Content Store)│
                        │                 │
                        │  + 13 other     │
                        │  microservices  │
                        │  (via allyabase)│
                        └─────────────────┘
```

## 🔐 CRITICAL: Admin Access Setup

**Before you start, understand this:** Farm mode wikis create separate sites based on the hostname you use. For admin access to work, you MUST:

1. **Configure your hosts file:**
   ```bash
   ./configure-hosts.sh
   ```

2. **Access via proper hostnames:**
   - ✅ `http://alice.localhost:3001` (CORRECT - has admin secret)
   - ❌ `http://localhost:3001` (WRONG - creates different unclaimed site)

3. **Login with admin secret:**
   - Click the 🔒 padlock in footer
   - Enter reclaim code: `planetnine-admin-secret-2024`
   - Padlock changes to 🔓 = you have admin privileges

**Why this matters:** If you access via `localhost:3001`, farm mode creates a NEW site called "localhost" that does NOT have the admin secret. You'll get 403 Forbidden when using plugmatic or other admin features.

See [ADMIN-LOGIN.md](./ADMIN-LOGIN.md) for complete details.

## Quick Start

### Option 1: One Command Start (Easiest!)

```bash
# First time setup
./configure-hosts.sh  # Add alice.localhost etc to /etc/hosts
./start-federation.sh --setup

# Access the wikis
open http://alice.localhost:3001
open http://bob.localhost:3002
open http://carol.localhost:3003
```

**Admin Secret:** `planetnine-admin-secret-2024`

### Option 2: Start and Test

```bash
./start-federation.sh --test
```

### Option 3: Manual Steps

```bash
# 1. Setup environment
./setup.sh

# 2. Start federation
docker-compose up -d

# 3. Access wikis
open http://localhost:3001  # Alice
open http://localhost:3002  # Bob
open http://localhost:3003  # Carol

# 4. Stop when done
./stop-federation.sh
```

See [SCRIPTS-GUIDE.md](./SCRIPTS-GUIDE.md) for all script options and workflows.

## Testing Guide

### Complete Walkthrough

For a comprehensive step-by-step testing guide, see **[TESTING-WALKTHROUGH.md](./TESTING-WALKTHROUGH.md)**

This guide covers:
- ✅ Starting the federation (1 command)
- ✅ Testing each of the 6 plugins on all 3 wikis
- ✅ Using the feed viewer to verify all feeds
- ✅ Testing federation features (cross-wiki access)
- ✅ Running automated tests
- ✅ Troubleshooting common issues

### Quick Feed Test

Test all feeds on all wikis with one command:

```bash
./test-all-feeds.sh
```

This verifies:
- All 3 wikis are running
- All 6 plugins respond on each wiki
- All 4 Cani* feeds work (Canimus, Canipub, Caniblog, Canicook)
- Federation endpoints are available

## Test Suite

### 1. Environment Setup ✅
- Starts Docker Compose
- Waits for all services to be healthy
- Verifies container startup

### 2. Wiki Node Availability ✅
- Alice's wiki (port 3001)
- Bob's wiki (port 3002)
- Carol's wiki (port 3003)

### 3. Plugin Availability ✅
- **Allyabase** on all nodes (service proxies + federation)
- **Linkitylink** on all nodes (link tapestries)
- Mutopia on all nodes
- Books on all nodes
- Blogs on all nodes
- Recipes on all nodes

### 4. Neighborhood Discovery ✅
- Sitemap.json endpoints
- Neighbor configuration
- Welcome-visitors pages
- Auto-seeding functionality

### 5. Cross-Wiki Content Discovery ✅
- Access content across wikis
- Search federation
- Page discovery
- Slug resolution

### 6. Plugin Content Federation ✅
- Music (Mutopia) - Canimus feeds
- Books - Canipub feeds
- Blogs - Caniblog feeds
- Recipes - Canicook feeds

### 7. Allyabase Service Proxies ✅
- Proxy routes to 14 Planet Nine services
- Federation endpoints (emoji shortcodes)
- Service availability checks

### 8. Shared Sanora Backend ✅
- Sanora health check
- Cross-wiki content storage
- Product synchronization

### 9. Federation Metadata ✅
- Sitemap availability
- Neighborhood lists
- Federation status

## Configuration

### Wiki Configurations

Each wiki has its own config file in `config/`:

**alice.json:**
```json
{
  "farm": true,
  "autoseed": true,
  "id": "alice.localhost",
  "neighbors": ["bob.localhost", "carol.localhost"]
}
```

### Wiki Ownership

Each wiki has an owner.json file in `data/{wiki}/status/owner.json`:

**owner.json:**
```json
{
  "name": "planetnineisaspaceship",
  "sessionlessKeys": {
    "pubKey": "03493f885965c30f36788427eb0376c12ae8fc19118a872c9a06cec9d1dea504db"
  },
  "pubKey": "03493f885965c30f36788427eb0376c12ae8fc19118a872c9a06cec9d1dea504db"
}
```

This enables:
- Sessionless authentication for all wikis
- Shared ownership across the federation
- Plugin authentication with sessionless keys

### Environment Variables

```bash
# Wiki URLs (defaults shown)
WIKI_ALICE_URL=http://localhost:3001
WIKI_BOB_URL=http://localhost:3002
WIKI_CAROL_URL=http://localhost:3003

# Backend service
SANORA_URL=http://localhost:7243
```

### Docker Compose Services

```yaml
services:
  wiki-alice:    # Port 3001, custom image with all plugins + sessionless security
  wiki-bob:      # Port 3002, custom image with all plugins + sessionless security
  wiki-carol:    # Port 3003, custom image with all plugins + sessionless security
  sanora:        # Port 7243, shared backend
```

**Custom Docker Image:**
All wikis use a custom-built image (`wiki-federation:latest`) that includes:
- Base: `dobbs/farm:latest`
- Security: `wiki-security-sessionless` npm module
- Plugins: All 6 wiki plugins (allyabase, linkitylink, mutopia, books, blogs, recipes)

The image is built from `Dockerfile.wiki` on first start.

## Federation Features

### Auto-Seeding

Each wiki automatically discovers neighbors when they visit each other:
- `--autoseed` flag enabled
- Neighborhood populates automatically
- Sitemap.json updated dynamically

### Manual Neighbors

Pre-configured neighbors in config files:
- Alice knows about Bob and Carol
- Bob knows about Alice and Carol
- Carol knows about Alice and Bob

### Security

All wikis use "friends" security mode:
- Read access: public
- Write access: owner + friends
- Admin: configured email

## Plugin Features Per Node

### Alice's Wiki (Primary Music Host)
- 🎵 **Mutopia** - Music distribution
- 📚 Books reader
- 📝 Blog viewer
- 🍳 Recipe browser

### Bob's Wiki (Primary Books Host)
- 📚 **Books** - Ebook publishing
- 🎵 Music player
- 📝 Blog viewer
- 🍳 Recipe browser

### Carol's Wiki (Primary Blog/Recipe Host)
- 📝 **Blogs** - Blog publishing
- 🍳 **Recipes** - Recipe sharing
- 📚 Book reader
- 🎵 Music player

## Testing Scenarios

### Basic Federation
1. Start all three wikis
2. Each discovers the others via autoseed
3. Verify neighborhood lists
4. Access content across nodes

### Content Federation
1. Alice uploads music via Mutopia
2. Bob discovers Alice's music feed
3. Bob can play Alice's music
4. Carol can see all content

### Cross-Plugin Discovery
1. Bob publishes a book
2. Carol publishes a recipe
3. Alice can browse both
4. All content is searchable

### Neighborhood Search
1. Create pages on all wikis
2. Search from any node
3. Results show federated content
4. Click-through works

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Restart clean
docker-compose down -v
docker-compose up -d
```

### Plugins Not Loading

```bash
# Verify plugin symlinks
ls -la plugins/

# Reinstall dependencies
./setup.sh
```

### Can't Access Wikis

```bash
# Check port conflicts
lsof -i :3001
lsof -i :3002
lsof -i :3003

# Verify containers running
docker ps
```

### Federation Not Working

```bash
# Check sitemap endpoints
curl http://localhost:3001/system/sitemap.json
curl http://localhost:3002/system/sitemap.json
curl http://localhost:3003/system/sitemap.json

# Verify neighbors
cat config/alice.json | grep neighbors
```

## Feed Viewer Tool

### Visual Feed Testing

A web-based tool to test and visualize all four Cani* feeds:

```bash
# Start federation
./start-federation.sh

# Open feed viewer
open feed-viewer.html
```

**Features:**
- 🌐 Switch between Alice, Bob, and Carol's wikis
- 🔄 Fetch all four feeds (Canimus, Canipub, Caniblog, Canicook)
- 📊 See feed statistics (items, load time, format)
- 🎨 Syntax-highlighted JSON/XML output
- ✅ Visual status indicators

**See [FEED-VIEWER.md](./FEED-VIEWER.md) for complete documentation.**

## Advanced Usage

### Custom Number of Nodes

Edit `docker-compose.yml` to add more wikis:

```yaml
wiki-dave:
  # Copy wiki-alice configuration
  # Change ports and config
```

### Different Plugin Sets

Edit Dockerfile.wiki to install only specific plugins.

### Production Deployment

For production, change:
- Use real domain names (not localhost)
- Enable HTTPS
- Use proper secrets
- Configure persistent volumes
- Set up backups

## CI/CD Integration

```yaml
# .github/workflows/federation-tests.yml
name: Federation Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd sharon/tests/wiki-federation && ./setup.sh
      - run: npm run test:federation
```

## Performance

Typical startup times:
- Container startup: ~30 seconds
- Service health checks: ~10 seconds
- Plugin initialization: ~5 seconds
- **Total ready time: ~45 seconds**

## Cleanup

```bash
# Stop containers
docker-compose down

# Remove volumes (deletes all wiki data)
docker-compose down -v

# Clean up data directories
rm -rf data/

# Remove plugin links
rm -rf plugins/
```

## Future Enhancements

- [ ] Add more test scenarios (page forking, citations)
- [ ] Test with actual content uploads
- [ ] Performance benchmarks
- [ ] Stress testing (100+ nodes)
- [ ] Security testing (auth, permissions)
- [ ] Plugin compatibility matrix
- [ ] Federation protocol validation
- [ ] Network partition testing
- [ ] Automatic federation health monitoring

## Related Documentation

- [Wiki Plugin Tests](../WIKI-PLUGINS-TESTING.md)
- [Sharon Test Suite](../../CLAUDE.md)
- [Federated Wiki Docs](../../../third-party/wiki/README.md)
- [Plugin Architecture](../../../third-party/wiki-plugin-mutopia/CLAUDE.md)

---

**Part of The Advancement** - Rebuilding platforms for communities 💚

**Federation Status:** ✅ Multi-node federation tested and verified
