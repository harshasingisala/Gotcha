alter table public.items
  add column if not exists urgency text default 'normal' not null
    check (urgency in ('normal', 'emergency')),
  add column if not exists verification_answer_hash text;

alter table public.claims
  add column if not exists student_id text,
  add column if not exists verification_answer_match boolean default false not null,
  add column if not exists handoff_status text default 'review' not null
    check (handoff_status in ('review', 'approved', 'scheduled', 'returned', 'rejected'));

create index if not exists idx_items_urgency on public.items(urgency);
create index if not exists idx_claims_handoff_status on public.claims(handoff_status);

alter table public.claims drop constraint if exists claims_student_id_format;
alter table public.claims add constraint claims_student_id_format
check (student_id is null or student_id ~ '^[A-Za-z0-9][A-Za-z0-9/-]{3,31}$');

drop policy if exists "claims insert authenticated claimant" on public.claims;
create policy "claims insert authenticated claimant"
on public.claims for insert
to authenticated
with check (
  claimant_id = auth.uid()
  and length(coalesce(trim(proof_description), '')) >= 40
  and student_id ~ '^[A-Za-z0-9][A-Za-z0-9/-]{3,31}$'
  and exists (
    select 1 from public.items
    where items.id = claims.item_id
      and items.type = 'found'
      and items.status = 'active'
      and items.user_id <> auth.uid()
  )
);
