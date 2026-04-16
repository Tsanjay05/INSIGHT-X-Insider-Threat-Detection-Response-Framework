# INSIGHT-X Deployment Guide

## Prerequisites

- Kubernetes cluster
- Helm 3+
- Kafka, PostgreSQL, Neo4j, Elasticsearch (or use included Helm dependencies)

## Quick Start

```bash
helm install insightx ./infrastructure/helm/insightx -n insightx --create-namespace
```

## Observability

- Prometheus: metrics collection
- Grafana: dashboards (trust evaluation latency, policy execution, signal drift)
- OpenTelemetry: distributed tracing
