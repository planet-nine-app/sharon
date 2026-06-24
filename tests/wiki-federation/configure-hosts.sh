#!/bin/bash

# Configure /etc/hosts for Wiki Federation
# This allows accessing wikis via alice.localhost, bob.localhost, carol.localhost

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🌐 Wiki Federation Hosts Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if entries already exist
if grep -q "alice.localhost" /etc/hosts && grep -q "bob.localhost" /etc/hosts && grep -q "carol.localhost" /etc/hosts; then
  echo -e "${GREEN}✅ Hosts are already configured${NC}"
  echo ""
  echo -e "${BLUE}You can access the wikis at:${NC}"
  echo -e "  • ${GREEN}http://alice.localhost:3001${NC}"
  echo -e "  • ${GREEN}http://bob.localhost:3002${NC}"
  echo -e "  • ${GREEN}http://carol.localhost:3003${NC}"
  exit 0
fi

echo -e "${YELLOW}📝 This script will add the following to /etc/hosts:${NC}"
echo ""
echo "127.0.0.1 alice.localhost"
echo "127.0.0.1 bob.localhost"
echo "127.0.0.1 carol.localhost"
echo ""
echo -e "${YELLOW}⚠️  This requires sudo privileges${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Cancelled${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}Adding entries to /etc/hosts...${NC}"

# Add entries
sudo bash -c 'cat >> /etc/hosts << EOF

# Wiki Federation - Added by configure-hosts.sh
127.0.0.1 alice.localhost
127.0.0.1 bob.localhost
127.0.0.1 carol.localhost
EOF'

echo -e "${GREEN}✅ Hosts configured successfully!${NC}"
echo ""
echo -e "${BLUE}You can now access the wikis at:${NC}"
echo -e "  • ${GREEN}http://alice.localhost:3001${NC}"
echo -e "  • ${GREEN}http://bob.localhost:3002${NC}"
echo -e "  • ${GREEN}http://carol.localhost:3003${NC}"
echo ""
echo -e "${BLUE}🔐 Admin Login:${NC}"
echo -e "  1. Click the 🔒 padlock in the footer"
echo -e "  2. Enter reclaim code: ${YELLOW}planetnine-admin-secret-2024${NC}"
echo -e "  3. You now have admin privileges!"
echo ""
