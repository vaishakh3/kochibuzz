import { events } from "@/data/events";
import { icsCalendar } from "@/lib/calendar";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(icsCalendar(events), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="kochi-buzz.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
