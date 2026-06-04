create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null,
  message text not null,
  status text default 'new' not null check (status in ('new','reviewed','closed')),
  created_at timestamptz default now() not null
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text default 'all' not null check (audience in ('all','students','admins')),
  status text default 'sent' not null check (status in ('draft','scheduled','sent')),
  scheduled_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now() not null
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  target_label text,
  risk text default 'low' not null check (risk in ('low','medium','high')),
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null
);

alter table public.contact_submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "contact submissions insert public" on public.contact_submissions;
create policy "contact submissions insert public"
on public.contact_submissions for insert
to anon, authenticated
with check (true);

drop policy if exists "contact submissions admin select" on public.contact_submissions;
create policy "contact submissions admin select"
on public.contact_submissions for select
to authenticated
using (public.is_admin());

drop policy if exists "announcements public sent select" on public.announcements;
create policy "announcements public sent select"
on public.announcements for select
to anon, authenticated
using (status = 'sent');

drop policy if exists "announcements admin all" on public.announcements;
create policy "announcements admin all"
on public.announcements for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "audit events admin select" on public.audit_events;
create policy "audit events admin select"
on public.audit_events for select
to authenticated
using (public.is_admin());

drop policy if exists "audit events admin insert" on public.audit_events;
create policy "audit events admin insert"
on public.audit_events for insert
to authenticated
with check (public.is_admin());

create index if not exists idx_contact_submissions_created_at_desc on public.contact_submissions(created_at desc);
create index if not exists idx_announcements_created_at_desc on public.announcements(created_at desc);
create index if not exists idx_announcements_status on public.announcements(status);
create index if not exists idx_audit_events_created_at_desc on public.audit_events(created_at desc);
create index if not exists idx_audit_events_risk on public.audit_events(risk);

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
check (type in ('match','claim_update','message','item_found','announcement','moderation','profile'));

grant insert on public.contact_submissions to anon, authenticated;
grant select, insert, update, delete on public.contact_submissions, public.announcements, public.audit_events to authenticated;
grant select on public.announcements to anon;
