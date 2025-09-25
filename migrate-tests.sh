#!/bin/bash

# Migration script to move all service tests to Sharon
# This script moves tests from individual service directories to the centralized Sharon structure

echo "🚚 Migrating Planet Nine service tests to Sharon..."

SERVICES=("bdo" "julia" "addie" "sanora" "dolores" "covenant" "aretha" "pref" "continuebee" "joan")

for service in "${SERVICES[@]}"; do
    echo "Migrating ${service} tests..."

    # Create service test directory structure
    mkdir -p "tests/${service}/client"
    mkdir -p "tests/${service}/server"
    mkdir -p "tests/${service}/integration"

    # Check if service test directory exists
    if [ -d "../${service}/test/mocha" ]; then
        # Copy test files
        cp "../${service}/test/mocha/"*.js "tests/${service}/client/" 2>/dev/null || echo "  No client tests found"

        # Copy package.json if it exists
        if [ -f "../${service}/test/mocha/package.json" ]; then
            cp "../${service}/test/mocha/package.json" "tests/${service}/package.json"

            # Update package.json for Sharon structure
            sed -i '' 's/"name": "[^"]*"/"name": "@sharon\/'${service}'-tests"/' "tests/${service}/package.json"
            sed -i '' 's/"test": "[^"]*"/"test": "node test-runner.js"/' "tests/${service}/package.json"
        fi

        # Create basic test runner
        cat > "tests/${service}/test-runner.js" << EOF
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

async function runTests() {
  console.log('🧪 Running ${service} tests...');

  const mocha = spawn('npx', ['mocha', '**/*.js', '--timeout', '30000'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  mocha.on('close', (code) => {
    process.exit(code);
  });
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
EOF

        # Create README
        cat > "tests/${service}/README.md" << EOF
# ${service^} Tests

Integration tests for the ${service} service.

## Running Tests

\`\`\`bash
npm test
\`\`\`

## Test Categories

- **client/** - Client SDK tests
- **server/** - Server endpoint tests
- **integration/** - Cross-service integration tests
EOF

        chmod +x "tests/${service}/test-runner.js"
        echo "  ✅ ${service} tests migrated"
    else
        echo "  ⚠️  No tests found for ${service}"
    fi
done

echo ""
echo "🎯 Migration complete!"
echo "You can now run tests using:"
echo "  npm run test:all          # All tests"
echo "  npm run test:services     # Service tests only"
echo "  npm run test:permissions  # Permissions tests only"