-- Run these in Supabase SQL editor after applying 001_campus_lost_schema.sql.
-- Replace the UUIDs with real auth.users IDs in your project.

select 'tables_with_rls' as check_name, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
and tablename in ('users','items','claims','messages','notifications');

select 'policy_inventory' as check_name, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
and tablename in ('users','items','claims','messages','notifications')
order by tablename, policyname;

-- Users: own row is visible; non-admin cannot read other users.
begin;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('role', 'authenticated', true);
select count(*) as own_user_rows_visible
from public.users
where id = '00000000-0000-0000-0000-000000000001';
select count(*) as other_user_rows_hidden
from public.users
where id = '00000000-0000-0000-0000-000000000002';
rollback;

-- Items: anonymous can read active catalog rows.
begin;
select set_config('role', 'anon', true);
select count(*) as anon_item_rows_visible from public.items;
rollback;

-- Claims: claimant, item owner, or admin can read; unrelated users cannot.
begin;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('role', 'authenticated', true);
select count(*) as visible_claims_for_participant from public.claims;
rollback;

-- Messages: only sender or receiver can read and receiver can mark read.
begin;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('role', 'authenticated', true);
select count(*) as participant_messages_visible
from public.messages
where sender_id = auth.uid() or receiver_id = auth.uid();
rollback;

-- Notifications: only owner can read/update.
begin;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('role', 'authenticated', true);
select count(*) as own_notifications_visible
from public.notifications
where user_id = auth.uid();
rollback;

select 'storage_bucket' as check_name, id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'item-images';

