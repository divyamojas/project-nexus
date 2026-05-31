#!/bin/bash
# dev.sh — Leaflet local stack orchestrator

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/project-nexus-light"
BACKEND_DIR="$ROOT_DIR/project-nexus-source"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
LOG_DIR="$ROOT_DIR/logs"
LOG_FILE="$LOG_DIR/dev-$(date +%Y-%m-%dT%H-%M-%S).log"
SCRIPT_START_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
STARTUP_FAILED=false
VERBOSE=false

FRONTEND_REMOTE="${LEAFLET_FRONTEND_REMOTE:-https://github.com/divyamojas/project-nexus-light.git}"
BACKEND_REMOTE="${LEAFLET_BACKEND_REMOTE:-https://github.com/divyamojas/project-nexus-source.git}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Ordered list of actions to execute — populated by parse_args or the interactive menu
ACTIONS=()

# Other command flags
MODE="queue"       # queue | status | logs | doctor | test | attach | push | help
LOGS_SERVICE=""
LOGS_NOW=false     # --now: anchor to current time instead of container start time
ATTACH_SERVICE="nexus-light"
PUSH_BRANCH=""
COMPOSE_ARGS=()
_BACKEND_ENABLED=false

# ─── Logging helpers ──────────────────────────────────────────────────────────

log() {
  mkdir -p "$LOG_DIR" > /dev/null 2>&1 || true
  echo "[$(date +%Y-%m-%dT%H:%M:%S)] $1" >> "$LOG_FILE"
}

say() {
  echo -e "$1"
  log "$(echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g')"
}

step() {
  local n=$((${#ACTIONS[@]} > 1 ? 1 : 0))  # only number steps when doing multiple actions
  echo ""
  if [ "$n" -gt 0 ]; then
    say "${CYAN}▸ $1${NC}"
  else
    say "${CYAN}[ $((++_STEP)) ] $1${NC}"
  fi
}
_STEP=0

ok()   { say "${GREEN}      ✓ $1${NC}"; }
info() { say "      $1"; }
fail() { say "${RED}ERROR: $1${NC}"; exit 1; }

# ─── Usage ────────────────────────────────────────────────────────────────────

print_usage() {
  cat <<EOF
Usage: ./dev.sh [actions...] [command]

  (no args)         Interactive menu — pick actions by number
  --start           Start the stack (build + up + follow logs)
  -s / --stop       Stop and remove containers
  -v / --volumes    Stop containers and wipe DB volumes
  -i / --images     Stop containers and remove local images
  -p / --prune      Prune Docker build cache
  -l / --clear-logs Clear all container log buffers

  Actions execute in the order they are given:
    ./dev.sh -v -i -p --start     wipe → remove images → prune → start
    ./dev.sh -p --start           prune cache → start

Other commands (run alone):
  --status          Show service status
  --logs            Tail logs since containers last started
  --logs=NAME       Tail logs for a specific service since containers last started
  --logs --now      Tail from this moment only (re-anchor after Ctrl+C)
  --doctor          Run environment diagnostics
  --test            Run the backend test suite
  --exec            Shell into the frontend container
  --exec=NAME       Shell into a named container (e.g. nexus-source)
  --push            Push all repos to origin/main
  --push=BRANCH     Push all repos to a specific branch
  --help            Show this help
  --verbose         Print docker commands before running them
EOF
}

# ─── Arg parsing ──────────────────────────────────────────────────────────────

parse_args() {
  if [ "$#" -eq 0 ]; then
    MODE="menu"
    return
  fi

  local arg
  for arg in "$@"; do
    case "$arg" in
      --start)         ACTIONS+=("start") ;;
      -s|--stop)       ACTIONS+=("stop") ;;
      -v|--volumes)    ACTIONS+=("volumes") ;;
      -i|--images)     ACTIONS+=("images") ;;
      -p|--prune)      ACTIONS+=("prune") ;;
      -l|--clear-logs) ACTIONS+=("clearlogs") ;;
      --status)      MODE="status" ;;
      --logs)        MODE="logs" ;;
      --logs=*)      MODE="logs"; LOGS_SERVICE="${arg#--logs=}" ;;
      --now)         LOGS_NOW=true ;;
      --doctor)      MODE="doctor" ;;
      --test)        MODE="test" ;;
      --exec)        MODE="attach"; ATTACH_SERVICE="nexus-light" ;;
      --exec=*)      MODE="attach"; ATTACH_SERVICE="${arg#--exec=}" ;;
      --attach)      MODE="attach"; ATTACH_SERVICE="nexus-light" ;;
      --attach=*)    MODE="attach"; ATTACH_SERVICE="${arg#--attach=}" ;;
      --push)        MODE="push"; PUSH_BRANCH="main" ;;
      --push=*)      MODE="push"; PUSH_BRANCH="${arg#--push=}" ;;
      --help|-h)     MODE="help" ;;
      --verbose)     VERBOSE=true ;;
      *) fail "Unknown option: $arg\nRun ./dev.sh --help for supported options." ;;
    esac
  done
}

# ─── Backend state ────────────────────────────────────────────────────────────

backend_can_start() {
  [ -d "$BACKEND_DIR" ]               || return 1
  [ -f "$BACKEND_DIR/.env" ]          || return 1
  grep -Eq "^SUPABASE_URL=.+"         "$BACKEND_DIR/.env" 2>/dev/null || return 1
  grep -Eq "^SUPABASE_SERVICE_KEY=.+" "$BACKEND_DIR/.env" 2>/dev/null || return 1
  grep -Eq "^DATABASE_URL=.+"         "$BACKEND_DIR/.env" 2>/dev/null || return 1
  return 0
}

# ─── Compose helpers ──────────────────────────────────────────────────────────

configure_compose_args() {
  COMPOSE_ARGS=("-f" "$COMPOSE_FILE" "--profile" "supabase")
  if backend_can_start; then
    COMPOSE_ARGS+=("--profile" "api")
    _BACKEND_ENABLED=true
  else
    _BACKEND_ENABLED=false
  fi
}

run_compose() {
  [ "$VERBOSE" = true ] && say "${YELLOW}→ docker compose ${COMPOSE_ARGS[*]} $*${NC}"
  docker compose "${COMPOSE_ARGS[@]}" "$@"
}

# ─── Error diagnostics ────────────────────────────────────────────────────────

diagnose_failure() {
  local label="$1" output_file="$2" text=""
  [ -f "$output_file" ] && text="$(tail -n 200 "$output_file" 2>/dev/null)"

  echo "$text" | grep -Eqi "no such host|temporary failure in name resolution|name or service not known|could not resolve host|network is unreachable|i/o timeout|connection timed out" \
    && fail "$label failed — network or DNS error.\n  Check your internet connection.\n  Logs: $LOG_FILE"
  echo "$text" | grep -Eqi "toomanyrequests|429 too many requests|pull rate limit" \
    && fail "$label failed — Docker Hub rate limit.\n  Run: docker login\n  Logs: $LOG_FILE"
  echo "$text" | grep -Eqi "permission denied.*docker|cannot connect to the docker daemon" \
    && fail "$label failed — Docker not accessible. Start Docker Desktop.\n  Logs: $LOG_FILE"
  echo "$text" | grep -Eqi "port is already allocated|address already in use|bind.*already in use" \
    && fail "$label failed — port already in use.\n  Find conflicts: lsof -nP -iTCP -sTCP:LISTEN\n  Logs: $LOG_FILE"
  fail "$label failed.\n  Logs: $LOG_FILE"
}

diagnose_readiness_timeout() {
  local service="$1" label="$2" timeout_seconds="$3"
  local state; state="$(docker inspect -f '{{.State.Status}}' "$service" 2>/dev/null || true)"
  local code;  code="$(docker inspect -f '{{.State.ExitCode}}' "$service" 2>/dev/null || true)"
  case "$state" in
    exited)     fail "$label timed out — container exited (code: ${code:-?}).\n  Logs: ./dev.sh --logs=$service" ;;
    restarting) fail "$label timed out — container is restart-looping.\n  Logs: ./dev.sh --logs=$service" ;;
    running)    fail "$label timed out — container running but not answering.\n  Logs: ./dev.sh --logs=$service" ;;
    *)          fail "$label did not become ready within ${timeout_seconds}s.\n  Logs: ./dev.sh --logs" ;;
  esac
}

# ─── Live startup monitor ─────────────────────────────────────────────────────

_spin_frame() {
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  printf '%s' "${frames[$(( $1 % 10 ))]}"
}

watch_build() {
  local pid="$1" log_file="$2"
  local tick=0 drawn=0
  while kill -0 "$pid" 2>/dev/null; do
    [ "$drawn" -gt 0 ] && printf '\033[1A\033[2K'
    local sp; sp=$(_spin_frame "$tick")
    local hint="" cols; cols=$(tput cols 2>/dev/null || echo 100)
    [ -f "$log_file" ] && hint=$(grep -aE '\[[0-9]+/[0-9]+\]|Step [0-9]+|^#[0-9]+ \[' "$log_file" 2>/dev/null \
      | sed 's/\x1b\[[0-9;]*m//g' | tail -1 | sed 's/^[[:space:]]*//' | cut -c1-$((cols - 8)))
    printf "    \033[0;36m%s\033[0m  %s\n" "$sp" "${hint:-building...}"
    drawn=1; sleep 0.25; tick=$((tick + 1))
  done
  [ "$drawn" -gt 0 ] && printf '\033[1A\033[2K'
}

watch_spinner() {
  local pid="$1" label="$2" log_file="${3:-}"
  local tick=0 drawn=0
  while kill -0 "$pid" 2>/dev/null; do
    [ "$drawn" -gt 0 ] && printf '\033[1A\033[2K'
    local sp; sp=$(_spin_frame "$tick")
    local hint="" cols; cols=$(tput cols 2>/dev/null || echo 100)
    if [ -n "$log_file" ] && [ -f "$log_file" ]; then
      hint=$(tail -1 "$log_file" 2>/dev/null | sed 's/\x1b\[[0-9;]*m//g' | sed 's/^[[:space:]]*//' | cut -c1-$((cols - ${#label} - 12)))
    fi
    printf "    \033[0;36m%s\033[0m  %s  \033[2m%s\033[0m\n" "$sp" "$label" "${hint:-}"
    drawn=1; sleep 0.25; tick=$((tick + 1))
  done
  [ "$drawn" -gt 0 ] && printf '\033[1A\033[2K'
}

watch_up() {
  local pid="$1" log_file="${2:-}"
  local tick=0 drawn=0
  local row name state health icon color label sp

  while true; do
    [ "$drawn" -gt 0 ] && printf '\033[%dA\033[J' "$drawn"
    sp=$(_spin_frame "$tick")
    drawn=0

    while IFS= read -r row; do
      [ -z "$row" ] && continue
      IFS='|' read -r name state health <<< "$row"
      case "$state" in
        running)
          case "$health" in
            healthy)   icon="✓"; color="0;32"; label="running · healthy" ;;
            unhealthy) icon="✗"; color="0;31"; label="running · unhealthy" ;;
            starting)  icon="$sp"; color="0;36"; label="starting health check" ;;
            *)         icon="✓"; color="0;32"; label="running" ;;
          esac ;;
        exited)     icon="✗"; color="0;31"; label="exited" ;;
        dead)       icon="✗"; color="0;31"; label="dead" ;;
        restarting) icon="$sp"; color="1;33"; label="restarting" ;;
        *)          icon="$sp"; color="1;33"; label="${state:-initializing}" ;;
      esac
      printf "    \033[%sm%s\033[0m  %-30s  \033[%sm%s\033[0m\n" "$color" "$icon" "$name" "$color" "$label"
      drawn=$((drawn + 1))
    done < <(docker compose "${COMPOSE_ARGS[@]}" ps --format '{{.Name}}|{{.State}}|{{.Health}}' 2>/dev/null)

    if [ "$drawn" -eq 0 ]; then
      local hint="initializing..."
      if [ -n "$log_file" ] && [ -f "$log_file" ]; then
        local raw; raw=$(tail -1 "$log_file" 2>/dev/null | sed 's/\x1b\[[0-9;]*m//g' | sed 's/^[[:space:]]*//')
        [ -n "$raw" ] && hint="$raw"
      fi
      printf "    \033[1;33m%s\033[0m  %s\n" "$sp" "$hint"
      drawn=1
    fi
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.3; tick=$((tick + 1))
  done

  [ "$drawn" -gt 0 ] && printf '\033[%dA\033[J' "$drawn"
  while IFS= read -r row; do
    [ -z "$row" ] && continue
    IFS='|' read -r name state health <<< "$row"
    case "$state" in
      running)
        case "$health" in
          healthy)   icon="✓"; color="0;32"; label="running · healthy" ;;
          unhealthy) icon="✗"; color="0;31"; label="running · unhealthy" ;;
          *)         icon="✓"; color="0;32"; label="running" ;;
        esac ;;
      exited) icon="✗"; color="0;31"; label="exited" ;;
      dead)   icon="✗"; color="0;31"; label="dead" ;;
      *)      icon="○"; color="1;33"; label="${state:-unknown}" ;;
    esac
    printf "    \033[%sm%s\033[0m  %-30s  \033[%sm%s\033[0m\n" "$color" "$icon" "$name" "$color" "$label"
  done < <(docker compose "${COMPOSE_ARGS[@]}" ps --format '{{.Name}}|{{.State}}|{{.Health}}' 2>/dev/null)
}

# ─── Bootstrap ────────────────────────────────────────────────────────────────

bootstrap_repos() {
  if [ ! -d "$FRONTEND_DIR" ]; then
    [ -z "$FRONTEND_REMOTE" ] && fail "Frontend repo not found.\n  Set LEAFLET_FRONTEND_REMOTE or clone manually."
    info "Frontend repo not found — cloning..."
    echo ""
    local clone_log="$LOG_DIR/clone-frontend.log"; : > "$clone_log"
    git clone --depth 1 --progress "$FRONTEND_REMOTE" "$FRONTEND_DIR" > "$clone_log" 2>&1 &
    local clone_pid=$!
    watch_spinner "$clone_pid" "cloning frontend..." "$clone_log"
    wait "$clone_pid" || fail "Failed to clone frontend.\n  Check your internet connection."
    ok "Frontend repo cloned"
  fi

  if [ ! -d "$BACKEND_DIR" ] && [ -n "$BACKEND_REMOTE" ]; then
    info "Backend repo not found — cloning..."
    echo ""
    local clone_log="$LOG_DIR/clone-backend.log"; : > "$clone_log"
    git clone --depth 1 --progress "$BACKEND_REMOTE" "$BACKEND_DIR" > "$clone_log" 2>&1 &
    local clone_pid=$!
    watch_spinner "$clone_pid" "cloning backend..." "$clone_log"
    if wait "$clone_pid"; then
      ok "Backend repo cloned"
    else
      info "Failed to clone backend — continuing without it"
    fi
  fi
}

# ─── Preflight ────────────────────────────────────────────────────────────────

check_docker() {
  command -v docker > /dev/null 2>&1          || fail "Docker not found. Install Docker Desktop and retry."
  docker info > /dev/null 2>&1                || fail "Docker is not running. Start Docker Desktop and retry."
  docker compose version > /dev/null 2>&1     || fail "docker compose plugin not found. Update Docker Desktop and retry."
}

check_ports() {
  local ports=(3000)
  [ "$_BACKEND_ENABLED" = true ] && ports+=(8000)
  for port in "${ports[@]}"; do
    lsof -nP -iTCP:"$port" -sTCP:LISTEN > /dev/null 2>&1 \
      && fail "Port $port is already in use.\n  lsof -nP -iTCP:$port -sTCP:LISTEN"
  done
}

# ─── Readiness ────────────────────────────────────────────────────────────────

wait_for_url() {
  local label="$1" url="$2" timeout_seconds="$3"
  local curl_args=("${@:4}")
  local deadline=$((SECONDS + timeout_seconds)) next_progress=5 elapsed=0

  say "      ↳ $label  $url"
  while [ "$SECONDS" -lt "$deadline" ]; do
    curl "${curl_args[@]}" "$url" > /dev/null 2>&1 && {
      elapsed=$((timeout_seconds - (deadline - SECONDS)))
      say "${GREEN}        ✓ $label ready (${elapsed}s)${NC}"
      return 0
    }
    elapsed=$((timeout_seconds - (deadline - SECONDS)))
    if [ "$elapsed" -ge "$next_progress" ]; then
      say "${YELLOW}        still waiting... ${elapsed}s / ${timeout_seconds}s${NC}"
      next_progress=$((next_progress + 5))
    fi
    sleep 1
  done
  return 1
}

capture_failure_logs() {
  log "Startup failed — capturing container logs"
  run_compose logs >> "$LOG_FILE" 2>&1 || true
}

cleanup_on_interrupt() {
  [ "$STARTUP_FAILED" = true ] && say "${YELLOW}Interrupted during startup. Leaving containers for debugging.${NC}"
  exit 130
}

print_summary() {
  echo ""
  say "${GREEN}Leaflet is running.${NC}"
  echo ""
  echo "  Frontend:  http://localhost:3000"
  [ "$_BACKEND_ENABLED" = true ] && echo "  API:       http://localhost:8000" && echo "  API docs:  http://localhost:8000/docs"
  echo "  Supabase:  http://localhost:54321"
  echo "  Studio:    http://localhost:54323"
  echo ""
  say "${YELLOW}  Log:  $LOG_FILE${NC}"
}

# ─── DB script runner ─────────────────────────────────────────────────────────

_psql() {
  docker exec -i supabase-db \
    psql -h /var/run/postgresql -U postgres -d postgres "$@"
}

apply_db_scripts() {
  local rls_script="$ROOT_DIR/supabase/volumes/db/init/02_rls.sql"

  echo ""
  say "${CYAN}▸ Database scripts${NC}"

  local rls_log="$LOG_DIR/rls-output.log"; : > "$rls_log"
  _psql < "$rls_script" > "$rls_log" 2>&1 &
  local rls_pid=$!
  watch_spinner "$rls_pid" "applying RLS policies..." "$rls_log"
  if wait "$rls_pid"; then
    ok "RLS policies applied"
  else
    info "RLS skipped — app tables may not exist yet; run again after backend migrations"
    log "RLS output: $(cat "$rls_log" 2>/dev/null)"
  fi
}

# ─── Individual action implementations ───────────────────────────────────────

exec_stop() {
  say "${CYAN}▸ Stop containers${NC}"
  mkdir -p "$LOG_DIR"
  echo ""
  local down_log="$LOG_DIR/down-output.log"; : > "$down_log"
  docker compose -f "$COMPOSE_FILE" --profile api --profile supabase \
    down --remove-orphans > "$down_log" 2>&1 &
  local pid=$!
  watch_spinner "$pid" "stopping containers..." "$down_log"
  wait "$pid" || true
  ok "Containers stopped"
}

exec_volumes() {
  say "${CYAN}▸ Wipe volumes${NC}"
  mkdir -p "$LOG_DIR"
  echo ""
  local down_log="$LOG_DIR/down-output.log"; : > "$down_log"
  docker compose -f "$COMPOSE_FILE" --profile api --profile supabase \
    down --remove-orphans -v > "$down_log" 2>&1 &
  local pid=$!
  watch_spinner "$pid" "stopping containers and wiping volumes..." "$down_log"
  wait "$pid" || true
  ok "Containers stopped, volumes wiped"
}

exec_images() {
  say "${CYAN}▸ Remove local images${NC}"
  mkdir -p "$LOG_DIR"
  echo ""
  local down_log="$LOG_DIR/down-output.log"; : > "$down_log"
  docker compose -f "$COMPOSE_FILE" --profile api --profile supabase \
    down --remove-orphans --rmi local > "$down_log" 2>&1 &
  local pid=$!
  watch_spinner "$pid" "stopping containers and removing images..." "$down_log"
  wait "$pid" || true
  ok "Containers stopped, local images removed"
}

exec_prune() {
  say "${CYAN}▸ Prune build cache${NC}"
  mkdir -p "$LOG_DIR"
  echo ""
  local prune_log="$LOG_DIR/prune-output.log"; : > "$prune_log"
  docker builder prune -f > "$prune_log" 2>&1 &
  local pid=$!
  watch_spinner "$pid" "pruning build cache..." "$prune_log"
  wait "$pid" || true
  ok "Build cache pruned"
}

exec_clear_logs() {
  say "${CYAN}▸ Clear container logs${NC}"
  echo ""
  local containers=(nexus-light nexus-source supabase-db supabase-auth supabase-kong supabase-meta supabase-studio)
  local paths=() container log_path

  for container in "${containers[@]}"; do
    log_path=$(docker inspect --format='{{.LogPath}}' "$container" 2>/dev/null)
    [ -n "$log_path" ] && [ "$log_path" != "<no value>" ] && paths+=("$log_path")
  done

  if [ "${#paths[@]}" -eq 0 ]; then
    info "No running containers found — nothing to clear"
    return
  fi

  # Truncate each log file via a short-lived alpine container that can reach
  # Docker's log directory inside the Docker Desktop VM.
  local truncate_cmd=""
  for p in "${paths[@]}"; do
    truncate_cmd+="truncate -s 0 '$p'; "
  done

  local clear_log="$LOG_DIR/clear-logs-output.log"; : > "$clear_log"
  docker run --rm \
    -v /var/lib/docker/containers:/var/lib/docker/containers \
    alpine sh -c "$truncate_cmd" > "$clear_log" 2>&1 &
  local pid=$!
  watch_spinner "$pid" "clearing container logs..." "$clear_log"
  wait "$pid" && ok "Container logs cleared (${#paths[@]} container(s))" \
              || info "Clear may have partially failed — check: $clear_log"
}

exec_start() {
  _STEP=0
  mkdir -p "$LOG_DIR"
  trap cleanup_on_interrupt INT TERM

  say "${CYAN}▸ Start${NC}"
  log "Starting Leaflet (log: $LOG_FILE)"

  bootstrap_repos

  echo ""
  say "${CYAN}[ $((_STEP+1)) ] Preflight${NC}"; _STEP=$((_STEP+1))
  configure_compose_args
  check_docker; ok "Docker running"
  check_ports;  ok "Ports clear"
  if [ "$_BACKEND_ENABLED" = true ]; then
    ok "Backend ready"
  else
    info "Backend skipped (configure $BACKEND_DIR/.env to enable)"
  fi

  echo ""
  say "${CYAN}[ $((_STEP+1)) ] Building images${NC}"; _STEP=$((_STEP+1))
  echo ""
  [ "$VERBOSE" = true ] && say "${YELLOW}→ docker compose ${COMPOSE_ARGS[*]} build${NC}"
  : > "$LOG_DIR/build-output.log"
  log "Running: docker compose ${COMPOSE_ARGS[*]} build"
  docker compose "${COMPOSE_ARGS[@]}" build >> "$LOG_DIR/build-output.log" 2>&1 &
  local build_pid=$!
  watch_build "$build_pid" "$LOG_DIR/build-output.log"
  wait "$build_pid" || { capture_failure_logs; diagnose_failure "Image build" "$LOG_DIR/build-output.log"; }
  echo ""; ok "Images built"

  echo ""
  say "${CYAN}[ $((_STEP+1)) ] Starting services${NC}"; _STEP=$((_STEP+1))
  STARTUP_FAILED=true
  echo ""
  [ "$VERBOSE" = true ] && say "${YELLOW}→ docker compose ${COMPOSE_ARGS[*]} up -d${NC}"
  : > "$LOG_DIR/up-output.log"
  log "Running: docker compose ${COMPOSE_ARGS[*]} up -d"
  docker compose "${COMPOSE_ARGS[@]}" up -d >> "$LOG_DIR/up-output.log" 2>&1 &
  local up_pid=$!
  watch_up "$up_pid" "$LOG_DIR/up-output.log"
  echo ""
  wait "$up_pid" || { capture_failure_logs; diagnose_failure "Service startup" "$LOG_DIR/up-output.log"; }
  ok "Containers running"

  echo ""
  say "${CYAN}[ $((_STEP+1)) ] Waiting for readiness${NC}"; _STEP=$((_STEP+1))
  if ! wait_for_url "Frontend" "http://127.0.0.1:3000" 90 --silent --show-error --fail; then
    capture_failure_logs; diagnose_readiness_timeout "nexus-light" "Frontend" 90
  fi
  if [ "$_BACKEND_ENABLED" = true ]; then
    if ! wait_for_url "API" "http://127.0.0.1:8000/health" 60 --silent --show-error --fail; then
      capture_failure_logs; diagnose_readiness_timeout "nexus-source" "API" 60
    fi
  fi

  STARTUP_FAILED=false
  trap - INT TERM

  [ "$_BACKEND_ENABLED" = true ] && apply_db_scripts

  print_summary
  say "${CYAN}--- following logs  (Ctrl+C to stop, stack keeps running) ---${NC}"
  echo ""
  local _start_since
  _start_since=$(docker inspect -f '{{.State.StartedAt}}' nexus-light 2>/dev/null | head -1)
  [ -z "$_start_since" ] || [ "$_start_since" = "0001-01-01T00:00:00Z" ] && _start_since="$SCRIPT_START_TIME"
  run_compose logs -f --since "$_start_since"
}

# ─── Interactive menu ─────────────────────────────────────────────────────────

do_menu() {
  echo ""
  say "${GREEN}Leaflet${NC}"
  echo ""
  echo "    1  Start the stack"
  echo "    2  Stop containers"
  echo "    3  Wipe volumes (DB data)"
  echo "    4  Remove local images"
  echo "    5  Prune build cache"
  echo "    6  Clear container logs"
  echo ""
  printf "  Enter numbers in order (e.g. 3 4 1): "
  local input; read -r input
  echo ""

  for num in $input; do
    case "$num" in
      1) ACTIONS+=("start") ;;
      2) ACTIONS+=("stop") ;;
      3) ACTIONS+=("volumes") ;;
      4) ACTIONS+=("images") ;;
      5) ACTIONS+=("prune") ;;
      6) ACTIONS+=("clearlogs") ;;
      *) say "${YELLOW}  Skipping unknown option: $num${NC}" ;;
    esac
  done

  [ "${#ACTIONS[@]}" -eq 0 ] && { say "${YELLOW}  Nothing selected.${NC}"; exit 0; }
}

# ─── Action queue runner ──────────────────────────────────────────────────────

run_queue() {
  check_docker
  for action in "${ACTIONS[@]}"; do
    case "$action" in
      start)      exec_start ;;
      stop)       exec_stop ;;
      volumes)    exec_volumes ;;
      images)     exec_images ;;
      prune)      exec_prune ;;
      clearlogs)  exec_clear_logs ;;
    esac
    echo ""
  done
}

# ─── Other commands ───────────────────────────────────────────────────────────

do_status() {
  configure_compose_args; check_docker; run_compose ps
}

do_logs() {
  configure_compose_args; check_docker

  local since
  if [ "$LOGS_NOW" = true ]; then
    # --now: anchor to this exact moment (discard everything before Ctrl+C)
    since="$SCRIPT_START_TIME"
  else
    # Default: anchor to when the containers were last started so re-attaching
    # after Ctrl+C shows the same session without repeating old history.
    since=$(docker inspect -f '{{.State.StartedAt}}' nexus-light 2>/dev/null | head -1)
    # Fall back to script start if container isn't found or not running
    [ -z "$since" ] || [ "$since" = "0001-01-01T00:00:00Z" ] && since="$SCRIPT_START_TIME"
  fi

  if [ -n "$LOGS_SERVICE" ]; then
    run_compose logs -f --since "$since" "$LOGS_SERVICE"
  else
    run_compose logs -f --since "$since"
  fi
}

do_doctor() {
  say "${GREEN}Leaflet — Doctor${NC}"; echo ""

  command -v docker > /dev/null 2>&1 \
    && ok "Docker: $(docker --version 2>&1 | head -1)" \
    || say "${RED}      ✗ Docker not found${NC}"
  docker compose version > /dev/null 2>&1 \
    && ok "Compose: $(docker compose version 2>&1)" \
    || say "${RED}      ✗ docker compose plugin not found${NC}"
  docker info > /dev/null 2>&1 \
    && ok "Docker daemon running" \
    || say "${YELLOW}      ✗ Docker daemon not running${NC}"

  echo ""
  [ -f "$COMPOSE_FILE"     ] && ok "docker-compose.yml"    || say "${RED}      ✗ docker-compose.yml missing${NC}"
  [ -d "$FRONTEND_DIR"     ] && ok "Frontend repo found"   || say "${YELLOW}      ✗ Frontend repo not found at $FRONTEND_DIR${NC}"
  [ -d "$BACKEND_DIR"      ] && ok "Backend repo found"    || say "${YELLOW}      ✗ Backend repo not found at $BACKEND_DIR${NC}"
  [ -f "$BACKEND_DIR/.env" ] && ok "Backend .env found"    || say "${YELLOW}      ✗ Backend .env not found${NC}"

  echo ""
  for port in 3000 8000 54321 54323; do
    lsof -nP -iTCP:"$port" -sTCP:LISTEN > /dev/null 2>&1 \
      && say "${YELLOW}      ✗ Port $port in use${NC}" \
      || ok "Port $port free"
  done

  echo ""
  configure_compose_args
  if [ "$_BACKEND_ENABLED" = true ]; then
    ok "Backend: enabled"
  else
    say "${YELLOW}      Backend: skipped — configure $BACKEND_DIR/.env to enable${NC}"
  fi
  info "Supabase: always on (local mode)"
}

do_test() {
  configure_compose_args; check_docker
  [ "$_BACKEND_ENABLED" != true ] && fail "Backend not configured.\n  Ensure $BACKEND_DIR exists and $BACKEND_DIR/.env is set up."
  run_compose run --rm nexus-source python -m pytest tests/ -v
}

do_attach() {
  configure_compose_args; check_docker
  run_compose exec "$ATTACH_SERVICE" sh
}

do_push() {
  local branch="$PUSH_BRANCH"
  say "${GREEN}Leaflet — Pushing repos to origin/$branch${NC}"; echo ""

  local repos=("$ROOT_DIR" "$FRONTEND_DIR" "$BACKEND_DIR")
  local names=("project-nexus" "project-nexus-light" "project-nexus-source")
  local any_failed=false

  for i in "${!repos[@]}"; do
    local repo="${repos[$i]}" name="${names[$i]}"
    [ ! -d "$repo/.git" ] && { info "$name — not a git repo, skipping"; continue; }
    info "Pushing $name..."
    if git -C "$repo" push -u origin "$branch" >> "$LOG_FILE" 2>&1; then
      ok "$name pushed"
    else
      say "${RED}      ✗ $name — push failed${NC}"; any_failed=true
    fi
  done

  echo ""
  [ "$any_failed" = true ] && fail "One or more repos failed to push.\n  Check: $LOG_FILE"
  ok "All repos pushed to origin/$branch"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
  parse_args "$@"

  case "$MODE" in
    help)    print_usage; exit 0 ;;
    status)  do_status; exit 0 ;;
    logs)    do_logs; exit 0 ;;
    doctor)  do_doctor; exit 0 ;;
    test)    do_test; exit 0 ;;
    attach)  do_attach; exit 0 ;;
    push)    do_push; exit 0 ;;
    menu)    do_menu ;;
  esac

  run_queue
}

main "$@"
