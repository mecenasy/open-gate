#!/usr/bin/env bash
# Uruchamia zrok tunele dla front (4002) i BFF (3001) z poziomu WSL.
# Wywołuje zrok.exe z Windowsa (przez /mnt/c) — windowsowy zrok widzi
# porty dockera, bo Docker Desktop forwarduje 127.0.0.1 z WSL na host.
#
# Wymagania:
#   - zrok.exe pod /mnt/c/Users/gajda/zrok.exe (lub przekaż ZROK_EXE)
#   - zrok włączony (zrok.exe enable <token>) — jednorazowo
#   - docker compose up uruchomione (porty 3001, 4002 nasłuchują)
#
# Użycie:
#   ./scripts/zrok-tunnels.sh                   # ephemeral, losowe URL-e
#   ./scripts/zrok-tunnels.sh --reserved        # stałe URL-e
#   ./scripts/zrok-tunnels.sh --reserved --sync-env   # + nadpisuje .env i restart front-service
#   ./scripts/zrok-tunnels.sh stop              # zatrzymuje uruchomione tunele

set -euo pipefail

ZROK_EXE="${ZROK_EXE:-/mnt/c/Users/gajda/zrok.exe}"
BFF_PORT="${BFF_PORT:-3001}"
FRONT_PORT="${FRONT_PORT:-4002}"
BFF_NAME="${BFF_NAME:-opengatebff}"
FRONT_NAME="${FRONT_NAME:-opengatefront}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$REPO_ROOT/.zrok-run"
mkdir -p "$RUN_DIR"

RESERVED=0
SYNC_ENV=0
KEEPALIVE=0
ACTION="start"

for arg in "$@"; do
  case "$arg" in
    --reserved)   RESERVED=1 ;;
    --sync-env)   SYNC_ENV=1 ;;
    --keepalive)  KEEPALIVE=1 ;;
    stop)         ACTION="stop" ;;
    -h|--help)
      sed -n '2,20p' "$0"; exit 0 ;;
    *)
      echo "Nieznany argument: $arg" >&2; exit 1 ;;
  esac
done

stop_tunnels() {
  for pidfile in "$RUN_DIR"/*.pid; do
    [ -e "$pidfile" ] || continue
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "[stop] kill $pid ($(basename "$pidfile" .pid))"
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pidfile"
  done
}

if [ "$ACTION" = "stop" ]; then
  stop_tunnels
  echo "Zatrzymano."
  exit 0
fi

if [ ! -x "$ZROK_EXE" ] && [ ! -f "$ZROK_EXE" ]; then
  echo "Nie znaleziono zrok.exe pod: $ZROK_EXE" >&2
  echo "Ustaw zmienną ZROK_EXE=/mnt/c/sciezka/do/zrok.exe" >&2
  exit 1
fi

check_port() {
  local port="$1"
  if (echo > "/dev/tcp/127.0.0.1/$port") >/dev/null 2>&1; then return 0; else return 1; fi
}

check_port "$BFF_PORT"   || echo "[ostrz] BFF (127.0.0.1:$BFF_PORT) nie odpowiada — odpal docker compose up bff-service"
check_port "$FRONT_PORT" || echo "[ostrz] Front (127.0.0.1:$FRONT_PORT) nie odpowiada — odpal docker compose up front-service"

# zatrzymujemy stare procesy żeby nie mnożyć tuneli
stop_tunnels

ensure_reserved() {
  local name="$1" port="$2"
  echo "[reserved] zapewniam $name -> http://127.0.0.1:$port"
  local out
  if out="$("$ZROK_EXE" reserve public --unique-name "$name" "http://127.0.0.1:$port" 2>&1)"; then
    echo "$out"
  else
    if echo "$out" | grep -qiE 'conflict|409|already'; then
      echo "[reserved] $name już istnieje — pomijam"
    else
      echo "$out" >&2
      echo "Nie udało się zarezerwować $name" >&2
      return 1
    fi
  fi
}

reserved_url() {
  # publiczny frontend zroka: https://<token>.share.zrok.io
  local name="$1"
  echo "https://${name}.share.zrok.io"
}

start_share() {
  local logname="$1"; shift
  local logfile="$RUN_DIR/$logname.log"
  local pidfile="$RUN_DIR/$logname.pid"
  echo "[start] $logname  (log: $logfile)"
  nohup "$ZROK_EXE" "$@" > "$logfile" 2>&1 &
  echo $! > "$pidfile"
}

if [ "$RESERVED" -eq 1 ]; then
  ensure_reserved "$BFF_NAME"   "$BFF_PORT"
  ensure_reserved "$FRONT_NAME" "$FRONT_PORT"

  if [ "$SYNC_ENV" -eq 1 ]; then
    bff_url="$(reserved_url "$BFF_NAME" || true)"
    front_host="${FRONT_NAME}.share.zrok.io"
    bff_host="${BFF_NAME}.share.zrok.io"
    allowed_origins="$front_host,$bff_host"

    if [ -z "${bff_url:-}" ]; then
      echo "Nie udało się odczytać URL dla $BFF_NAME. Sprawdź: $ZROK_EXE overview" >&2
      exit 1
    fi
    env_file="$REPO_ROOT/.env"
    [ -f "$env_file" ] || { echo "Brak .env w $REPO_ROOT" >&2; exit 1; }

    set_env() {
      local key="$1" val="$2"
      if grep -q "^${key}=" "$env_file"; then
        sed -i "s|^${key}=.*|${key}=${val}|" "$env_file"
      else
        printf '\n%s=%s\n' "$key" "$val" >> "$env_file"
      fi
    }

    echo "[env] NEXT_PUBLIC_API_HOST_URL=$bff_url"
    set_env NEXT_PUBLIC_API_HOST_URL "$bff_url"
    echo "[env] NEXT_DEV_ALLOWED_ORIGINS=$allowed_origins"
    set_env NEXT_DEV_ALLOWED_ORIGINS "$allowed_origins"

    echo "[docker] up -d front-service (recreate, żeby wstrzyknąć nowe env z compose)"
    (cd "$REPO_ROOT" && docker compose up -d --force-recreate --no-deps front-service)
  fi

  start_share "bff"   share reserved "$BFF_NAME"
  start_share "front" share reserved "$FRONT_NAME"
else
  echo "Tryb ephemeral — losowe URL-e. Dla stałych użyj: --reserved --sync-env"
  start_share "bff"   share public "http://127.0.0.1:$BFF_PORT"
  start_share "front" share public "http://127.0.0.1:$FRONT_PORT"
fi

if [ "$KEEPALIVE" -eq 1 ]; then
  ka_log="$RUN_DIR/keepalive.log"
  ka_pid="$RUN_DIR/keepalive.pid"
  echo "[keepalive] start (co 30s pinguje front + bff)"
  (
    while true; do
      curl -fsS -m 25 -o /dev/null "http://127.0.0.1:$FRONT_PORT/" 2>>"$ka_log" || echo "$(date -Is) front fail" >> "$ka_log"
      curl -fsS -m 25 -o /dev/null "http://127.0.0.1:$BFF_PORT/health" 2>>"$ka_log" || echo "$(date -Is) bff fail" >> "$ka_log"
      sleep 30
    done
  ) >/dev/null 2>&1 &
  echo $! > "$ka_pid"
fi

sleep 2
echo
echo "Tunele uruchomione w tle. Logi: $RUN_DIR/{bff,front}.log"
echo "Aby zobaczyć URL-e:  tail -f $RUN_DIR/bff.log $RUN_DIR/front.log"
echo "Aby zatrzymać:       $0 stop"
if [ "$RESERVED" -eq 1 ]; then
  echo "Lub:                 $ZROK_EXE overview"
fi
