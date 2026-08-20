import { EventRecord, SourceDefinition } from "../schemas";

/** Minimal iCalendar VEVENT extraction — no external parser dependency. */

export interface IcsEvent {
  uid?: string;
  summary?: string;
  description?: string;
  location?: string;
  url?: string;
  dtstart?: { date: string; time?: string };
  dtend?: { date: string; time?: string };
  status?: string;
}

function unfold(ics: string): string[] {
  return ics
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n");
}

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseDateValue(raw: string): { date: string; time?: string } | undefined {
  const dateOnly = raw.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnly) return { date: `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}` };
  const dateTime = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  if (dateTime) {
    return {
      date: `${dateTime[1]}-${dateTime[2]}-${dateTime[3]}`,
      time: `${dateTime[4]}:${dateTime[5]}`,
    };
  }
  return undefined;
}

export function parseIcs(ics: string): IcsEvent[] {
  const events: IcsEvent[] = [];
  let current: IcsEvent | null = null;
  for (const line of unfold(ics)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const [nameWithParams, value] = [line.slice(0, colon), line.slice(colon + 1)];
    const name = nameWithParams.split(";")[0].toUpperCase();
    switch (name) {
      case "UID": current.uid = value.trim(); break;
      case "SUMMARY": current.summary = unescapeText(value.trim()); break;
      case "DESCRIPTION": current.description = unescapeText(value.trim()); break;
      case "LOCATION": current.location = unescapeText(value.trim()); break;
      case "URL": current.url = value.trim(); break;
      case "STATUS": current.status = value.trim().toUpperCase(); break;
      case "DTSTART": current.dtstart = parseDateValue(value.trim()); break;
      case "DTEND": current.dtend = parseDateValue(value.trim()); break;
    }
  }
  return events;
}

/** Subtract one day from a YYYY-MM-DD string (all-day DTEND is exclusive). */
function previousDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function normalizeIcsEvents(
  parsed: IcsEvent[],
  source: SourceDefinition,
): EventRecord[] {
  const records: EventRecord[] = [];
  for (const item of parsed) {
    if (!item.summary || !item.dtstart) continue;
    if (item.status === "CANCELLED") continue;
    const start = item.dtstart.date;
    let end = item.dtend?.date ?? start;
    if (item.dtend && !item.dtend.time && end > start) end = previousDay(end);
    const url = item.url ?? source.url;
    records.push({
      id: `${source.id}-${(item.uid ?? `${start}-${item.summary}`).replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}`.slice(0, 80),
      title: item.summary,
      start,
      end,
      startTime: item.dtstart.time,
      endTime: item.dtend?.time,
      category: "webdev",
      venue: item.location?.split(",")[0]?.trim() || "Venue TBA",
      city: "Kochi",
      organizer: source.name,
      blurb: (item.description ?? item.summary).replace(/\s+/g, " ").trim().slice(0, 280),
      tags: [],
      url,
      sourceUrls: [url],
      sourceIds: [source.id],
    });
  }
  return records;
}
