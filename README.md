# Leaflet

Leaflet is a community-first library for lending and borrowing books. Think of it as a neighbourhood shelf that lives online: anyone can request to join, admins keep the catalogue tidy, and super admins make sure the rules stay fair. The frontend is a Vite-powered React single-page app, and Supabase handles authentication, databases, and realtime updates.

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

Setting up Leaflet takes about 20 minutes. You only need basic computer skills: copying text, pasting keys, and running simple commands.

### Step 1: Gather your tools

- **Node.js 18 or newer**: download from [nodejs.org](https://nodejs.org/). Installing Node also installs `npm`, the package manager we use.
- **A Supabase account**: sign up at [supabase.com](https://supabase.com/) with any email address.
- **Git (optional but helpful)**: lets you download updates and contribute back.

### Step 2: Create a Supabase project

1. Log in to Supabase and click **New project**.
2. Give it a name (for example “leaflet-dev”).
3. Choose the **Free** plan and any region close to you.
4. Set a database password you will remember.
5. Once the project finishes provisioning, open **Settings → API**. You will need:
   - the **Project URL** (looks like `https://your-project.supabase.co`)
   - the **anon public key**
6. In **Authentication → URL Configuration** add `http://localhost:5173` to the redirect URLs so Supabase lets you sign in during local development.
7. In **Authentication → Policies** create (or note) the email allowlist you want. By default Leaflet accepts `@sprinklr.com` or `@gmail.com` emails; you can change this later in code under `src/constants/constants.js`.

### Step 3: Configure environment variables

1. In the project root, duplicate `.env.sample` if it exists or create a new `.env` file.
2. Add the Supabase values you collected:

   ```ini
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-public-anon-key>
   SUPABASE_SUPER_ADMIN_EMAIL=<email-that-should-start-as-super-admin>
   ```

3. If you want to export schema snapshots or run SQL migrations from your machine, also add the database connection string (find it under **Settings → Database → Connection String**):

   ```ini
   SUPABASE_DB_URL=postgresql://postgres:<your-password>@<host>:5432/postgres
   ```

   This optional value lets scripts in `supabase_schema/` connect securely.

> Tip: Environment variables stay on your computer. Do not share `.env` or commit it to Git.

### Step 4: Install dependencies

Open a terminal (or Command Prompt on Windows), change into the project folder, and run:

```bash
npm install
```

This downloads the React, Supabase, and tooling packages listed in `package.json`.

### Step 5: Start the app

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser. The Vite dev server live-reloads whenever you edit files. Use the **Signup** form to create a new account with an allowed email domain. Your first signup should use the `SUPABASE_SUPER_ADMIN_EMAIL` so you have full control.

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

| Command              | What it does and why it matters                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run dev`        | Starts the Vite dev server at `http://localhost:5173` with live reloads.                       |
| `npm run build`      | Creates an optimised production bundle (useful before deploying to Vercel or similar).         |
| `npm run preview`    | Serves the built bundle locally to mimic production.                                           |
| `npm run lint`       | Runs ESLint with project rules; fixes style issues early.                                      |
| `npm run test`       | Executes Vitest suites for hooks, utilities, and contexts.                                     |
| `npm run test:watch` | Runs tests continuously while you develop.                                                     |
| `npm run getSchema`  | Pulls Supabase metadata into JSON snapshots (needs `SUPABASE_DB_URL`).                         |
| `npm run updateDB`   | Applies `supabase_schema/update.sql`, refreshes metadata, then clears the SQL file for safety. |

When introducing new tooling or scripts, document them here and in `package.json` comments so the team stays aligned.

---

## Quality Checks, Deployment & Next Steps

- **Before pushing changes** run `npm run lint` and `npm test`. Both should pass without warnings.
- **Database changes** belong in `supabase_schema/update.sql`. After editing, run `npm run getSchema` to refresh the JSON snapshots and commit them together.
- **Deployments**: supply `.env` values to your hosting provider (for example Vercel) and run `npm run build` to verify the production bundle. Ensure Supabase policies in your hosted project match the checked-in SQL.
- **Monitoring**: Super admins should periodically export the schema to confirm RLS still protects sensitive data. Admins should review the approval queue daily so newcomers are not blocked.

Suggested follow-up tasks once you are comfortable:

1. Tailor the email allowlist in `src/constants/constants.js` to match your community.
2. Add onboarding content or welcome emails for newly approved users.
3. Expand test coverage around any new approval or loan workflows you introduce.

---

## Further Resources

- [`AGENTS.md`](AGENTS.md) — automation notes used by Codex (humans can stick with this README).
- [`structure.txt`](structure.txt) — current repository layout, updated with every structural change.
- [Supabase Docs](https://supabase.com/docs) — guides for auth, database policies, and storage.
- [Material UI](https://mui.com/) and [Framer Motion](https://www.framer.com/motion/) — component and animation systems used in the UI.

Built with care for communities that read. 📚🌿
