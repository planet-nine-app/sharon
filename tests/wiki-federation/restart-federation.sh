#!/bin/bash

# Restart Federated Wiki Federation
# Convenient script to restart all wikis

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Restarting federation...${NC}"
echo ""

# Restart via docker-compose
docker-compose restart

echo ""
echo -e "${BLUE}✅ Federation restarted${NC}"
echo ""
echo "Visit:"
echo "  - Alice: http://localhost:3001"
echo "  - Bob:   http://localhost:3002"
echo "  - Carol: http://localhost:3003"
echo ""
