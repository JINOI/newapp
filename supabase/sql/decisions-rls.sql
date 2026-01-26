alter table public.decisions enable row level security;

create policy "decisions_select_own"
on public.decisions
for select
using (user_id = auth.uid());

create policy "decisions_insert_own"
on public.decisions
for insert
with check (user_id = auth.uid());

create policy "decisions_update_own"
on public.decisions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "decisions_delete_own"
on public.decisions
for delete
using (user_id = auth.uid());

create policy "decisions_public_read_by_slug"
on public.decisions
for select
using (
  is_public = true
  and share_slug is not null
);
