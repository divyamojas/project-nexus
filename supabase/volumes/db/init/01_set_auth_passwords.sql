-- Sets supabase internal role passwords to match POSTGRES_PASSWORD.
-- The supabase/postgres image creates these roles but doesn't always
-- inherit the POSTGRES_PASSWORD value for them.
-- This script runs once on first DB initialisation (empty data volume).

ALTER USER supabase_auth_admin WITH PASSWORD 'your-super-secret-and-long-postgres-password';
