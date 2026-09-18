-- AdmitAvenue: initial cloud storage for the existing questionnaire.
-- Run ONCE in the Supabase project's SQL Editor.
-- No existing tables or records are removed or replaced.
-- If these objects already exist, the transaction fails rather than changing them.

begin;

create table public.admit_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  draft jsonb not null default '{"version":1}'::jsonb,
  current_step smallint not null default 0,
  locale text not null default 'ru',
  revision bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint admit_profiles_draft_object check (jsonb_typeof(draft) = 'object'),
  constraint admit_profiles_draft_version check (draft @> '{"version":1}'::jsonb),
  constraint admit_profiles_draft_size check (octet_length(draft::text) <= 262144),
  constraint admit_profiles_step_range check (current_step between 0 and 6),
  constraint admit_profiles_locale check (locale in ('ru', 'kk', 'en')),
  constraint admit_profiles_revision_positive check (revision > 0)
);

comment on table public.admit_profiles is
  'One private questionnaire per authenticated user. Draft matches profile-core.js schema version 1; JSON preserves exam statuses, languages and achievement arrays without flattening missing scores to zero.';
comment on column public.admit_profiles.revision is
  'Server-managed version. Updates should filter by the last-read revision to detect conflicts between devices.';

-- Keep the revision and timestamps controlled by the database.
-- SECURITY INVOKER and an empty search_path avoid elevated execution.
create function public.admit_profiles_stamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    NEW.revision := 1;
    NEW.created_at := pg_catalog.now();
  else
    NEW.revision := OLD.revision + 1;
    NEW.created_at := OLD.created_at;
  end if;
  NEW.updated_at := pg_catalog.now();
  return NEW;
end;
$$;

revoke all on function public.admit_profiles_stamp() from public, anon, authenticated;

create trigger admit_profiles_before_write
before insert or update on public.admit_profiles
for each row execute function public.admit_profiles_stamp();

alter table public.admit_profiles enable row level security;
alter table public.admit_profiles force row level security;

-- Remove defaults before granting only the client operations actually needed.
revoke all on table public.admit_profiles from public, anon, authenticated;
grant select, delete on table public.admit_profiles to authenticated;
grant insert (user_id, draft, current_step, locale)
  on table public.admit_profiles to authenticated;
grant update (draft, current_step, locale)
  on table public.admit_profiles to authenticated;

create policy admit_profiles_select_own
on public.admit_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy admit_profiles_insert_own
on public.admit_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy admit_profiles_update_own
on public.admit_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy admit_profiles_delete_own
on public.admit_profiles for delete to authenticated
using ((select auth.uid()) = user_id);

commit;
