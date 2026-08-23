revoke all on table public.event_attendance from service_role;
revoke all on sequence public.event_attendance_id_seq from service_role;

grant select, insert, update, delete on table public.event_attendance to service_role;
grant usage, select on sequence public.event_attendance_id_seq to service_role;

drop policy if exists "deny direct anonymous attendance access"
  on public.event_attendance;

create policy "deny direct anonymous attendance access"
  on public.event_attendance
  for all
  to anon, authenticated
  using (false)
  with check (false);
