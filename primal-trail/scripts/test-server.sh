#!/usr/bin/env bash
# Run the game server integration test against a throwaway Postgres database.
# Usage: PGURL=postgres://postgres@127.0.0.1:5432 scripts/test-server.sh
# Needs psql and deno on PATH.
set -euo pipefail
cd "$(dirname "$0")/.."
PGURL="${PGURL:-postgres://postgres@127.0.0.1:5432}"
DB=primal_trail_test
psql "$PGURL/postgres" -qc "drop database if exists $DB" -c "create database $DB"
psql "$PGURL/$DB" -q -v ON_ERROR_STOP=1 -f supabase/tests/auth_stub.sql -f supabase/migrations/*_init.sql
cd supabase/functions
PT_TEST_DATABASE_URL="$PGURL/$DB" deno test --config deno.json -A game/
