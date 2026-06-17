drop policy if exists "photos_public_read" on public.photos;

create policy "photos_public_read" on public.photos
for select using (
  is_deleted = false
  and exists (
    select 1 from public.events
    where id = photos.event_id and status = 'revealed'
  )
);
