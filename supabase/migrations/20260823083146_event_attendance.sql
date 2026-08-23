create table public.event_attendance (
  id bigint generated always as identity primary key,
  event_id text not null,
  attendee_id uuid not null,
  identity_secret_hash text not null,
  display_name text not null,
  avatar_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_attendance_event_attendee_key unique (event_id, attendee_id),
  constraint event_attendance_event_id_check
    check (event_id ~ '^[a-z0-9][a-z0-9-]{0,159}$'),
  constraint event_attendance_secret_hash_check
    check (identity_secret_hash ~ '^[0-9a-f]{64}$'),
  constraint event_attendance_display_name_check
    check (
      display_name = btrim(display_name)
      and char_length(display_name) between 1 and 32
    ),
  constraint event_attendance_avatar_id_check
    check (avatar_id in ('ferry', 'builder', 'cyclist', 'artist', 'host', 'photographer'))
);

create index event_attendance_event_created_idx
  on public.event_attendance (event_id, created_at, id);

alter table public.event_attendance enable row level security;
alter table public.event_attendance force row level security;

create policy "deny direct anonymous attendance access"
  on public.event_attendance
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on table public.event_attendance from anon, authenticated;
revoke all on sequence public.event_attendance_id_seq from anon, authenticated;

revoke all on table public.event_attendance from service_role;
revoke all on sequence public.event_attendance_id_seq from service_role;
grant select, insert, update, delete on table public.event_attendance to service_role;
grant usage, select on sequence public.event_attendance_id_seq to service_role;

comment on table public.event_attendance is
  'Self-declared Kochi Buzz event attendance. Private ownership tokens are only handled by the event-attendance Edge Function.';
