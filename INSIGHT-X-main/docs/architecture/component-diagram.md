# INSIGHT-X Component Diagram

See ARCHITECTURE.md for the main architecture overview.

## Key Components

1. **Data Ingestion** - Kafka consumers, normalization, enrichment
2. **Trust Engine** - Cumulative trust, OPA, temporal deviation
3. **Intent Service** - Hypothesis modeling, confidence bounds
4. **Graph Service** - Neo4j, kill-chain, campaign correlation
5. **Controls Engine** - Adaptive response, canary, SOAR
6. **Provenance** - Immutable logging, Elasticsearch
