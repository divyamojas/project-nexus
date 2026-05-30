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
| `docker-compose.yml` | Three services: `app`, `proxy`, `api` (api under `api` profile) |
| `start.sh` | Canonical entrypoint — all flags documented in file header |
| `test.sh` | Delegates to `./start.sh --test` |
| `push.sh` | Pushes all three repos |
| `logs/` | Timestamped start logs (gitignored) |

## Repo Layout
```
project-nexus/
  project-nexus-light/    (nested separate git repo — gitignored by root)
  project-nexus-source/   (nested separate git repo — gitignored by root)
  docker-compose.yml
  start.sh
  ...
```

## Running
```bash
./start.sh            # start everything
./start.sh --status   # check services
./start.sh --down     # stop
./start.sh --doctor   # diagnose issues
./start.sh --logs     # tail logs
```

## Rules
- No app code in this repo
- No hardcoded secrets — all config in sub-repo `.env` files
- `project-nexus-light/` and `project-nexus-source/` are gitignored by root
