import { Attendee } from "@/lib/attendees";

/**
 * Attendee lists live in Upstash Redis (via its REST API, no SDK) when
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set — on Vercel, add
 * the Upstash for Redis integration. Without them we fall back to an
 * in-memory map, which works locally but resets on redeploy.
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const memory = new Map<string, Attendee[]>();

function keyFor(eventId: string): string {
  return `attendees:${eventId}`;
}

async function redis(command: unknown[]): Promise<unknown> {
  const res = await fetch(url!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

export async function getAttendees(eventId: string): Promise<Attendee[]> {
  if (!url || !token) return memory.get(eventId) ?? [];
  const raw = (await redis(["GET", keyFor(eventId)])) as string | null;
  return raw ? (JSON.parse(raw) as Attendee[]) : [];
}

async function saveAttendees(eventId: string, list: Attendee[]): Promise<void> {
  if (!url || !token) {
    memory.set(eventId, list);
    return;
  }
  await redis(["SET", keyFor(eventId), JSON.stringify(list)]);
}

export async function addAttendee(
  eventId: string,
  attendee: Attendee,
): Promise<Attendee[]> {
  const list = await getAttendees(eventId);
  const next = [
    ...list.filter((a) => a.name.toLowerCase() !== attendee.name.toLowerCase()),
    attendee,
  ].slice(-500);
  await saveAttendees(eventId, next);
  return next;
}

export async function removeAttendee(
  eventId: string,
  name: string,
): Promise<Attendee[]> {
  const list = await getAttendees(eventId);
  const next = list.filter((a) => a.name.toLowerCase() !== name.toLowerCase());
  await saveAttendees(eventId, next);
  return next;
}
