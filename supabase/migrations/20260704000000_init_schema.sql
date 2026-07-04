-- Create profiles for guides
create table public.guides (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles for travelers
create table public.travelers (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.guides enable row level security;
alter table public.travelers enable row level security;

-- Create policies for guides
create policy "Public guides are viewable by everyone." on public.guides
  for select using (true);

create policy "Users can update their own guide profile." on public.guides
  for update using (auth.uid() = id);

-- Create policies for travelers
create policy "Travelers can view their own profile." on public.travelers
  for select using (auth.uid() = id);

create policy "Users can update their own traveler profile." on public.travelers
  for update using (auth.uid() = id);

-- Create a trigger function that runs whenever a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
  f_name text;
  l_name text;
  p_number text;
begin
  -- Retrieve user metadata sent during auth.signUp()
  user_role := new.raw_user_meta_data ->> 'role';
  f_name := coalesce(new.raw_user_meta_data ->> 'firstName', '');
  l_name := coalesce(new.raw_user_meta_data ->> 'lastName', '');
  p_number := coalesce(new.raw_user_meta_data ->> 'phone', '');

  if user_role = 'guide' then
    insert into public.guides (id, first_name, last_name, email, phone)
    values (new.id, f_name, l_name, new.email, p_number);
  elsif user_role = 'traveler' then
    insert into public.travelers (id, first_name, last_name, email, phone)
    values (new.id, f_name, l_name, new.email, p_number);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created in auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
