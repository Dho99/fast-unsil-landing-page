#!/bin/sh
# Install system cron to auto-sync PDFs (BIMA/Hiliriset/BRIN) every 6 hours.
# Run once on the Linux server after deploying the app.
# Usage: bash scripts/setup-cron.sh
#
# Env (optional, for instant page refresh after sync):
#   SITE_URL=https://fast.unsil.ac.id REVALIDATE_SECRET=<secret> bash scripts/setup-cron.sh

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NODE_BIN="$(which node)"
# Pass SITE_URL/REVALIDATE_SECRET through to the cron job if set
CRON_ENV=""
if [ -n "$SITE_URL" ]; then CRON_ENV="SITE_URL=$SITE_URL "; fi
if [ -n "$REVALIDATE_SECRET" ]; then CRON_ENV="${CRON_ENV}REVALIDATE_SECRET=$REVALIDATE_SECRET "; fi
CRON_LINE="0 */6 * * * cd $SCRIPT_DIR && ${CRON_ENV}$NODE_BIN scripts/download-all-pdfs.mjs >> /var/log/pdf-sync.log 2>&1"

# Remove any existing entry for this script, then add the new one
(crontab -l 2>/dev/null | grep -v "download-all-pdfs"; echo "$CRON_LINE") | crontab -

echo "Cron installed:"
echo "  $CRON_LINE"
echo ""
echo "To verify: crontab -l"
echo "Logs will appear at: /var/log/pdf-sync.log"
