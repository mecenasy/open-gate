#!/usr/bin/env bash
# Uruchamia zrok tunele dla front (4002) i BFF (3001) z poziomu WSL.
# Używa natywnego linuxowego zrok-a (nie .exe z Windowsa) — brak interopu vsock,
# więc nohup ... & działa stabilnie. Konfig w ~/.zrok jest 1:1 zgodny z windowsowym.
#
# Wymagania:
#   - zrok w PATH (np. ~/.local/bin/zrok) lub przekaż ZROK_EXE=/sciezka/do/zrok
#   - ~/.zrok skopiowane z Windowsa albo zrok enable <token> raz
#   - docker compose up uruchomione (porty 3001, 4002 nasłuchują na 127.0.0.1)
#
# Użycie:
#   ./scripts/zrok-tunnels.sh                   # reserved (domyślnie) — stałe URL-e opengatebff/opengatefront
#   ./scripts/zrok-tunnels.sh --ephemeral       # losowe URL-e (nie używaj — .env wskazuje na reserved)
#   ./scripts/zrok-tunnels.sh --sync-env        # reserved + nadpisuje .env i restart front-service
#   ./scripts/zrok-tunnels.sh --keepalive       # dodatkowo pinguje co 30s żeby front-service nie zasypiał
#   ./scripts/zrok-tunnels.sh stop              # zatrzymuje uruchomione tunele (też sieroty)

set -euo pipefail

# Wybór binarki: ZROK_EXE > zrok w PATH > ~/.local/bin/zrok > .exe (fallback dla starych setupów)
default_zrok() {
  if command -v zrok >/dev/null 2>&1; then command -v zrok; return; fi
  if [ -x "$HOME/.local/bin/zrok" ]; then echo "$HOME/.local/bin/zrok"; return; fi
  echo "/mnt/c/Users/gajda/zrok.exe"
}
ZROK_EXE="${ZROK_EXE:-$(default_zrok)}"
EDGE_PORT="${EDGE_PORT:-3001}"
FRONT_PORT="${FRONT_PORT:-4002}"
BFF_NAME="${BFF_NAME:-opengatebff}"
FRONT_NAME="${FRONT_NAME:-opengatefront}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$REPO_ROOT/.zrok-run"
mkdir -p "$RUN_DIR"

RESERVED=1
SYNC_ENV=0
KEEPALIVE=0
ACTION="start"

for arg in "$@"; do
  case "$arg" in
    --reserved)   RESERVED=1 ;;
    --ephemeral)  RESERVED=0 ;;
    --sync-env)   SYNC_ENV=1 ;;
    --keepalive)  KEEPALIVE=1 ;;
    stop)         ACTION="stop" ;;
    -h|--help)
      sed -n '2,18p' "$0"; exit 0 ;;
    *)
      echo "Nieznany argument: $arg" >&2; exit 1 ;;
  esac
done

stop_tunnels() {
  # 1) procesy zarządzane przez skrypt (z .zrok-run/*.pid)
  for pidfile in "$RUN_DIR"/*.pid; do
    [ -e "$pidfile" ] || continue
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "[stop] kill $pid ($(basename "$pidfile" .pid))"
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$pidfile"
  done
  # 2) sieroty: dowolny zrok (linux lub .exe) z --headless <token> uruchomiony poza skryptem
  for token in "$BFF_NAME" "$FRONT_NAME"; do
    while read -r pid; do
      [ -n "$pid" ] || continue
      echo "[stop] kill orphan $pid (--headless $token)"
      kill "$pid" 2>/dev/null || true
    done < <(pgrep -af "zrok(\\.exe)?.*--headless[[:space:]]+${token}\\b" 2>/dev/null | awk '{print $1}')
  done
  sleep 0.3
}

if [ "$ACTION" = "stop" ]; then
  stop_tunnels
  echo "Zatrzymano."
  exit 0
fi

if [ ! -x "$ZROK_EXE" ] && [ ! -f "$ZROK_EXE" ]; then
  echo "Nie znaleziono zrok pod: $ZROK_EXE" >&2
  echo "Zainstaluj: curl -sL https://github.com/openziti/zrok/releases/download/v0.4.49/zrok_0.4.49_linux_amd64.tar.gz | tar -xzC ~/.local/bin/" >&2
  echo "Lub przekaż ZROK_EXE=/sciezka/do/zrok" >&2
  exit 1
fi

check_port() {
  local port="$1"
  if (echo > "/dev/tcp/127.0.0.1/$port") >/dev/null 2>&1; then return 0; else return 1; fi
}

check_port "$EDGE_PORT"  || echo "[ostrz] BFF (127.0.0.1:$EDGE_PORT) nie odpowiada — odpal docker compose up edge"
check_port "$FRONT_PORT" || echo "[ostrz] Front (127.0.0.1:$FRONT_PORT) nie odpowiada — odpal docker compose up front-service"

# zatrzymujemy stare procesy żeby nie mnożyć tuneli
stop_tunnels

reserved_url() {
  echo "https://${1}.share.zrok.io"
}

start_share() {
  local logname="$1"; shift
  local logfile="$RUN_DIR/$logname.log"
  local pidfile="$RUN_DIR/$logname.pid"
  echo "[start] $logname  (log: $logfile)"
  nohup "$ZROK_EXE" "$@" </dev/null >"$logfile" 2>&1 &
  echo $! > "$pidfile"
}

if [ "$RESERVED" -eq 1 ]; then
  if [ "$SYNC_ENV" -eq 1 ]; then
    bff_url="$(reserved_url "$BFF_NAME")"
    front_host="${FRONT_NAME}.share.zrok.io"
    bff_host="${BFF_NAME}.share.zrok.io"
    allowed_origins="$front_host,$bff_host"
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

  start_share "bff"   share reserved --headless "$BFF_NAME"
  start_share "front" share reserved --headless "$FRONT_NAME"
else
  echo "Tryb ephemeral — losowe URL-e. Dla stałych użyj: --reserved --sync-env"
  start_share "bff"   share public --headless "http://127.0.0.1:$EDGE_PORT"
  start_share "front" share public --headless "http://127.0.0.1:$FRONT_PORT"
fi

if [ "$KEEPALIVE" -eq 1 ]; then
  ka_log="$RUN_DIR/keepalive.log"
  ka_pid="$RUN_DIR/keepalive.pid"
  echo "[keepalive] start (co 30s pinguje front + bff)"
  (
    while true; do
      curl -sS -m 25 -o /dev/null -w "$(date -Is) front %{http_code} %{time_total}s\n" "http://127.0.0.1:$FRONT_PORT/" >>"$ka_log" 2>&1 || true
      curl -sS -m 25 -o /dev/null -w "$(date -Is) bff   %{http_code} %{time_total}s\n" "http://127.0.0.1:$EDGE_PORT/health" >>"$ka_log" 2>&1 || true
      sleep 30
    done
  ) >/dev/null 2>&1 &
  echo $! > "$ka_pid"
fi

extract_url_from_log() {
  local logfile="$1"
  local url=""
  for _ in $(seq 1 30); do
    url="$(grep -oE 'https://[a-zA-Z0-9.-]+\.share\.zrok\.io' "$logfile" 2>/dev/null | head -n1 || true)"
    [ -n "$url" ] && { echo "$url"; return 0; }
    sleep 0.5
  done
  return 1
}

sleep 2
echo
if [ "$RESERVED" -eq 1 ]; then
  bff_url="$(reserved_url "$BFF_NAME")"
  front_url="$(reserved_url "$FRONT_NAME")"
else
  bff_url="$(extract_url_from_log "$RUN_DIR/bff.log" || echo '(nie udało się odczytać — sprawdź log)')"
  front_url="$(extract_url_from_log "$RUN_DIR/front.log" || echo '(nie udało się odczytać — sprawdź log)')"
fi
echo "URL-e tuneli:"
echo "  BFF   -> $bff_url   (lokalnie 127.0.0.1:$EDGE_PORT)"
echo "  Front -> $front_url (lokalnie 127.0.0.1:$FRONT_PORT)"
echo
echo "Binarka:             $ZROK_EXE"
echo "Tunele w tle. Logi:  $RUN_DIR/{bff,front}.log"
echo "Aby zatrzymać:       $0 stop"
if [ "$RESERVED" -eq 1 ]; then
  echo "Status:              $ZROK_EXE overview"
fi
