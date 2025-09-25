# Permissions Tests

Tests for the Planet Nine permissions system - nineum-based gating and MAGIC spell authorization.

## What This Tests

- **Nineum Permission System** - Galaxy/System/Flavor-based permissions
- **MAGIC Gating** - Spell casting with MP and nineum requirements
- **Cross-Service Authorization** - Julia key coordination between services
- **User Creation Gating** - BDO, Product, Post, Video creation permissions

## Test Categories

- **integration/** - End-to-end permission flows

## Architecture Tested

The complete flow: **Client** → **Julia** → **Fount** → **Target Service**

1. **Client** creates spell with MP cost and nineum requirements
2. **Julia** coordinates keys and verifies permissions
3. **Fount** checks MP availability and nineum permissions
4. **Target Service** creates object after successful authorization

## Running Tests

```bash
# Run all permissions tests
npm test

# Run specific test
npm run test:gating
npm run test:permissions
```

## Dependencies

Services must be running:
- Julia (localhost:3007) - Key coordination
- Fount (localhost:3006) - MAGIC resolution & nineum
- BDO (localhost:3003) - Object creation
- Sanora (localhost:7243) - Product creation
- Dolores (localhost:3004) - Post creation

## Test Data

Tests create temporary users with known nineum permissions:
- Admin user for granting nineum
- Test users with specific galaxy/system/flavor combinations
- Mock signatures for testing (replace with real crypto for production)