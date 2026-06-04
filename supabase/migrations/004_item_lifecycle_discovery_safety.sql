alter table public.items
  add column if not exists lifecycle_state text default 'reported' not null
    check (lifecycle_state in ('reported', 'matched', 'claimed', 'verified', 'closed')),
  add column if not exists location_zone text,
  add column if not exists expires_at timestamptz default (now() + interval '14 days') not null,
  add column if not exists closed_at timestamptz;

alter table public.items drop constraint if exists items_category_check;
alter table public.items add constraint items_category_check
check (category in ('Phone', 'ID Card', 'Keys', 'Bag', 'Wallet', 'Laptop', 'Electronics', 'Stationery', 'ID/Documents', 'Clothing', 'Accessories', 'Other'));

create table if not exists public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(id) on delete set null,
  target_type text not null check (target_type in ('item', 'message', 'user')),
  target_id uuid not null,
  reason text not null,
  status text default 'open' not null check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz default now() not null
);

alter table public.safety_reports enable row level security;

create index if not exists idx_items_lifecycle_state on public.items(lifecycle_state);
create index if not exists idx_items_location_zone on public.items(location_zone);
create index if not exists idx_items_expires_at on public.items(expires_at);
create index if not exists idx_safety_reports_status on public.safety_reports(status);
create index if not exists idx_safety_reports_target on public.safety_reports(target_type, target_id);

revoke select on public.items from anon, authenticated;
grant select (
  id,
  user_id,
  type,
  title,
  description,
  category,
  location,
  location_zone,
  date_occurred,
  image_url,
  status,
  lifecycle_state,
  urgency,
  expires_at,
  closed_at,
  created_at
) on public.items to anon, authenticated;

drop policy if exists "safety reports insert authenticated" on public.safety_reports;
create policy "safety reports insert authenticated"
on public.safety_reports for insert
to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "safety reports admin select" on public.safety_reports;
create policy "safety reports admin select"
on public.safety_reports for select
to authenticated
using (public.is_admin());

drop policy if exists "safety reports admin update" on public.safety_reports;
create policy "safety reports admin update"
on public.safety_reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, insert, update on public.safety_reports to authenticated;
