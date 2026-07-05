-- ================================================================
-- KuTo Kerala Explore — COMPLETE DATABASE RESET & REBUILD
-- Run this ONCE in: Supabase Dashboard → SQL Editor → Run
-- This script is fully self-contained and idempotent.
-- ================================================================

-- ── PHASE 1: WIPE EVERYTHING CLEAN ──────────────────────────

-- Drop triggers first
drop trigger if exists on_auth_user_created on auth.users;

-- Drop all project tables (cascade removes all policies, indexes, FKs)
drop table if exists public.support_tickets  cascade;
drop table if exists public.reviews          cascade;
drop table if exists public.bookings         cascade;
drop table if exists public.pending_guides   cascade;
drop table if exists public.guides           cascade;
drop table if exists public.travelers        cascade;
drop table if exists public.users            cascade;

-- Drop old functions
drop function if exists public.handle_new_user() cascade;

-- ── PHASE 2: ENABLE REQUIRED EXTENSIONS ─────────────────────
create extension if not exists "pgcrypto";

-- ================================================================
-- PHASE 3: CREATE TABLES
-- ================================================================

-- ── 3a. USERS (master profile — every user has a row here) ───
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique not null references auth.users(id) on delete cascade,
  email         text unique not null,
  full_name     text        not null default '',
  phone         text        not null default '',
  role          text        not null default 'traveler'
                check (role in ('traveler','guide','guide_admin','traveler_admin','super_admin')),
  status        text        not null default 'active'
                check (status in ('active','pending','approved','rejected','suspended')),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── 3b. GUIDES (guide profiles + verification status) ────────
create table public.guides (
  id               uuid primary key references auth.users(id) on delete cascade,
  first_name       text        not null default '',
  last_name        text        not null default '',
  email            text unique not null,
  phone            text        not null default '',
  biography        text,
  years_experience text,
  specializations  text[]      not null default '{}',
  languages        text[]      not null default '{}',
  price_per_day    numeric     not null default 0,
  availability     text,
  service_areas    text[]      not null default '{}',
  status           text        not null default 'pending'
                   check (status in ('pending','approved','rejected','suspended')),
  rating           numeric     not null default 0,
  total_reviews    int         not null default 0,
  total_bookings   int         not null default 0,
  avatar_url       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── 3c. TRAVELERS (traveler profiles) ────────────────────────
create table public.travelers (
  id           uuid primary key references auth.users(id) on delete cascade,
  first_name   text        not null default '',
  last_name    text        not null default '',
  email        text unique not null,
  phone        text        not null default '',
  nationality  text,
  interests    text[]      not null default '{}',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── 3d. BOOKINGS (traveler ↔ guide booking requests) ─────────
create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  traveler_id     uuid not null references public.travelers(id) on delete cascade,
  guide_id        uuid not null references public.guides(id)    on delete cascade,
  travel_date     date,
  duration_days   int         not null default 1,
  destination     text,
  group_size      int         not null default 1,
  special_notes   text,
  total_amount    numeric     not null default 0,
  status          text        not null default 'pending'
                  check (status in ('pending','confirmed','completed','cancelled','rejected')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── 3e. REVIEWS (traveler reviews of guides) ─────────────────
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings(id)  on delete cascade,
  traveler_id uuid        not null references public.travelers(id) on delete cascade,
  guide_id    uuid        not null references public.guides(id)    on delete cascade,
  rating      int         not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

-- ── 3f. SUPPORT TICKETS ───────────────────────────────────────
create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  user_email  text,
  subject     text not null,
  message     text not null,
  status      text not null default 'open'
              check (status in ('open','in_progress','resolved','closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ================================================================
-- PHASE 4: ROW LEVEL SECURITY
-- ================================================================

alter table public.users           enable row level security;
alter table public.guides          enable row level security;
alter table public.travelers       enable row level security;
alter table public.bookings        enable row level security;
alter table public.reviews         enable row level security;
alter table public.support_tickets enable row level security;

-- ── users policies ────────────────────────────────────────────
create policy "users: own row select"
  on public.users for select
  using (auth.uid() = auth_user_id);

create policy "users: own row update"
  on public.users for update
  using (auth.uid() = auth_user_id);

create policy "users: admins select all"
  on public.users for select
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('guide_admin','traveler_admin','super_admin')
  ));

create policy "users: admins update all"
  on public.users for update
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('guide_admin','traveler_admin','super_admin')
  ));

-- ── guides policies ───────────────────────────────────────────
create policy "guides: approved are public"
  on public.guides for select
  using (status = 'approved');

create policy "guides: own row select"
  on public.guides for select
  using (auth.uid() = id);

create policy "guides: own row update"
  on public.guides for update
  using (auth.uid() = id);

create policy "guides: insert on signup"
  on public.guides for insert
  with check (true);

create policy "guides: guide_admin select all"
  on public.guides for select
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('guide_admin','super_admin')
  ));

create policy "guides: guide_admin update status"
  on public.guides for update
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('guide_admin','super_admin')
  ));

-- ── travelers policies ────────────────────────────────────────
create policy "travelers: own row select"
  on public.travelers for select
  using (auth.uid() = id);

create policy "travelers: own row update"
  on public.travelers for update
  using (auth.uid() = id);

create policy "travelers: insert on signup"
  on public.travelers for insert
  with check (true);

create policy "travelers: traveler_admin select all"
  on public.travelers for select
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('traveler_admin','super_admin')
  ));

create policy "travelers: traveler_admin delete"
  on public.travelers for delete
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('traveler_admin','super_admin')
  ));

-- ── bookings policies ─────────────────────────────────────────
create policy "bookings: traveler own select"
  on public.bookings for select
  using (traveler_id = (
    select id from public.travelers where id = auth.uid()
  ));

create policy "bookings: guide own select"
  on public.bookings for select
  using (guide_id = (
    select id from public.guides where id = auth.uid()
  ));

create policy "bookings: traveler insert"
  on public.bookings for insert
  with check (traveler_id = auth.uid());

create policy "bookings: guide update status"
  on public.bookings for update
  using (guide_id = auth.uid());

create policy "bookings: admins select all"
  on public.bookings for select
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('guide_admin','traveler_admin','super_admin')
  ));

-- ── reviews policies ──────────────────────────────────────────
create policy "reviews: public select"
  on public.reviews for select
  using (true);

create policy "reviews: traveler insert"
  on public.reviews for insert
  with check (traveler_id = auth.uid());

-- ── support_tickets policies ──────────────────────────────────
create policy "support: user insert"
  on public.support_tickets for insert
  with check (true);

create policy "support: user own select"
  on public.support_tickets for select
  using (user_id = (
    select id from public.users where auth_user_id = auth.uid()
  ));

create policy "support: admins select all"
  on public.support_tickets for select
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('guide_admin','traveler_admin','super_admin')
  ));

create policy "support: admins update"
  on public.support_tickets for update
  using (exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and u.role in ('guide_admin','traveler_admin','super_admin')
  ));

-- ================================================================
-- PHASE 5: TRIGGER — auto-create profile on auth.users insert
-- ================================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_role    text;
  v_fname   text;
  v_lname   text;
  v_phone   text;
  v_fullname text;
begin
  v_role    := coalesce(new.raw_user_meta_data->>'role', 'traveler');
  v_fname   := coalesce(new.raw_user_meta_data->>'firstName', '');
  v_lname   := coalesce(new.raw_user_meta_data->>'lastName', '');
  v_phone   := coalesce(new.raw_user_meta_data->>'phone', '');
  v_fullname := trim(v_fname || ' ' || v_lname);

  -- Master users row (always)
  insert into public.users (auth_user_id, email, full_name, phone, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    v_fullname,
    v_phone,
    case when v_role in ('guide','guide_admin','traveler_admin','super_admin')
         then v_role else 'traveler' end,
    case when v_role = 'guide' then 'pending' else 'active' end
  )
  on conflict (auth_user_id) do nothing;

  -- Role-specific rows
  if v_role = 'guide' then
    insert into public.guides (id, first_name, last_name, email, phone, status)
    values (new.id, v_fname, v_lname, coalesce(new.email,''), v_phone, 'pending')
    on conflict (id) do nothing;

  elsif v_role = 'traveler' then
    insert into public.travelers (id, first_name, last_name, email, phone)
    values (new.id, v_fname, v_lname, coalesce(new.email,''), v_phone)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- PHASE 6: Admin users are seeded in migration 20260705120000_admin_seed.sql
-- ================================================================

-- Verify tables were created
select 'users' as table_name, count(*) as rows from public.users
union all
select 'guides',    count(*) from public.guides
union all
select 'travelers', count(*) from public.travelers
union all
select 'bookings',  count(*) from public.bookings
union all
select 'reviews',   count(*) from public.reviews
union all
select 'support_tickets', count(*) from public.support_tickets;


