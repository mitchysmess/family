alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

drop policy if exists "Authenticated users can read tasks" on public.tasks;
drop policy if exists "Authenticated users can create tasks" on public.tasks;
drop policy if exists "Authenticated users can update task status" on public.tasks;

revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
revoke all on public.tasks from anon;
revoke all on public.tasks from authenticated;

-- This app uses one shared app login and server-side API routes.
-- The browser never talks directly to Supabase tables.
-- Database access happens server-side with SUPABASE_SERVICE_ROLE_KEY.
-- Keep that key only in Vercel/server environment variables.
