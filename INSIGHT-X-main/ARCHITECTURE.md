# INSIGHT-X System Architecture

**Version:** 1.0  
**Last Updated:** February 9, 2025

---

## 1. Architecture Overview

INSIGHT-X is an insider threat detection and response platform built on an **event-driven**, **policy-governed** architecture with clear separation between signal ingestion, trust arbitration, and enforcement.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           INSIGHT-X ARCHITECTURE                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────────────────────┐ │
│  │   IAM/      │    │   Apache Kafka  │    │   Data Ingestion Service              │ │
│  │   DLP/      │───▶│   Event Bus     │───▶│   (Normalization, Enrichment)         │ │
│  │   Workflow  │    │   + Schema Reg  │    └──────────────────┬───────────────────┘ │
│  └─────────────┘    └─────────────────┘                       │                      │
│                                                                 │                      │
│         ┌───────────────┬───────────────────┬──────────────────▼─────────────────┐  │
│         │               │                   │  Trust & Risk Computation Engine    │  │
│         │               │                   │  (Cumulative Trust, Deviation, OPA) │  │
│         │               │                   └──────────────────┬─────────────────┘  │
│         │               │                                      │                     │
│         ▼               ▼                                      ▼                     │
│  ┌─────────────┐ ┌─────────────┐    ┌──────────────────────────────────────────────┐│
│  │ PostgreSQL  │ │ Neo4j Graph │    │ Intent Hypothesis │ Temporal Graph Service   ││
│  │ Trust Store │ │ Behavioral  │    │ Modeling Service  │ (Campaign Correlation)   ││
│  └─────────────┘ └─────────────┘    └──────────────────┬───────────────────────────┘│
│         │               │                              │                              │
│         └───────────────┼──────────────────────────────┘                              │
│                         │                                                             │
│                         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐│
│  │ Response Orchestration (Adaptive Controls, Canary, SOAR, Simulation)             ││
│  └─────────────────────────────────────────────────────────────────────────────────┘│
│                         │                                                             │
│  ┌──────────────────────┼──────────────────────────────────────────────────────────┐│
│  │                      ▼                                                            ││
│  │  Elasticsearch │ Decision Provenance │ React Security Operations UI               ││
│  └─────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Data Layer (Phase 2)

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Event Streaming** | Apache Kafka + Schema Registry | Ingestion, replay, event sourcing |
| **Trust & Risk Store** | PostgreSQL | User trust state, risk indicators, policy decisions |
| **Graph Intelligence** | Neo4j | User↔resource, behavioral relationships, kill-chain |
| **Search & Forensics** | Elasticsearch/OpenSearch | Case timelines, event search, provenance |
| **Object Storage** | S3-compatible | Raw event archives, append-only logs |

### 2.2 Backend Services (Phase 3)

| Service | Responsibility |
|---------|----------------|
| **Data Ingestion Service** | Kafka consumer, normalization, enrichment |
| **Trust & Risk Computation Engine** | Cumulative trust, temporal deviation, OPA integration |
| **Intent Hypothesis Modeling Service** | Multiple hypotheses, confidence bounds, corroboration |
| **Temporal Graph Intelligence Service** | Graph builder, kill-chain modeler, campaign correlation |
| **Adaptive Controls Engine** | Trust→control mapping, throttling, step-up auth |
| **Decision Provenance System** | Immutable logging, forensic reconstruction |

### 2.3 Frontend (Phase 6)

| Module | Purpose |
|--------|---------|
| **Dashboard** | KPIs, trust posture, campaign trends |
| **Case Management** | Case list, detail, campaign view |
| **Evidence Timeline** | Chronological events, filtering, export |
| **Trust State Visualization** | Trust score, timeline, history |
| **Intent Hypothesis Display** | Hypothesis comparison, confidence, evidence |
| **Provenance UI** | Decision viewer, policy trace, audit trail |

---

## 3. Directory Structure

```
INSIGHT-X/
├── docs/
│   ├── architecture/           # Architecture diagrams and specs
│   │   └── component-diagram.md
│   ├── api/                    # API specifications
│   │   └── openapi.yaml
│   └── deployment/             # Deployment guides
│       └── README.md
├── infrastructure/
│   ├── kubernetes/             # K8s manifests (namespace, configmap)
│   ├── helm/insightx/          # Helm charts
│   ├── observability/          # Prometheus, Grafana, OpenTelemetry
│   └── keycloak/               # Keycloak realm config
├── backend/                    # Java 21 + Spring Boot
│   ├── insightx-ingestion/     # Data Ingestion Service (FR-1.1–1.3)
│   ├── insightx-trust-engine/  # Trust & Risk Computation (FR-2.2–2.5)
│   ├── insightx-intent/        # Intent Hypothesis Modeling (FR-3.1–3.3)
│   ├── insightx-graph/         # Temporal Graph Intelligence (FR-4.1–4.4)
│   ├── insightx-controls/      # Adaptive Controls Engine (FR-5.1–5.4)
│   ├── insightx-provenance/    # Decision Provenance (FR-6.1–6.2)
│   └── insightx-api-gateway/   # REST/WebSocket API
├── frontend/insightx-ui/       # React + TypeScript + Vite + Tailwind
├── connectors/                 # External system connectors
│   ├── iam-connector/
│   ├── dlp-connector/
│   └── soar-connector/
├── policies/opa/               # OPA Rego policies
├── database/
│   ├── postgres/               # Schema migrations (Flyway)
│   ├── neo4j/                  # Graph schema
│   └── elasticsearch/          # Index mappings
├── kafka/                      # Topic configs, Avro schemas
├── tests/
│   ├── integration/
│   └── e2e/
├── scripts/                    # deploy.sh, etc.
├── docker-compose.yml          # Local dev stack
├── ARCHITECTURE.md
├── prd.md
├── TODO.md
└── README.md
```

---

## 4. Data Flow

1. **Ingestion**: Events flow from IAM/DLP/Workflow → Kafka (topic-per-signal-type).
2. **Enrichment**: Ingestion service normalizes and enriches with roles, entitlements, baselines.
3. **Trust Computation**: Engine computes trust state using PostgreSQL state + Neo4j graph.
4. **Policy Arbitration**: OPA evaluates trust decay, thresholds, response eligibility.
5. **Intent Modeling**: Hypotheses updated; evidence collected; ranking applied.
6. **Response**: Adaptive controls, canary, SOAR triggered per policy.
7. **Provenance**: Every decision logged immutably to Elasticsearch + PostgreSQL.

---

## 5. Technology Stack Summary

| Layer | Technology |
|-------|------------|
| Streaming | Apache Kafka, Avro/Protobuf |
| Backend | Java 21, Spring Boot, WebFlux, gRPC |
| Policy | Open Policy Agent (OPA) |
| Graph | Neo4j |
| Storage | PostgreSQL, S3-compatible |
| Search | Elasticsearch/OpenSearch |
| UI | React, TypeScript, Vite, Tailwind |
| Identity | Keycloak |
| Observability | OpenTelemetry, Prometheus, Grafana |
| Infra | Kubernetes, Helm |

---

## 6. Cross-Cutting Concerns

- **Security**: Keycloak RBAC, MFA, step-up auth, security vs HR visibility separation
- **Observability**: OpenTelemetry instrumentation, Prometheus metrics, Grafana dashboards
- **Compliance**: Data minimization, regional residency, bias monitoring, human-in-the-loop

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-02-09 | Initial architecture from TODO.md and PRD |
