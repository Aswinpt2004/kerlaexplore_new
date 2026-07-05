-- Alter guides table to support additional registration columns
alter table public.guides add column if not exists years_experience text;
alter table public.guides add column if not exists biography text;
alter table public.guides add column if not exists specializations text[];
alter table public.guides add column if not exists languages text[];
alter table public.guides add column if not exists price_per_day numeric;
alter table public.guides add column if not exists availability text;
alter table public.guides add column if not exists service_areas text[];
alter table public.guides add column if not exists password text;

-- Create pending_guides table to store details before verification
create table if not exists public.pending_guides (
  id uuid primary key,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  password text,
  years_experience text,
  biography text,
  specializations text[],
  languages text[],
  price_per_day numeric,
  availability text,
  service_areas text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for pending_guides
alter table public.pending_guides enable row level security;

-- Policies for pending_guides
create policy "Pending profiles are viewable by anyone."
  on public.pending_guides for select
  using (true);

create policy "Anyone can insert a pending guide profile."
  on public.pending_guides for insert
  with check (true);

create policy "Anyone can delete pending guides."
  on public.pending_guides for delete
  using (true);

-- Update public.handle_new_user trigger function to NOT insert guide into guides table automatically.
-- Only traveler should be auto-inserted. Guide profiles are moved manually from pending_guides to guides on verification.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  f_name text;
  l_name text;
  p_number text;
begin
  user_role := new.raw_user_meta_data ->> 'role';
  f_name := coalesce(new.raw_user_meta_data ->> 'firstName', '');
  l_name := coalesce(new.raw_user_meta_data ->> 'lastName', '');
  p_number := coalesce(new.raw_user_meta_data ->> 'phone', '');

  if user_role = 'traveler' then
    insert into public.travelers (id, first_name, last_name, email, phone)
    values (new.id, f_name, l_name, new.email, p_number);
  end if;

  return new;
end;
$$ language plpgsql security definer;
