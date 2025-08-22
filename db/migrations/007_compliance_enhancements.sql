-- Extend compliance_rules with severity/category/blocking and industry
do $$ begin
  alter table public.compliance_rules add column if not exists category text;
  alter table public.compliance_rules add column if not exists severity text check (severity in ('low','medium','high')) default 'medium';
  alter table public.compliance_rules add column if not exists blocking boolean default false;
  alter table public.compliance_rules add column if not exists industry text;
exception when others then null; end $$;

-- Audits table to record checks
create table if not exists public.compliance_audits (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.content_drafts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  industry text,
  violations jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.compliance_audits enable row level security;
create policy if not exists "audits_select_own" on public.compliance_audits for select using (auth.uid() = user_id);
create policy if not exists "audits_insert_own" on public.compliance_audits for insert with check (auth.uid() = user_id);


