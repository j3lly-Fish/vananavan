-- Enable PostGIS
create extension if not exists postgis;

-- Create Roles Enum
create type user_role as enum ('admin', 'driver', 'parent');

-- Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  first_name text,
  last_name text,
  role user_role not null default 'parent',
  phone text,
  is_active boolean default true,
  license_document_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Admins can update everyone"
  on profiles for update
  using ( exists (select 1 from profiles where id = auth.uid() and role = 'admin') );

-- Routes Table
create table routes (
  id uuid default gen_random_uuid() primary key,
  driver_id uuid references profiles(id) on delete cascade not null,
  name text,
  path geography(LINESTRING, 4326),
  schedule jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table routes enable row level security;

create policy "Routes are viewable by everyone"
  on routes for select
  using ( true );

create policy "Drivers can insert custom routes"
  on routes for insert
  with check ( auth.uid() = driver_id );

create policy "Drivers can update own routes"
  on routes for update
  using ( auth.uid() = driver_id );

create policy "Drivers can delete own routes"
  on routes for delete
  using ( auth.uid() = driver_id );

-- Messages Table
create table messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) not null,
  recipient_id uuid references profiles(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

create policy "Users can read messages sent to or by them"
  on messages for select
  using ( auth.uid() = sender_id or auth.uid() = recipient_id );

create policy "Users can insert messages"
  on messages for insert
  with check ( auth.uid() = sender_id );

-- TRIGGERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    (new.raw_user_meta_data->>'role')::user_role
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC Function for Matching
-- Returns routes that pass within 'distance_meters' of BOTH start_point and end_point
create or replace function match_routes(
  home_lat double precision,
  home_lng double precision,
  school_lat double precision,
  school_lng double precision,
  distance_meters double precision default 8000 -- ~5 miles default buffer
)
returns table (
  id uuid,
  driver_id uuid,
  name text,
  path geography,
  driver_name text,
  driver_email text
) language plpgsql security definer as $$
begin
  return query
  select 
    r.id,
    r.driver_id,
    r.name,
    r.path,
    p.first_name || ' ' || p.last_name as driver_name,
    p.email as driver_email
  from routes r
  join profiles p on r.driver_id = p.id
  where 
    -- Check if route is within distance of Home
    ST_DWithin(r.path, ST_SetSRID(ST_MakePoint(home_lng, home_lat), 4326), distance_meters)
    AND
    -- Check if route is within distance of School
    ST_DWithin(r.path, ST_SetSRID(ST_MakePoint(school_lng, school_lat), 4326), distance_meters);
end;
$$;

-- RPC Function to get conversation list
create or replace function get_conversations(user_id uuid)
returns table (
  partner_id uuid,
  partner_name text,
  last_message text,
  last_message_time timestamp with time zone,
  unread_count bigint
) language plpgsql security definer as $$
begin
  return query
  with conversation_partners as (
    select 
      distinct case when sender_id = user_id then recipient_id else sender_id end as partner_id
    from messages
    where sender_id = user_id or recipient_id = user_id
  )
  select 
    cp.partner_id,
    p.first_name || ' ' || p.last_name as partner_name,
    (select content from messages m where (m.sender_id = user_id and m.recipient_id = cp.partner_id) or (m.sender_id = cp.partner_id and m.recipient_id = user_id) order by created_at desc limit 1) as last_message,
    (select created_at from messages m where (m.sender_id = user_id and m.recipient_id = cp.partner_id) or (m.sender_id = cp.partner_id and m.recipient_id = user_id) order by created_at desc limit 1) as last_message_time,
    (select count(*) from messages m where m.recipient_id = user_id and m.sender_id = cp.partner_id and is_read = false) as unread_count
  from conversation_partners cp
  join profiles p on p.id = cp.partner_id
  order by last_message_time desc;
end;
$$;
