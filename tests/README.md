# Sharon Test Categories

This directory contains comprehensive integration tests organized by category:

## Miniservice Tests
Individual service tests that verify server/client SDK contracts:

- **addie** - Payment processing service tests
- **bdo** - Big Dumb Object storage tests
- **continuebee** - Client state verification tests
- **covenant** - Multi-party contract tests
- **dolores** - Social feeds & media tests
- **fount** - MAGIC protocol & nineum management tests
- **joan** - Recovery service tests
- **julia** - P2P messaging & key coordination tests
- **aretha** - Limited-run product tests
- **pref** - Preferences service tests
- **sanora** - Product hosting & marketplace tests

## Protocol Tests
Core protocol integration tests:

- **sessionless** - Passwordless authentication tests
- **magic** - Multi-device consensus protocol tests
- **teleportation** - Content discovery & verification tests
- **covenant** - Contract management protocol tests

## System Tests
Higher-level system integration tests:

- **permissions** - Nineum permission system & gating tests
- **cross-service** - Multi-service interaction tests
- **client-server** - End-to-end client application tests

## Running Tests

Each category contains its own test runner and can be executed independently:

```bash
# Run specific category
cd tests/fount && npm test

# Run all miniservice tests
npm run test:services

# Run all protocol tests
npm run test:protocols

# Run all system tests
npm run test:system

# Run everything
npm run test:all
```

## Test Structure

Each test category follows this structure:
```
category-name/
├── package.json          # Test dependencies
├── README.md             # Category-specific docs
├── test-runner.js        # Main test runner
├── client/              # Client SDK tests
│   └── *.test.js
├── server/              # Server endpoint tests
│   └── *.test.js
└── integration/         # Cross-service integration tests
    └── *.test.js
```