# Leaflet Roles & Responsibilities

Leaflet supports three application roles. Supabase assigns roles through the `public.profiles.role` column (default `user`) and a seeded super administrator defined in `supabase_schema/update.sql`.

| Role          | How it is assigned                                                                               | Capabilities                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `super_admin` | Supabase user whose email matches `SUPABASE_SUPER_ADMIN_EMAIL` (injected via the SQL migration). | Full read/write access through RLS overrides; can promote/demote other users |
| `admin`       | Any profile whose `role` is `admin` (granted via the Admin Dashboard or a DB update).            | Access `/admin`; moderate catalogue entries, requests, and active loans      |
| `user`        | Default role for new accounts.                                                                   | Normal product experience without administrative controls                    |

## Day-to-day Tasks

- **Super Admin**

  - Periodically review `Admin Dashboard → User Management` and assign roles as needed.
  - Use `npm run getSchema` before committing Supabase policy changes.
  - Maintain `supabase_schema/update.sql` and run `npm run updateDB` (manually) when applying migrations.

- **Admin**

  - Moderate book listings (archive/unarchive inappropriate items).
  - Triage borrow requests (approve, reject, cancel where necessary).
  - Mark loans as returned when a borrower confirms a drop-off.

- **Developers**
  - Do **not** hard-code new role checks outside `UserContext` / `useRole`. Always source role data from those helpers.
  - When introducing new tables or policies, update `supabase_schema/getSchemaDump.sql` and rerun `npm run getSchema`.

Refer to the main [README](README.md) for setup instructions and the Admin Dashboard walkthrough.
