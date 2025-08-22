-- A/B testing: experiments and results
create table if not exists public.ab_experiments (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.content_drafts(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ab_variations (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references public.ab_experiments(id) on delete cascade,
  content text not null
);

create table if not exists public.ab_results (
  id uuid primary key default gen_random_uuid(),
  variation_id uuid references public.ab_variations(id) on delete cascade,
  metric text not null,
  value numeric not null,
  recorded_at timestamptz not null default now()
);

alter table public.ab_experiments enable row level security;
alter table public.ab_variations enable row level security;
alter table public.ab_results enable row level security;

create policy if not exists "ab_exp_select_own" on public.ab_experiments for select using (auth.uid() = created_by);
create policy if not exists "ab_exp_insert_own" on public.ab_experiments for insert with check (auth.uid() = created_by);
create policy if not exists "ab_vars_select_by_exp" on public.ab_variations for select using (exists(select 1 from public.ab_experiments e where e.id = experiment_id and e.created_by = auth.uid()));
create policy if not exists "ab_vars_insert_by_exp" on public.ab_variations for insert with check (exists(select 1 from public.ab_experiments e where e.id = experiment_id and e.created_by = auth.uid()));
create policy if not exists "ab_res_select_by_var" on public.ab_results for select using (exists(select 1 from public.ab_variations v join public.ab_experiments e on e.id = v.experiment_id where v.id = variation_id and e.created_by = auth.uid()));
create policy if not exists "ab_res_insert_by_var" on public.ab_results for insert with check (exists(select 1 from public.ab_variations v join public.ab_experiments e on e.id = v.experiment_id where v.id = variation_id and e.created_by = auth.uid()));

-- Images metadata and storage reference
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.content_drafts(id) on delete set null,
  url text not null,
  provider text not null,
  prompt text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.images enable row level security;
create policy if not exists "images_select_own" on public.images for select using (auth.uid() = created_by);
create policy if not exists "images_insert_own" on public.images for insert with check (auth.uid() = created_by);


