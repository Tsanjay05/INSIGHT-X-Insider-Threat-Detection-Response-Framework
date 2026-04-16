# INSIGHT-X Deployment Runbook

## Prerequisites

### Required Software
- Kubernetes cluster (v1.27+)
- Helm 3.12+
- kubectl configured with cluster access
- AWS CLI (for S3 backups)
- Docker (for local testing)

### Required Services
- PostgreSQL 15+ (or use managed service)
- Neo4j 5+ Enterprise
- Elasticsearch 8+
- Kafka 3.5+
- Keycloak 22+
- OPA (Open Policy Agent) 0.55+

---

## Phase 1: Infrastructure Setup

### 1.1 Create Kubernetes Namespaces

```bash
kubectl create namespace insightx-prod
kubectl create namespace insightx-staging
kubectl create namespace insightx-dev
kubectl create namespace insightx-data
```

### 1.2 Configure Secrets

Create secrets for each environment:

```bash
# Database secrets
kubectl create secret generic postgres-credentials \
  --from-literal=username=insightx_app \
  --from-literal=password='<SECURE_PASSWORD>' \
  -n insightx-prod

# Kafka secrets
kubectl create secret generic kafka-credentials \
  --from-literal=bootstrap-servers='kafka-broker-1:9092,kafka-broker-2:9092' \
  -n insightx-prod

# Keycloak admin
kubectl create secret generic keycloak-admin \
  --from-literal=username=admin \
  --from-literal=password='<KEYCLOAK_ADMIN_PASSWORD>' \
  -n insightx-prod
```

### 1.3 Deploy Helm Charts

```bash
# Production deployment
helm install insightx ./infrastructure/helm/insightx \
  --namespace insightx-prod \
  --values infrastructure/helm/insightx/values-production.yaml

# Staging deployment  
helm install insightx ./infrastructure/helm/insightx \
  --namespace insightx-staging \
  --values infrastructure/helm/insightx/values-staging.yaml
```

---

## Phase 2: Data Layer Setup

### 2.1 PostgreSQL Setup

```bash
# Apply migrations
cd database/postgres
flyway migrate -url=jdbc:postgresql://postgres-primary:5432/insightx_trust \
  -user=insightx_app -password='<PASSWORD>'

# Verify partitions
psql -h postgres-primary -U insightx_app -d insightx_trust \
  -c "SELECT tablename FROM pg_tables WHERE schemaname = 'partitions';"

# Configure replication
# On primary server
cp database/postgres/config/replication-primary.conf /etc/postgresql/postgresql.conf
systemctl restart postgresql

# On replica servers
cp database/postgres/config/replication-replica.conf /etc/postgresql/postgresql.conf
systemctl restart postgresql

# Start PgBouncer
cp database/postgres/pooling/pgbouncer.ini /etc/pgbouncer/
systemctl start pgbouncer
```

### 2.2 Neo4j Setup

```bash
# Initialize schema
cat database/neo4j/init_schema.cypher | cypher-shell \
  -u neo4j -p '<NEO4J_PASSWORD>' \
  -a bolt://neo4j-core-1:7687

# Load APOC procedures
cat database/neo4j/apoc-procedures.cypher | cypher-shell \
  -u neo4j -p '<NEO4J_PASSWORD>' \
  -a bolt://neo4j-core-1:7687

# Verify cluster status
echo "CALL dbms.cluster.overview();" | cypher-shell \
  -u neo4j -p '<NEO4J_PASSWORD>'
```

### 2.3 Elasticsearch Setup

```bash
# Run initialization script
cd elasticsearch/scripts
chmod +x init-elasticsearch.sh
ELASTICSEARCH_HOST=elasticsearch-master \
ELASTICSEARCH_PASSWORD='<ES_PASSWORD>' \
./init-elasticsearch.sh

# Verify indices
curl -u elastic:<PASSWORD> \
  http://elasticsearch-master:9200/_cat/indices/insightx-*?v
```

### 2.4 Kafka Setup

```bash
# Create topics
kubectl apply -f kafka/topics-complete.yaml -n insightx-data

# Verify topics
kafka-topics --bootstrap-server kafka-broker-1:9092 --list

# Register Avro schemas
for schema in kafka/schemas/*.avsc; do
  curl -X POST \
    -H "Content-Type: application/vnd.schemaregistry.v1+json" \
    --data @$schema \
    http://schema-registry:8081/subjects/$(basename $schema .avsc)/versions
done
```

---

## Phase 3: Application Deployment

### 3.1 Deploy Keycloak

```bash
# Import realm configuration
kubectl exec -n insightx-prod deployment/keycloak -- \
  /opt/keycloak/bin/kc.sh import \
  --file /tmp/realm-export-complete.json

# Verify realm
kubectl exec -n insightx-prod deployment/keycloak -- \
  /opt/keycloak/bin/kc.sh show realms
```

### 3.2 Deploy OPA Policies

```bash
# Create ConfigMap from policies
kubectl create configmap opa-policies \
  --from-file=policies/opa/ \
  -n insightx-prod

# Deploy OPA
kubectl apply -f infrastructure/opa/deployment.yaml -n insightx-prod
```

### 3.3 Deploy Microservices

Services will auto-deploy via Helm chart. Verify deployment:

```bash
# Check all pods are running
kubectl get pods -n insightx-prod

# Check HPAs
kubectl get hpa -n insightx-prod

# Check services
kubectl get svc -n insightx-prod
```

---

## Phase 4: Verification

### 4.1 Health Checks

```bash
# Check API Gateway
curl http://api-gateway.insightx-prod/actuator/health

# Check Trust Engine
curl http://trust-engine.insightx-prod/actuator/health

# Check all services
for svc in ingestion trust-engine intent graph controls provenance api-gateway; do
  echo "=== $svc ==="
  kubectl exec -n insightx-prod deployment/$svc -- \
    curl -s localhost:8080/actuator/health | jq .
done
```

### 4.2 Database Connectivity

```bash
# Test PostgreSQL
kubectl run -n insightx-prod psql-test --rm -it --restart=Never \
  --image=postgres:15 -- \
  psql -h postgres-primary -U insightx_app -d insightx_trust -c "SELECT version();"

# Test Neo4j
echo "RETURN 'Connected' AS status;" | kubectl exec -i -n insightx-data deployment/neo4j-core-1 -- \
  cypher-shell -u neo4j -p '<PASSWORD>'
```

### 4.3 Kafka Connectivity

```bash
# Produce test message
echo "test-message" | kubectl exec -i -n insightx-data deployment/kafka-broker-1 -- \
  kafka-console-producer --broker-list localhost:9092 --topic insightx.auth.events

# Consume test message
kubectl exec -n insightx-data deployment/kafka-broker-1 -- \
  kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic insightx.auth.events --from-beginning --max-messages 1
```

---

## Phase 5: Monitoring Setup

### 5.1 Verify Prometheus Scraping

```bash
# Check ServiceMonitors
kubectl get servicemonitors -n insightx-prod

# Check Prometheus targets
curl http://prometheus-server/api/v1/targets | jq '.data.activeTargets[] | select(.labels.namespace=="insightx-prod")'
```

### 5.2 Configure Grafana Dashboards

```bash
# Import dashboards
kubectl apply -f monitoring/grafana/dashboards/ -n monitoring
```

---

## Backup Configuration

### Daily Automated Backups

```bash
# PostgreSQL backup (run daily via cron)
0 2 * * * /var/scripts/postgres-backup.sh

# Neo4j backup (run daily via cron)
0 3 * * * /var/scripts/neo4j-backup.sh

# Elasticsearch snapshots (configured via SLM policy)
# Runs automatically at 2 AM daily
```

---

## Rollback Procedures

### Application Rollback

```bash
# Rollback to previous Helm release
helm rollback insightx -n insightx-prod

# Rollback specific service
helm upgrade insightx ./infrastructure/helm/insightx \
  --namespace insightx-prod \
  --reuse-values \
  --set trustEngine.image.tag=previous-version
```

### Database Rollback

```bash
# PostgreSQL: Restore from backup
cd database/postgres/backup
./restore.sh -b base_backup_20260210_020000

# PostgreSQL: Point-in-time recovery
./point-in-time-recovery.sh -t "2026-02-10 12:00:00"
```

---

## Troubleshooting

### Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n insightx-prod
kubectl logs <pod-name> -n insightx-prod --previous
```

**Database connection issues:**
```bash
# Check PgBouncer
pgbouncer -R -d /etc/pgbouncer/pgbouncer.ini

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log
```

**Kafka consumer lag:**
```bash
kafka-consumer-groups --bootstrap-server kafka-broker-1:9092 \
  --describe --group trust-engine-consumer-group
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

- **Trust Engine**: `trust.calculation.time`, `trust.score`
- **Events**: `events.processed` (by type and status)
- **Policies**: `policy.evaluation.time`
- **Health**: `health_check` (all components)
- **Circuit Breakers**: `resilience4j.circuitbreaker.state`

### Critical Alerts

1. **Service Down**: Any pod restart > 3 times in 10 minutes
2. **High Error Rate**: Error rate > 5% over 5 minutes
3. **Database Lag**: Replication lag > 10 seconds
4. **Kafka Lag**: Consumer lag > 1000 messages
5. **Disk Space**: < 20% free space

---

*Last Updated: 2026-02-10*
