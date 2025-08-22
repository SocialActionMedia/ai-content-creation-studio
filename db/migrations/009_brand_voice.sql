-- Brand voice profiles and snippets
create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tone text,
  style_guidelines text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (created_by, name)
);

create table if not exists public.brand_snippets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.brand_profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.brand_profiles enable row level security;
alter table public.brand_snippets enable row level security;

create policy if not exists "brand_profiles_select_own" on public.brand_profiles for select using (auth.uid() = created_by);
create policy if not exists "brand_profiles_insert_own" on public.brand_profiles for insert with check (auth.uid() = created_by);
create policy if not exists "brand_profiles_update_own" on public.brand_profiles for update using (auth.uid() = created_by);

create policy if not exists "brand_snippets_select_by_profile" on public.brand_snippets for select using (exists(select 1 from public.brand_profiles p where p.id = profile_id and p.created_by = auth.uid()));
create policy if not exists "brand_snippets_insert_by_profile" on public.brand_snippets for insert with check (exists(select 1 from public.brand_profiles p where p.id = profile_id and p.created_by = auth.uid()));


