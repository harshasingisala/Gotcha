-- Claim verification gate: private proof photos + atomic item-level review.

alter table public.items
  add column if not exists claim_photo_url text,
  add column if not exists claim_note text check (char_length(claim_note) <= 500),
  add column if not exists claim_rejected_reason text,
  add column if not exists claimed_by uuid references public.users(id) on delete set null;

create index if not exists idx_items_claimed_by on public.items(claimed_by);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('claim-photos', 'claim-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "claim photos claimant insert" on storage.objects;
create policy "claim photos claimant insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'claim-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
  and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg','image/png','image/webp')
  and coalesce((metadata->>'size')::int, 0) <= 5242880
);

drop policy if exists "claim photos claimant select own" on storage.objects;
create policy "claim photos claimant select own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'claim-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "claim photos admin select" on storage.objects;
create policy "claim photos admin select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'claim-photos'
  and public.is_admin()
);

create or replace function public.claim_item(
  p_item_id uuid,
  p_claim_photo_url text,
  p_claim_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if p_claim_photo_url is null or length(trim(p_claim_photo_url)) = 0 then
    raise exception 'Claim proof photo is required';
  end if;

  if p_claim_note is not null and char_length(p_claim_note) > 500 then
    raise exception 'Claim note must be 500 characters or fewer';
  end if;

  update public.items
  set
    lifecycle_state = 'claimed',
    claim_photo_url = p_claim_photo_url,
    claim_note = nullif(trim(p_claim_note), ''),
    claim_rejected_reason = null,
    claimed_by = auth.uid(),
    status = 'active'
  where
    id = p_item_id
    and type = 'found'
    and lifecycle_state = 'matched'
    and user_id <> auth.uid();

  if not found then
    raise exception 'Item is not available for claiming or you posted it';
  end if;
end;
$$;

create or replace function public.admin_approve_claim(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  update public.items
  set lifecycle_state = 'verified'
  where id = p_item_id and lifecycle_state = 'claimed';

  if not found then
    raise exception 'Item is not in claimed state';
  end if;
end;
$$;

create or replace function public.admin_reject_claim(
  p_item_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  if char_length(coalesce(trim(p_reason), '')) < 10 then
    raise exception 'Rejection reason must be at least 10 characters';
  end if;

  update public.items
  set
    lifecycle_state = 'matched',
    claim_photo_url = null,
    claim_note = null,
    claimed_by = null,
    claim_rejected_reason = trim(p_reason)
  where id = p_item_id and lifecycle_state = 'claimed';

  if not found then
    raise exception 'Item is not in claimed state';
  end if;
end;
$$;

create or replace function public.admin_pending_claim_items()
returns table (
  id uuid,
  title text,
  category text,
  location text,
  location_zone text,
  image_url text,
  claim_photo_url text,
  claim_note text,
  claimed_by uuid,
  claimant_name text,
  claimant_email text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    i.id,
    i.title,
    i.category,
    i.location,
    i.location_zone,
    i.image_url,
    i.claim_photo_url,
    i.claim_note,
    i.claimed_by,
    u.full_name as claimant_name,
    u.email as claimant_email,
    i.created_at
  from public.items i
  left join public.users u on u.id = i.claimed_by
  where i.lifecycle_state = 'claimed'
    and i.claimed_by is not null
  order by i.created_at desc;
end;
$$;

grant execute on function public.claim_item(uuid, text, text) to authenticated;
grant execute on function public.admin_approve_claim(uuid) to authenticated;
grant execute on function public.admin_reject_claim(uuid, text) to authenticated;
grant execute on function public.admin_pending_claim_items() to authenticated;
