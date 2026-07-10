#!/bin/sh
# Install system cron to auto-sync BIMA PDFs every 6 hours.
# Run once on the Linux server after deploying the app.
# Usage: bash scripts/setup-cron.sh

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NODE_BIN="$(which node)"
CRON_LINE="0 */6 * * * cd $SCRIPT_DIR && $NODE_BIN scripts/download-bima-pdfs.mjs >> /var/log/bima-pdf-sync.log 2>&1"

# Remove any existing entry for this script, then add the new one
(crontab -l 2>/dev/null | grep -v "download-bima-pdfs"; echo "$CRON_LINE") | crontab -

echo "Cron installed:"
echo "  $CRON_LINE"
echo ""
echo "To verify: crontab -l"
echo "Logs will appear at: /var/log/bima-pdf-sync.log"
