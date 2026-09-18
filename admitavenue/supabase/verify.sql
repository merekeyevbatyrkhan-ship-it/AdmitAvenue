-- Read-only checks. Run after the migration in the same Supabase project.
-- Expected: admit_profiles, rls_enabled=true, rls_forced=true.
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'admit_profiles';

-- Expected: four owner-only policies for SELECT, INSERT, UPDATE, DELETE.
select policyname, roles, cmd, qual, with_check
from pg_catalog.pg_policies
where schemaname = 'public' and tablename = 'admit_profiles'
order by policyname;

-- Expected: no anon grants; authenticated can read/delete and write listed columns.
select grantee, privilege_type, column_name
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'admit_profiles'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type, column_name;

-- These checks verify configuration, not a complete cross-user security test.
-- Integration must also be tested with two real test-user JWTs and an anonymous
-- request before publishing. A SQL Editor query as postgres does NOT test RLS.
