-- ============================================================
-- Migration: Unified Auth & Dashboard Architecture (Idempotent)
-- Date: 2026-07-05
-- Safe to re-run: all CREATE statements use IF NOT EXISTS,
-- all policies are dropped before being recreated.
-- ============================================================

-- ── 1. Master users table ───────────────────────────────────
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  auth_user_id    uuid unique references auth.users(id) on delete cascade,
  email           text unique not null,
  full_name       text,
  phone           text,
  role            text not null default 'traveler'
                  check (role in ('traveler','guide','guide_admin','traveler_admin','super_admin')),
  status          text not null default 'active'
                  check (status in ('active','pending','approved','rejected','suspended')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS on users
alter table public.users enable row level security;

-- Drop all users policies first (idempotent)
drop policy if exists "Users can read own profile"    on public.users;
drop policy if exists "Users can update own profile"  on public.users;
drop policy if exists "Admins can read all users"     on public.users;
drop policy if exists "Admins can update all users"   on public.users;

create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = auth_user_id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = auth_user_id);

create policy "Admins can read all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.auth_user_id = auth.uid()
        and u.role in ('guide_admin','traveler_admin','super_admin')
    )
  );

create policy "Admins can update all users"
  on public.users for update
  using (
    exists (
      select 1 from public.users u
      where u.auth_user_id = auth.uid()
        and u.role in ('guide_admin','traveler_admin','super_admin')
    )
  );

-- ── 2. Add status & profile columns to guides ───────────────
alter table public.guides
  add column if not exists status            text not null default 'pending'
    check (status in ('pending','approved','rejected','suspended')),
  add column if not exists biography         text,
  add column if not exists years_experience  text,
  add column if not exists specializations   text[],
  add column if not exists languages         text[],
  add column if not exists price_per_day     numeric,
  add column if not exists availability      text,
  add column if not exists service_areas     text[],
  add column if not exists password          text,
  add column if not exists updated_at        timestamptz not null default now();

-- RLS on guides — drop all first
drop policy if exists "Public guides are viewable by everyone."  on public.guides;
drop policy if exists "Approved guides are public"               on public.guides;
drop policy if exists "Guide admins can view all guides"         on public.guides;
drop policy if exists "Guide admins can update guide status"     on public.guides;
drop policy if exists "Guides can insert own profile"            on public.guides;
drop policy if exists "Users can update their own guide profile." on public.guides;

create policy "Approved guides are public"
  on public.guides for select
  using (status = 'approved');

create policy "Guide admins can view all guides"
  on public.guides for select
  using (
    exists (
      select 1 from public.users u
      where u.auth_user_id = auth.uid()
        and u.role in ('guide_admin','super_admin')
    )
  );

create policy "Guide admins can update guide status"
  on public.guides for update
  using (
    exists (
      select 1 from public.users u
      where u.auth_user_id = auth.uid()
        and u.role in ('guide_admin','super_admin')
    )
  );

create policy "Guides can insert own profile"
  on public.guides for insert
  with check (true);

-- Allow guides to update their own profile
create policy "Guides can update own profile"
  on public.guides for update
  using (auth.uid() = id);

-- ── 3. Add profile columns to travelers ─────────────────────
alter table public.travelers
  add column if not exists password    text,
  add column if not exists updated_at  timestamptz not null default now();

-- RLS on travelers — drop all first
drop policy if exists "Travelers can view their own profile."        on public.travelers;
drop policy if exists "Travelers can view own profile"               on public.travelers;
drop policy if exists "Traveler admins can view all travelers"       on public.travelers;
drop policy if exists "Traveler admins can delete travelers"         on public.travelers;
drop policy if exists "Users can update their own traveler profile." on public.travelers;

create policy "Travelers can view own profile"
  on public.travelers for select
  using (auth.uid() = id);

create policy "Traveler admins can view all travelers"
  on public.travelers for select
  using (
    exists (
      select 1 from public.users u
      where u.auth_user_id = auth.uid()
        and u.role in ('traveler_admin','super_admin')
    )
  );

create policy "Traveler admins can delete travelers"
  on public.travelers for delete
  using (
    exists (
      select 1 from public.users u
      where u.auth_user_id = auth.uid()
        and u.role in ('traveler_admin','super_admin')
    )
  );

-- Allow travelers to insert own profile
create policy "Travelers can insert own profile"
  on public.travelers for insert
  with check (true);

-- Allow travelers to update own profile
create policy "Travelers can update own profile"
  on public.travelers for update
  using (auth.uid() = id);

-- ── 4. Drop pending_guides (replaced by guides.status) ──────
drop table if exists public.pending_guides;

-- ── 5. Updated trigger: insert into users + role table ──────
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  f_name    text;
  l_name    text;
  p_number  text;
  full_n    text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'traveler');
  f_name    := coalesce(new.raw_user_meta_data->>'firstName', '');
  l_name    := coalesce(new.raw_user_meta_data->>'lastName', '');
  p_number  := coalesce(new.raw_user_meta_data->>'phone', '');
  full_n    := trim(f_name || ' ' || l_name);

  -- Always insert into master users table
  insert into public.users (auth_user_id, email, full_name, phone, role, status)
  values (
    new.id,
    new.email,
    full_n,
    p_number,
    case
      when user_role in ('guide','guide_admin','traveler_admin','super_admin') then user_role
      else 'traveler'
    end,
    case
      when user_role = 'guide' then 'pending'
      else 'active'
    end
  )
  on conflict (auth_user_id) do nothing;

  -- Insert into role-specific table
  if user_role = 'guide' then
    insert into public.guides (id, first_name, last_name, email, phone, status)
    values (new.id, f_name, l_name, new.email, p_number, 'pending')
    on conflict (id) do nothing;

  elsif user_role = 'traveler' then
    insert into public.travelers (id, first_name, last_name, email, phone)
    values (new.id, f_name, l_name, new.email, p_number)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 6. Admin bootstrap user ─────────────────────────────────
-- Run this block ONCE manually after creating auth users via the
-- Supabase Dashboard (Authentication → Add User).
-- Replace the UUIDs with the actual auth_user_id values.
--
-- insert into public.users (auth_user_id, email, full_name, role, status)
-- values ('<auth_uid_of_guide_admin>', 'guideadmin@kuto.com', 'Guide Admin', 'guide_admin', 'active')
-- on conflict (auth_user_id) do nothing;
--
-- insert into public.users (auth_user_id, email, full_name, role, status)
-- values ('<auth_uid_of_traveler_admin>', 'traveleradmin@kuto.com', 'Traveler Admin', 'traveler_admin', 'active')
-- on conflict (auth_user_id) do nothing;
