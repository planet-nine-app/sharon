#!/bin/bash

# Wiki Federation Test Setup Script
# This script prepares the environment for federation testing

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🚀 Setting up Wiki Federation Test Environment"
echo "================================================"

# Create data directories for each wiki
echo ""
echo "📁 Creating data directories..."
mkdir -p data/alice/{pages,status}
mkdir -p data/bob/{pages,status}
mkdir -p data/carol/{pages,status}
mkdir -p data/dave/{pages,status}
echo "✅ Data directories created"

# Create owner.json for each wiki with admin secret
# Using a fixed secret so all fresh installs have the same admin credentials
echo ""
echo "👤 Creating owner.json files with admin privileges..."

ADMIN_SECRET="planetnine-admin-secret-2024"

cat > data/alice/status/owner.json << EOF
{
  "name": "alice",
  "friend": {
    "secret": "$ADMIN_SECRET"
  }
}
EOF

cat > data/bob/status/owner.json << EOF
{
  "name": "bob",
  "friend": {
    "secret": "$ADMIN_SECRET"
  }
}
EOF

cat > data/carol/status/owner.json << EOF
{
  "name": "carol",
  "friend": {
    "secret": "$ADMIN_SECRET"
  }
}
EOF

echo "✅ Owner files created for all wikis"
echo "   Admin secret: $ADMIN_SECRET"

# Create owner.json for Dave (sessionless security)
echo ""
echo "👤 Creating owner.json for Dave (sessionless)..."

# Using a fixed pubKey for Dave so it's repeatable
# This is the pubKey from the conversation summary: planetnineisaspaceship
DAVE_PUBKEY="03493f885965c30f36788427eb0376c12ae8fc19118a872c9a06cec9d1dea504db"

cat > data/dave/status/owner.json << EOF
{
  "name": "planetnineisaspaceship",
  "sessionlessKeys": {
    "pubKey": "$DAVE_PUBKEY"
  },
  "pubKey": "$DAVE_PUBKEY"
}
EOF

echo "✅ Dave's owner.json created with sessionless keys"
echo "   Owner: planetnineisaspaceship"
echo "   PubKey: $DAVE_PUBKEY"

# Create plugins directory
echo ""
echo "🔌 Setting up plugins directory..."
mkdir -p plugins

# Create symlinks to actual plugin directories
echo "   Linking allyabase plugin..."
if [ ! -L "plugins/wiki-plugin-allyabase" ]; then
  ln -sf ../../../third-party/wiki-plugin-allyabase plugins/wiki-plugin-allyabase
fi

echo "   Linking linkitylink plugin..."
if [ ! -L "plugins/wiki-plugin-linkitylink" ]; then
  ln -sf ../../../third-party/wiki-plugin-linkitylink plugins/wiki-plugin-linkitylink
fi

echo "   Linking mutopia plugin..."
if [ ! -L "plugins/wiki-plugin-mutopia" ]; then
  ln -sf ../../../third-party/wiki-plugin-mutopia plugins/wiki-plugin-mutopia
fi

echo "   Linking books plugin..."
if [ ! -L "plugins/wiki-plugin-books" ]; then
  ln -sf ../../../third-party/wiki-plugin-books plugins/wiki-plugin-books
fi

echo "   Linking blogs plugin..."
if [ ! -L "plugins/wiki-plugin-blogs" ]; then
  ln -sf ../../../third-party/wiki-plugin-blogs plugins/wiki-plugin-blogs
fi

echo "   Linking recipes plugin..."
if [ ! -L "plugins/wiki-plugin-recipes" ]; then
  ln -sf ../../../third-party/wiki-plugin-recipes plugins/wiki-plugin-recipes
fi

echo "✅ Plugins linked (6 plugins total)"

# Install plugin dependencies
echo ""
echo "📦 Installing plugin dependencies..."
for plugin in plugins/wiki-plugin-*; do
  if [ -d "$plugin" ] && [ -f "$plugin/package.json" ]; then
    echo "   Installing $(basename $plugin)..."
    (cd "$plugin" && npm install --production --silent)
  fi
done
echo "✅ Plugin dependencies installed"

# Create .gitignore
echo ""
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Data directories
data/

# Node modules
node_modules/
plugins/node_modules/

# Logs
*.log
npm-debug.log*

# Environment files
.env
.env.local

# Docker volumes
.docker-volumes/
EOF
echo "✅ .gitignore created"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run tests: npm run test:federation"
echo "  2. Or start manually: docker-compose up -d"
echo "  3. Access wikis:"
echo "     - Alice: http://localhost:3001"
echo "     - Bob:   http://localhost:3002"
echo "     - Carol: http://localhost:3003"
echo ""
