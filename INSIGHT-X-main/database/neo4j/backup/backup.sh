#!/bin/bash
# INSIGHT-X Neo4j Backup Script
# Enterprise backup with online consistency check

set -e
set -u
set -o pipefail

# Configuration
NEO4J_HOME="/var/lib/neo4j"
BACKUP_DIR="/var/backups/neo4j"
S3_BUCKET="s3://insightx-neo4j-backups"
DATABASE_NAME="insightx"
NEO4J_HOST="neo4j-core-1"
NEO4J_PORT="6362"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="neo4j_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Logging
LOG_FILE="/var/log/neo4j/backup.log"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting Neo4j backup: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Perform online backup using neo4j-admin
log "Running neo4j-admin backup..."
neo4j-admin database backup \
    --to-path="$BACKUP_PATH" \
    --database="$DATABASE_NAME" \
    --verbose 2>&1 | tee -a "$LOG_FILE"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    log "ERROR: neo4j-admin backup failed!"
    exit 1
fi

log "Backup completed successfully"

# Verify backup integrity
log "Verifying backup integrity..."
neo4j-admin database check \
    --from-path="${BACKUP_PATH}/${DATABASE_NAME}" \
    --verbose 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "✓ Backup integrity verified"
else
    log "✗ ERROR: Backup integrity check failed!"
    exit 1
fi

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Compress backup
log "Compressing backup..."
tar -czf "${BACKUP_PATH}.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
rm -rf "$BACKUP_PATH"

# Upload to S3
log "Uploading backup to S3..."
aws s3 cp "${BACKUP_PATH}.tar.gz" \
    "${S3_BUCKET}/${BACKUP_NAME}.tar.gz" \
    --storage-class STANDARD_IA \
    --region us-east-1 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "Backup uploaded to S3 successfully"
else
    log "ERROR: S3 upload failed!"
    exit 1
fi

# Clean up old local backups (keep last 7 days)
log "Cleaning up old local backups..."
find "$BACKUP_DIR" -name "neo4j_backup_*.tar.gz" -type f -mtime +7 -delete

# Clean up old S3 backups (keep last 30 days)
RETENTION_DAYS=30
log "Cleaning up old S3 backups (older than ${RETENTION_DAYS} days)..."
CUTOFF_DATE=$(date -d "${RETENTION_DAYS} days ago" +%Y%m%d)

aws s3 ls "${S3_BUCKET}/" | grep "neo4j_backup_" | while read -r line; do
    BACKUP_FILE=$(echo "$line" | awk '{print $4}')
    BACKUP_DATE=$(echo "$BACKUP_FILE" | sed 's/neo4j_backup_//;s/_.*//')
    
    if [ "$BACKUP_DATE" -lt "$CUTOFF_DATE" ]; then
        log "Deleting old backup: $BACKUP_FILE"
        aws s3 rm "${S3_BUCKET}/${BACKUP_FILE}" --region us-east-1
    fi
done

log "Backup completed: $BACKUP_NAME"
log "Location: ${S3_BUCKET}/${BACKUP_NAME}.tar.gz"

exit 0
