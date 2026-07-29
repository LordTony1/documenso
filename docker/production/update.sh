#!/usr/bin/env bash
#
# Pull the newest image built by .github/workflows/build-image.yml and restart.
#
# Run from the server:  ./docker/production/update.sh
#
# Takes a database dump first, because `up -d` recreates the app container and
# that boot runs `prisma migrate deploy` (see docker/start.sh) — schema changes
# are not reversible by rolling the image back.

set -euo pipefail

cd "$(dirname "$0")"

COMPOSE="docker compose -f compose.selfhost.yml"
BACKUP_DIR="${HOME}/documenso-backups"

echo "==> Disk before update"
df -h / | tail -1

echo "==> Backing up database"
mkdir -p "${BACKUP_DIR}"
STAMP="$(date +%F-%H%M)"
# Single-quoted so the variables expand inside the container, which already has
# them from compose. Sourcing .env here instead would break on any unquoted
# value containing spaces (e.g. SMTP_FROM_NAME).
${COMPOSE} exec -T database \
  sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' \
  > "${BACKUP_DIR}/pre-update-${STAMP}.dump"
echo "    saved ${BACKUP_DIR}/pre-update-${STAMP}.dump ($(du -h "${BACKUP_DIR}/pre-update-${STAMP}.dump" | cut -f1))"

echo "==> Updating repo"
git pull --ff-only

echo "==> Pulling image"
${COMPOSE} pull documenso

echo "==> Restarting"
${COMPOSE} up -d

# Only after a successful `up` — the old image is the rollback target until then.
echo "==> Removing superseded images"
docker image prune -f

# Keep the last 10 dumps; the LXC disk is small.
ls -1t "${BACKUP_DIR}"/pre-update-*.dump 2>/dev/null | tail -n +11 | xargs -r rm --

echo "==> Done"
${COMPOSE} ps
df -h / | tail -1
