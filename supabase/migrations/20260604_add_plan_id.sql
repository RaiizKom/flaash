-- supabase/migrations/20260604_add_plan_id.sql
alter table public.events add column plan_id text;
