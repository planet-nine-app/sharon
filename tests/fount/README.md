# Fount Tests

Tests for the Fount service - MAGIC protocol integration and nineum management.

## Test Categories

- **client/** - Client SDK tests (fount-js)
- **server/** - Server endpoint tests
- **integration/** - Cross-service integration tests

## What Fount Tests

- User creation and management
- Nineum granting and permissions
- MP (Magic Power) system
- MAGIC spell resolution
- Cross-service communication

## Running Tests

```bash
# Run all fount tests
npm test

# Run specific test category
npm run test:client
npm run test:server
npm run test:integration
```

## Dependencies

- Fount service running on localhost:3006
- BDO service for spellbook storage
- Database connectivity