create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  student_id text,
  college text,
  role text default 'student' not null check (role in ('student','admin')),
  avatar_url text,
  created_at timestamptz default now() not null
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('lost','found')),
  title text not null,
  description text,
  category text check (category in ('Electronics','Stationery','ID/Documents','Clothing','Accessories','Other')),
  location text,
  date_occurred date,
  image_url text,
  status text default 'active' not null check (status in ('active','claimed','returned','closed')),
  created_at timestamptz default now() not null
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimant_id uuid not null references public.users(id) on delete cascade,
  proof_description text,
  proof_image_url text,
  student_id_verified boolean default false not null,
  status text default 'pending' not null check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz default now() not null,
  unique(item_id, claimant_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  content text not null,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text check (type in ('match','claim_update','message','item_found')),
  title text not null,
  body text,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_items_user_id on public.items(user_id);
create index if not exists idx_items_status on public.items(status);
create index if not exists idx_items_category on public.items(category);
create index if not exists idx_items_created_at_desc on public.items(created_at desc);
create index if not exists idx_claims_item_id on public.claims(item_id);
create index if not exists idx_claims_claimant_id on public.claims(claimant_id);
create index if not exists idx_claims_status on public.claims(status);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_receiver_id on public.messages(receiver_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(read);

alter table public.users enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "users select own or admin" on public.users;
create policy "users select own or admin"
on public.users for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "users insert own" on public.users;
create policy "users insert own"
on public.users for insert
with check (id = auth.uid());

drop policy if exists "users update own or admin" on public.users;
create policy "users update own or admin"
on public.users for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "items public select" on public.items;
create policy "items public select"
on public.items for select
to anon, authenticated
using (true);

drop policy if exists "items insert authenticated" on public.items;
create policy "items insert authenticated"
on public.items for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "items update owner or admin" on public.items;
create policy "items update owner or admin"
on public.items for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "items delete owner or admin" on public.items;
create policy "items delete owner or admin"
on public.items for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "claims select participant or admin" on public.claims;
create policy "claims select participant or admin"
on public.claims for select
to authenticated
using (
  claimant_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.items
    where items.id = claims.item_id and items.user_id = auth.uid()
  )
);

drop policy if exists "claims insert authenticated claimant" on public.claims;
create policy "claims insert authenticated claimant"
on public.claims for insert
to authenticated
with check (claimant_id = auth.uid());

drop policy if exists "claims update admin only" on public.claims;
create policy "claims update admin only"
on public.claims for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "messages select participant" on public.messages;
create policy "messages select participant"
on public.messages for select
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "messages insert sender" on public.messages;
create policy "messages insert sender"
on public.messages for insert
to authenticated
with check (sender_id = auth.uid());

drop policy if exists "messages update receiver_read" on public.messages;
create policy "messages update receiver_read"
on public.messages for update
to authenticated
using (receiver_id = auth.uid())
with check (receiver_id = auth.uid());

drop policy if exists "notifications select own" on public.notifications;
create policy "notifications select own"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-images', 'item-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "item images public read" on storage.objects;
create policy "item images public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'item-images');

drop policy if exists "item images authenticated insert" on storage.objects;
create policy "item images authenticated insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce((metadata->>'size')::int, 0) <= 5242880
  and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg','image/png','image/webp')
);

drop policy if exists "item images owner update" on storage.objects;
create policy "item images owner update"
on storage.objects for update
to authenticated
using (bucket_id = 'item-images' and owner = auth.uid())
with check (
  bucket_id = 'item-images'
  and owner = auth.uid()
  and coalesce((metadata->>'size')::int, 0) <= 5242880
  and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg','image/png','image/webp')
);

drop policy if exists "item images owner delete" on storage.objects;
create policy "item images owner delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'item-images' and owner = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.items to anon;
grant select, insert, update, delete on public.users, public.items, public.claims, public.messages, public.notifications to authenticated;

