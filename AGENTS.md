# Project Nexus – Delivery Playbook

## Source of Truth & Change Hygiene

- Treat `README.md`, `structure.txt`, and `AGENTS.md` as living documents. Update all three whenever the architecture, tooling, or workflows change.
- Keep `structure.txt` synchronized with the actual repository layout. If you add or reorganize folders/files, reflect those changes immediately and note any conventions (e.g., `features/<domain>/components`).
- Before merging, run `npm run lint`, `npm test`, and any Supabase schema scripts referenced in the README to ensure updates stay green.

## Folder & Module Conventions

- Analyze the existing folder structure before adding new code. Prefer feature-based slices under `src/features/<domain>` with colocated hooks, components, and tests.
- Shared UI belongs in `src/components/common`, shared hooks in `src/contexts/hooks`, and reusable utilities in `src/utilities`.
- When introducing new services, add them under `src/services` with a clear Supabase boundary and export them via `src/services/index.js`.
- Document any new structure rules in `structure.txt` so future contributors can follow consistent, industry-standard organization.

## Roles & Capabilities

| Role          | Assignment Path                                                               | Capabilities                                                                                                              |
| ------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `super_admin` | Seeded via `SUPABASE_SUPER_ADMIN_EMAIL` or manually set in `public.profiles`. | Omnipotent: can edit any record, manage policies, promote/demote roles, and override approvals.                           |
| `admin`       | Granted via Admin Dashboard or DB migration.                                  | Full application management: approve/reject users, curate catalog, manage requests/loans, update organizational settings. |
| `user`        | Default for new signups.                                                      | Standard product usage, subject to approval gating.                                                                       |

## Approval Workflow Expectations

- All new signups land in `approval_status = 'pending'` until an admin or super admin approves them.
- Admins and super admins must review the dashboard approval queue daily and move accounts to `approved` or `rejected`.
- Ensure Supabase RLS policies allow admins/super admins to update approval status while preventing regular users from escalating privileges.

## Development Guidelines

- Centralize role and approval logic in `UserContext` and `useRole`; never duplicate role checks elsewhere.
- When altering roles, approvals, or policies, update:
  - `supabase_schema/update.sql` and regenerate schema dumps.
  - Relevant services (`adminService`, `profileService`) and context providers.
  - Admin Dashboard UI, ensuring super admins retain omnipotent controls and admins have the full toolset required to manage the app.
- Remove redundant API calls (e.g., avoid duplicate profile fetches) and keep services lean.
- Whenever you expand admin functionality, add corresponding tests to cover approval flows, role gating, and dashboard interactions.

## Communication & Documentation

- Record major workflow or schema changes in the project changelog (if present) and summarize them in the README.
- If new scripts or commands are added, document them in both the README and `package.json` comments where appropriate.
- Coordinate with stakeholders when adjusting approval or role escalation rules to avoid breaking access for live users.
