-- Run this once in your Supabase project's SQL editor.

create extension if not exists "uuid-ossp";

-- User profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subjects / Tracks / Projects
create table if not exists public.subjects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  short_name text,
  category text not null check (category in ('college', 'study', 'project')),
  teacher text,
  room text,
  notes text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Events (replaces recurring_blocks)
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  category text not null check (category in ('college', 'study', 'project', 'personal', 'exercise', 'other')),
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  description text,
  location text,
  recurrence_rule text, -- rrule string for recurring events
  recurrence_end timestamptz, -- when recurrence ends
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (start_datetime < end_datetime)
);

-- Event exceptions for recurring events (replaces date_exceptions)
create table if not exists public.event_exceptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  occurrence_date date not null,
  action text not null check (action in ('cancel', 'move', 'update')),
  replacement_start timestamptz,
  replacement_end timestamptz,
  replacement_title text,
  replacement_location text,
  replacement_notes text,
  created_at timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  description text,
  due_datetime timestamptz,
  priority int default 0 check (priority between 0 and 3), -- 0=none, 1=low, 2=medium, 3=high
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User settings
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_view text default 'today',
  week_starts_on int default 1 check (week_starts_on between 0 and 6),
  notification_enabled boolean default true,
  default_reminder_minutes int default 10,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_subjects_user on public.subjects (user_id);
create index if not exists idx_events_user_datetime on public.events (user_id, start_datetime);
create index if not exists idx_events_user_status on public.events (user_id, status);
create index if not exists idx_event_exceptions_user_date on public.event_exceptions (user_id, occurrence_date);
create index if not exists idx_tasks_user_due on public.tasks (user_id, due_datetime);
create index if not exists idx_tasks_user_completed on public.tasks (user_id, completed);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.events enable row level security;
alter table public.event_exceptions enable row level security;
alter table public.tasks enable row level security;
alter table public.settings enable row level security;

-- Policies
drop policy if exists "profiles_owner" on public.profiles;
create policy "profiles_owner"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "subjects_owner" on public.subjects;
create policy "subjects_owner"
  on public.subjects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "events_owner" on public.events;
create policy "events_owner"
  on public.events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "event_exceptions_owner" on public.event_exceptions;
create policy "event_exceptions_owner"
  on public.event_exceptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasks_owner" on public.tasks;
create policy "tasks_owner"
  on public.tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "settings_owner" on public.settings;
create policy "settings_owner"
  on public.settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Real-time
alter publication supabase_realtime add table public.subjects;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.event_exceptions;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.settings;