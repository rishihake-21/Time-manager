-- Run this once in your Supabase project's SQL editor.

create extension if not exists "uuid-ossp";

-- The weekly recurring pattern: your normal college + personal timetable.
create table if not exists public.recurring_blocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null check (category in ('college', 'personal')),
  title text not null,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = Sunday ... 6 = Saturday
  start_time time not null,
  end_time time not null,
  location text,
  color text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (start_time < end_time)
);

-- One-off changes for a specific calendar date: either cancel a recurring
-- block for that day, or add an ad-hoc block (e.g. personal work that needs
-- to happen during normal college hours just for that one day).
create table if not exists public.date_exceptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exception_date date not null,
  type text not null check (type in ('cancel', 'add')),
  recurring_block_id uuid references public.recurring_blocks(id) on delete cascade,
  category text check (category in ('college', 'personal')),
  title text,
  start_time time,
  end_time time,
  location text,
  color text,
  notes text,
  created_at timestamptz default now(),
  check (
    (type = 'cancel' and recurring_block_id is not null)
    or
    (type = 'add' and title is not null and start_time is not null and end_time is not null and category is not null)
  )
);

create index if not exists idx_recurring_blocks_user_day on public.recurring_blocks (user_id, day_of_week);
create index if not exists idx_date_exceptions_user_date on public.date_exceptions (user_id, exception_date);

-- Row Level Security: every user only ever sees and edits their own rows.
alter table public.recurring_blocks enable row level security;
alter table public.date_exceptions enable row level security;

drop policy if exists "recurring_blocks_owner" on public.recurring_blocks;
create policy "recurring_blocks_owner"
  on public.recurring_blocks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "date_exceptions_owner" on public.date_exceptions;
create policy "date_exceptions_owner"
  on public.date_exceptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Real-time updates so edits show up instantly across devices/tabs.
alter publication supabase_realtime add table public.recurring_blocks;
alter publication supabase_realtime add table public.date_exceptions;
