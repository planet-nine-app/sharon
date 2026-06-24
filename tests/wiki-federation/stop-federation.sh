#!/bin/bash

# Stop Federated Wiki Federation
# Stops all wiki containers

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
VOLUMES=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --clean)
      CLEAN=true
      VOLUMES=true
      shift
      ;;
    --volumes)
      VOLUMES=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --clean     Remove containers AND volumes (deletes all data)"
      echo "  --volumes   Remove volumes (same as --clean)"
      echo "  --help      Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0              # Stop containers (data preserved)"
      echo "  $0 --clean      # Stop and remove everything"
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
echo -e "${BLUE}🛑 Stopping Federated Wiki${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ "$VOLUMES" = true ]; then
  echo -e "${YELLOW}🧹 Stopping containers and removing volumes...${NC}"
  docker-compose down -v

  echo ""
  echo -e "${YELLOW}🗑️  Removing data directories...${NC}"
  rm -rf data/ 2>/dev/null || true
  rm -rf plugins/ 2>/dev/null || true

  echo ""
  echo -e "${GREEN}✅ Federation stopped and cleaned${NC}"
  echo -e "${YELLOW}⚠️  All wiki data has been deleted${NC}"
else
  echo -e "${YELLOW}🛑 Stopping containers...${NC}"
  docker-compose down

  echo ""
  echo -e "${GREEN}✅ Federation stopped${NC}"
  echo -e "${BLUE}ℹ️  Data preserved in data/ directory${NC}"
  echo -e "${BLUE}ℹ️  Run with ${YELLOW}--clean${NC} to remove all data${NC}"
fi

echo ""
echo -e "${BLUE}📊 Remaining containers:${NC}"
docker ps -a | grep -E "wiki-alice|wiki-bob|wiki-carol|wiki-dave" || echo "  None"
echo ""
