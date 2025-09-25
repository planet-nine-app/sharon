# Sharon - Launch Status Check

This is the **single command** to clone, build, and test the entire Planet Nine ecosystem.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Git](https://git-scm.com/downloads) installed
- [docker-compose](https://docs.docker.com/compose/install/) installed

## Launch Status Check

```bash
./launch-status-check.sh
```

Or via npm:
```bash
npm run launch
```

That's it! This command will:

1. ✅ **Clone allyabase** repository (if not present)
2. ✅ **Build Docker containers** for all services
3. ✅ **Start nginx proxy** with path-based routing
4. ✅ **Verify all services** are accessible
5. ✅ **Run complete test suite** and report results

## What It Does

### Environment Setup
- **Allyabase**: All Planet Nine services in one container (production-like)
- **Nginx Proxy**: Routes requests to services via paths (`/fount/`, `/bdo/`, etc.)
- **Sharon**: Test runner with access to all services

### Service Endpoints
Once running, all services are available at:
- **Main Proxy**: http://localhost:8080
- **Fount (MAGIC)**: http://localhost:8080/fount/
- **Julia (P2P)**: http://localhost:8080/julia/
- **BDO (Storage)**: http://localhost:8080/bdo/
- **Sanora (Products)**: http://localhost:8080/sanora/
- **Dolores (Social)**: http://localhost:8080/dolores/
- **Addie (Payments)**: http://localhost:8080/addie/

### Test Results
The script runs the complete Sharon test suite and reports:
- ✅ **Passed tests** - Working correctly
- ❌ **Failed tests** - Need attention (expected during development)
- 📊 **Summary** - Total results and timing

## Manual Commands

If you need to run things manually:

```bash
# Start environment (without running tests)
docker-compose up --build -d

# Verify services are working
docker-compose exec sharon node verify-environment.js

# Run tests
docker-compose exec sharon node run-all-tests.js

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## Troubleshooting

If something goes wrong:

1. **Check Docker is running**: `docker --version`
2. **Clean up**: `docker-compose down -v --remove-orphans`
3. **Try again**: `./setup-and-test.sh`
4. **View logs**: `docker-compose logs`

## Expected Results

✅ **Success**: Environment starts, most services respond, some tests may fail (normal during development)

❌ **Failure**: If Docker/networking issues prevent services from starting

The goal is to verify the **test environment works**, not that all tests pass (yet).

---

**Named in honor of Christa McAuliffe** - ensuring our mission to space proceeds safely 🚀