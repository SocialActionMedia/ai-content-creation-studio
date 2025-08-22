-- Version history for content drafts
create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.content_drafts(id) on delete cascade,
  content text not null,
  created_by uuid references auth.users(id) on delete set null,
  parent_version_id uuid references public.content_versions(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.content_versions enable row level security;
create policy if not exists "versions_select_by_draft_owner" on public.content_versions
  for select using (exists(select 1 from public.content_drafts d where d.id = draft_id and d.created_by = auth.uid()));
create policy if not exists "versions_insert_by_draft_owner" on public.content_versions
  for insert with check (exists(select 1 from public.content_drafts d where d.id = draft_id and d.created_by = auth.uid()));

-- Collaborators on drafts
create table if not exists public.draft_collaborators (
  draft_id uuid references public.content_drafts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin','editor','viewer')),
  added_at timestamptz not null default now(),
  primary key (draft_id, user_id)
);

alter table public.draft_collaborators enable row level security;
create policy if not exists "collab_select_by_draft_owner" on public.draft_collaborators
  for select using (exists(select 1 from public.content_drafts d where d.id = draft_id and d.created_by = auth.uid()));
create policy if not exists "collab_insert_by_draft_owner" on public.draft_collaborators
  for insert with check (exists(select 1 from public.content_drafts d where d.id = draft_id and d.created_by = auth.uid()));


