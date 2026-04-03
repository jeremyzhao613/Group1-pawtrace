#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="/opt/homebrew/opt/postgresql@16/bin"
PG_DATA="$ROOT_DIR/.local-pg/data"
PG_LOG="$ROOT_DIR/.local-pg/log/postgres.log"
PG_PORT="${PG_PORT:-55432}"

cmd="${1:-status}"

need_bin() {
  local b="$1"
  if ! command -v "$b" >/dev/null 2>&1; then
    echo "[local-db] missing command: $b"
    exit 1
  fi
}

need_pg_bin() {
  if [ ! -x "$PG_BIN/pg_ctl" ]; then
    echo "[local-db] PostgreSQL 16 not found at $PG_BIN"
    echo "Install with: brew install postgresql@16"
    exit 1
  fi
}

init_cluster() {
  need_pg_bin
  mkdir -p "$ROOT_DIR/.local-pg/log"
  if [ ! -d "$PG_DATA" ] || [ ! -f "$PG_DATA/PG_VERSION" ]; then
    echo "[local-db] initializing cluster at $PG_DATA"
    "$PG_BIN/initdb" -D "$PG_DATA" --auth=trust --username=pawtrace >/dev/null
  fi
}

start_db() {
  init_cluster
  if "$PG_BIN/pg_ctl" -D "$PG_DATA" status >/dev/null 2>&1; then
    echo "[local-db] already running"
  else
    echo "[local-db] starting on port $PG_PORT"
    "$PG_BIN/pg_ctl" -D "$PG_DATA" -l "$PG_LOG" -o "-p $PG_PORT" start >/dev/null
  fi
  "$PG_BIN/createdb" -h localhost -p "$PG_PORT" -U pawtrace pawtrace >/dev/null 2>&1 || true
  echo "[local-db] ready: postgresql://pawtrace@localhost:$PG_PORT/pawtrace"
}

stop_db() {
  need_pg_bin
  if "$PG_BIN/pg_ctl" -D "$PG_DATA" status >/dev/null 2>&1; then
    "$PG_BIN/pg_ctl" -D "$PG_DATA" stop -m fast >/dev/null
    echo "[local-db] stopped"
  else
    echo "[local-db] not running"
  fi
}

status_db() {
  need_pg_bin
  if "$PG_BIN/pg_ctl" -D "$PG_DATA" status >/dev/null 2>&1; then
    echo "[local-db] running on $PG_PORT"
  else
    echo "[local-db] stopped"
  fi
}

reset_db() {
  stop_db || true
  rm -rf "$ROOT_DIR/.local-pg"
  start_db
  echo "[local-db] reset done"
}

case "$cmd" in
  start) start_db ;;
  stop) stop_db ;;
  status) status_db ;;
  reset) reset_db ;;
  *)
    echo "Usage: scripts/local-db.sh [start|stop|status|reset]"
    exit 1
    ;;
esac
