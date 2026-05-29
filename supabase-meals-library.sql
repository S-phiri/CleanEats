-- ============================================
-- CleanEats: meals_library (shared meal cache)
-- Run in: Supabase → SQL Editor → New Query
-- Then seed: node scripts/seed-meals-library.js
-- ============================================

create table if not exists public.meals_library (
  id uuid primary key default gen_random_uuid(),
  meal_json jsonb not null,
  meal_type text not null,
  country_code text not null,
  culinary_style text not null,
  goal text not null,
  diet_tags text[] not null default '{}',
  budget_tier text,
  calories int not null,
  protein_g int not null,
  carbs_g int not null,
  fat_g int not null,
  cuisine_tags text[] default '{}',
  archetype_key text,
  ingredient_names text[] not null default '{}',
  content_hash text not null unique,
  source text not null default 'claude',
  use_count int not null default 0,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

comment on table public.meals_library is
  'Shared reusable meals for cache-first plan assembly. Inserts via service role / server routes only.';

create index if not exists meals_library_lookup_idx on public.meals_library (
  country_code, culinary_style, goal, meal_type, calories, protein_g
);

create index if not exists meals_library_ingredient_names_gin
  on public.meals_library using gin (ingredient_names);

alter table public.meals_library enable row level security;

drop policy if exists "Authenticated users can read meals_library" on public.meals_library;
create policy "Authenticated users can read meals_library"
  on public.meals_library
  for select
  to authenticated
  using (true);

grant select on public.meals_library to authenticated;

create or replace function public.increment_meal_library_use(p_meal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.meals_library
  set use_count = use_count + 1,
      last_used_at = now()
  where id = p_meal_id;
end;
$$;

grant execute on function public.increment_meal_library_use(uuid) to authenticated;

-- Optional api_logs columns for cache observability (safe if api_logs missing)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'api_logs'
  ) then
    alter table public.api_logs add column if not exists prompt_type text;
    alter table public.api_logs add column if not exists cache_hits integer;
    alter table public.api_logs add column if not exists cache_misses integer;
  end if;
end $$;
