# Sharon - Planet Nine Integration Test Harness

## Overview

Sharon is the comprehensive integration test harness for the Planet Nine ecosystem. It provides centralized testing infrastructure for all microservices, protocols, and system-level integration tests.

**Location**: `/sharon/`

## Core Features

### 🧪 **Centralized Testing**
- **Service Tests**: Individual microservice test suites
- **Protocol Tests**: MAGIC protocol, sessionless auth, teleportation
- **Integration Tests**: Cross-service workflows
- **MAGIC Spell Tests**: Comprehensive spell testing for all services

### 🔄 **Test Orchestration**
- **Unified Test Runner**: Single command to run all tests
- **Service-Specific Runners**: Individual service test execution
- **Protocol Validators**: Protocol compliance testing
- **Docker Support**: Containerized test environments

## Test Structure

```
sharon/
├── tests/
│   ├── fount/          # Fount service tests + MAGIC spells
│   ├── bdo/            # BDO service tests + MAGIC spells
│   ├── covenant/       # Covenant service tests + MAGIC spells
│   ├── prof/           # Prof service tests + MAGIC spells
│   ├── addie/          # Addie service tests + MAGIC spells
│   ├── julia/          # Julia service tests + MAGIC spells
│   ├── sanora/         # Sanora service tests + MAGIC spells
│   ├── dolores/        # Dolores service tests + MAGIC spells
│   ├── joan/           # Joan service tests + MAGIC spells
│   ├── pref/           # Pref service tests + MAGIC spells
│   ├── aretha/         # Aretha service tests + MAGIC spells
│   ├── continuebee/    # Continuebee service tests + MAGIC spells
│   ├── magic/          # MAGIC protocol tests
│   ├── sessionless/    # Sessionless auth tests
│   └── teleportation/  # Teleportation protocol tests
├── run-all-tests.js          # Master test runner
├── run-service-tests.js       # Service test runner
├── run-protocol-tests.js      # Protocol test runner
├── run-magic-spell-tests.js   # MAGIC spell test runner (NEW)
└── package.json
```

## Test Scripts

### Run All Tests
```bash
npm test                    # Run all tests
npm run test:all           # Same as above
```

### Run Test Categories
```bash
npm run test:services      # All service tests
npm run test:protocols     # All protocol tests
npm run test:magic-spells  # All MAGIC spell tests (NEW)
```

### Run Individual Service Tests
```bash
npm run test:fount
npm run test:bdo
npm run test:covenant
# ... etc for each service
```

### Run Individual MAGIC Spell Tests (NEW)
```bash
npm run test:fount:magic
npm run test:bdo:magic
npm run test:covenant:magic
npm run test:prof:magic
npm run test:addie:magic
npm run test:julia:magic
npm run test:sanora:magic
npm run test:dolores:magic
npm run test:joan:magic
npm run test:pref:magic
npm run test:aretha:magic
npm run test:continuebee:magic
```

## MAGIC Spell Testing (October 2025)

Sharon now includes comprehensive MAGIC spell tests for all 12 services that have been converted to the MAGIC protocol.

### MAGIC Test Coverage
- **12 Services**: All Planet Nine services with MAGIC conversion
- **64 Total Spells**: Every converted REST endpoint
- **120 Tests**: 10 tests per service (success + error cases)
- **Unified Runner**: `run-magic-spell-tests.js` runs all MAGIC tests

### Test Files
Each service has a `magic-spells.js` test file:
- Fount: `/tests/fount/mocha/magic-spells.js`
- All others: `/tests/{service}/magic-spells.js`

### Running MAGIC Tests

**All services:**
```bash
npm run test:magic-spells
```

Output shows:
- ✨ Total services tested (12)
- 🔮 Total spells tested (64)
- ✅ Services passed
- ❌ Services failed
- Summary statistics

**Individual service:**
```bash
npm run test:fount:magic
```

### Test Requirements

MAGIC spell tests require:
1. **All Planet Nine services running** on localhost
2. **Correct ports**:
   - Fount: 3006
   - BDO: 3003
   - Covenant: 3011
   - Prof: 3012
   - Addie: 3004
   - Julia: 3005
   - Sanora: 3002
   - Dolores: 3007
   - Joan: 3008
   - Pref: 3009
   - Aretha: 3010
   - Continuebee: 3001

3. **Dependencies installed**:
   - `sessionless-node` (local file dependency)
   - `fount-js` (local file dependency)
   - Mocha, Chai

## Dependencies

Sharon uses local file dependencies for Planet Nine libraries:

```json
{
  "sessionless-node": "file:../sessionless/src/javascript/node",
  "fount-js": "file:../fount/src/client/javascript"
}
```

This ensures tests use the latest local versions of these libraries.

## Docker Support

Sharon includes Docker Compose configuration for running tests in isolated environments:

```bash
npm run env:start        # Start test environment
npm run env:test         # Run tests in Docker
npm run env:logs         # View logs
npm run env:stop         # Stop environment
npm run env:clean        # Clean up containers
```

## Test Results

Tests output to console with clear pass/fail indicators:
- ✅ Passed tests
- ❌ Failed tests
- 📊 Summary statistics
- Detailed error messages for failures

## Last Updated
October 14, 2025 - Added comprehensive MAGIC spell testing infrastructure. All 12 services now have centralized MAGIC spell tests in Sharon with unified test runner support. Total: 64 spells, 120 tests.
