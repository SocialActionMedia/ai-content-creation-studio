-- Brand voice documents
create table if not exists public.brand_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  industry text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.brand_documents enable row level security;
create policy if not exists "brand_docs_select_own" on public.brand_documents for select using (auth.uid() = created_by);
create policy if not exists "brand_docs_insert_own" on public.brand_documents for insert with check (auth.uid() = created_by);

-- Extend compliance_rules with industry column
do $$ begin
  alter table public.compliance_rules add column if not exists industry text;
exception when others then null; end $$;

-- Approval workflow definitions (simple: ordered steps with required role)
create table if not exists public.workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references public.workflow_definitions(id) on delete cascade,
  step_order int not null,
  required_role text not null check (required_role in ('admin','editor','client')),
  unique(workflow_id, step_order)
);

alter table public.workflow_definitions enable row level security;
alter table public.workflow_steps enable row level security;
create policy if not exists "wf_defs_select_own" on public.workflow_definitions for select using (auth.uid() = created_by);
create policy if not exists "wf_defs_insert_own" on public.workflow_definitions for insert with check (auth.uid() = created_by);
create policy if not exists "wf_steps_select_by_wf" on public.workflow_steps for select using (exists(select 1 from public.workflow_definitions d where d.id = workflow_id and d.created_by = auth.uid()));
create policy if not exists "wf_steps_insert_by_wf" on public.workflow_steps for insert with check (exists(select 1 from public.workflow_definitions d where d.id = workflow_id and d.created_by = auth.uid()));

-- Integrations and external projects/social accounts
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- e.g., 'project_mgmt', 'social'
  name text not null,
  config jsonb not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.external_projects (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid references public.integrations(id) on delete cascade,
  external_id text not null,
  name text
);

alter table public.integrations enable row level security;
alter table public.external_projects enable row level security;
create policy if not exists "integrations_select_own" on public.integrations for select using (auth.uid() = created_by);
create policy if not exists "integrations_insert_own" on public.integrations for insert with check (auth.uid() = created_by);
create policy if not exists "ext_projects_select_by_int" on public.external_projects for select using (exists(select 1 from public.integrations i where i.id = integration_id and i.created_by = auth.uid()));
create policy if not exists "ext_projects_insert_by_int" on public.external_projects for insert with check (exists(select 1 from public.integrations i where i.id = integration_id and i.created_by = auth.uid()));

-- Performance/engagement imports
create table if not exists public.performance_imports (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  payload jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  imported_at timestamptz not null default now()
);

alter table public.performance_imports enable row level security;
create policy if not exists "perf_imports_select_own" on public.performance_imports for select using (auth.uid() = created_by);
create policy if not exists "perf_imports_insert_own" on public.performance_imports for insert with check (auth.uid() = created_by);


