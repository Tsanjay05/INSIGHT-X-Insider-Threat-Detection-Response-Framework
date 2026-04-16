#!/bin/bash

echo "================================================"
echo "INSIGHT-X Connection Verification (CORRECTED)"
echo "================================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Navigate to project root
cd "$(dirname "$0")/../.."

check_service() {
  local service=$1
  local url=$2
  
  if curl -sf "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $service: Connected"
    return 0
  else
    echo -e "${RED}✗${NC} $service: Failed"
    return 1
  fi
}

# Check API Gateway routes
echo -e "\n${YELLOW}Testing API Gateway Routes...${NC}"
check_service "API Gateway Direct" "http://localhost:8080/actuator/health"
check_service "Intent Service (via Gateway)" "http://localhost:8080/api/intent/actuator/health"
check_service "Trust Engine (via Gateway)" "http://localhost:8080/api/trust/actuator/health"
check_service "Controls Service (via Gateway)" "http://localhost:8080/api/controls/actuator/health"
check_service "Provenance Service (via Gateway)" "http://localhost:8080/api/provenance/actuator/health"
check_service "Graph Service (via Gateway)" "http://localhost:8080/api/graph/actuator/health"

# Check Infrastructure
echo -e "\n${YELLOW}Testing Infrastructure Connectivity...${NC}"

# PostgreSQL main database
if docker exec insight-x-postgres-1 psql -U insightx -d insightx -c "SELECT 1;" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} PostgreSQL (insightx): Connected"
else
  echo -e "${RED}✗${NC} PostgreSQL (insightx): Failed"
fi

# PostgreSQL provenance database
if docker exec insight-x-postgres-1 psql -U insightx -d insightx_provenance -c "SELECT 1;" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} PostgreSQL (insightx_provenance): Connected"
else
  echo -e "${RED}✗${NC} PostgreSQL (insightx_provenance): Failed"
fi

# Check Kafka
echo -e "\n${YELLOW}Testing Kafka Connectivity...${NC}"
if docker exec insight-x-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Kafka: Connected"
  echo -e "${YELLOW}Kafka Topics:${NC}"
  docker exec insight-x-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list
else
  echo -e "${RED}✗${NC} Kafka: Failed"
fi

# Check Neo4j
echo -e "\n${YELLOW}Testing Neo4j Connectivity...${NC}"
if curl -sf http://localhost:7474 > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Neo4j Browser: Connected (http://localhost:7474)"
else
  echo -e "${RED}✗${NC} Neo4j Browser: Failed"
fi

# Check running containers
echo -e "\n${YELLOW}Container Status:${NC}"
docker compose ps

echo -e "\n${YELLOW}================================================${NC}"
echo "Verification Complete"
echo -e "${YELLOW}================================================${NC}"

# Summary of issues
echo -e "\n${YELLOW}Quick Troubleshooting:${NC}"
echo "1. If services fail to connect via Gateway, check service logs:"
echo "   docker compose logs trust-engine"
echo "2. If Kafka fails, verify broker is healthy:"
echo "   docker compose logs kafka"
echo "3. If database connection fails, check schema creation:"
echo "   docker exec insight-x-postgres-1 psql -U insightx -l"
