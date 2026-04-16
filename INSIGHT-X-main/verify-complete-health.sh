#!/bin/bash

echo "================================================"
echo "INSIGHT-X Service Health Verification"
echo "================================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test HTTP endpoints
test_endpoint() {
    local name=$1
    local url=$2
    local expected=${3:-200}
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" -eq "$expected" ]; then
        echo -e "${GREEN}✓${NC} $name: HTTP $response"
        return 0
    elif [ -n "$response" ] && [ "$response" -ne 000 ]; then
        echo -e "${YELLOW}!${NC} $name: HTTP $response (responding but unexpected)"
        return 1
    else
        echo -e "${RED}✗${NC} $name: No response"
        return 2
    fi
}

# 1. Container Status Check
echo -e "\n${BLUE}=== Container Status ===${NC}"
docker compose ps --format "table {{.Name}}\t{{.Status}}" | grep -E "(Name|insight-x)"

# 2. Infrastructure Connectivity
echo -e "\n${BLUE}=== Infrastructure Health ===${NC}"

# PostgreSQL
if docker exec insight-x-postgres-1 psql -U insightx -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL: Connected"
else
    echo -e "${RED}✗${NC} PostgreSQL: Failed"
fi

# PostgreSQL - Check databases exist
if docker exec insight-x-postgres-1 psql -U insightx -l | grep -q "insightx"; then
    echo -e "${GREEN}✓${NC} Database 'insightx': Exists"
else
    echo -e "${YELLOW}!${NC} Database 'insightx': Not found"
fi

if docker exec insight-x-postgres-1 psql -U insightx -l | grep -q "insightx_provenance"; then
    echo -e "${GREEN}✓${NC} Database 'insightx_provenance': Exists"
else
    echo -e "${YELLOW}!${NC} Database 'insightx_provenance': Not found"
fi

# Kafka
if docker exec insight-x-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Kafka: Connected"
    topic_count=$(docker exec insight-x-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null | wc -l)
    echo -e "  ${YELLOW}→${NC} Topics: $topic_count"
else
    echo -e "${RED}✗${NC} Kafka: Failed"
fi

# Neo4j
if curl -sf http://localhost:7474 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Neo4j Browser: http://localhost:7474"
else
    echo -e "${RED}✗${NC} Neo4j Browser: Failed"
fi

# Elasticsearch
if curl -sf http://localhost:9200 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Elasticsearch: http://localhost:9200"
else
    echo -e "${RED}✗${NC} Elasticsearch: Failed"
fi

# 3. API Gateway Endpoints
echo -e "\n${BLUE}=== API Gateway Endpoints ===${NC}"

# Try different health endpoint paths
test_endpoint "API Gateway (root)" "http://localhost:8080/" 
test_endpoint "API Gateway (/health)" "http://localhost:8080/health"
test_endpoint "API Gateway (/actuator)" "http://localhost:8080/actuator"
test_endpoint "API Gateway (/actuator/health)" "http://localhost:8080/actuator/health"

# Try backend service routes through gateway
echo -e "\n${BLUE}=== Gateway Routing (Backend Services) ===${NC}"
test_endpoint "Trust Engine via Gateway" "http://localhost:8080/api/trust/health"
test_endpoint "Intent via Gateway" "http://localhost:8080/api/intent/health"
test_endpoint "Controls via Gateway" "http://localhost:8080/api/controls/health"
test_endpoint "Provenance via Gateway" "http://localhost:8080/api/provenance/health"
test_endpoint "Graph via Gateway" "http://localhost:8080/api/graph/health"

# 4. Service Logs Check
echo -e "\n${BLUE}=== Service Startup Status ===${NC}"

check_service_logs() {
    local service=$1
    if docker compose logs "$service" 2>/dev/null | grep -q "Started.*Application"; then
        echo -e "${GREEN}✓${NC} $service: Application started"
    elif docker compose logs "$service" 2>/dev/null | grep -qi "error\|exception\|failed"; then
        echo -e "${RED}✗${NC} $service: Errors detected"
        echo "  Recent errors:"
        docker compose logs "$service" --tail 5 | grep -i "error\|exception" | head -3
    else
        echo -e "${YELLOW}!${NC} $service: Status unclear"
    fi
}

check_service_logs "api-gateway"
check_service_logs "trust-engine"
check_service_logs "intent"
check_service_logs "controls"
check_service_logs "provenance"
check_service_logs "graph"
check_service_logs "ingestion"
check_service_logs "stream-gateway"

# 5. Critical Error Check
echo -e "\n${BLUE}=== Critical Errors (Last 2 minutes) ===${NC}"
errors=$(docker compose logs --since 2m 2>/dev/null | grep -i "error\|exception\|failed" | grep -v "InvalidReplicationFactorException" | head -10)

if [ -z "$errors" ]; then
    echo -e "${GREEN}✓${NC} No critical errors detected"
else
    echo -e "${YELLOW}!${NC} Found some errors:"
    echo "$errors"
fi

# 6. Kafka Consumer Groups
echo -e "\n${BLUE}=== Kafka Consumer Groups ===${NC}"
groups=$(docker exec insight-x-kafka-1 kafka-consumer-groups --bootstrap-server localhost:9092 --list 2>/dev/null)
if [ -n "$groups" ]; then
    echo -e "${GREEN}✓${NC} Active consumer groups:"
    echo "$groups" | head -5
else
    echo -e "${YELLOW}!${NC} No consumer groups yet (services may still be initializing)"
fi

# 7. Network Connectivity
echo -e "\n${BLUE}=== Inter-Service Network Test ===${NC}"
if docker exec insight-x-api-gateway-1 ping -c 1 kafka > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} API Gateway can reach Kafka"
else
    echo -e "${RED}✗${NC} API Gateway cannot reach Kafka"
fi

if docker exec insight-x-trust-engine-1 ping -c 1 postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Trust Engine can reach PostgreSQL"
else
    echo -e "${RED}✗${NC} Trust Engine cannot reach PostgreSQL"
fi

# 8. Summary
echo -e "\n${BLUE}================================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}================================================${NC}"

# Count running containers
total=$(docker compose ps --format json 2>/dev/null | jq -s 'length')
running=$(docker compose ps --format json 2>/dev/null | jq -s '[.[] | select(.State == "running")] | length')

echo -e "Containers: $running/$total running"

if [ "$running" -eq "$total" ]; then
    echo -e "${GREEN}✓${NC} All containers are running"
else
    echo -e "${YELLOW}!${NC} Some containers are not running"
fi

# Final recommendations
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Check individual service logs: docker compose logs <service-name>"
echo "2. Verify application-docker.yml exists in each service"
echo "3. Check if services are exposing health endpoints"
echo "4. Review API Gateway routing configuration"

echo -e "\n${YELLOW}Common Diagnostic Commands:${NC}"
echo "• View all logs:        docker compose logs -f"
echo "• View specific service: docker compose logs -f trust-engine"
echo "• Check Kafka topics:   docker exec insight-x-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list"
echo "• Check databases:      docker exec insight-x-postgres-1 psql -U insightx -l"
echo "• Restart a service:    docker compose restart trust-engine"
