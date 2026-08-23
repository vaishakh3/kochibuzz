import { createClient } from "npm:@supabase/supabase-js@2.112.3";

const AVATAR_IDS = new Set([
  "ferry",
  "builder",
  "cyclist",
  "artist",
  "host",
  "photographer",
]);
const EVENT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,159}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SECRET_PATTERN = /^[A-Za-z0-9_-]{40,128}$/;
const NAME_CONTROL_PATTERN = /[\u0000-\u001f\u007f]/;

type AttendanceWrite = {
  event_id?: unknown;
  attendee_id?: unknown;
  identity_secret?: unknown;
  display_name?: unknown;
  avatar_id?: unknown;
};

type AttendanceRow = {
  id: number;
  attendee_id: string;
  display_name: string;
  avatar_id: string;
  created_at: string;
};

function originAllowed(origin: string | null) {
  if (!origin) return true;
  if (origin === "https://kochi.buzz" || origin === "https://www.kochi.buzz") return true;
  if (origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000") return true;
  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigin = origin && originAllowed(origin) ? origin : "https://kochi.buzz";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "content-type, x-attendee-id",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
}

function json(request: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(request),
  });
}

function normalizeName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || Array.from(name).length > 32 || NAME_CONTROL_PATTERN.test(name)) return null;
  return name;
}

function parseWrite(body: AttendanceWrite) {
  const eventId = typeof body.event_id === "string" ? body.event_id : "";
  const attendeeId = typeof body.attendee_id === "string" ? body.attendee_id : "";
  const secret = typeof body.identity_secret === "string" ? body.identity_secret : "";
  const avatarId = typeof body.avatar_id === "string" ? body.avatar_id : "";
  const displayName = normalizeName(body.display_name);
  if (
    !EVENT_ID_PATTERN.test(eventId)
    || !UUID_PATTERN.test(attendeeId)
    || !SECRET_PATTERN.test(secret)
    || !displayName
    || !AVATAR_IDS.has(avatarId)
  ) return null;
  return { eventId, attendeeId, secret, displayName, avatarId };
}

async function secretHash(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase function environment is incomplete.");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function attendanceForEvent(eventId: string, viewerId: string | null) {
  const { data, error, count } = await supabase
    .from("event_attendance")
    .select("id, attendee_id, display_name, avatar_id, created_at", { count: "exact" })
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(100);

  if (error) throw error;
  const attendees = ((data ?? []) as AttendanceRow[]).map((row) => ({
    id: String(row.id),
    display_name: row.display_name,
    avatar_id: row.avatar_id,
    created_at: row.created_at,
    is_you: Boolean(viewerId && row.attendee_id === viewerId),
  }));
  return { attendees, count: count ?? attendees.length };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (!originAllowed(request.headers.get("origin"))) return json(request, 403, { error: "Origin not allowed." });

  try {
    if (request.method === "GET") {
      const eventId = new URL(request.url).searchParams.get("event_id") ?? "";
      if (!EVENT_ID_PATTERN.test(eventId)) return json(request, 400, { error: "Invalid event." });
      const viewerId = request.headers.get("x-attendee-id");
      return json(request, 200, await attendanceForEvent(eventId, viewerId));
    }

    let body: AttendanceWrite;
    try {
      body = await request.json();
    } catch {
      return json(request, 400, { error: "Invalid request body." });
    }
    const write = parseWrite(body);
    if (!write) return json(request, 400, { error: "Check your name and avatar, then try again." });
    const hash = await secretHash(write.secret);

    const { data: existing, error: findError } = await supabase
      .from("event_attendance")
      .select("id, identity_secret_hash")
      .eq("event_id", write.eventId)
      .eq("attendee_id", write.attendeeId)
      .maybeSingle();
    if (findError) throw findError;
    if (existing && !constantTimeEqual(existing.identity_secret_hash, hash)) {
      return json(request, 403, { error: "This attendance belongs to another browser identity." });
    }

    if (request.method === "POST") {
      const values = {
        event_id: write.eventId,
        attendee_id: write.attendeeId,
        identity_secret_hash: hash,
        display_name: write.displayName,
        avatar_id: write.avatarId,
        updated_at: new Date().toISOString(),
      };
      const operation = existing
        ? supabase.from("event_attendance").update(values).eq("id", existing.id)
        : supabase.from("event_attendance").insert(values);
      const { error } = await operation;
      if (error) throw error;
      return json(request, existing ? 200 : 201, await attendanceForEvent(write.eventId, write.attendeeId));
    }

    if (request.method === "DELETE") {
      if (!existing) return json(request, 200, await attendanceForEvent(write.eventId, write.attendeeId));
      const { error } = await supabase.from("event_attendance").delete().eq("id", existing.id);
      if (error) throw error;
      return json(request, 200, await attendanceForEvent(write.eventId, write.attendeeId));
    }

    return json(request, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error("event-attendance", error);
    return json(request, 500, { error: "The attendance board could not update. Please try again." });
  }
});
