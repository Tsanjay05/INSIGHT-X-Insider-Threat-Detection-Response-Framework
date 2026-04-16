# INSIGHT-X File Index

Complete list of generated architecture and project files.

## Root
- `ARCHITECTURE.md` - Main architecture document
- `README.md` - Project overview and quick start
- `docker-compose.yml` - Local dev stack (Kafka, Postgres, Neo4j, ES, Keycloak)

## Infrastructure
- `infrastructure/kubernetes/namespace.yaml`
- `infrastructure/kubernetes/configmap-base.yaml`
- `infrastructure/helm/insightx/Chart.yaml`
- `infrastructure/helm/insightx/values.yaml`
- `infrastructure/helm/insightx/templates/deployment.yaml`
- `infrastructure/observability/prometheus/rules/alerting-rules.yaml`
- `infrastructure/observability/grafana/dashboards/trust-evaluation.json`
- `infrastructure/observability/opentelemetry/otel-collector-config.yaml`
- `infrastructure/keycloak/realm-export.json`

## Backend (Java 21 + Spring Boot)
- `backend/pom.xml` - Parent POM
- `backend/insightx-ingestion/` - Data Ingestion Service
- `backend/insightx-trust-engine/` - Trust & Risk Engine
- `backend/insightx-intent/` - Intent Hypothesis Modeling
- `backend/insightx-graph/` - Temporal Graph Intelligence
- `backend/insightx-controls/` - Adaptive Controls Engine
- `backend/insightx-provenance/` - Decision Provenance
- `backend/insightx-api-gateway/` - REST/WebSocket API

## Frontend
- `frontend/insightx-ui/package.json`
- `frontend/insightx-ui/vite.config.ts`
- `frontend/insightx-ui/src/App.tsx`
- `frontend/insightx-ui/src/components/` - Layout, Sidebar, Header
- `frontend/insightx-ui/src/pages/` - Dashboard, ThreatMap, Cases, Users, Settings, Reports

## Database
- `database/postgres/V1__init_schema.sql`
- `database/neo4j/schema.cypher`
- `database/elasticsearch/case-timeline-mapping.json`
- `database/elasticsearch/decision-provenance-mapping.json`

## Kafka
- `kafka/topics.yaml`
- `kafka/schemas/event.avsc`

## Policies (OPA)
- `policies/opa/trust_decay.rego`
- `policies/opa/risk_thresholds.rego`
- `policies/opa/human_in_loop.rego`

## Connectors
- `connectors/iam-connector/README.md`
- `connectors/dlp-connector/README.md`
- `connectors/soar-connector/README.md`

## Docs
- `docs/architecture/component-diagram.md`
- `docs/api/openapi.yaml`
- `docs/deployment/README.md`

## Tests & Scripts
- `tests/integration/README.md`
- `tests/e2e/README.md`
- `scripts/deploy.sh`
