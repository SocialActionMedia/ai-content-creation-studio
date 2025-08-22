-- Feedback and learned tips
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.content_drafts(id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
create policy if not exists "feedback_select_own" on public.feedback for select using (auth.uid() = created_by);
create policy if not exists "feedback_insert_own" on public.feedback for insert with check (auth.uid() = created_by);

create table if not exists public.learned_tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  text text not null,
  weight numeric not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.learned_tips enable row level security;
create policy if not exists "tips_select_own" on public.learned_tips for select using (auth.uid() = user_id);
create policy if not exists "tips_upsert_own" on public.learned_tips for insert with check (auth.uid() = user_id);


