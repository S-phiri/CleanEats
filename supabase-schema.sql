-- ============================================
-- CleanEats Database Schema
-- Run this in: Supabase → SQL Editor → New Query
-- ============================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  tier text default 'free' check (tier in ('free', 'pro', 'coach')),
  generations_this_month integer default 0,
  month_reset_date date default current_date,
  credits_used integer not null default 0,
  last_reset_date date default current_date,
  is_generating boolean not null default false,
  profile_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PLANS TABLE
create table public.plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_title text,
  plan_subtitle text,
  target_calories integer,
  plan_json jsonb not null,
  created_at timestamptz default now()
);

-- 3. ROW LEVEL SECURITY
-- Users can only see and edit their own data

alter table public.profiles enable row level security;
alter table public.plans enable row level security;

-- Profiles: users manage their own profile only
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Plans: users manage their own plans only
create policy "Users can view own plans"
  on public.plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on public.plans for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own plans"
  on public.plans for delete
  using (auth.uid() = user_id);

-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- Trigger that runs when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. AUTO-RESET MONTHLY GENERATIONS
-- Resets generation count at start of each month
create or replace function public.reset_monthly_generations()
returns void as $$
begin
  update public.profiles
  set generations_this_month = 0,
      month_reset_date = current_date
  where month_reset_date < date_trunc('month', current_date);
end;
$$ language plpgsql security definer;

-- Note: Call this function via a Supabase scheduled job (cron)
-- In Supabase Dashboard → Database → Extensions → enable pg_cron
-- Then: select cron.schedule('reset-generations', '0 0 1 * *', 'select public.reset_monthly_generations()');

-- 6. INDEXES for performance
create index plans_user_id_idx on public.plans(user_id);
create index plans_created_at_idx on public.plans(created_at desc);
