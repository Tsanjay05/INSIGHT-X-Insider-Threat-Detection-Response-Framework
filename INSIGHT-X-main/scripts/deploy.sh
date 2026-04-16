#!/bin/bash
# INSIGHT-X deployment script

set -e

NAMESPACE="${1:-insightx}"

echo "Deploying INSIGHT-X to namespace: $NAMESPACE"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install insightx ./infrastructure/helm/insightx -n "$NAMESPACE"
echo "Deployment complete."
