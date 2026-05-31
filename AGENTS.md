# Agents Guide — project-nexus (Root Orchestrator)

## Purpose
Docker orchestration for Leaflet. This repo contains no application code.

## Out of Scope
Do NOT add application code here. All logic lives in sub-repos:
- `project-nexus-light/` — Next.js frontend
- `project-nexus-source/` — FastAPI backend

## Key Files
| File | Role |
|------|------|
| `docker-compose.yml` | Services: `nexus-light` (frontend), `nexus-source` (backend, profile: api), plus local Supabase stack (profile: supabase) |
| `dev.sh` | Single dev CLI — all commands documented below |
| `supabase/volumes/db/init/` | SQL init scripts that run on first DB volume creation |
| `supabase/kong/kong.yml` | Kong gateway config for local Supabase API routing |
| `logs/` | Timestamped dev logs (gitignored) |

## Repo Layout
```
project-nexus/
  project-nexus-light/    (nested separate git repo — gitignored by root)
  project-nexus-source/   (nested separate git repo — gitignored by root)
  docker-compose.yml
  dev.sh
  supabase/
    volumes/db/init/      (SQL init scripts for local Supabase DB)
    kong/kong.yml         (API gateway config)
```

## Running
Each action does exactly one thing. Pass multiple to chain them in order.
```bash
./dev.sh                  # interactive menu — pick actions by number
./dev.sh --start          # start the stack (build + up + follow logs)
./dev.sh -s               # stop and remove containers
./dev.sh -v               # stop containers and wipe DB volumes
./dev.sh -i               # stop containers and remove local images
./dev.sh -p               # prune build cache
./dev.sh -v -i -p --start # chain: wipe → remove images → prune → start
./dev.sh --status         # check service status
./dev.sh --doctor         # diagnose issues (docker, ports, repos, .env)
./dev.sh --logs           # tail logs from current session only
./dev.sh --test           # run backend test suite
./dev.sh --attach         # shell into frontend container
./dev.sh --push           # push all repos to origin/main
```

## Supabase local stack
The Supabase profile (postgres, auth, kong, studio) is **always enabled**. Services are exposed at:
- `http://localhost:54321` — Supabase API (via Kong)
- `http://localhost:54323` — Supabase Studio

To reset the DB:
```bash
./dev.sh -v --start       # wipe volumes then start fresh
./dev.sh -v -i --start    # also removes local images
```

## Rules
- No app code in this repo
- No hardcoded secrets — all config in sub-repo `.env` files
- `project-nexus-light/` and `project-nexus-source/` are gitignored by root
- Never use `docker` directly for routine dev — use `./dev.sh`
