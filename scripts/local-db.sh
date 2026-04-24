#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="${PG_BIN:-}"
PG_DATA="$ROOT_DIR/.local-pg/data"
PG_LOG="$ROOT_DIR/.local-pg/log/postgres.log"
PG_PORT="${PG_PORT:-55432}"

cmd="${1:-status}"

find_pg_bin() {
  if [ -n "$PG_BIN" ] && [ -x "$PG_BIN/pg_ctl" ]; then
    echo "$PG_BIN"
    return
  fi

  for candidate in \
    "/opt/homebrew/opt/postgresql@16/bin" \
    "/usr/local/opt/postgresql@16/bin" \
    "$(command -v pg_ctl 2>/dev/null | xargs dirname 2>/dev/null || true)"
  do
    if [ -n "$candidate" ] && [ -x "$candidate/pg_ctl" ]; then
      echo "$candidate"
      return
    fi
  done

  echo "[local-db] PostgreSQL pg_ctl not found." >&2
  echo "[local-db] Install PostgreSQL 16, or run with PG_BIN=/path/to/postgres/bin." >&2
  echo "[local-db] macOS Homebrew: brew install postgresql@16" >&2
  exit 1
}

need_pg_bin() {
  PG_BIN="$(find_pg_bin)"
  for required in pg_ctl initdb createdb; do
    if [ ! -x "$PG_BIN/$required" ]; then
      echo "[local-db] missing $required in $PG_BIN"
      echo "[local-db] Set PG_BIN=/path/to/postgres/bin and retry."
      exit 1
    fi
  done
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
