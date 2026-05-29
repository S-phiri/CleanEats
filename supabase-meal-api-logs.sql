-- ============================================
-- CleanEats: meal_logs + api_logs
-- Run in: Supabase → SQL Editor → New Query
-- Requires: auth.users, public.plans (see supabase-schema.sql)
-- ============================================

-- ---------------------------------------------------------------------------
-- meal_logs — user meal history (what was eaten + coach notes)
-- ---------------------------------------------------------------------------
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  meal_type text,
  meal_name text not null,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  notes text
);

comment on table public.meal_logs is
  'Per-user meal log entries: what was eaten, macros, and coach deviation notes.';

create index if not exists meal_logs_user_id_idx
  on public.meal_logs (user_id);

create index if not exists meal_logs_created_at_idx
  on public.meal_logs (created_at desc);

alter table public.meal_logs enable row level security;

drop policy if exists "Users can view own meal_logs" on public.meal_logs;
create policy "Users can view own meal_logs"
  on public.meal_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own meal_logs" on public.meal_logs;
create policy "Users can insert own meal_logs"
  on public.meal_logs
  for insert
  with check (auth.uid() = user_id);

grant select, insert on public.meal_logs to authenticated;

-- ---------------------------------------------------------------------------
-- api_logs — Anthropic / API usage and credit audit per request
-- ---------------------------------------------------------------------------
create table if not exists public.api_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  endpoint text not null,
  credits_used integer not null default 1,
  model text not null default 'claude-sonnet-4-20250514',
  input_tokens integer,
  output_tokens integer,
  duration_ms integer,
  created_at timestamptz not null default now()
);

comment on table public.api_logs is
  'Server-side audit of API calls (e.g. /api/generate): credits charged, model, token usage, and latency.';

create index if not exists api_logs_user_id_idx
  on public.api_logs (user_id);

create index if not exists api_logs_created_at_idx
  on public.api_logs (created_at desc);

alter table public.api_logs enable row level security;

drop policy if exists "Users can view own api_logs" on public.api_logs;
create policy "Users can view own api_logs"
  on public.api_logs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own api_logs" on public.api_logs;
create policy "Users can insert own api_logs"
  on public.api_logs
  for insert
  with check (auth.uid() = user_id);

grant select, insert on public.api_logs to authenticated;

-- Service role (route handlers / cron) bypasses RLS for inserts with any user_id.
