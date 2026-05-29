-- ============================================
-- CleanEats: meal_logs schema alignment
-- Run in: Supabase → SQL Editor (after supabase-meal-api-logs.sql if fresh)
-- Aligns table with app inserts in DashboardClient.js
-- ============================================

-- Drop legacy columns if present (from older schema)
alter table public.meal_logs drop column if exists meal_plan_id;
alter table public.meal_logs drop column if exists logged_at;
alter table public.meal_logs drop column if exists deviation_note;
alter table public.meal_logs drop column if exists swapped_from;
alter table public.meal_logs drop column if exists swapped_to;

-- Add columns expected by the app
alter table public.meal_logs add column if not exists meal_type text;
alter table public.meal_logs add column if not exists calories integer;
alter table public.meal_logs add column if not exists protein_g numeric;
alter table public.meal_logs add column if not exists carbs_g numeric;
alter table public.meal_logs add column if not exists fat_g numeric;
alter table public.meal_logs add column if not exists notes text;

alter table public.meal_logs add column if not exists meal_name text;

update public.meal_logs set meal_name = 'Unknown meal' where meal_name is null;

alter table public.meal_logs alter column meal_name set not null;

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
