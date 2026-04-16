#!/bin/bash
# INSIGHT-X PostgreSQL Backup Script
# Performs daily base backup with continuous WAL archiving

set -e
set -u
set -o pipefail

# Configuration
BACKUP_DIR="/var/backups/postgresql"
S3_BUCKET="s3://insightx-postgres-backups"
POSTGRES_USER="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
RETENTION_DAYS=30

# Timestamp for backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="base_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Logging
LOG_FILE="/var/log/postgresql/backup.log"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting PostgreSQL backup: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_PATH"

# Perform base backup using pg_basebackup
log "Running pg_basebackup..."
pg_basebackup \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -D "$BACKUP_PATH" \
    -Ft \
    -z \
    -P \
    -X stream \
    --checkpoint=fast \
    --label="$BACKUP_NAME" 2>&1 | tee -a "$LOG_FILE"

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    log "ERROR: pg_basebackup failed!"
    exit 1
fi

log "Base backup completed successfully"

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Upload to S3
log "Uploading backup to S3..."
aws s3 sync "$BACKUP_PATH" "${S3_BUCKET}/${BACKUP_NAME}/" \
    --storage-class STANDARD_IA \
    --region us-east-1 2>&1 | tee -a "$LOG_FILE"

if [ $? -eq 0 ]; then
    log "Backup uploaded to S3 successfully"
else
    log "ERROR: S3 upload failed!"
    exit 1
fi

# Create backup metadata
cat > "${BACKUP_PATH}/backup_metadata.json" <<EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$TIMESTAMP",
  "size": "$BACKUP_SIZE",
  "postgres_version": "$(psql -U $POSTGRES_USER -h $POSTGRES_HOST -p $POSTGRES_PORT -t -c 'SELECT version();' | xargs)",
  "s3_location": "${S3_BUCKET}/${BACKUP_NAME}/",
  "retention_days": $RETENTION_DAYS
}
EOF

# Upload metadata to S3
aws s3 cp "${BACKUP_PATH}/backup_metadata.json" \
    "${S3_BUCKET}/${BACKUP_NAME}/backup_metadata.json" \
    --region us-east-1

# Clean up old local backups (keep last 7 days)
log "Cleaning up old local backups..."
find "$BACKUP_DIR" -name "base_backup_*" -type d -mtime +7 -exec rm -rf {} \; 2>&1 | tee -a "$LOG_FILE"

# Clean up old S3 backups (keep based on retention policy)
log "Cleaning up old S3 backups (older than ${RETENTION_DAYS} days)..."
CUTOFF_DATE=$(date -d "${RETENTION_DAYS} days ago" +%Y%m%d)

aws s3 ls "${S3_BUCKET}/" | grep "base_backup_" | while read -r line; do
    BACKUP_DATE=$(echo "$line" | awk '{print $2}' | sed 's/base_backup_//;s/_.*//;s/-//g')
    if [ "$BACKUP_DATE" -lt "$CUTOFF_DATE" ]; then
        BACKUP_TO_DELETE=$(echo "$line" | awk '{print $2}')
        log "Deleting old backup: $BACKUP_TO_DELETE"
        aws s3 rm "${S3_BUCKET}/${BACKUP_TO_DELETE}" --recursive --region us-east-1
    fi
done

# Verify backup integrity
log "Verifying backup integrity..."
cd "$BACKUP_PATH"
for tarfile in *.tar.gz; do
    if tar -tzf "$tarfile" > /dev/null 2>&1; then
        log "✓ $tarfile is valid"
    else
        log "✗ ERROR: $tarfile is corrupted!"
        exit 1
    fi
done

log "Backup completed successfully: $BACKUP_NAME"
log "Location: ${S3_BUCKET}/${BACKUP_NAME}/"

# Send notification (optional - integrate with monitoring)
# curl -X POST "$SLACK_WEBHOOK_URL" -d "{\"text\": \"PostgreSQL backup completed: $BACKUP_NAME\"}"

exit 0
