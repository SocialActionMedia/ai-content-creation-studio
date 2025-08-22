-- Users are managed by Supabase Auth. This schema adds app tables.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  content text not null,
  status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.content_drafts(id) on delete cascade,
  approver_id uuid references auth.users(id) on delete set null,
  decision text check (decision in ('approved','rejected')),
  comment text,
  decided_at timestamptz
);

create table if not exists public.performance_metrics (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.content_drafts(id) on delete cascade,
  metric text not null,
  value numeric not null,
  recorded_at timestamptz not null default now()
);

-- Basic RLS setup
alter table public.projects enable row level security;
alter table public.content_drafts enable row level security;
alter table public.approvals enable row level security;
alter table public.performance_metrics enable row level security;

-- Authenticated users can read their projects and drafts they created
create policy if not exists "projects_select_own" on public.projects
  for select using (auth.uid() = created_by);

create policy if not exists "projects_insert" on public.projects
  for insert with check (auth.uid() = created_by);

create policy if not exists "drafts_select_own" on public.content_drafts
  for select using (auth.uid() = created_by);

create policy if not exists "drafts_insert" on public.content_drafts
  for insert with check (auth.uid() = created_by);


