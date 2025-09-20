# Leaflet

Leaflet is a community-first library for lending and borrowing books. The frontend is a Vite-powered React SPA that talks to Supabase for authentication, storage, realtime updates, and Postgres access. This repository contains everything you need to run Leaflet locally, contribute new features, and maintain the Supabase schema metadata that accompanies the app.

---

## Table of Contents

1. [Key Capabilities](#key-capabilities)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
   - [Prerequisites](#prerequisites)
   - [Clone & Install](#clone--install)
   - [Environment Variables](#environment-variables)
   - [Run Locally](#run-locally)
4. [Supabase & Schema Dumps](#supabase--schema-dumps)
5. [Role-Based Administration](#role-based-administration)
6. [Project Structure](#project-structure)
7. [Scripts & Tooling](#scripts--tooling)
8. [Architecture Notes](#architecture-notes)
9. [Development Guidelines](#development-guidelines)
10. [Testing & Quality](#testing--quality)
11. [Deployment Tips](#deployment-tips)
12. [Further Reading](#further-reading)

---

## Key Capabilities

- ✅ Email/password authentication (with domain allowlist) via Supabase Auth
- ✅ Profile onboarding with avatar uploads to Supabase Storage
- ✅ Browse, filter, and save books with realtime updates across clients
- ✅ Add books with catalog lookup, cover upload, and request workflows
- ✅ Request/accept/reject/cancel borrowing with live status tracking
- ✅ Role-based admin dashboard for moderating books, requests, and loans
- ✅ Super-admin can promote/demote users and export schema snapshots

---

## Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| Frontend     | React 19, React Router 7, Material UI 7      |
| State        | React Context + custom hooks                 |
| Animations   | Framer Motion                                |
| Backend APIs | Supabase (Auth, Postgres, Realtime, Storage) |
| Tooling      | Vite, ESLint, Prettier, Vitest               |

---

## Quick Start

### Prerequisites

- **Node.js 18+** (ESM support & fetch in Node)
- **npm** (ships with Node)
- **Supabase project** with Postgres, Realtime, Storage enabled

### Clone & Install

```bash
git clone https://github.com/your-org/project-nexus.git
cd project-nexus
npm install
```

> ⚠️ You may see a warning from Husky if Git hooks cannot be installed (e.g., in read-only environments). This does not impact local development.

### Environment Variables

Create a `.env` file in the project root. At minimum you need client-side Supabase credentials:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

If you plan to export Supabase schema metadata (see [Supabase & Schema Dumps](#supabase--schema-dumps)), also populate the database connection variables listed in `.env.sample`.

### Run Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser. Supabase Auth requires exact URL matches for redirect URIs, so ensure `http://localhost:5173` is whitelisted in your Supabase project settings.

---

## Supabase & Schema Dumps

Leaflet tracks Supabase metadata (tables, columns, RLS policies, etc.) in JSON files under `supabase_schema/`. To refresh them after changing the database:

1. Ensure you have database credentials in `.env` (`SUPABASE_DB_URL` _or_ host/user/password) and `SUPABASE_SUPER_ADMIN_EMAIL`.
2. Use the pooler connection string if you are on an IPv4-only network (e.g., `aws-0-<region>.pooler.supabase.com`).
3. Run manually whenever you need fresh metadata:
   ```bash
   npm run getSchema
   ```
4. Commit the updated JSON files alongside the database migration (`supabase_schema/update.sql`).

> Tip: To apply SQL changes and refresh metadata in one step, run `npm run updateDB`. The script will apply `supabase_schema/update.sql`, invoke `npm run getSchema`, and then clear `update.sql`.

The script reads `supabase_schema/getSchemaDump.sql` which is organised into nine sections (tables, columns, constraints, indexes, triggers, views, functions, sequences, RLS policies). Each section is written atomically to a matching JSON file.

---

## Role-Based Administration

Leaflet recognises three roles. Policies are enforced by Supabase RLS functions defined in `supabase_schema/update.sql`.

| Role          | Description & Powers                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`        | Default. Full end-user functionality but no moderation controls.                                                                               |
| `admin`       | Can access `/admin` to moderate books, requests, and active loans.                                                                             |
| `super_admin` | Seeded account determined by the `SUPABASE_SUPER_ADMIN_EMAIL` environment variable. Can promote/demote roles, has unrestricted access via RLS. |

See [AGENTS.md](AGENTS.md) for day-to-day responsibilities and how to manage roles through the Admin Dashboard.

---

## Project Structure

```
.
├── AGENTS.md                  # Role definitions & responsibilities
├── README.md
├── scripts/
│   ├── getSchema.js           # Supabase schema export utility
│   └── updateDB.js            # Applies update.sql and refreshes schema
├── supabase_schema/
│   ├── getSchemaDump.sql      # SQL queries executed by getSchema.js
│   ├── update.sql             # RLS/seed/role helpers to run on Supabase
│   └── *.json                 # Generated metadata snapshots
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   │   ├── common/            # Reusable UI (AdminRoute, Layout, loaders...)
│   │   └── providers/         # Context providers (ErrorBoundary, Snackbar...)
│   ├── contexts/              # Contexts & hooks (Auth, Book, User, useRole)
│   ├── features/              # Domain-driven slices w/ colocated components & hooks
│   ├── services/              # Supabase data access layer (adminService, bookService...)
│   ├── hooks/                 # Cross-feature hooks (session, debounce, base image drop)
│   ├── theme/                 # Theme providers & tokens
│   └── utilities/             # Pure helpers (form validation, logger, auth flows)
└── structure.txt              # Up-to-date outline (generated manually)
```

See `structure.txt` for a freshly generated tree snapshot.

---

## Scripts & Tooling

| Command              | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `npm run dev`        | Start Vite dev server                                               |
| `npm run build`      | Production build                                                    |
| `npm run preview`    | Preview built app                                                   |
| `npm run lint`       | ESLint across the repo                                              |
| `npm run test`       | Run Vitest unit/integration suites                                  |
| `npm run test:watch` | Vitest in watch mode                                                |
| `npm run getSchema`  | Export Supabase metadata to JSON (requires DB creds)                |
| `npm run updateDB`   | Apply SQL in supabase_schema/update.sql, refresh schema, reset file |

---

## Architecture Notes

1. **Services (data access)**

   - Located under `src/services/**` and the sole authorised place to use Supabase JS client.
   - Each file targets a domain (`bookService`, `adminService`, etc.).
   - `src/services/index.js` re-exports a curated surface for UI consumption.

2. **Contexts (state orchestration)**

   - `AuthContext` wraps Supabase session handling.
   - `BookContext` coordinates book lists, saved state, realtime listeners.
   - `UserContext` aggregates profile data, requests, and loans; exposes `role`, `isAdmin`, `isSuperAdmin`.

3. **Hooks & Utilities**

   - Cross-cutting hooks live in `src/hooks` (`useImageDrop`, `useSession`, `useDebounce`). Feature-specific hooks sit beside their screens under `src/features/<domain>/hooks`.
   - Utilities are pure, testable helpers (validation, login/signup flows, logging).

4. **Admin Dashboard Flow**
   - `AdminRoute` ensures an authenticated admin (or super admin) can access `/admin` without forcing profile completion.
   - `AdminDashboard` relies on `adminService.js` to list users (for super admin) and moderate books/requests/loans.
   - RLS policies in `supabase_schema/update.sql` mirror the checks enforced in the client.

---

## Development Guidelines

- **Boundary discipline**: UI never touches Supabase directly. Add new calls to `src/services/**` and export via `index.js`.
- **Profile-guarded routes**: `PrivateRoute` defaults to requiring a completed profile but can be relaxed via `requireProfile={false}` (used for `/admin`).
- **Role checks**: Use `useRole()` or `useUser()` so logic stays consistent with context state.
- **Supabase changes**: Update `supabase_schema/update.sql`, then regenerate JSON via `npm run getSchema`, and document in commit/PR.
- **Error handling**: Services call `logError` with context; UI shows toast or inline feedback.

---

## Testing & Quality

- **Unit / Integration**: `npm run test` (Vitest) covers hooks, contexts, and utilities.
- **Linting**: `npm run lint` (ESLint) with React recommended rules.
- **Pre-commit**: Husky + lint-staged run `eslint --fix` + `prettier` on staged files when hooks are enabled.

---

## Deployment Tips

- **Environment variables**: Supply the same `.env` values to your hosting provider (e.g., Vercel). Never expose service-role keys.
- **Supabase policies**: Ensure `supabase_schema/update.sql` has been executed on your Supabase instance. Run schema exports before each release to catch drift.
- **IPv4 vs IPv6**: Supabase direct connection hosts are IPv6-only. Use the transaction or session pooler host when connecting from IPv4 environments (local dev, CI).

---

## Further Reading

- [AGENTS.md](AGENTS.md) — Roles, responsibilities, and admin workflows
- [Supabase Docs](https://supabase.com/docs)
- [Material UI Docs](https://mui.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

Built with care for communities that read. 📚🌿
