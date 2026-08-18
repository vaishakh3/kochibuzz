import { NextRequest, NextResponse } from "next/server";
import { AVATAR_EMOJI, hueFor, normalizeName } from "@/lib/attendees";
import {
  addAttendee,
  getAttendeeCounts,
  getAttendees,
  removeAttendee,
} from "@/lib/attendeeStore";
import { events } from "@/data/events";

const eventIds = new Set(events.map((e) => e.id));

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has("counts")) {
    return NextResponse.json({
      counts: await getAttendeeCounts(events.map((e) => e.id)),
    });
  }
  const eventId = request.nextUrl.searchParams.get("event");
  if (!eventId || !eventIds.has(eventId)) return badRequest("Unknown event");
  return NextResponse.json({ attendees: await getAttendees(eventId) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    eventId?: string;
    name?: string;
    emoji?: string;
  } | null;
  if (!body?.eventId || !eventIds.has(body.eventId)) {
    return badRequest("Unknown event");
  }
  const name = normalizeName(body.name ?? "");
  if (!name) return badRequest("Name required");
  const emoji = AVATAR_EMOJI.includes(body.emoji ?? "")
    ? body.emoji!
    : AVATAR_EMOJI[0];
  const attendees = await addAttendee(body.eventId, {
    name,
    emoji,
    hue: hueFor(name),
    joinedAt: Date.now(),
  });
  return NextResponse.json({ attendees });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    eventId?: string;
    name?: string;
  } | null;
  if (!body?.eventId || !eventIds.has(body.eventId)) {
    return badRequest("Unknown event");
  }
  const name = normalizeName(body.name ?? "");
  if (!name) return badRequest("Name required");
  return NextResponse.json({
    attendees: await removeAttendee(body.eventId, name),
  });
}
