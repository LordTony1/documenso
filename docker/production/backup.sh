#!/usr/bin/env bash
#
# Nightly logical backup of the Documenso database.
#
# This is the portable layer on top of the Proxmox Backup Server snapshot:
# PBS restores the whole LXC onto Proxmox, this restores anywhere.
#
# Cron:
#   30 3 * * * /root/documenso/docker/production/backup.sh >> /var/log/documenso-backup.log 2>&1

set -euo pipefail

cd "$(dirname "$0")"

COMPOSE="docker compose -f compose.selfhost.yml"
BACKUP_DIR="${HOME}/documenso-backups"
KEEP=7

# Compose reads .env itself; this shell does not, and pg_dump needs the credentials.
set -a
# shellcheck disable=SC1091
. ./.env
set +a

mkdir -p "${BACKUP_DIR}"
STAMP="$(date +%F)"
TARGET="${BACKUP_DIR}/documenso-${STAMP}.dump"

echo "[$(date -Is)] starting backup"

# -Fc (custom format) rather than plain SQL + gzip:
#   * already compressed, so no separate gzip step
#   * pg_restore can then pull out a single table (-t) instead of all-or-nothing
#
# Write to .partial first so a run that dies midway cannot leave a truncated
# file that looks like a valid backup to the retention logic below.
${COMPOSE} exec -T database \
  pg_dump -U "${POSTGRES_USER}" -Fc "${POSTGRES_DB}" > "${TARGET}.partial"

mv "${TARGET}.partial" "${TARGET}"
echo "[$(date -Is)] wrote ${TARGET} ($(du -h "${TARGET}" | cut -f1))"

# Verify the dump is readable rather than trusting pg_dump's exit code alone.
# An unreadable backup discovered today beats one discovered during a restore.
if ! ${COMPOSE} exec -T database pg_restore --list < "${TARGET}" > /dev/null 2>&1; then
  echo "[$(date -Is)] ERROR: ${TARGET} failed verification" >&2
  exit 1
fi
echo "[$(date -Is)] verified"

# Retention. Never lets a bad day wipe history: only whole, verified files
# from previous runs are counted.
ls -1t "${BACKUP_DIR}"/documenso-*.dump 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  echo "[$(date -Is)] pruning ${old}"
  rm -- "${old}"
done

echo "[$(date -Is)] done; $(ls -1 "${BACKUP_DIR}"/documenso-*.dump | wc -l) backups, $(du -sh "${BACKUP_DIR}" | cut -f1) total"
