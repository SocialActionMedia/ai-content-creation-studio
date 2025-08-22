-- Profiles table with role-based access control

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('admin','editor','client')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Only the user can read/update their own profile
create policy if not exists "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy if not exists "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Insert profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


