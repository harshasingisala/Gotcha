create table if not exists public.item_matches (
  id uuid primary key default gen_random_uuid(),
  source_item_id uuid not null references public.items(id) on delete cascade,
  matched_item_id uuid not null references public.items(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  reasons jsonb default '[]'::jsonb not null,
  status text default 'suggested' not null check (status in ('suggested', 'notified', 'dismissed', 'confirmed')),
  created_at timestamptz default now() not null,
  unique(source_item_id, matched_item_id)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  channel text not null check (channel in ('email', 'push')),
  status text not null check (status in ('sent', 'skipped', 'failed')),
  detail text,
  created_at timestamptz default now() not null
);

alter table public.item_matches enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_deliveries enable row level security;

alter table public.items
  add column if not exists claim_challenge_questions jsonb default '[]'::jsonb not null;

alter table public.claims
  add column if not exists challenge_answers jsonb default '{}'::jsonb not null,
  add column if not exists challenge_score integer default 0 not null check (challenge_score between 0 and 100);

create index if not exists idx_item_matches_source on public.item_matches(source_item_id);
create index if not exists idx_item_matches_matched on public.item_matches(matched_item_id);
create index if not exists idx_item_matches_score on public.item_matches(score desc);
create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);
create index if not exists idx_notification_deliveries_user on public.notification_deliveries(user_id);

drop policy if exists "item matches participants select" on public.item_matches;
create policy "item matches participants select"
on public.item_matches for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.items
    where items.id in (item_matches.source_item_id, item_matches.matched_item_id)
      and items.user_id = auth.uid()
  )
);

drop policy if exists "item matches admin all" on public.item_matches;
create policy "item matches admin all"
on public.item_matches for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.item_matches to authenticated;
grant select (
  claim_challenge_questions
) on public.items to anon, authenticated;

drop policy if exists "push subscriptions owner all" on public.push_subscriptions;
create policy "push subscriptions owner all"
on public.push_subscriptions for all
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "notification deliveries owner select" on public.notification_deliveries;
create policy "notification deliveries owner select"
on public.notification_deliveries for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant select on public.notification_deliveries to authenticated;
