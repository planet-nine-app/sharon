# Sharon

Sharon, named for Sharon Christa McAuliffe, the woman selected for NASA's Teacher in Space program who tragically lost her life in the Challenger explosion, administers the tests for The Advancement.

The goal is to have a single command that can be run against a deployed allyabase node using the client sdks in whichever language you are working in, to verify that the contracts between server and client are working as expected.

## Overview

Now that all of the miniservices are running, and we're able to make multi-service calls, there's a need for a more comprehensive integration test that takes us out of the individual repos. That's the goal here.

By centralizing the test-harness and testing boilerplate, we can maintain consistency and not have to update small changes in 10+ different repos.

## Quick Start

### Local Testing (Direct Service Access)
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test categories
npm run test:services     # All microservice tests
npm run test:protocols    # Core protocol tests
npm run test:system       # Cross-service integration tests
npm run test:permissions  # Permissions & gating system tests

# Run individual service tests
npm run test:fount
npm run test:bdo
npm run test:julia
```

### Docker Environment Testing (Production-like with Nginx Routing)
```bash
# Start the full test environment (Docker-in-Docker with nginx)
npm run env:start

# Run tests against dockerized environment
npm run env:test                # Default output
npm run env:test:verbose        # Detailed output
npm run env:test:quiet          # Minimal output

# View logs
npm run env:logs

# Stop environment
npm run env:stop

# Clean up containers and volumes
npm run env:clean
```

## Directory Structure

The `tests/` directory is organized by test categories:

### **Miniservice Tests**
- `addie/` - Payment processing service tests
- `bdo/` - Big Dumb Object storage tests
- `fount/` - MAGIC protocol & nineum management tests
- `julia/` - P2P messaging & key coordination tests
- `sanora/` - Product hosting & marketplace tests
- `dolores/` - Social feeds & media tests
- `covenant/` - Multi-party contract tests
- Plus: `aretha/`, `pref/`, `continuebee/`, `joan/`

### **Protocol Tests**
- `sessionless/` - Passwordless authentication tests
- `magic/` - Multi-device consensus protocol tests
- `teleportation/` - Content discovery & verification tests

### **System Tests**
- `permissions/` - Nineum permission system & MAGIC gating tests
- `cross-service/` - Multi-service interaction tests
- `client-server/` - End-to-end client application tests

## Test Categories

Each category follows this structure:
```
category-name/
├── package.json          # Test dependencies
├── README.md             # Category-specific documentation
├── test-runner.js        # Main test runner (optional)
├── client/              # Client SDK tests
├── server/              # Server endpoint tests
└── integration/         # Cross-service integration tests
```

## Migration

To migrate existing tests from individual service directories:

```bash
# Run the migration script
./migrate-tests.sh
```

This will copy tests from `service/test/mocha/` to `sharon/tests/service/` and update them for the new structure.

## Docker Test Environment

Sharon includes a production-like Docker environment that mirrors the actual deployment architecture:

### Architecture
- **Docker-in-Docker**: Allyabase runs in a container within the test environment
- **Nginx Proxy**: Routes requests using path-based URLs (e.g., `/fount/`, `/bdo/`)
- **Service Discovery**: Available at `http://localhost:8080/services`
- **Health Monitoring**: Available at `http://localhost:8080/health`

### Service Endpoints
When using the Docker environment, all services are accessible through nginx routing:
- **Fount**: `http://localhost:8080/fount/` (MAGIC & Nineum)
- **Julia**: `http://localhost:8080/julia/` (P2P Messaging)
- **BDO**: `http://localhost:8080/bdo/` (Object Storage)
- **Sanora**: `http://localhost:8080/sanora/` (Product Hosting)
- **Dolores**: `http://localhost:8080/dolores/` (Social Media)
- **Addie**: `http://localhost:8080/addie/` (Payments)

### Configuration
Tests automatically adapt based on environment:
- **Local**: Direct port access (e.g., `localhost:3002`)
- **Docker**: Nginx routing (e.g., `localhost:8080/fount/`)

Configuration is managed in `config/test-config.js`.

## Test Runners

- `run-all-tests.js` - Master test runner (runs everything)
- `run-service-tests.js` - Runs all microservice tests
- `run-protocol-tests.js` - Runs all protocol tests
- `run-system-tests.js` - Runs all system integration tests
- `test-environment.sh` - Docker environment setup script
- `start-test-environment.sh` - Environment startup wrapper

## Example: Permissions Tests

Our MAGIC gating system tests are located in `tests/permissions/` and verify:

- ✅ MP (Magic Power) consumption for spells
- ✅ Nineum permission checking (galaxy/system/flavor)
- ✅ Complete spell flow: Client → Julia → Fount → Target Service
- ✅ Creation operation gating (BDO, Product, Post, Video)

## Benefits

- **Centralized Testing** - One place for all integration tests
- **Consistent Structure** - Standardized test organization
- **Easy CI/CD** - Single command runs entire test suite
- **Cross-Service Validation** - Tests that span multiple services
- **Rapid Development** - Quickly verify ecosystem contracts

Named in honor of Christa McAuliffe, Sharon ensures our mission to space proceeds safely. 🚀
