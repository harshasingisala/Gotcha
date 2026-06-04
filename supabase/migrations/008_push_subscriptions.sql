create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fcm_token text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id)
);

alter table public.push_subscriptions
  add column if not exists fcm_token text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'push_subscriptions'
      and column_name = 'endpoint'
  ) then
    alter table public.push_subscriptions alter column endpoint drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'push_subscriptions'
      and column_name = 'p256dh'
  ) then
    alter table public.push_subscriptions alter column p256dh drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'push_subscriptions'
      and column_name = 'auth'
  ) then
    alter table public.push_subscriptions alter column auth drop not null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'push_subscriptions_user_id_key'
      and conrelid = 'public.push_subscriptions'::regclass
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_user_id_key unique (user_id);
  end if;
end $$;

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users manage own push token" on public.push_subscriptions;
create policy "Users manage own push token"
on public.push_subscriptions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists idx_push_subscriptions_user_id
on public.push_subscriptions(user_id);
