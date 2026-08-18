import { eventById, events } from "@/data/events";
import { icsFor } from "@/lib/calendar";

export function generateStaticParams() {
  return events.map((event) => ({ id: event.id }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = eventById.get(id);
  if (!event) return new Response("Not found", { status: 404 });
  return new Response(icsFor(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}.ics"`,
    },
  });
}
