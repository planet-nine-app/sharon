# Federation Scripts Guide

Quick reference for all federation management scripts.

## 🚀 Start Federation

### Quick Start (Recommended)

```bash
./start-federation.sh
```

Starts 3 wikis with all 6 plugins. That's it!

### Options

```bash
# Clean start (removes old data)
./start-federation.sh --clean --setup

# Rebuild Docker images
./start-federation.sh --build

# Start and run tests
./start-federation.sh --test

# Start and follow logs
./start-federation.sh --logs

# All options combined
./start-federation.sh --clean --setup --build --test
```

### What It Does

1. ✅ Runs setup if needed (creates directories, links plugins)
2. ✅ Starts 3 Docker containers (Alice, Bob, Carol)
3. ✅ Waits for all wikis to be healthy (~30-60 seconds)
4. ✅ Shows access URLs and useful commands
5. ✅ Optionally runs tests or follows logs

### Example Output

```
========================================
🌐 Federated Wiki - 3 Node Setup
========================================

🚀 Starting federated wiki containers...
⏳ Waiting for wikis to be healthy...

✅ Alice's wiki is ready (port 3001)
✅ Bob's wiki is ready (port 3002)
✅ Carol's wiki is ready (port 3003)

========================================
✨ Federation is ready!
========================================

📍 Access your wikis:

  Alice's Wiki:  http://localhost:3001
  Bob's Wiki:    http://localhost:3002
  Carol's Wiki:  http://localhost:3003

🔌 Plugins installed (6 per wiki):

  🌐 Allyabase    - Service proxies + federation
  🔗 Linkitylink  - Link tapestries + linktree import
  🎵 Mutopia      - Music distribution
  📚 Books        - Ebook publishing
  📝 Blogs        - Blog posts
  🍳 Recipes      - Recipe sharing

🎉 Federation is running!
```

## 🛑 Stop Federation

### Basic Stop (Preserves Data)

```bash
./stop-federation.sh
```

Stops containers but keeps all wiki data in `data/` directory.

### Clean Stop (Removes Everything)

```bash
./stop-federation.sh --clean
```

Stops containers AND deletes all data. Use this for a fresh start.

### What It Does

**Basic:**
- Stops all containers
- Preserves data in `data/` directory
- Can restart later without losing content

**Clean:**
- Stops all containers
- Removes volumes
- Deletes `data/` and `plugins/` directories
- Next start will be completely fresh

## 🔄 Restart Federation

### Quick Restart

```bash
./restart-federation.sh
```

Restarts all containers without losing data. Useful after making changes.

## 📦 Setup Only

### Run Setup Without Starting

```bash
./setup.sh
```

Creates directories and symlinks plugins without starting containers.

## 📋 All Scripts Reference

| Script | Purpose | Data Preserved? |
|--------|---------|-----------------|
| `start-federation.sh` | Start 3 wikis | Yes (creates if needed) |
| `stop-federation.sh` | Stop wikis | Yes |
| `stop-federation.sh --clean` | Stop and clean | No (deletes all) |
| `restart-federation.sh` | Restart wikis | Yes |
| `setup.sh` | Prepare environment | N/A (setup only) |

## 🎯 Common Workflows

### First Time Setup

```bash
# 1. Start federation (includes setup)
./start-federation.sh --setup

# 2. Visit wikis in browser
open http://localhost:3001
open http://localhost:3002
open http://localhost:3003

# 3. Explore and create content

# 4. Stop when done
./stop-federation.sh
```

### Development Workflow

```bash
# Start
./start-federation.sh

# Make changes to plugins...

# Restart to see changes
./restart-federation.sh

# Or rebuild if needed
./stop-federation.sh
./start-federation.sh --build

# Stop when done
./stop-federation.sh
```

### Testing Workflow

```bash
# Clean start with tests
./start-federation.sh --clean --setup --test

# Or separate steps
./start-federation.sh --clean --setup
npm run test:federation

# Clean up
./stop-federation.sh --clean
```

### Demo Workflow

```bash
# Start and show logs
./start-federation.sh --logs

# (Logs will stream - Ctrl+C to exit)

# Federation keeps running
# Visit http://localhost:3001

# Stop later
./stop-federation.sh
```

## 🛠️ NPM Scripts

You can also use npm scripts from the sharon directory:

```bash
cd sharon

# Start federation
npm run federation:start

# Stop federation
npm run federation:stop

# Restart federation
npm run federation:restart

# Clean stop
npm run federation:clean

# Run tests
npm run test:federation
```

## 🐛 Troubleshooting

### Containers won't start

```bash
# Clean everything and rebuild
./stop-federation.sh --clean
./start-federation.sh --clean --setup --build
```

### Plugins not loading

```bash
# Re-run setup
./setup.sh

# Check symlinks
ls -la plugins/

# Restart
./restart-federation.sh
```

### Port conflicts

```bash
# Check what's using the ports
lsof -i :3001
lsof -i :3002
lsof -i :3003

# Stop any conflicts
# Then try again
./start-federation.sh
```

### Want to see what's happening

```bash
# Start with logs
./start-federation.sh --logs

# Or view logs separately
docker-compose logs -f

# Or view specific wiki
docker-compose logs -f wiki-alice
```

## 💡 Pro Tips

**Tip 1:** Keep federation running between work sessions
```bash
./start-federation.sh      # Start once
# Work, close terminal, etc.
# Wikis keep running!
./stop-federation.sh       # Stop when done
```

**Tip 2:** Quick test after changes
```bash
./restart-federation.sh && npm run test:federation
```

**Tip 3:** Monitor logs while testing
```bash
# Terminal 1
./start-federation.sh --logs

# Terminal 2
npm run test:federation
```

**Tip 4:** Fresh start every time
```bash
alias wiki-fresh='./stop-federation.sh --clean && ./start-federation.sh --clean --setup'
wiki-fresh
```

## 📊 Script Options Matrix

| Script | --clean | --setup | --build | --test | --logs |
|--------|---------|---------|---------|--------|--------|
| start-federation.sh | ✅ | ✅ | ✅ | ✅ | ✅ |
| stop-federation.sh | ✅ | - | - | - | - |
| restart-federation.sh | - | - | - | - | - |
| setup.sh | - | - | - | - | - |

## 🎓 What Each Script Does Internally

### start-federation.sh

1. Parse command-line arguments
2. Clean up if `--clean`
3. Run setup if `--setup` or data missing
4. Build images if `--build`
5. Start docker-compose
6. Wait for health checks (max 60 seconds)
7. Show success message with URLs
8. Run tests if `--test`
9. Follow logs if `--logs`

### stop-federation.sh

1. Parse command-line arguments
2. If `--clean`: Remove volumes + delete data/
3. If not: Just stop containers (data preserved)
4. Show status

### restart-federation.sh

1. Run `docker-compose restart`
2. Show success message

### setup.sh

1. Create data directories (alice, bob, carol)
2. Create plugins directory
3. Symlink plugin directories
4. Install plugin dependencies
5. Create .gitignore

## 🔗 Related

- **README.md** - Full federation documentation
- **QUICKSTART.md** - Quick start guide
- **docker-compose.yml** - Container definitions

---

**Part of The Advancement** - Rebuilding platforms for communities 💚

**Quick Start:** Just run `./start-federation.sh` and go! 🚀
