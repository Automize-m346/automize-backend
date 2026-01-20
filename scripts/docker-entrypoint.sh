#!/bin/sh

set -eu

echo "--- Docker entrypoint diagnostics ---"
echo "User: $(id -u -n 2>/dev/null || echo unknown)"
echo "Node: $(node --version 2>/dev/null || echo not-found)"
echo "NPM: $(npm --version 2>/dev/null || echo not-found)"
echo "PORT env: ${PORT:-<not-set>}"
echo "RUN_MIGRATIONS: ${RUN_MIGRATIONS:-0}"

echo "Listing /app contents:"
ls -la /app || true

echo "Checking dist/main.js presence:"
if [ -f /app/dist/main.js ]; then
  echo "dist/main.js exists"
else
  echo "dist/main.js NOT FOUND"
fi

if [ "$RUN_MIGRATIONS" = "1" ]; then
  echo "RUN_MIGRATIONS=1: running prisma migrate deploy"
  npm run prisma:migrate-prod || echo "prisma migrate failed"
fi

echo "Starting node dist/main.js"
exec node dist/main.js
