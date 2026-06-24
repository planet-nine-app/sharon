#!/bin/bash

# Start Federated Wiki Federation
# Creates and starts 3 wikis with all 6 plugins

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
CLEAN=false
BUILD=false
SETUP=false
TEST=false
FOLLOW_LOGS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN=true
      shift
      ;;
    --build)
      BUILD=true
      shift
      ;;
    --setup)
      SETUP=true
      shift
      ;;
    --test)
      TEST=true
      shift
      ;;
    --logs)
      FOLLOW_LOGS=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --clean     Clean up existing containers and volumes first"
      echo "  --build     Rebuild Docker images"
      echo "  --setup     Run setup script first"
      echo "  --test      Run federation tests after startup"
      echo "  --logs      Follow logs after startup"
      echo "  --help      Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                    # Just start (quick)"
      echo "  $0 --clean --setup    # Clean start with setup"
      echo "  $0 --clean --build    # Clean rebuild"
      echo "  $0 --test             # Start and test"
      echo "  $0 --logs             # Start and follow logs"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run with --help for usage"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🌐 Federated Wiki - 3 Node Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Clean up if requested
if [ "$CLEAN" = true ]; then
  echo -e "${YELLOW}🧹 Cleaning up existing containers and volumes...${NC}"
  docker-compose down -v 2>/dev/null || true
  rm -rf data/ 2>/dev/null || true
  echo -e "${GREEN}✅ Cleaned up${NC}"
  echo ""
fi

# Step 2: Run setup if requested or if data doesn't exist
if [ "$SETUP" = true ] || [ ! -d "data/alice" ]; then
  echo -e "${YELLOW}📋 Running setup...${NC}"
  ./setup.sh
  echo ""
fi

# Step 3: Build images (once for each type)
if [ "$BUILD" = true ] || [ ! "$(docker images -q wiki-federation:latest 2> /dev/null)" ]; then
  echo -e "${YELLOW}🔨 Building farm mode wiki image...${NC}"
  echo -e "   (Alice, Bob, Carol - wiki-security-friends)"
  docker-compose build wiki-alice
  echo -e "${GREEN}✅ Farm mode image built${NC}"
  echo ""
fi

if [ "$BUILD" = true ] || [ ! "$(docker images -q wiki-standalone:latest 2> /dev/null)" ]; then
  echo -e "${YELLOW}🔨 Building standalone wiki image...${NC}"
  echo -e "   (Dave - wiki-security-sessionless)"
  docker-compose build wiki-dave
  echo -e "${GREEN}✅ Standalone image built${NC}"
  echo ""
fi

# Step 4: Start containers
echo -e "${YELLOW}🚀 Starting federated wiki containers...${NC}"
docker-compose up -d --no-build

# Step 5: Wait for health
echo ""
echo -e "${YELLOW}⏳ Waiting for wikis to be healthy...${NC}"
echo -e "   This may take 30-60 seconds..."
echo ""

MAX_ATTEMPTS=60
ATTEMPT=0
ALICE_READY=false
BOB_READY=false
CAROL_READY=false
DAVE_READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))

  # Check Alice (farm mode requires Host header)
  if [ "$ALICE_READY" = false ]; then
    if curl -s -o /dev/null -w "%{http_code}" -H "Host: alice.localhost" http://localhost:3001 | grep -q "200\|302"; then
      ALICE_READY=true
      echo -e "${GREEN}✅ Alice's wiki is ready (port 3001)${NC}"
    fi
  fi

  # Check Bob (farm mode requires Host header)
  if [ "$BOB_READY" = false ]; then
    if curl -s -o /dev/null -w "%{http_code}" -H "Host: bob.localhost" http://localhost:3002 | grep -q "200\|302"; then
      BOB_READY=true
      echo -e "${GREEN}✅ Bob's wiki is ready (port 3002)${NC}"
    fi
  fi

  # Check Carol (farm mode requires Host header)
  if [ "$CAROL_READY" = false ]; then
    if curl -s -o /dev/null -w "%{http_code}" -H "Host: carol.localhost" http://localhost:3003 | grep -q "200\|302"; then
      CAROL_READY=true
      echo -e "${GREEN}✅ Carol's wiki is ready (port 3003)${NC}"
    fi
  fi

  # Check Dave (standalone mode, no Host header needed)
  if [ "$DAVE_READY" = false ]; then
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3004 | grep -q "200\|302"; then
      DAVE_READY=true
      echo -e "${GREEN}✅ Dave's wiki is ready (port 3004)${NC}"
    fi
  fi

  # Check if all ready
  if [ "$ALICE_READY" = true ] && [ "$BOB_READY" = true ] && [ "$CAROL_READY" = true ] && [ "$DAVE_READY" = true ]; then
    break
  fi

  sleep 1
done

echo ""

if [ "$ALICE_READY" = false ] || [ "$BOB_READY" = false ] || [ "$CAROL_READY" = false ] || [ "$DAVE_READY" = false ]; then
  echo -e "${RED}❌ Timeout waiting for wikis to be healthy${NC}"
  echo -e "${YELLOW}Check logs with: docker-compose logs${NC}"
  exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Federation is ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Show access information
echo -e "${BLUE}📍 Access your wikis:${NC}"
echo ""
echo -e "  ${GREEN}Alice's Wiki:${NC}  http://localhost:3001  ${YELLOW}(farm mode - friends auth)${NC}"
echo -e "  ${GREEN}Bob's Wiki:${NC}    http://localhost:3002  ${YELLOW}(farm mode - friends auth)${NC}"
echo -e "  ${GREEN}Carol's Wiki:${NC}  http://localhost:3003  ${YELLOW}(farm mode - friends auth)${NC}"
echo -e "  ${GREEN}Dave's Wiki:${NC}   http://localhost:3004  ${YELLOW}(standalone - sessionless auth)${NC}"
echo ""

# Show plugin information
echo -e "${BLUE}🔌 Plugins installed (6 per wiki):${NC}"
echo ""
echo -e "  🌐 Allyabase    - Service proxies + federation"
echo -e "  🔗 Linkitylink  - Link tapestries + linktree import"
echo -e "  🎵 Mutopia      - Music distribution"
echo -e "  📚 Books        - Ebook publishing"
echo -e "  📝 Blogs        - Blog posts"
echo -e "  🍳 Recipes      - Recipe sharing"
echo ""

# Show neighborhood info
echo -e "${BLUE}🏘️  Configuration:${NC}"
echo ""
echo -e "  Alice, Bob, Carol: ${GREEN}Farm mode${NC} (wiki-security-friends)"
echo -e "  Dave: ${GREEN}Standalone mode${NC} (wiki-security-sessionless)"
echo -e "  Auto-seeding: ${GREEN}enabled${NC}"
echo ""
echo -e "${BLUE}🔐 Authentication:${NC}"
echo ""
echo -e "  Alice/Bob/Carol: Reclaim with secret ${YELLOW}planetnine-admin-secret-2024${NC}"
echo -e "  Dave: Sessionless (secp256k1 keypair signing)"
echo ""

# Show useful commands
echo -e "${BLUE}📝 Useful commands:${NC}"
echo ""
echo -e "  ${YELLOW}View logs:${NC}         docker-compose logs -f"
echo -e "  ${YELLOW}Stop wikis:${NC}        docker-compose down"
echo -e "  ${YELLOW}Clean up:${NC}          docker-compose down -v"
echo -e "  ${YELLOW}Restart:${NC}           docker-compose restart"
echo -e "  ${YELLOW}Run tests:${NC}         npm run test:federation"
echo ""

# Show container status
echo -e "${BLUE}📊 Container status:${NC}"
echo ""
docker-compose ps
echo ""

# Run tests if requested
if [ "$TEST" = true ]; then
  echo -e "${YELLOW}🧪 Running federation tests...${NC}"
  echo ""
  npm test
  echo ""
fi

# Follow logs if requested
if [ "$FOLLOW_LOGS" = true ]; then
  echo -e "${YELLOW}📜 Following logs (Ctrl+C to exit)...${NC}"
  echo ""
  docker-compose logs -f
else
  # Show final tip
  echo -e "${GREEN}🎉 Federation is running!${NC}"
  echo ""
  echo -e "💡 Tip: Visit http://localhost:3001 to start exploring"
  echo -e "💡 Run with ${YELLOW}--logs${NC} to follow container logs"
  echo ""
fi
