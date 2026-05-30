#!/usr/bin/env bash
# dev.sh — project-nexus dev CLI

show_usage() {
  cat <<'EOF'
Usage: ./dev.sh [flag]

  ./dev.sh                           Start the stack
  ./dev.sh --rebuild                 Rebuild images (no-cache), then start
  ./dev.sh --clean                   Down containers, then restart
    -v                                 Also remove named volumes
    -i                                 Also remove built images
    -o                                 Also remove orphan containers
    -c                                 Also clear build cache
    -a                                 All of the above
  ./dev.sh --down                    Stop and remove all containers
  ./dev.sh --status                  Show service status
  ./dev.sh --logs[=svc]              Tail logs  (svc: nexus-light | nexus-source)
  ./dev.sh --doctor                  Run environment diagnostics
  ./dev.sh --test                    Run backend test suite
  ./dev.sh --attach[=svc]            Shell into a container (default: nexus-light)
  ./dev.sh --push[=branch]           Push all repos to remote (default branch: main)
  ./dev.sh --help                    Show this help
EOF
}

set -euo pipefail

# ─── Config ──────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
FRONTEND_DIR="$ROOT_DIR/project-nexus-light"
BACKEND_DIR="$ROOT_DIR/project-nexus-source"
LOG_DIR="$ROOT_DIR/logs"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/dev_${TIMESTAMP}.log"
REQUIRED_PORTS=(3000 8000)

# Git remotes — used to bootstrap missing sibling repos
FRONTEND_REMOTE="${LEAFLET_FRONTEND_REMOTE:-https://github.com/divyamojas/project-nexus-light.git}"
BACKEND_REMOTE="${LEAFLET_BACKEND_REMOTE:-https://github.com/divyamojas/project-nexus-source.git}"

# ─── Colors ──────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; NC='\033[0m'

# ─── Flags ───────────────────────────────────────────────
REBUILD=false
CLEAN=false; CLEAN_VOLUMES=false; CLEAN_IMAGES=false
CLEAN_ORPHANS=false; CLEAN_CACHE=false; CLEAN_ALL=false
DOWN=false; STATUS=false; LOGS_SERVICE=""; DOCTOR=false
TEST=false; ATTACH_SERVICE=""; PUSH_BRANCH=""

# ─── Helpers ─────────────────────────────────────────────
phase()  { echo -e "\n${BOLD}[Phase $1]${NC} $2" | tee -a "$LOG_FILE"; }
ok()     { echo -e "  ${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"; }
warn()   { echo -e "  ${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"; }
fail()   { echo -e "  ${RED}✗${NC} $1" | tee -a "$LOG_FILE"; }
info()   { echo -e "  ${BLUE}→${NC} $1" | tee -a "$LOG_FILE"; }

port_free() { ! lsof -i ":$1" -sTCP:LISTEN -t >/dev/null 2>&1; }

translate_error() {
  local out="$1"
  echo "$out" | grep -q "connection refused\|no route to host" && { echo "Network/DNS error — check internet connection."; return; }
  echo "$out" | grep -q "toomanyrequests\|rate limit"         && { echo "Docker Hub rate limit — docker login or wait 6h."; return; }
  echo "$out" | grep -q "port is already allocated\|address already in use" && { echo "Port conflict — run ./dev.sh --status"; return; }
  echo "$out" | grep -q "Cannot connect to the Docker daemon" && { echo "Docker not running — start Docker Desktop."; return; }
  echo "$out"
}

# ─── Argument parsing ─────────────────────────────────────
parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --rebuild) REBUILD=true ;;
      --clean)
        CLEAN=true; shift
        while [[ $# -gt 0 ]] && [[ "$1" =~ ^-[vioaca]$ ]]; do
          case "$1" in
            -v) CLEAN_VOLUMES=true ;; -i) CLEAN_IMAGES=true ;;
            -o) CLEAN_ORPHANS=true ;; -c) CLEAN_CACHE=true ;;
            -a) CLEAN_ALL=true ;;
          esac
          shift
        done
        continue ;;
      --down)       DOWN=true ;;
      --status)     STATUS=true ;;
      --logs=*)     LOGS_SERVICE="${1#--logs=}" ;;
      --logs)       LOGS_SERVICE="all" ;;
      --doctor)     DOCTOR=true ;;
      --test)       TEST=true ;;
      --attach=*)   ATTACH_SERVICE="${1#--attach=}" ;;
      --attach)     ATTACH_SERVICE="nexus-light" ;;
      --push=*)     PUSH_BRANCH="${1#--push=}" ;;
      --push)       PUSH_BRANCH="main" ;;
      --help|-h)    show_usage; exit 0 ;;
      *) echo "Unknown flag: $1" >&2; show_usage >&2; exit 1 ;;
    esac
    shift
  done
}

# ─── Operations ───────────────────────────────────────────
do_down() {
  info "Stopping services..."
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>&1 | tee -a "$LOG_FILE"
  ok "Services stopped."
}

do_status() {
  docker compose -f "$COMPOSE_FILE" ps
}

do_logs() {
  local svc="${LOGS_SERVICE:-}"
  [[ -z "$svc" || "$svc" == "all" ]] \
    && docker compose -f "$COMPOSE_FILE" logs -f --tail=100 \
    || docker compose -f "$COMPOSE_FILE" logs -f --tail=100 "$svc"
}

do_doctor() {
  echo -e "\n${BOLD}Diagnostics${NC}"
  command -v docker >/dev/null 2>&1 \
    && ok "docker: $(docker --version 2>&1 | head -1)" \
    || fail "docker not found"
  docker compose version >/dev/null 2>&1 \
    && ok "docker compose: $(docker compose version 2>&1)" \
    || fail "docker compose plugin not found"
  [[ -f "$COMPOSE_FILE" ]]     && ok "docker-compose.yml found"        || fail "docker-compose.yml missing"
  [[ -d "$FRONTEND_DIR" ]]     && ok "Frontend repo: $FRONTEND_DIR"    || warn "Frontend repo missing: $FRONTEND_DIR"
  [[ -d "$BACKEND_DIR" ]]      && ok "Backend repo: $BACKEND_DIR"      || warn "Backend repo missing: $BACKEND_DIR"
  [[ -f "$BACKEND_DIR/.env" ]] && ok "Backend .env found"              || warn "Backend .env missing"
  for p in "${REQUIRED_PORTS[@]}"; do
    port_free "$p" && ok "Port $p free" || warn "Port $p in use"
  done
}

do_test() {
  [[ -d "$BACKEND_DIR" ]] || { fail "Backend repo not found at $BACKEND_DIR"; exit 1; }
  docker compose -f "$COMPOSE_FILE" --profile api run --rm nexus-source \
    python -m pytest tests/ -v
}

do_attach() {
  docker compose -f "$COMPOSE_FILE" exec "${ATTACH_SERVICE:-nexus-light}" sh
}

do_push() {
  local branch="$PUSH_BRANCH"
  local repos=("$ROOT_DIR" "$FRONTEND_DIR" "$BACKEND_DIR")
  echo ""
  echo -e "${BOLD}Pushing all repos → $branch${NC}"
  echo ""
  local any_failed=false
  for repo in "${repos[@]}"; do
    local name
    name="$(basename "$repo")"
    if [[ ! -d "$repo/.git" ]]; then
      warn "$name: not a git repo, skipping."
      continue
    fi
    info "Pushing $name..."
    if git -C "$repo" push -u origin "$branch" 2>&1 | tee -a "$LOG_FILE"; then
      ok "$name pushed."
    else
      fail "$name push failed."
      any_failed=true
    fi
  done
  echo ""
  $any_failed && { fail "One or more repos failed to push."; exit 1; }
  ok "All repos pushed."
}

# ─── Bootstrap missing sibling repos ──────────────────────
bootstrap_repos() {
  if [[ ! -d "$FRONTEND_DIR" && -n "$FRONTEND_REMOTE" ]]; then
    info "Cloning frontend from $FRONTEND_REMOTE..."
    git clone "$FRONTEND_REMOTE" "$FRONTEND_DIR" 2>&1 | tee -a "$LOG_FILE" \
      || warn "Failed to clone frontend — continuing without it."
  fi
  if [[ ! -d "$BACKEND_DIR" && -n "$BACKEND_REMOTE" ]]; then
    info "Cloning backend from $BACKEND_REMOTE..."
    git clone "$BACKEND_REMOTE" "$BACKEND_DIR" 2>&1 | tee -a "$LOG_FILE" \
      || warn "Failed to clone backend — continuing without it."
  fi
}

# ─── Determine compose profiles ───────────────────────────
# api profile enabled only when backend repo + .env + required keys are all present
compose_profiles() {
  local args=()
  if [[ -d "$BACKEND_DIR" && -f "$BACKEND_DIR/.env" ]]; then
    local all_set=true
    for key in SUPABASE_URL SUPABASE_SERVICE_KEY DATABASE_URL; do
      grep -q "^${key}=.\+" "$BACKEND_DIR/.env" 2>/dev/null || { all_set=false; break; }
    done
    if [[ "$all_set" == "true" ]]; then
      args+=("--profile" "api")
    else
      warn "Backend .env missing required keys — starting frontend-only."
    fi
  else
    warn "Backend repo/env not found — starting frontend-only."
  fi
  echo "${args[@]}"
}

# ─── Main ─────────────────────────────────────────────────
main() {
  mkdir -p "$LOG_DIR"
  parse_args "$@"

  # Non-startup operations — run and exit
  $DOWN                     && { do_down;   exit 0; }
  $STATUS                   && { do_status; exit 0; }
  [[ -n "$LOGS_SERVICE" ]]  && { do_logs;   exit 0; }
  $DOCTOR                   && { do_doctor; exit 0; }
  $TEST                     && { do_test;   exit 0; }
  [[ -n "$ATTACH_SERVICE" ]] && { do_attach; exit 0; }
  [[ -n "$PUSH_BRANCH" ]]   && { do_push;   exit 0; }

  echo "" | tee -a "$LOG_FILE"
  echo -e "${BOLD}🌿 Leaflet — Local Dev${NC}" | tee -a "$LOG_FILE"
  echo "Log: $LOG_FILE"

  # ── Phase 1: Preflight ───────────────────────────────────
  phase 1 "Preflight"

  command -v docker >/dev/null 2>&1 || { fail "Docker not found. Install Docker Desktop."; exit 1; }
  ok "Docker: $(docker --version 2>&1 | head -1)"

  # If our own containers are already running, stop them first
  local running_ours
  running_ours=$(docker compose -f "$COMPOSE_FILE" --profile api ps --status running --format "{{.Name}}" 2>/dev/null || true)
  if [[ -n "$running_ours" ]]; then
    warn "Containers already running — stopping them first..."
    docker compose -f "$COMPOSE_FILE" --profile api down --remove-orphans 2>&1 | tee -a "$LOG_FILE" || true
    ok "Stopped previous containers."
  fi

  local conflicts=()
  for p in "${REQUIRED_PORTS[@]}"; do port_free "$p" || conflicts+=("$p"); done
  if [[ ${#conflicts[@]} -gt 0 ]]; then
    warn "Ports in use: ${conflicts[*]} — freeing..."
    for p in "${conflicts[@]}"; do
      local pids
      pids=$(lsof -i ":$p" -sTCP:LISTEN -t 2>/dev/null || true)
      if [[ -n "$pids" ]]; then
        local proc
        proc=$(lsof -i ":$p" -sTCP:LISTEN -n -P 2>/dev/null | awk 'NR>1 {print $1, "PID:"$2}' | head -1 || echo "unknown")
        info "Killing process on port $p: $proc"
        # shellcheck disable=SC2086
        kill -9 $pids 2>/dev/null || true
      fi
    done
    sleep 1
    local still=()
    for p in "${conflicts[@]}"; do port_free "$p" || still+=("$p"); done
    if [[ ${#still[@]} -gt 0 ]]; then
      fail "Ports still in use after kill attempt: ${still[*]}"
      echo ""
      echo "  What's using these ports:"
      for p in "${still[@]}"; do
        echo "    Port $p: $(lsof -i ":$p" -sTCP:LISTEN -n -P 2>/dev/null | awk 'NR>1 {print $1, "PID:"$2}' | head -1 || echo "unknown")"
      done
      echo ""
      echo "  Kill the process manually, or change its port, then retry."
      exit 1
    fi
    ok "Ports freed (${conflicts[*]})"
  fi
  ok "Ports free (${REQUIRED_PORTS[*]})"

  bootstrap_repos

  # ── Phase 2: Clean (if requested) ───────────────────────
  if $CLEAN; then
    phase 2 "Clean"
    local c_args=("down")
    { $CLEAN_ORPHANS || $CLEAN_ALL; } && c_args+=("--remove-orphans")
    { $CLEAN_VOLUMES || $CLEAN_ALL; } && c_args+=("-v")
    docker compose -f "$COMPOSE_FILE" "${c_args[@]}" 2>&1 | tee -a "$LOG_FILE" || true
    { $CLEAN_IMAGES || $CLEAN_ALL; } && {
      info "Removing built images..."
      docker compose -f "$COMPOSE_FILE" down --rmi local 2>/dev/null | tee -a "$LOG_FILE" || true
    }
    { $CLEAN_CACHE || $CLEAN_ALL; } && {
      info "Clearing build cache..."
      docker builder prune -f 2>&1 | tee -a "$LOG_FILE" || true
    }
    ok "Cleaned."
  fi

  # ── Phase 3: Build ───────────────────────────────────────
  phase 3 "Build"

  local profiles_str
  profiles_str="$(compose_profiles)"
  read -ra PROFILES <<< "$profiles_str"

  local build_cmd=("docker" "compose" "-f" "$COMPOSE_FILE" "${PROFILES[@]}" "build" "--progress=plain")
  $REBUILD && build_cmd+=("--no-cache")

  info "Building images..."
  local build_out
  if ! build_out=$("${build_cmd[@]}" 2>&1); then
    printf '%s\n' "$build_out" | tee -a "$LOG_FILE"
    fail "Build failed. Check log: $LOG_FILE"
    exit 1
  fi
  printf '%s\n' "$build_out" >> "$LOG_FILE"
  ok "Build complete."

  # ── Phase 4: Start ───────────────────────────────────────
  phase 4 "Start"

  local up_out
  if ! up_out=$(docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" up -d 2>&1); then
    printf '%s\n' "$up_out" | tee -a "$LOG_FILE"
    fail "Failed to start services."
    exit 1
  fi
  printf '%s\n' "$up_out" >> "$LOG_FILE"
  ok "Containers started."

  # ── Phase 5: Wait for readiness ──────────────────────────
  phase 5 "Wait for readiness"

  _dump_service_logs() {
    local svcs=("nexus-light")
    [[ " ${PROFILES[*]} " == *"api"* ]] && svcs+=("nexus-source")
    for svc in "${svcs[@]}"; do
      echo ""
      echo -e "  ${BOLD}${svc} (last 30 lines):${NC}"
      docker compose -f "$COMPOSE_FILE" logs --tail=30 --no-log-prefix "$svc" 2>/dev/null | sed 's/^/    /'
    done
    echo ""
    info "Run ./dev.sh --logs to stream live logs."
  }

  local max_wait=300 elapsed=0 last_print=0
  info "Waiting for services to start..."

  while true; do
    # ── Crash / restart-loop check ─────────────────────────
    # Catches both hard exits (exited/dead) and restart loops
    # (restart:unless-stopped keeps status "Running" so we check RestartCount).
    local crashed looping container rc
    crashed=$(docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" ps \
      --format "{{.Name}} {{.Status}}" 2>/dev/null \
      | grep -i "exit\|error\|dead" || true)
    looping=""
    while IFS= read -r container; do
      [[ -z "$container" ]] && continue
      rc=$(docker inspect --format '{{.RestartCount}}' "$container" 2>/dev/null || echo 0)
      (( rc >= 2 )) && looping+="${container} (restarted ${rc}x) "
    done < <(docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" ps --format "{{.Name}}" 2>/dev/null)

    if [[ -n "$crashed" || -n "$looping" ]]; then
      [[ -n "$crashed" ]] && fail "Container(s) crashed: $crashed"
      [[ -n "$looping" ]] && fail "Crash loop detected: $looping"
      _dump_service_logs
      exit 1
    fi

    # ── Timeout check ──────────────────────────────────────
    if [[ $elapsed -ge $max_wait ]]; then
      fail "Timed out after ${max_wait}s."
      _dump_service_logs
      exit 1
    fi

    # ── Poll frontend ───────────────────────────────────────
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    if [[ "$http_code" =~ ^[23] ]]; then
      ok "nexus-light ready after ${elapsed}s."
      if [[ " ${PROFILES[*]} " == *"api"* ]]; then
        local api_code
        api_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs 2>/dev/null || echo "000")
        [[ "$api_code" =~ ^[23] ]] \
          && ok "nexus-source ready." \
          || warn "nexus-source still starting — run ./dev.sh --logs=nexus-source"
      fi
      break
    fi

    # ── Periodic status (every 5s) ──────────────────────────
    if (( elapsed - last_print >= 5 )); then
      last_print=$elapsed
      local status_str
      status_str=$(docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" ps \
        --format "{{.Service}}: {{.Status}}" 2>/dev/null | tr '\n' '   ' | sed 's/   $//')
      info "[${elapsed}s] ${status_str:-containers starting}"
    fi

    sleep 3; elapsed=$((elapsed + 3))
  done

  # ── Success ───────────────────────────────────────────────
  echo ""
  echo -e "${BOLD}${GREEN}✓ Leaflet is running${NC}"
  echo ""
  echo "  nexus-light  : http://localhost:3000"
  [[ " ${PROFILES[*]} " == *"api"* ]] && \
  echo "  nexus-source : http://localhost:8000"
  echo ""
  echo "  Logs   → ./dev.sh --logs"
  echo "  Status → ./dev.sh --status"
  echo "  Stop   → ./dev.sh --down"
}

main "$@"
