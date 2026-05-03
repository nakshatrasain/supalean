-- SUPA LEAN — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- ===== PROFILES =====
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  weight numeric(5,2),
  target_weight numeric(5,2),
  height numeric(5,1),
  age integer,
  body_fat_percent numeric(5,2),
  muscle_mass numeric(5,2),
  visceral_fat_level integer,
  bmi numeric(4,1),
  bmr integer,
  waist_hip_ratio numeric(4,2),
  abdomen_cm numeric(5,1),
  inbody_score integer,
  daily_cal_target integer default 1900,
  daily_protein_target integer default 130,
  hrv_baseline numeric(5,1),
  rhr_baseline integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for all using (auth.uid() = id);

-- ===== MEALS =====
create table if not exists public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  meal_type text not null,
  name text not null,
  calories integer default 0,
  protein numeric(6,1) default 0,
  carbs numeric(6,1) default 0,
  fat numeric(6,1) default 0,
  meal_date date default current_date,
  logged_at timestamp with time zone default now()
);

alter table public.meals enable row level security;

create policy "Users manage own meals" on public.meals
  for all using (auth.uid() = user_id);

create index meals_user_date_idx on public.meals(user_id, meal_date desc);

-- ===== WORKOUTS =====
create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  session_type text, -- Push, Pull, Legs
  workout_date date default current_date,
  logged_at timestamp with time zone default now()
);

create table if not exists public.exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  sets jsonb default '[]', -- [{weight, reps}, ...]
  exercise_date date default current_date,
  logged_at timestamp with time zone default now()
);

alter table public.workouts enable row level security;
alter table public.exercises enable row level security;

create policy "Users manage own workouts" on public.workouts
  for all using (auth.uid() = user_id);

create policy "Users manage own exercises" on public.exercises
  for all using (auth.uid() = user_id);

-- ===== CARDIO =====
create table if not exists public.cardio_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  cardio_type text not null,
  duration_minutes integer,
  calories_burned integer,
  speed_level text,
  incline_resistance text,
  session_date date default current_date,
  logged_at timestamp with time zone default now()
);

alter table public.cardio_sessions enable row level security;

create policy "Users manage own cardio" on public.cardio_sessions
  for all using (auth.uid() = user_id);

-- ===== RECOVERY (WHOOP) =====
create table if not exists public.recovery_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  recovery_score integer,
  hrv_ms numeric(5,1),
  rhr_bpm integer,
  sleep_hours numeric(4,2),
  log_date date default current_date,
  logged_at timestamp with time zone default now(),
  unique(user_id, log_date)
);

alter table public.recovery_logs enable row level security;

create policy "Users manage own recovery" on public.recovery_logs
  for all using (auth.uid() = user_id);

-- ===== WEIGHT LOG =====
create table if not exists public.weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  weight numeric(5,2) not null,
  log_date date default current_date,
  logged_at timestamp with time zone default now()
);

alter table public.weight_logs enable row level security;

create policy "Users manage own weights" on public.weight_logs
  for all using (auth.uid() = user_id);

create index weight_logs_user_date_idx on public.weight_logs(user_id, log_date desc);

-- ===== STEPS =====
create table if not exists public.steps_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  steps integer not null,
  log_date date default current_date,
  unique(user_id, log_date)
);

alter table public.steps_logs enable row level security;

create policy "Users manage own steps" on public.steps_logs
  for all using (auth.uid() = user_id);

-- ===== CHAT HISTORY =====
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.chat_messages enable row level security;

create policy "Users manage own chat" on public.chat_messages
  for all using (auth.uid() = user_id);

create index chat_messages_user_idx on public.chat_messages(user_id, created_at desc);

-- ===== TRIGGER: update profiles.updated_at =====
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ===== TRIGGER: auto-create profile on signup =====
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
