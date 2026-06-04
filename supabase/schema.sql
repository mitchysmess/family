create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text not null default 'member',
  avatar_url text,
  profile_color text not null default '#347468',
  created_at timestamp with time zone not null default now(),
  constraint profiles_role_check check (role in ('admin', 'member')),
  constraint profiles_profile_color_check check (profile_color ~ '^#[0-9A-Fa-f]{6}$')
);

alter table public.profiles
  add column if not exists profile_color text not null default '#347468';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_profile_color_check'
  ) then
    alter table public.profiles
      add constraint profiles_profile_color_check
      check (profile_color ~ '^#[0-9A-Fa-f]{6}$');
  end if;
end $$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  task_date date not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint tasks_status_check check (status in ('open', 'done')),
  constraint tasks_priority_check check (priority in ('normal', 'high'))
);

alter table public.tasks
  add column if not exists priority text not null default 'normal';

alter table public.tasks
  alter column assigned_to drop not null,
  alter column created_by drop not null,
  alter column status set default 'open',
  alter column priority set default 'normal',
  alter column created_at set default now(),
  alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_priority_check'
  ) then
    alter table public.tasks
      add constraint tasks_priority_check
      check (priority in ('normal', 'high'));
  end if;
end $$;

create index if not exists tasks_task_date_idx on public.tasks(task_date);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_created_by_idx on public.tasks(created_by);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_priority_idx on public.tasks(priority);
