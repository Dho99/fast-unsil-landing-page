#!/bin/sh
# Install system cron to auto-sync PDFs (BIMA/Hiliriset/BRIN) every 6 hours.
# Run once on the Linux server after deploying the app.
# Usage: bash scripts/setup-cron.sh
#
# Env (optional, for instant page refresh after sync):
#   SITE_URL=https://fast.unsil.ac.id REVALIDATE_SECRET=<secret> bash scripts/setup-cron.sh

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# Prefer nvm node if available, else system node — avoids 18 vs 22 mismatch
if [ -n "$NVM_DIR" ] && [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
fi
NODE_BIN="$(command -v node || which node)"
# Fallback: try common nvm path for dharmo
if [ ! -x "$NODE_BIN" ] && [ -x "$HOME/.nvm/versions/node/v22.22.3/bin/node" ]; then
    NODE_BIN="$HOME/.nvm/versions/node/v22.22.3/bin/node"
fi
# Warn if still old Node
NODE_VER="$($NODE_BIN -v 2>/dev/null || echo unknown)"
case "$NODE_VER" in
    v18.*) echo "WARNING: Node $NODE_VER detected — requires >=20 for undici File. Consider: nvm install 22 && nvm use 22" >&2 ;;
esac
# Pass SITE_URL/REVALIDATE_SECRET through to the cron job if set
CRON_ENV=""
if [ -n "$SITE_URL" ]; then CRON_ENV="SITE_URL=$SITE_URL "; fi
if [ -n "$REVALIDATE_SECRET" ]; then CRON_ENV="${CRON_ENV}REVALIDATE_SECRET=$REVALIDATE_SECRET "; fi
if [ -z "$SITE_URL" ]; then
    echo "NOTE: SITE_URL not set, cron will default to https://fast.unsil.ac.id (set SITE_URL env to override)" >&2
    CRON_ENV="SITE_URL=https://fast.unsil.ac.id ${CRON_ENV}"
fi
CRON_LINE="0 */6 * * * cd $SCRIPT_DIR && ${CRON_ENV}$NODE_BIN scripts/download-all-pdfs.mjs >> /var/log/pdf-sync.log 2>&1"

# Remove any existing entry for this script, then add the new one
(crontab -l 2>/dev/null | grep -v "download-all-pdfs"; echo "$CRON_LINE") | crontab -

echo "Cron installed:"
echo "  $CRON_LINE"
echo ""
echo "To verify: crontab -l"
echo "Logs will appear at: /var/log/pdf-sync.log"
