# Leaflet — Root Orchestrator (project-nexus)

## Current State
Leaflet is a community book-sharing platform where users can lend and borrow physical books from each other.
This root repo is **Docker orchestration only** — it contains no application code.

**Layout — sub-repos are nested inside this repo but are separate git repos:**

```
project-nexus/                ← this repo (git repo 1)
  project-nexus-light/        ← Next.js frontend (separate git repo, gitignored by root)
  project-nexus-source/       ← FastAPI backend  (separate git repo, gitignored by root)
  docker-compose.yml
  dev.sh
  ...
```

| Repo | Purpose | Stack |
|------|---------|-------|
| `project-nexus` (this) | Docker orchestration | Shell, YAML |
| `project-nexus-light/` | Next.js frontend | Next.js 14, React 18, Tailwind CSS, JS |
| `project-nexus-source/` | FastAPI backend | Python 3.11, FastAPI 0.115, asyncpg |

---

## Repo Boundaries

**This repo owns:**
- `docker-compose.yml` — two services: `nexus-light` (frontend), `nexus-source` (backend, profile: api)
- `dev.sh` — single dev CLI (start, stop, build, test, push, attach, logs, doctor)
- `logs/` — timestamped dev logs (gitignored)
- `CLAUDE.md`, `AGENTS.md`, `README.md`

**Never add application code to this repo.**

---

## Running Locally

```bash
# Interactive — no args shows a numbered menu (pick actions in any order)
./dev.sh

# Actions (each does exactly one thing; combine freely in any order)
./dev.sh --start                 # start the stack (build + up + follow logs)
./dev.sh -s                      # stop and remove containers
./dev.sh -v                      # stop containers and wipe DB volumes
./dev.sh -i                      # stop containers and remove local images
./dev.sh -p                      # prune Docker build cache

# Combine: actions execute left-to-right
./dev.sh -v -i -p --start        # wipe → remove images → prune → start
./dev.sh -p --start              # prune cache → start

# Other commands (run alone)
./dev.sh --status                # docker compose ps
./dev.sh --logs                  # tail logs since containers last started
./dev.sh --logs=nexus-light      # tail frontend logs since containers last started
./dev.sh --logs=nexus-source     # tail backend logs since containers last started
./dev.sh --logs --now            # re-attach from this moment only (after Ctrl+C)
./dev.sh --doctor                # diagnostics: docker, ports, repos, .env
./dev.sh --test                  # run backend test suite
./dev.sh --attach                # shell into frontend container
./dev.sh --attach=nexus-source   # shell into backend container
./dev.sh --exec                  # alias for --attach
./dev.sh --exec=nexus-source     # alias for --attach=
./dev.sh --push                  # push all repos to origin/main
./dev.sh --push=branch-name      # push all repos to a specific branch
./dev.sh --verbose               # print docker commands before running (combine with any flag)
```

---

## Startup Behavior

`dev.sh` runs an **action queue** — each flag adds one action; actions execute in order:

- `--start` — bootstrap repos → preflight → `docker compose build` → `docker compose up -d` → readiness poll → apply RLS → follow logs
- `-s` — `docker compose down --remove-orphans`
- `-v` — `docker compose down --remove-orphans -v`
- `-i` — `docker compose down --remove-orphans --rmi local`
- `-p` — `docker builder prune -f`

No flags → interactive numbered menu; user picks actions in any order.
Other commands (`--status`, `--logs`, etc.) bypass the queue entirely.

On success, URLs printed:
- Frontend: `http://localhost:3000`
- API + API docs: `http://localhost:8000` / `http://localhost:8000/docs` *(if backend enabled)*
- Supabase API: `http://localhost:54321`
- Supabase Studio: `http://localhost:54323`

**Supabase** is always included in the stack (not conditional).

**`api` profile auto-enable logic** — the FastAPI backend starts automatically only when ALL of:
- `project-nexus-source/` directory exists
- `project-nexus-source/.env` exists
- `project-nexus-source/.env` contains non-empty `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `DATABASE_URL`

If any condition fails: supabase + frontend mode (info message printed, api profile skipped).

**`--clean` action** — separate from startup; tears down everything (containers, local images, volumes, build cache) with a 3× YES confirmation, then exits. To wipe and restart in one command use `--rebuild -v`.

**Common failures translated to actionable messages:**
- DNS/network error → "Check internet connection"
- Docker Hub rate limit → "docker login or wait 6h"
- Port conflict → "lsof -nP -iTCP:<port> -sTCP:LISTEN"
- Docker not running → "Start Docker Desktop"

Logs captured to `logs/dev-YYYY-MM-DDTHH-MM-SS.log`.

---

## Auth Contract (Full Flow)

### Signup
1. `POST /auth/signup` with `{email, password}` — backend validates email domain (`@sprinklr.com` or `@gmail.com` only), proxies to Supabase Auth
2. Supabase sends confirmation email
3. User confirms email → auth token issued

### Login
1. `POST /auth/login` with `{email, password}` → `{access_token, token_type, user}`
2. Frontend: `setToken(access_token)` → stores in `localStorage('leaflet_token')` + cookie `leaflet_token=<token>; path=/`
3. Frontend: `GET /users/me` → profile
4. If 404 (no profile yet) → redirect to `/onboarding`
5. If `approval_status === 'pending'` → redirect to `/pending`
6. If `approval_status === 'approved'` → redirect to `/app`

### Authenticated requests
Every API call includes `Authorization: Bearer <token>`.
Backend `get_current_user` dependency verifies on every protected route.

### JWT Verification Order (backend `app/auth.py`)
1. Extract bearer token from `Authorization` header; absent → 401
2. Peek at `alg` in JWT header
3. `RS256`/`ES256` → verify via JWKS at `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`
4. `HS256` + `JWT_SECRET` env set → verify locally
5. `HS256`, no `JWT_SECRET` → verify remotely via `{SUPABASE_URL}/auth/v1/user`
6. Any failure → 401

### Logout
`POST /auth/logout` (bearer required) → backend calls Supabase signout.
Frontend: `clearToken()` — removes localStorage + expires cookie.

---

## RBAC

```
user  <  admin  <  super_admin
```

Enforced by `require_role(minimum_role)` dependency in `app/dependencies.py`.

| Role | Can do |
|------|--------|
| `user` | Own data; needs `approval_status=approved` |
| `admin` | All user actions + approve users + manage all books/loans/requests |
| `super_admin` | All admin actions + raw SQL + schema migrations |

**Admin invariants:**
- Cannot delete yourself
- Cannot demote your own role
- `approval_status` does not gate admin/super_admin routes (only `user` role checks it)

---

## Primary Data Shape

All tables in Supabase PostgreSQL `public` schema:

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `profiles` | id UUID PK, username, first_name, last_name, bio, avatar_url, role, approval_status, created_at | role: user/admin/super_admin; approval: pending/approved/rejected |
| `books` | id UUID PK, user_id, catalog_id FK, status, condition, archived, created_at | status: available/scheduled/lent |
| `books_catalog` | id UUID PK, title, author, isbn, cover_url, created_by, created_at | master catalogue entries |
| `book_requests` | id, book_id FK, requested_by, requested_to, status, message, created_at, updated_at | status: pending/accepted/rejected/cancelled |
| `book_loans` | id, book_id FK, lender_id, borrower_id, status, loaned_at, due_date, returned_at, notes | status: active/returned |
| `return_requests` | id, book_id FK, loan_id FK, requested_by, status, requested_at, resolved_at | status: pending/approved |
| `transfers` | id, request_id FK, book_id FK, from_user, to_user, status, scheduled_at, completed_at, created_at | status: pending/confirmed/transferred |
| `book_reviews` | id, book_id FK, reviewer_id, rating INTEGER, comment, created_at | |
| `user_reviews` | id, reviewee_id, reviewer_id, rating INTEGER, comment, created_at | |
| `saved_books` | id, user_id, book_id FK, catalog_id FK, created_at | |
| `crud_event_logs` | id, user_id, table_name, operation, row_id UUID, metadata JSONB, created_at | audit trail |
| `feedback` | id, message, email, created_at | |

### Borrow lifecycle
```
1. A requests B's book   → book_requests (status=pending)
2. B accepts             → request=accepted, book=scheduled
                           transfers row created (status=pending, from=B, to=A)
3. Physical handoff done → transfer=transferred
                           book_loans created (status=active, lender=B, borrower=A)
                           book=lent
4. A requests return     → return_requests (status=pending)
5. B approves return     → return_request=approved, loan=returned, book=available
```

---

## Full API Contract

All protected routes require `Authorization: Bearer <token>`.
"approved" = `require_role("user")` which also checks `approval_status=approved`.

### Auth `/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | — | email+password signup; validates domain |
| POST | `/auth/login` | — | returns `{access_token, user}` |
| POST | `/auth/logout` | Bearer | invalidates session |
| POST | `/auth/reset-password` | — | sends reset email |
| GET | `/auth/me` | Bearer | `{id, email}` from JWT |

### Books `/books`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/books` | approved | all books with enrichment (is_saved, borrowed_by, etc.) |
| POST | `/books` | approved | `{catalog_id, condition}` → new book instance |
| GET | `/books/{id}` | approved | single book with enrichment |
| DELETE | `/books/{id}` | approved | delete own book |
| PATCH | `/books/{id}/archive` | approved | `{archived: bool}` |

### Catalog `/catalog`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/catalog/search?q=` | approved | search by title (ilike, limit 5) |
| GET | `/catalog/lookup?title=&author=` | approved | exact match |
| POST | `/catalog` | approved | `{title, author, isbn?, cover_url?}` |
| GET | `/catalog/{id}` | approved | single entry |

### Requests `/requests`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/requests` | approved | `{book_id, message?}` → borrow request |
| GET | `/requests/incoming` | approved | pending requests targeting my books |
| GET | `/requests/outgoing` | approved | my pending outgoing requests |
| GET | `/requests/book/{book_id}` | approved | all requests for a book |
| PATCH | `/requests/{id}/status` | approved | `{status}` (accepted/rejected/cancelled) |

### Loans `/loans`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/loans` | approved | my loans (lender or borrower) |
| GET | `/loans/book/{book_id}/active` | approved | active loan for book |
| PATCH | `/loans/{id}/return` | approved | mark loan returned |

### Transfers `/transfers`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/transfers` | approved | my pending/confirmed transfers |
| PATCH | `/transfers/{id}` | approved | `{status?, scheduled_at?}` |
| POST | `/transfers/{id}/complete` | approved | creates loan, sets book=lent |

### Returns `/returns`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/returns` | approved | `{book_id}` → return request |
| POST | `/returns/{id}/approve` | approved | approve → closes loan, frees book |

### Saved `/saved`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/saved` | approved | my saved books with outgoing request info |
| POST | `/saved` | approved | `{book_id, catalog_id}` |
| DELETE | `/saved/{book_id}` | approved | unsave |

### Reviews `/reviews`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reviews/book/{book_id}` | approved | book reviews |
| POST | `/reviews/book` | approved | `{book_id, rating, comment?}` |
| GET | `/reviews/user/{user_id}` | approved | user reviews |
| POST | `/reviews/user` | approved | `{reviewee_id, rating, comment?}` |

### Users `/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | approved | own profile |
| PUT | `/users/me` | approved | update profile `{username?, first_name?, last_name?, bio?, avatar_url?}` |
| DELETE | `/users/me` | Bearer | delete own account |
| DELETE | `/users/me/data` | approved | delete own books/loans/requests data |

### Admin `/admin` (minimum role: `admin`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/stats` | counts: users, books, requests, loans |
| GET | `/admin/users` | all users with profiles |
| PUT | `/admin/users/{id}/role` | `{role}` — cannot self-demote |
| PUT | `/admin/users/{id}/approval` | `{approval_status}` |
| DELETE | `/admin/users/{id}` | cannot self-delete |
| GET | `/admin/books` | all books |
| PATCH | `/admin/books/{id}/archive` | `{archived: bool}` |
| GET | `/admin/requests` | all requests |
| PATCH | `/admin/requests/{id}/status` | `{status}` |
| GET | `/admin/loans` | all loans |
| POST | `/admin/loans/{id}/complete` | mark returned |

### Schema `/schema` (minimum role: `super_admin`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/schema/snapshot` | current DB schema snapshot |
| POST | `/schema/migrate` | run pending migration files |
| POST | `/schema/sql` | execute raw SQL `{sql}` |

### Legal `/legal` (no auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/legal/privacy` | privacy policy text |
| GET | `/legal/terms` | terms of service text |

### Feedback `/feedback`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/feedback` | approved | `{message}` |

### Sync `/sync` (only when `S3_SYNC_ENABLED=true`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/sync/status` | sync status |
| POST | `/sync/full` | trigger full sync |

---

## Environment Variables

### Frontend (`project-nexus-light/.env`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### Backend (`project-nexus-source/.env`)
```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=postgresql://user:pass@host:5432/postgres
JWT_SECRET=                      # optional — for HS256 token verification
CORS_ORIGINS=http://localhost:3000
S3_SYNC_ENABLED=false
S3_BUCKET_NAME=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

---

## Universal Rules

- **No TypeScript** anywhere — frontend is `.js`/`.jsx`, backend is `.py`
- **Docker only** for running the app locally — no `npm install` or `pip install` on host
- **No hardcoded secrets** — all config from `.env` files (never committed)
- **`user_id` from JWT only** — never from request body or query params
- **404, not 403** for owned-resource-not-found
- **No ORM** in the backend — asyncpg raw queries only
- **Repo separation** — no app logic in this root repo
- **Each repo has its own** `CLAUDE.md` (full context) and `AGENTS.md` (lean guide)

---

## Future Phases
- **Monetization**: `lib/featureFlags.js` has `hasFeature(key)` scaffold — all return `true` until gates needed
- **S3 sync**: disabled by default; `S3_SYNC_ENABLED=true` + AWS vars enables it
- **OAuth**: `/auth/oauth/start` and `/auth/callback` stubs exist in backend
- **Legal pages**: `/legal/privacy` and `/legal/terms` fetch from backend; static fallback if unavailable
