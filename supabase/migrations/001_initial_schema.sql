-- ============================================================
-- Flaash — Initial schema
-- Run via: supabase db push  OR  supabase migration up
-- ============================================================

-- ── Custom types ──────────────────────────────────────────
create type event_type as enum (
  'anniversary', 'wedding', 'engagement', 'party', 'corporate', 'other'
);

create type event_status as enum (
  'draft', 'active', 'revealed', 'closed'
);

create type photo_source as enum (
  'camera', 'library'
);

-- ── events ────────────────────────────────────────────────
create table public.events (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references auth.users(id) on delete cascade,
  title               text not null,
  event_type          event_type not null default 'other',
  slug                text not null unique,
  status              event_status not null default 'draft',
  max_guests          integer not null default 50 check (max_guests > 0),
  photos_per_guest    integer not null default 8 check (photos_per_guest between 1 and 20),
  reveal_at           timestamptz,
  allow_library_upload boolean not null default false,
  price_chf           numeric(10,2) not null default 49,
  stripe_payment_id   text,
  created_at          timestamptz not null default now(),
  expires_at          timestamptz
);

create index events_owner_id_idx   on public.events(owner_id);
create index events_slug_idx       on public.events(slug);
create index events_status_idx     on public.events(status);
create index events_reveal_at_idx  on public.events(reveal_at) where reveal_at is not null;

-- ── guests ────────────────────────────────────────────────
create table public.guests (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  first_name   text not null,
  token        text not null unique default replace(gen_random_uuid()::text, '-', ''),
  photos_taken integer not null default 0,
  is_blocked   boolean not null default false,
  joined_at    timestamptz not null default now()
);

create index guests_event_id_idx on public.guests(event_id);
create index guests_token_idx    on public.guests(token);

-- ── photos ────────────────────────────────────────────────
create table public.photos (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  guest_id      uuid not null references public.guests(id) on delete cascade,
  storage_url   text not null,
  thumbnail_url text not null,
  is_deleted    boolean not null default false,
  taken_at      timestamptz not null default now(),
  source        photo_source not null default 'camera'
);

create index photos_event_id_idx    on public.photos(event_id);
create index photos_guest_id_idx    on public.photos(guest_id);
create index photos_taken_at_idx    on public.photos(taken_at);

-- ── Row Level Security ────────────────────────────────────
alter table public.events enable row level security;
alter table public.guests  enable row level security;
alter table public.photos  enable row level security;

-- events: owner full access
create policy "events_owner_all" on public.events
  for all using (auth.uid() = owner_id);

-- events: guests can read active/revealed events by slug (via anon key)
create policy "events_public_read" on public.events
  for select using (status in ('active', 'revealed'));

-- guests: owner can manage all guests of their events
create policy "guests_owner_all" on public.guests
  for all using (
    exists (
      select 1 from public.events
      where id = guests.event_id and owner_id = auth.uid()
    )
  );

-- guests: allow insert from anon (joining an event)
create policy "guests_anon_insert" on public.guests
  for insert with check (
    exists (
      select 1 from public.events
      where id = guests.event_id and status = 'active'
    )
  );

-- guests: guests can read their own row (matched by token in app logic)
create policy "guests_self_read" on public.guests
  for select using (true); -- token-gated in app layer

-- photos: owner can manage all photos of their events
create policy "photos_owner_all" on public.photos
  for all using (
    exists (
      select 1 from public.events
      where id = photos.event_id and owner_id = auth.uid()
    )
  );

-- photos: insert allowed when event is active (guest token validated in app)
create policy "photos_guest_insert" on public.photos
  for insert with check (
    exists (
      select 1 from public.events
      where id = photos.event_id and status = 'active'
    )
  );

-- photos: visible to all once event is revealed
create policy "photos_public_read" on public.photos
  for select using (
    is_deleted = false
    and exists (
      select 1 from public.events
      where id = photos.event_id and status in ('active', 'revealed')
    )
  );

-- ── Helper function: auto-reveal events ──────────────────
create or replace function public.reveal_due_events()
returns void
language plpgsql
security definer
as $$
begin
  update public.events
  set status = 'revealed'
  where status = 'active'
    and reveal_at is not null
    and reveal_at <= now();
end;
$$;
