-- Optimization configs per platform/format
create table if not exists public.optimization_configs (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  format text not null,
  rules jsonb not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.optimization_configs enable row level security;
create policy if not exists "opt_configs_read_all" on public.optimization_configs for select using (true);
create policy if not exists "opt_configs_insert_own" on public.optimization_configs for insert with check (auth.uid() = created_by);

-- Compliance rules
create table if not exists public.compliance_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  pattern text not null,
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.compliance_rules enable row level security;
create policy if not exists "compliance_rules_read_all" on public.compliance_rules for select using (true);
create policy if not exists "compliance_rules_insert_own" on public.compliance_rules for insert with check (auth.uid() = created_by);


