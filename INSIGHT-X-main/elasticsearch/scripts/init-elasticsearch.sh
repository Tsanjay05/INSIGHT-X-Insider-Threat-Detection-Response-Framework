#!/bin/bash
# INSIGHT-X Elasticsearch Initialization Script
# Sets up index templates, ILM policies, and snapshot repository

set -e
set -u
set -o pipefail

# Configuration
ES_HOST="${ELASTICSEARCH_HOST:-localhost}"
ES_PORT="${ELASTICSEARCH_PORT:-9200}"
ES_URL="http://${ES_HOST}:${ES_PORT}"
ES_USER="${ELASTICSEARCH_USER:-elastic}"
ES_PASSWORD="${ELASTICSEARCH_PASSWORD}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Wait for Elasticsearch to be ready
log "Waiting for Elasticsearch to be ready..."
until curl -s -u "${ES_USER}:${ES_PASSWORD}" "${ES_URL}/_cluster/health" > /dev/null; do
    log "Elasticsearch not ready yet, waiting..."
    sleep 5
done
log "✓ Elasticsearch is ready"

# ============================================================================
# Create ILM Policies
# ============================================================================

log "Creating ILM policies..."

# Provenance ILM policy
log "Creating provenance ILM policy..."
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/_ilm/policy/insightx-provenance-policy" \
    -H 'Content-Type: application/json' \
    -d @"${SCRIPT_DIR}/../ilm/provenance-ilm-policy.json"

# Policy decisions ILM policy
log "Creating policy decisions ILM policy..."
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/_ilm/policy/insightx-policy-decisions-policy" \
    -H 'Content-Type: application/json' \
    -d @"${SCRIPT_DIR}/../ilm/policy-decisions-ilm-policy.json"

# Risk indicators ILM policy
log "Creating risk indicators ILM policy..."
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/_ilm/policy/insightx-risk-indicators-policy" \
    -H 'Content-Type: application/json' \
    -d @"${SCRIPT_DIR}/../ilm/risk-indicators-ilm-policy.json"

log "✓ ILM policies created"

# ============================================================================
# Create Index Templates
# ============================================================================

log "Creating index templates..."

# Provenance template
log "Creating provenance index template..."
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/_index_template/insightx-provenance-template" \
    -H 'Content-Type: application/json' \
    -d @"${SCRIPT_DIR}/../templates/provenance-template.json"

# Policy decisions template
log "Creating policy decisions index template..."
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/_index_template/insightx-policy-decisions-template" \
    -H 'Content-Type: application/json' \
    -d @"${SCRIPT_DIR}/../templates/policy-decisions-template.json"

# Risk indicators template
log "Creating risk indicators index template..."
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/_index_template/insightx-risk-indicators-template" \
    -H 'Content-Type: application/json' \
    -d @"${SCRIPT_DIR}/../templates/risk-indicators-template.json"

log "✓ Index templates created"

# ============================================================================
# Create Initial Indices with Aliases
# ============================================================================

log "Creating initial indices..."

# Create provenance index
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/insightx-provenance-000001" \
    -H 'Content-Type: application/json' \
    -d '{
      "aliases": {
        "insightx-provenance": {
          "is_write_index": true
        }
      }
    }'

# Create policy decisions index
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/insightx-policy-decisions-000001" \
    -H 'Content-Type: application/json' \
    -d '{
      "aliases": {
        "insightx-policy-decisions": {
          "is_write_index": true
        }
      }
    }'

# Create risk indicators index
curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/insightx-risk-indicators-000001" \
    -H 'Content-Type: application/json' \
    -d '{
      "aliases": {
        "insightx-risk-indicators": {
          "is_write_index": true
        }
      }
    }'

log "✓ Initial indices created"

# ============================================================================
# Create Snapshot Repository
# ============================================================================

log "Creating snapshot repository..."

curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/_snapshot/insightx-snapshots" \
    -H 'Content-Type: application/json' \
    -d @"${SCRIPT_DIR}/../snapshots/repository-config.json"

log "✓ Snapshot repository created"

# ============================================================================
# Create Snapshot Lifecycle Policy
# ============================================================================

log "Creating snapshot lifecycle policy..."

curl -X PUT -u "${ES_USER}:${ES_PASSWORD}" \
    "${ES_URL}/_slm/policy/insightx-daily-snapshots" \
    -H 'Content-Type: application/json' \
    -d @"${SCRIPT_DIR}/../snapshots/snapshot-policy.json"

log "✓ Snapshot lifecycle policy created"

# ============================================================================
# Verify Setup
# ============================================================================

log "Verifying setup..."

# Check cluster health
HEALTH=$(curl -s -u "${ES_USER}:${ES_PASSWORD}" "${ES_URL}/_cluster/health" | jq -r '.status')
log "Cluster health: $HEALTH"

# List ILM policies
log "ILM Policies:"
curl -s -u "${ES_USER}:${ES_PASSWORD}" "${ES_URL}/_ilm/policy" | jq 'keys'

# List index templates
log "Index Templates:"
curl -s -u "${ES_USER}:${ES_PASSWORD}" "${ES_URL}/_index_template" | jq '.index_templates[].name'

# List indices
log "Indices:"
curl -s -u "${ES_USER}:${ES_PASSWORD}" "${ES_URL}/_cat/indices/insightx-*?v"

# Check snapshot repository
log "Snapshot Repository:"
curl -s -u "${ES_USER}:${ES_PASSWORD}" "${ES_URL}/_snapshot/insightx-snapshots" | jq '.'

log "✓ Elasticsearch setup completed successfully!"

exit 0
