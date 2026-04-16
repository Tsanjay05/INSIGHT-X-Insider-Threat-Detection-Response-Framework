#!/bin/bash
# INSIGHT-X PostgreSQL Restore Script
# Restores from base backup with WAL recovery

set -e
set -u
set -o pipefail

# Configuration
BACKUP_DIR="/var/backups/postgresql"
S3_BUCKET="s3://insightx-postgres-backups"
POSTGRES_DATA_DIR="/var/lib/postgresql/data"
POSTGRES_USER="postgres"

# Logging
LOG_FILE="/var/log/postgresql/restore.log"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Usage
usage() {
    cat <<EOF
Usage: $0 [OPTIONS]

Restore PostgreSQL database from backup.

OPTIONS:
    -b BACKUP_NAME    Name of backup to restore (e.g., base_backup_20260210_120000)
    -d DATA_DIR       PostgreSQL data directory (default: $POSTGRES_DATA_DIR)
    -h                Show this help message

EXAMPLES:
    # Restore latest backup
    $0

    # Restore specific backup
    $0 -b base_backup_20260210_120000
EOF
    exit 1
}

# Parse arguments
BACKUP_NAME=""
while getopts "b:d:h" opt; do
    case $opt in
        b) BACKUP_NAME="$OPTARG" ;;
        d) POSTGRES_DATA_DIR="$OPTARG" ;;
        h) usage ;;
        *) usage ;;
    esac
done

log "Starting PostgreSQL restore..."

# Stop PostgreSQL if running
log "Stopping PostgreSQL service..."
systemctl stop postgresql || true

# If no backup specified, get latest
if [ -z "$BACKUP_NAME" ]; then
    log "No backup specified, finding latest backup..."
    BACKUP_NAME=$(aws s3 ls "${S3_BUCKET}/" | grep "base_backup_" | sort -r | head -n1 | awk '{print $2}' | sed 's:/::')
    if [ -z "$BACKUP_NAME" ]; then
        log "ERROR: No backups found in S3!"
        exit 1
    fi
    log "Latest backup: $BACKUP_NAME"
fi

# Download backup from S3
RESTORE_DIR="${BACKUP_DIR}/restore_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESTORE_DIR"

log "Downloading backup from S3..."
aws s3 sync "${S3_BUCKET}/${BACKUP_NAME}/" "$RESTORE_DIR/" --region us-east-1 2>&1 | tee -a "$LOG_FILE"

if [ $? -ne 0 ]; then
    log "ERROR: Failed to download backup from S3!"
    exit 1
fi

# Backup current data directory
if [ -d "$POSTGRES_DATA_DIR" ]; then
    CURRENT_BACKUP="${POSTGRES_DATA_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    log "Backing up current data directory to: $CURRENT_BACKUP"
    mv "$POSTGRES_DATA_DIR" "$CURRENT_BACKUP"
fi

# Create new data directory
mkdir -p "$POSTGRES_DATA_DIR"
chown -R postgres:postgres "$POSTGRES_DATA_DIR"
chmod 700 "$POSTGRES_DATA_DIR"

# Extract base backup
log "Extracting base backup..."
cd "$POSTGRES_DATA_DIR"

for tarfile in "$RESTORE_DIR"/*.tar.gz; do
    log "Extracting: $(basename $tarfile)"
    tar -xzf "$tarfile" 2>&1 | tee -a "$LOG_FILE"
done

# Set ownership
chown -R postgres:postgres "$POSTGRES_DATA_DIR"

# Create recovery configuration
log "Creating recovery configuration..."
cat > "${POSTGRES_DATA_DIR}/recovery.signal" <<EOF
# Recovery mode enabled
EOF

cat > "${POSTGRES_DATA_DIR}/postgresql.auto.conf" <<EOF
# Recovery configuration
restore_command = 'aws s3 cp s3://insightx-postgres-wal-archive/%f %p --region us-east-1'
recovery_target_timeline = 'latest'
EOF

log "Recovery configuration created"

# Start PostgreSQL in recovery mode
log "Starting PostgreSQL service..."
systemctl start postgresql

# Wait for recovery to complete
log "Waiting for recovery to complete..."
for i in {1..60}; do
    if su - postgres -c "psql -c 'SELECT pg_is_in_recovery();'" 2>/dev/null | grep -q "f"; then
        log "Recovery completed successfully!"
        break
    fi
    if [ $i -eq 60 ]; then
        log "ERROR: Recovery did not complete within expected time!"
        exit 1
    fi
    sleep 5
done

# Verify database
log "Verifying database integrity..."
su - postgres -c "psql -c 'SELECT version();'" 2>&1 | tee -a "$LOG_FILE"
su - postgres -c "psql -d insightx_trust -c 'SELECT COUNT(*) FROM user_trust_state;'" 2>&1 | tee -a "$LOG_FILE"

log "Restore completed successfully!"
log "Backup used: $BACKUP_NAME"
log "Data directory: $POSTGRES_DATA_DIR"

# Clean up restore directory
rm -rf "$RESTORE_DIR"

exit 0
