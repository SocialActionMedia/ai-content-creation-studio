-- Presets for fast workflows
create table if not exists public.content_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  format text not null,
  platform text,
  brand text,
  prompt_template text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.content_presets enable row level security;
create policy if not exists "presets_select_own" on public.content_presets for select using (auth.uid() = created_by);
create policy if not exists "presets_insert_own" on public.content_presets for insert with check (auth.uid() = created_by);


