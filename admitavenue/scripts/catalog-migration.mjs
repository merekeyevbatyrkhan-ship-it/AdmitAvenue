import fs from 'node:fs/promises';
import {PROGRAMS} from '../public/programs.js';
import {validatePrograms} from '../public/catalog-core.js';
const rows=validatePrograms(PROGRAMS);
const quote=value=>"'"+value.replaceAll("'","''")+"'";
const sql=`-- Apply ONCE. Creates only the public editorial catalog; does not touch profiles.
begin;
create table public.admit_programs (
  id text primary key check (id ~ '^[a-z0-9-]{1,100}$'),
  data jsonb not null,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint admit_programs_object check (jsonb_typeof(data) = 'object'),
  constraint admit_programs_id check (data->>'id' = id),
  constraint admit_programs_size check (octet_length(data::text) <= 16384)
);
alter table public.admit_programs enable row level security;
alter table public.admit_programs force row level security;
revoke all on public.admit_programs from public, anon, authenticated;
grant select on public.admit_programs to anon, authenticated;
create policy admit_programs_read_active on public.admit_programs
  for select to anon, authenticated using (active = true);
comment on table public.admit_programs is 'Public sourced program catalog. Only administrators may edit. No applicant information.';
insert into public.admit_programs (id, data) values
${rows.map(p=>`(${quote(p.id)}, ${quote(JSON.stringify(p))}::jsonb)`).join(',\n')};
commit;
select count(*) as program_count from public.admit_programs;
`;
await fs.writeFile(new URL('../supabase/migrations/202609180002_program_catalog.sql',import.meta.url),sql);
console.log(`Catalog migration generated: ${rows.length} programs.`);
