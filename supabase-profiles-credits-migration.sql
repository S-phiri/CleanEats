-- ============================================
-- Profiles credits columns (run after supabase-schema.sql)
-- Required for /api/generate free-tier credit charging
-- ============================================

alter table public.profiles
  add column if not exists credits_used integer not null default 0,
  add column if not exists last_reset_date date default current_date,
  add column if not exists is_generating boolean not null default false;

update public.profiles
set
  credits_used = coalesce(credits_used, 0),
  last_reset_date = coalesce(last_reset_date, current_date),
  is_generating = coalesce(is_generating, false)
where credits_used is null
   or last_reset_date is null
   or is_generating is null;
