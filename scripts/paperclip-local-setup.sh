#!/usr/bin/env bash
# Run on the machine that can reach YOUR Paperclip instance (localhost:3100, Zeabur URL, etc.)
# Usage:
#   export PAPERCLIP_API_BASE="https://YOUR-PAPERCLIP-DOMAIN"
#   export PAPERCLIP_API_KEY="pcp_..."
#   ./scripts/paperclip-local-setup.sh

set -euo pipefail

: "${PAPERCLIP_API_BASE:?Set PAPERCLIP_API_BASE (e.g. http://localhost:3100 or your Zeabur URL)}"
: "${PAPERCLIP_API_KEY:?Set PAPERCLIP_API_KEY (board token from Paperclip Settings)}"

CLI=(npx paperclipai --api-base "$PAPERCLIP_API_BASE" --api-key "$PAPERCLIP_API_KEY")

echo "==> Testing Paperclip API..."
"${CLI[@]}" company list --json | head -c 400
echo

echo "==> Current company..."
COMPANY_JSON=$("${CLI[@]}" company current --json 2>/dev/null || "${CLI[@]}" company list --json)
echo "$COMPANY_JSON" | head -c 800
echo

COMPANY_ID=$(echo "$COMPANY_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); const c=Array.isArray(d)?d[0]:d; console.log(c?.id||'');")
if [[ -z "$COMPANY_ID" ]]; then
  echo "ERROR: Could not resolve company id. Pass -C manually to CLI commands."
  exit 1
fi

echo "==> Listing agents..."
"${CLI[@]}" agent list -C "$COMPANY_ID" --json || true

echo "==> Listing projects..."
"${CLI[@]}" project list -C "$COMPANY_ID" --json || true

echo
echo "Manual UI steps still required (or extend this script):"
echo "  1. Hire CMO and UXDesigner agents (PSI-94 / PSI-112)"
echo "  2. Create/update FabricaDeContenido project:"
echo "     repoUrl=https://github.com/luigiraffaelesianocanoro/fabricadecontenido.git"
echo "     repoRef=main, workspace mode=Isolated"
echo "  3. Add company secrets: GITHUB_TOKEN, GH_TOKEN"
echo "  4. Add project env: DATABASE_URL, ENCRYPTION_MASTER_KEY, NEXT_PUBLIC_APP_URL"
echo "  5. Fix PAPERCLIP_API_URL on cloud agents (must not be 127.0.0.1 from remote runtimes)"
