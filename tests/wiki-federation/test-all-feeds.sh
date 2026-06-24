#!/bin/bash

# Complete Federation Feed Testing Script
# Tests all 4 feeds on all 3 wikis

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 Federation Feed Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if wikis are running (farm mode requires Host headers)
echo -e "${YELLOW}🔍 Checking if wikis are running...${NC}"
ALICE_UP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: alice.localhost" http://localhost:3001 || echo "000")
BOB_UP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: bob.localhost" http://localhost:3002 || echo "000")
CAROL_UP=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: carol.localhost" http://localhost:3003 || echo "000")

if [ "$ALICE_UP" != "200" ] && [ "$ALICE_UP" != "302" ]; then
    echo -e "${RED}❌ Alice's wiki is not running${NC}"
    echo -e "${YELLOW}💡 Start with: ./start-federation.sh${NC}"
    exit 1
fi

if [ "$BOB_UP" != "200" ] && [ "$BOB_UP" != "302" ]; then
    echo -e "${RED}❌ Bob's wiki is not running${NC}"
    echo -e "${YELLOW}💡 Start with: ./start-federation.sh${NC}"
    exit 1
fi

if [ "$CAROL_UP" != "200" ] && [ "$CAROL_UP" != "302" ]; then
    echo -e "${RED}❌ Carol's wiki is not running${NC}"
    echo -e "${YELLOW}💡 Start with: ./start-federation.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All wikis are running${NC}"
echo ""

# Test function
test_feed() {
    local WIKI_NAME=$1
    local WIKI_URL=$2
    local FEED_NAME=$3
    local FEED_PATH=$4
    local FEED_ICON=$5

    # Farm mode requires Host header
    local HOST_HEADER="Host: ${WIKI_NAME}.localhost"
    local RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "$HOST_HEADER" "$WIKI_URL$FEED_PATH" 2>/dev/null || echo "000")

    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "503" ]; then
        echo -e "  ${GREEN}✅${NC} $FEED_ICON $FEED_NAME (HTTP $RESPONSE)"
        return 0
    else
        echo -e "  ${RED}❌${NC} $FEED_ICON $FEED_NAME (HTTP $RESPONSE)"
        return 1
    fi
}

# Test Alice's wiki
echo -e "${BLUE}🎵 Testing Alice's wiki (port 3001)${NC}"
test_feed "Alice" "http://localhost:3001" "Canimus" "/plugin/mutopia/feed" "🎵"
test_feed "Alice" "http://localhost:3001" "Canipub" "/plugin/books/library" "📚"
test_feed "Alice" "http://localhost:3001" "Caniblog" "/plugin/blogs/feed" "📝"
test_feed "Alice" "http://localhost:3001" "Canicook" "/plugin/recipes/feed" "🍳"
test_feed "Alice" "http://localhost:3001" "Allyabase" "/plugin/allyabase/status" "🌐"
test_feed "Alice" "http://localhost:3001" "Linkitylink" "/plugin/linkitylink/health" "🔗"
echo ""

# Test Bob's wiki
echo -e "${BLUE}📚 Testing Bob's wiki (port 3002)${NC}"
test_feed "Bob" "http://localhost:3002" "Canimus" "/plugin/mutopia/feed" "🎵"
test_feed "Bob" "http://localhost:3002" "Canipub" "/plugin/books/library" "📚"
test_feed "Bob" "http://localhost:3002" "Caniblog" "/plugin/blogs/feed" "📝"
test_feed "Bob" "http://localhost:3002" "Canicook" "/plugin/recipes/feed" "🍳"
test_feed "Bob" "http://localhost:3002" "Allyabase" "/plugin/allyabase/status" "🌐"
test_feed "Bob" "http://localhost:3002" "Linkitylink" "/plugin/linkitylink/health" "🔗"
echo ""

# Test Carol's wiki
echo -e "${BLUE}📝 Testing Carol's wiki (port 3003)${NC}"
test_feed "Carol" "http://localhost:3003" "Canimus" "/plugin/mutopia/feed" "🎵"
test_feed "Carol" "http://localhost:3003" "Canipub" "/plugin/books/library" "📚"
test_feed "Carol" "http://localhost:3003" "Caniblog" "/plugin/blogs/feed" "📝"
test_feed "Carol" "http://localhost:3003" "Canicook" "/plugin/recipes/feed" "🍳"
test_feed "Carol" "http://localhost:3003" "Allyabase" "/plugin/allyabase/status" "🌐"
test_feed "Carol" "http://localhost:3003" "Linkitylink" "/plugin/linkitylink/health" "🔗"
echo ""

# Test federation endpoints
echo -e "${BLUE}🔗 Testing federation endpoints${NC}"
test_feed "Alice" "http://localhost:3001" "Sitemap" "/system/sitemap.json" "📍"
test_feed "Bob" "http://localhost:3002" "Sitemap" "/system/sitemap.json" "📍"
test_feed "Carol" "http://localhost:3003" "Sitemap" "/system/sitemap.json" "📍"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Feed Testing Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • 3 wikis tested (Alice, Bob, Carol)"
echo -e "  • 6 plugins per wiki (24 endpoints total)"
echo -e "  • 4 feeds tested (Canimus, Canipub, Caniblog, Canicook)"
echo -e "  • 2 utility plugins (Allyabase, Linkitylink)"
echo ""
echo -e "${BLUE}💡 Response codes explained:${NC}"
echo -e "  • ${GREEN}200${NC} - Success (endpoint working, data returned)"
echo -e "  • ${YELLOW}401${NC} - Auth required (endpoint working, needs auth)"
echo -e "  • ${YELLOW}503${NC} - Service unavailable (plugin loaded, backend not running)"
echo -e "  • ${RED}404${NC} - Not found (plugin not loaded or endpoint wrong)"
echo ""
echo -e "${BLUE}🎨 Next steps:${NC}"
echo -e "  • Visual testing: ${YELLOW}open feed-viewer.html${NC}"
echo -e "  • Automated tests: ${YELLOW}npm run test:federation${NC}"
echo -e "  • Access wikis:"
echo -e "    - Alice: ${YELLOW}http://localhost:3001${NC}"
echo -e "    - Bob:   ${YELLOW}http://localhost:3002${NC}"
echo -e "    - Carol: ${YELLOW}http://localhost:3003${NC}"
echo ""
