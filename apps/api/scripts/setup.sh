#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
API_DIR="$ROOT/apps/api"

cd "$ROOT"

node_major="$(node -p "process.versions.node.split('.')[0]")"
if [ "$node_major" -lt 22 ]; then
  echo "Node.js 22.5+ is required. Current: $(node --version)" >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Install with: npm install -g pnpm" >&2
  exit 1
fi

if [ ! -f "$API_DIR/.env" ]; then
  cp "$API_DIR/.env.example" "$API_DIR/.env"
  echo "Created apps/api/.env from .env.example"
fi

pnpm install
pnpm --filter @campusqr/api seed

echo "Setup complete. Run: pnpm --filter @campusqr/api start"
