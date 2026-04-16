#!/bin/bash
set -e

echo "================================================"
echo "INSIGHT-X Tiered Startup Script (CORRECTED)"
echo "================================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to project root
cd "$(dirname "$0")/../.."

echo -e "${YELLOW}Phase 1: Starting Infrastructure...${NC}"
docker compose up -d postgres kafka neo4j zookeeper
sleep 15

echo -e "${YELLOW}Phase 2: Waiting for infrastructure health...${NC}"

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until docker compose ps | grep -q "postgres.*healthy"; do
  echo -n "."
  sleep 3
done
echo -e "${GREEN}✓ PostgreSQL ready${NC}"

# Wait for Kafka
echo "Waiting for Kafka..."
until docker compose ps | grep -q "kafka.*healthy"; do
  echo -n "."
  sleep 3
done
echo -e "${GREEN}✓ Kafka ready${NC}"

# Wait for Neo4j
echo "Waiting for Neo4j..."
until docker compose ps | grep -q "neo4j.*healthy"; do
  echo -n "."
  sleep 3
done
echo -e "${GREEN}✓ Neo4j ready${NC}"

echo -e "${GREEN}✓ Infrastructure ready${NC}"

echo -e "${YELLOW}Phase 3: Starting Data Layer Services...${NC}"
docker compose up -d ingestion provenance
sleep 15

echo -e "${YELLOW}Phase 4: Starting Core Engine Services...${NC}"
docker compose up -d trust-engine intent controls
sleep 15

echo -e "${YELLOW}Phase 5: Starting Query Services...${NC}"
docker compose up -d graph stream-gateway
sleep 10

echo -e "${YELLOW}Phase 6: Starting API Gateway...${NC}"
docker compose up -d api-gateway
sleep 10

echo -e "${GREEN}✓ All services started${NC}"

# Show running services
echo -e "\n${YELLOW}Running Services:${NC}"
docker compose ps

echo -e "\n${YELLOW}Running health checks...${NC}"
if [ -f "./docker/scripts/verify-connections.sh" ]; then
    ./docker/scripts/verify-connections.sh
else
    echo -e "${RED}verify-connections.sh not found${NC}"
fi
