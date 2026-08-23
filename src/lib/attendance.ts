export const ATTENDANCE_IDENTITY_KEY = "kochibuzz:attendance-identity:v1";

export const attendanceAvatars = [
  { id: "ferry", label: "Harbour", src: "/images/avatars/ferry.jpg" },
  { id: "builder", label: "Builder", src: "/images/avatars/builder.jpg" },
  { id: "cyclist", label: "Pedal", src: "/images/avatars/cyclist.jpg" },
  { id: "artist", label: "Canvas", src: "/images/avatars/artist.jpg" },
  { id: "host", label: "Host", src: "/images/avatars/host.jpg" },
  { id: "photographer", label: "Lens", src: "/images/avatars/photographer.jpg" },
] as const;

export type AttendanceAvatarId = (typeof attendanceAvatars)[number]["id"];

export type AttendanceIdentity = {
  attendeeId: string;
  secret: string;
  displayName: string;
  avatarId: AttendanceAvatarId;
};

export type EventAttendee = {
  id: string;
  displayName: string;
  avatarId: AttendanceAvatarId;
  createdAt: string;
  isYou: boolean;
};

export type AttendanceSnapshot = {
  attendees: EventAttendee[];
  count: number;
};

const avatarIds = new Set<string>(attendanceAvatars.map((avatar) => avatar.id));
const DEFAULT_ATTENDANCE_API_URL = "https://sqmlbrvheevtapvszrfe.supabase.co/functions/v1/event-attendance";

function isAvatarId(value: unknown): value is AttendanceAvatarId {
  return typeof value === "string" && avatarIds.has(value);
}

export function parseAttendanceIdentity(value: string | null): AttendanceIdentity | null {
  if (!value) return null;
  try {
    const identity = JSON.parse(value) as Partial<AttendanceIdentity>;
    if (
      typeof identity.attendeeId !== "string"
      || typeof identity.secret !== "string"
      || typeof identity.displayName !== "string"
      || !isAvatarId(identity.avatarId)
      || identity.displayName.trim().length === 0
    ) return null;
    return {
      attendeeId: identity.attendeeId,
      secret: identity.secret,
      displayName: identity.displayName,
      avatarId: identity.avatarId,
    };
  } catch {
    return null;
  }
}

export function readAttendanceIdentity() {
  try {
    return parseAttendanceIdentity(window.localStorage.getItem(ATTENDANCE_IDENTITY_KEY));
  } catch {
    return null;
  }
}

export function getAttendanceIdentitySnapshot() {
  try {
    return window.localStorage.getItem(ATTENDANCE_IDENTITY_KEY) ?? "";
  } catch {
    return "";
  }
}

export function getServerAttendanceIdentitySnapshot() {
  return "";
}

export function subscribeAttendanceIdentity(onChange: () => void) {
  function changed(event: Event) {
    if (event instanceof StorageEvent && event.key && event.key !== ATTENDANCE_IDENTITY_KEY) return;
    onChange();
  }
  window.addEventListener("storage", changed);
  window.addEventListener("kochibuzz:attendance-identity", changed);
  return () => {
    window.removeEventListener("storage", changed);
    window.removeEventListener("kochibuzz:attendance-identity", changed);
  };
}

export function writeAttendanceIdentity(identity: AttendanceIdentity) {
  window.localStorage.setItem(ATTENDANCE_IDENTITY_KEY, JSON.stringify(identity));
  window.dispatchEvent(new Event("kochibuzz:attendance-identity"));
}

function randomSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function createAttendanceIdentity(displayName: string, avatarId: AttendanceAvatarId): AttendanceIdentity {
  return {
    attendeeId: crypto.randomUUID(),
    secret: randomSecret(),
    displayName: displayName.trim().replace(/\s+/g, " "),
    avatarId,
  };
}

function apiUrl() {
  return (process.env.NEXT_PUBLIC_ATTENDANCE_API_URL ?? DEFAULT_ATTENDANCE_API_URL).replace(/\/$/, "");
}

function parseSnapshot(value: unknown): AttendanceSnapshot {
  const data = value as { attendees?: unknown; count?: unknown };
  const attendees = Array.isArray(data.attendees)
    ? data.attendees.flatMap((item) => {
        const row = item as Record<string, unknown>;
        if (
          typeof row.id !== "string"
          || typeof row.display_name !== "string"
          || !isAvatarId(row.avatar_id)
          || typeof row.created_at !== "string"
        ) return [];
        return [{
          id: row.id,
          displayName: row.display_name,
          avatarId: row.avatar_id,
          createdAt: row.created_at,
          isYou: row.is_you === true,
        }];
      })
    : [];
  return { attendees, count: typeof data.count === "number" ? data.count : attendees.length };
}

async function responseSnapshot(response: Response) {
  const body = await response.json().catch(() => ({})) as { error?: unknown };
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Couldn’t update the attendee list.");
  return parseSnapshot(body);
}

export async function fetchAttendance(eventId: string, attendeeId?: string, signal?: AbortSignal) {
  const response = await fetch(`${apiUrl()}?event_id=${encodeURIComponent(eventId)}`, {
    cache: "no-store",
    headers: attendeeId ? { "x-attendee-id": attendeeId } : undefined,
    signal,
  });
  return responseSnapshot(response);
}

export async function saveAttendance(eventId: string, identity: AttendanceIdentity) {
  const response = await fetch(apiUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: eventId,
      attendee_id: identity.attendeeId,
      identity_secret: identity.secret,
      display_name: identity.displayName,
      avatar_id: identity.avatarId,
    }),
  });
  return responseSnapshot(response);
}

export async function removeAttendance(eventId: string, identity: AttendanceIdentity) {
  const response = await fetch(apiUrl(), {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: eventId,
      attendee_id: identity.attendeeId,
      identity_secret: identity.secret,
      display_name: identity.displayName,
      avatar_id: identity.avatarId,
    }),
  });
  return responseSnapshot(response);
}
