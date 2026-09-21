-- Aura internal API: phone join key + active fasting flag (server-to-server from Aura bot)
alter table public.profiles
  add column if not exists phone_digits text,
  add column if not exists aura_fasting boolean not null default false,
  add column if not exists aura_fasting_until date;

create unique index if not exists profiles_phone_digits_uidx
  on public.profiles (phone_digits)
  where phone_digits is not null;
