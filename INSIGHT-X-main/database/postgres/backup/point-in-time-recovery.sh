#!/bin/bash
# INSIGHT-X PostgreSQL Point-in-Time Recovery Script
# Restore database to a specific point in time

set -e
set -u
set -o pipefail

# Configuration
BACKUP_DIR="/var/backups/postgresql"
S3_BUCKET="s3://insightx-postgres-backups"
POSTGRES_DATA_DIR="/var/lib/postgresql/data"

# Logging
LOG_FILE="/var/log/postgresql/pitr.log"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Usage
usage() {
    cat <<EOF
Usage: $0 -t TARGET_TIME [OPTIONS]

Perform Point-in-Time Recovery (PITR) for PostgreSQL.

REQUIRED:
    -t TARGET_TIME    Target recovery time (format: 'YYYY-MM-DD HH:MM:SS')

OPTIONS:
    -b BACKUP_NAME    Specific backup to restore from
    -d DATA_DIR       PostgreSQL data directory (default: $POSTGRES_DATA_DIR)
    -h                Show this help message

EXAMPLES:
    # Restore to 2 hours ago
    $0 -t "$(date -d '2 hours ago' '+%Y-%m-%d %H:%M:%S')"

    # Restore to specific time
    $0 -t "2026-02-10 12:00:00"

    # Restore from specific backup to specific time
    $0 -b base_backup_20260209_000000 -t "2026-02-10 12:00:00"
EOF
    exit 1
}

# Parse arguments
TARGET_TIME=""
BACKUP_NAME=""

while getopts "t:b:d:h" opt; do
    case $opt in
        t) TARGET_TIME="$OPTARG" ;;
        b) BACKUP_NAME="$OPTARG" ;;
        d) POSTGRES_DATA_DIR="$OPTARG" ;;
        h) usage ;;
        *) usage ;;
    esac
done

if [ -z "$TARGET_TIME" ]; then
    echo "ERROR: Target time is required!"
    usage
fi

log "Starting Point-in-Time Recovery to: $TARGET_TIME"

# Validate target time format
if ! date -d "$TARGET_TIME" "+%Y-%m-%d %H:%M:%S" > /dev/null 2>&1; then
    log "ERROR: Invalid target time format!"
    exit 1
fi

# Convert to PostgreSQL timestamp format
TARGET_TIMESTAMP=$(date -d "$TARGET_TIME" "+%Y-%m-%d %H:%M:%S %Z")
log "Target timestamp: $TARGET_TIMESTAMP"

# Stop PostgreSQL
log "Stopping PostgreSQL service..."
systemctl stop postgresql || true

# Find appropriate base backup (must be older than target time)
if [ -z "$BACKUP_NAME" ]; then
    log "Finding appropriate base backup..."
    
    TARGET_EPOCH=$(date -d "$TARGET_TIME" +%s)
    
    while IFS= read -r backup; do
        BACKUP_NAME=$(echo "$backup" | awk '{print $2}' | sed 's:/::')
        BACKUP_TIMESTAMP=$(echo "$BACKUP_NAME" | sed 's/base_backup_//;s/_/ /')
        BACKUP_EPOCH=$(date -d "$BACKUP_TIMESTAMP" +%s 2>/dev/null || echo "0")
        
        if [ "$BACKUP_EPOCH" -lt "$TARGET_EPOCH" ]; then
            log "Selected backup: $BACKUP_NAME"
            break
        fi
    done < <(aws s3 ls "${S3_BUCKET}/" | grep "base_backup_" | sort -r)
    
    if [ -z "$BACKUP_NAME" ]; then
        log "ERROR: No suitable base backup found before target time!"
        exit 1
    fi
fi

# Download and extract base backup
RESTORE_DIR="${BACKUP_DIR}/pitr_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RESTORE_DIR"

log "Downloading base backup from S3..."
aws s3 sync "${S3_BUCKET}/${BACKUP_NAME}/" "$RESTORE_DIR/" --region us-east-1

# Backup current data directory
if [ -d "$POSTGRES_DATA_DIR" ]; then
    CURRENT_BACKUP="${POSTGRES_DATA_DIR}.pitr_backup.$(date +%Y%m%d_%H%M%S)"
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
    tar -xzf "$tarfile"
done

chown -R postgres:postgres "$POSTGRES_DATA_DIR"

# Create PITR recovery configuration
log "Configuring Point-in-Time Recovery..."

cat > "${POSTGRES_DATA_DIR}/recovery.signal" <<EOF
# Point-in-Time Recovery enabled
EOF

cat > "${POSTGRES_DATA_DIR}/postgresql.auto.conf" <<EOF
# Point-in-Time Recovery configuration
restore_command = 'aws s3 cp s3://insightx-postgres-wal-archive/%f %p --region us-east-1'
recovery_target_time = '$TARGET_TIMESTAMP'
recovery_target_action = 'promote'
recovery_target_timeline = 'latest'
EOF

log "PITR configuration created"
log "Recovery target: $TARGET_TIMESTAMP"

# Start PostgreSQL
log "Starting PostgreSQL for recovery..."
systemctl start postgresql

# Monitor recovery progress
log "Monitoring recovery progress..."
for i in {1..120}; do
    RECOVERY_STATUS=$(su - postgres -c "psql -t -c \"SELECT
 pg_is_in_recovery();\"" 2>/dev/null | xargs || echo "error")
    
    if [ "$RECOVERY_STATUS" = "f" ]; then
        log "Recovery completed! Database is now online."
        break
    fi
    
    if [ $i -eq 120 ]; then
        log "ERROR: Recovery did not complete within expected time!"
        exit 1
    fi
    
    if [ $((i % 10)) -eq 0 ]; then
        log "Still recovering... ($i/120)"
    fi
    
    sleep 5
done

# Get actual recovery time
ACTUAL_RECOVERY_TIME=$(su - postgres -c "psql -t -c \"SELECT pg_last_xact_replay_timestamp();\"" | xargs)
log "Actual recovery time: $ACTUAL_RECOVERY_TIME"

# Verify database
log "Verifying database integrity..."
su - postgres -c "psql -c 'SELECT version();'"
su - postgres -c "psql -d insightx_trust -c 'SELECT COUNT(*) FROM user_trust_state;'"

log "Point-in-Time Recovery completed successfully!"
log "Base backup used: $BACKUP_NAME"
log "Target time: $TARGET_TIMESTAMP"
log "Actual recovery time: $ACTUAL_RECOVERY_TIME"

# Clean up
rm -rf "$RESTORE_DIR"

exit 0
