# Leaflet

Leaflet is a community-first library for lending and borrowing books. Think of it as a neighbourhood shelf that lives online: anyone can request to join, admins keep the catalogue tidy, and super admins make sure the rules stay fair. The stack runs locally via Docker: a Next.js frontend, a FastAPI backend, and a self-contained local Supabase instance (Postgres, Auth, Kong, Studio).

---

## Table of Contents

1. [Welcome & Purpose](#welcome--purpose)
2. [Guided Project Tour](#guided-project-tour)
3. [Plain-Language Setup](#plain-language-setup)
   - [Step 1: Gather your tools](#step-1-gather-your-tools)
   - [Step 2: Create a Supabase project](#step-2-create-a-supabase-project)
   - [Step 3: Configure environment variables](#step-3-configure-environment-variables)
   - [Step 4: Install dependencies](#step-4-install-dependencies)
   - [Step 5: Start the app](#step-5-start-the-app)
4. [Everyday App Workflow](#everyday-app-workflow)
   - [New member journey](#new-member-journey)
   - [Admin daily checklist](#admin-daily-checklist)
   - [Super admin safety net](#super-admin-safety-net)
5. [How Data Flows Through Leaflet](#how-data-flows-through-leaflet)
   - [Authentication & sessions](#authentication--sessions)
   - [Profiles, approvals & roles](#profiles-approvals--roles)
   - [Books, requests & loans](#books-requests--loans)
   - [Realtime updates](#realtime-updates)
6. [Code Map in Plain English](#code-map-in-plain-english)
7. [Why We Built It This Way](#why-we-built-it-this-way)
8. [Tools, Commands & Scripts](#tools-commands--scripts)
9. [Quality Checks, Deployment & Next Steps](#quality-checks-deployment--next-steps)
10. [Further Resources](#further-resources)

---

## Welcome & Purpose

We built Leaflet to solve a simple problem: neighbours and co-workers own interesting books that sit unread. Leaflet keeps track of who owns what, who wants to borrow it, and how those loans progress. The project balances three audiences:

- **Members** who just want to join, browse, and borrow.
- **Admins** who approve new members and keep the catalogue organised.
- **Super admins** who can rescue any account or policy if something breaks.

This README explains the entire workflow in plain language so anyone—technical or not—can stand up the app, understand its moving parts, and maintain it with confidence.

---

## Guided Project Tour

- **Frontend shell:** A React SPA (Single Page Application) created with Vite for fast local development. Routing lives in `src/App.jsx`, and we lean on Material UI for layout and components.
- **State management:** Three main React Contexts keep the UI in sync:
  - `AuthContext` tracks who is logged in.
  - `UserContext` loads the member profile, approval status, loans, and saved books.
  - `BookContext` fetches book lists, keeps filters applied, and listens for realtime updates.
- **Supabase backend:** Supabase Auth manages signups/login, Postgres stores books and profiles, Storage keeps avatars, and the realtime channel notifies the UI when books change.
- **Services layer:** Every call to Supabase is wrapped in a service (e.g., `src/services/bookService.js`). UI components never talk to Supabase directly; they go through these functions for consistent permissions and error handling.
- **Admin tools:** The admin dashboard (under `/admin`) shows approval queues, catalogue health, active loans, and user management. Admins can promote, demote, or archive content without leaving the dashboard.

If you would rather watch it run than read code, follow the setup instructions below and click through the app—the routing, modals, and flows mirror what you see described here.

---

## Plain-Language Setup

Setting up Leaflet takes about 10 minutes. You need Docker Desktop and Git — nothing else installed on your machine.

### Step 1: Gather your tools

- **Docker Desktop**: download from [docker.com](https://www.docker.com/products/docker-desktop/). Make sure it is running before you proceed.
- **Git**: to clone the repos.

### Step 2: Clone this repo

```bash
git clone https://github.com/divyamojas/project-nexus.git
cd project-nexus
```

The frontend and backend sub-repos are cloned automatically on first `./dev.sh` run if the `LEAFLET_FRONTEND_REMOTE` and `LEAFLET_BACKEND_REMOTE` environment variables are set (or they use the defaults in `dev.sh`).

### Step 3: Configure environment variables

The backend needs a `.env` file to enable the API:

```bash
# project-nexus-source/.env
SUPABASE_URL=http://supabase-kong:8000          # local Supabase via Kong
SUPABASE_SERVICE_KEY=<local-service-key>        # see docker-compose.yml SUPABASE_SERVICE_KEY
SUPABASE_PUBLISHABLE_KEY=<local-anon-key>
DATABASE_URL=postgresql://postgres:your-super-secret-and-long-postgres-password@supabase-db:5432/postgres
CORS_ORIGINS=http://localhost:3000
```

The frontend `.env` is optional for local dev:

```bash
# project-nexus-light/.env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-anon-key>
```

> The local Supabase anon and service keys are the well-known dev values in `docker-compose.yml`. Never use them in production.

### Step 4: Start the app

```bash
./dev.sh
```

That's it. `dev.sh` builds images, starts all services, and tails logs. Visit:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| Supabase API | http://localhost:54321 |
| Supabase Studio | http://localhost:54323 |

---

## Everyday App Workflow

### New member journey

1. **Signup:** A visitor enters an approved email and password. Supabase Auth creates the account but marks it as `pending` approval.
2. **Email confirmation:** Supabase sends a confirmation email. After clicking the link, the user can log in but still sees a “Pending Approval” screen.
3. **Profile setup:** Once approved, the member fills out their name, preferred contact info, and optionally uploads an avatar. The profile lives in the `profiles` table.
4. **Browse & request:** Members explore the catalogue (books pulled from `books` and `catalog` tables). They can save favourites, request to borrow, and track requests from the dashboard.
5. **Borrow & return:** When a lender accepts a request, a loan record is created. The borrower can see due dates; the lender marks the book returned.

### Admin daily checklist

1. Open the **Admin Dashboard** (`/admin`).
2. Review the **Approval Queue**: approve or reject pending users.
3. Check **Books** for duplicates or archived items and tidy as needed.
4. Monitor **Requests** and **Loans** for anything stuck or overdue.
5. Use **User Management** to promote helpful members to admins or demote inactive admins back to regular users.

### Super admin safety net

- Can do everything an admin does plus:
  - Update any user’s role instantly.
  - Export schema snapshots via `npm run getSchema` to audit policies.
  - Apply emergency SQL fixes by editing `supabase_schema/update.sql` and running `npm run updateDB`.
- Should regularly check that RLS (Row Level Security) policies still align with the same role rules our automation uses (documented for Codex in `AGENTS.md`).

---

## How Data Flows Through Leaflet

### Authentication & sessions

- `AuthContext` (`src/contexts/AuthContext.jsx`) listens to Supabase Auth. It keeps the current session in state and exposes simple helpers like `signup`, `login`, and `logout`.
- Email domains are validated before any request leaves the browser using `ALLOWED_EMAIL_DOMAINS` (`src/constants/constants.js`). This prevents unwanted signups.
- `useSessionTracker` (`src/hooks/useSessionTracker.js`) subscribes to Supabase session events so the UI updates instantly when someone logs in or out.

### Profiles, approvals & roles

- After Auth signs a member in, `UserContext` (`src/contexts/UserContext.jsx`) fetches their profile via `getUserProfile` (`src/services/profileService.js`).
- Approval status lives on the profile record. `UserContext` exposes `isApproved`, `isPendingApproval`, and `role` so components know when to gate screens.
- The route guards (`PrivateRoute.jsx` and `AdminRoute.jsx`) rely on those flags to redirect members who are still pending or who lack admin rights.
- Role changes flow only through services inside `src/services/adminService.js`. Admins and super admins trigger these functions from the dashboard tables.

### Books, requests & loans

- `BookContext` loads all relevant book data using `getBooks`, `getSavedBooks`, and `getBookWithRelations` from `src/services`. It also exposes helpers to archive, delete, or save a book and to send borrow requests.
- When a member requests a book, `requestBorrowBook` (`src/services/bookRequestService.js`) writes a record to `book_requests`. The response updates both the main list and the saved-books view to keep the UI consistent.
- Approving a request creates a loan via `bookLoanService.js`. The borrower sees due dates in their dashboard; the lender (or an admin) can mark the loan as returned.
- Shared helpers in `src/utilities` (for example `validateAndSubmitBookForm.js`) keep validation and form submission logic away from components so features stay easy to maintain.

### Realtime updates

- `subscribeToBookChanges` (`src/services/realtimeService.js`) opens a Supabase realtime channel for `books` and related tables.
- When Supabase broadcasts an insert, update, or delete, `BookContext` refreshes the local list or performs a focused fetch (`addBookById`) so viewers see changes without refreshing.
- Window-level custom events (e.g., `'books:added'`) ensure optimistic UI updates when the current member adds a book.

---

## Code Map in Plain English

```
├── src/
│   ├── App.jsx                 # Routes and layout wiring
│   ├── main.jsx                # React entry point
│   ├── components/
│   │   ├── common/             # Shared UI pieces like loaders and route guards
│   │   └── providers/          # Error boundaries and Snackbar context
│   ├── contexts/               # Auth, User, Book providers plus their hooks
│   ├── features/               # Screens grouped by domain (auth, books, admin…)
│   ├── hooks/                  # Reusable hooks (session tracking, debouncing)
│   ├── services/               # Supabase access layer (one file per domain)
│   ├── theme/                  # Material UI theme helpers
│   └── utilities/              # Pure helper functions and validations
├── supabase_schema/            # SQL helper + JSON snapshots of database metadata
├── scripts/                    # Node scripts for schema exports and migrations
├── structure.txt               # Plain-text outline kept in sync with the repo
└── AGENTS.md                   # Automation instructions for Codex (not a human guide)
```

Keep `structure.txt` aligned with any structural change so new contributors can rely on it as a quick map.

---

## Why We Built It This Way

- **Separation of concerns:** UI components stay lean because data fetching and mutations live in services. This reduces the risk of bypassing security policies.
- **Context-driven state:** React Contexts supply the minimal data each screen needs—sessions, profiles, books—without dragging in global state libraries.
- **Supabase-first backend:** Supabase combines authentication, database, file storage, and realtime messaging with generous free tiers, making it ideal for community projects.
- **Role-based access control:** Roles (`user`, `admin`, `super_admin`) match the operating rules maintained for Codex in `AGENTS.md`, and RLS policies in `supabase_schema/update.sql` mirror the same structure so database access stays consistent.
- **Testable utilities:** Form validation, auth flows, and other logic sit in `src/utilities` with dedicated tests. This keeps regressions low when requirements change.

---

## Tools, Commands & Scripts

All commands go through `dev.sh` in the repo root. Never run `npm` or `pip` on the host — everything runs inside Docker.

Each command does exactly one thing. Combine actions left-to-right — they execute in that order.

| Command | What it does |
|---------|--------------|
| `./dev.sh` | Interactive menu — pick and sequence actions by number |
| `./dev.sh --start` | Start the stack (build + up + follow logs) |
| `./dev.sh -s` | Stop and remove containers |
| `./dev.sh -v` | Stop containers and wipe DB volumes |
| `./dev.sh -i` | Stop containers and remove local images |
| `./dev.sh -p` | Prune Docker build cache |
| `./dev.sh -v -i -p --start` | Wipe → remove images → prune → start (example: full reset) |
| `./dev.sh --status` | Show service status (`docker compose ps`) |
| `./dev.sh --logs` | Tail logs from the current session only |
| `./dev.sh --logs=nexus-light` | Tail frontend logs from current session |
| `./dev.sh --logs=nexus-source` | Tail backend logs from current session |
| `./dev.sh --doctor` | Diagnose Docker, ports, repos, and `.env` state |
| `./dev.sh --test` | Run the backend test suite |
| `./dev.sh --attach` | Shell into the frontend container |
| `./dev.sh --attach=nexus-source` | Shell into the backend container |
| `./dev.sh --push` | Push all repos to `origin/main` |
| `./dev.sh --push=branch` | Push all repos to a named branch |
| `./dev.sh --verbose` | Print docker commands as they run (combine with any flag) |

When introducing new flags or scripts, update `dev.sh`, the `print_usage` block inside it, and this table.

---

## Quality Checks, Deployment & Next Steps

- **Before pushing changes** use `./dev.sh --test` to run the backend test suite inside Docker.
- **Database changes** — add a migration file under `project-nexus-source/` and apply it via the `/schema/migrate` API endpoint (super_admin only) or Supabase Studio at `http://localhost:54323`.
- **Deployments** — supply production `.env` values to your hosting provider. Point `SUPABASE_URL` at your hosted Supabase project rather than the local Kong gateway.
- **Monitoring**: Super admins should periodically use `/schema/snapshot` to audit RLS policies. Admins should review the approval queue daily so newcomers are not blocked.

Suggested follow-up tasks once you are comfortable:

1. Tailor the email allowlist in `src/constants/constants.js` to match your community.
2. Add onboarding content or welcome emails for newly approved users.
3. Expand test coverage around any new approval or loan workflows you introduce.

---

## Further Resources

- [`AGENTS.md`](AGENTS.md) — quick reference for AI agents and automation tooling.
- [`CLAUDE.md`](CLAUDE.md) — full context for Claude Code: auth contract, API contract, data schema, environment variables, and dev rules.
- [Supabase Docs](https://supabase.com/docs) — guides for auth, database policies, and storage.
- [Next.js Docs](https://nextjs.org/docs) — frontend framework.
- [FastAPI Docs](https://fastapi.tiangolo.com/) — backend framework.

Built with care for communities that read. 📚🌿
