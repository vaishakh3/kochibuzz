import type { EventRecord, JobRecord, OpportunityRecord, SourceDefinition } from "../schemas";
import { classifyEventCategory, slugify, stripHtml } from "./events";
import { classifyJob, isKochiJobLocation } from "./jobs";

type JsonObject = Record<string, unknown>;

function rowsFrom(body: string): JsonObject[] {
  const parsed = JSON.parse(body) as unknown;
  let rows: unknown[] | null = null;
  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (parsed && typeof parsed === "object") {
    const data = (parsed as JsonObject).data;
    if (Array.isArray(data)) rows = data;
  }
  if (!rows) throw new Error("KSUM response did not contain a records array");
  return rows.filter((row): row is JsonObject => Boolean(row) && typeof row === "object");
}

function stringField(row: JsonObject, ...keys: string[]): string | undefined {
  for (const key of keys) {
    if (typeof row[key] === "string" && (row[key] as string).trim()) return (row[key] as string).trim();
  }
  return undefined;
}

function sourceUrl(value: string | undefined, base: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, base).toString();
  } catch {
    return undefined;
  }
}

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

export function parseKsumDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const named = value.match(/(?:\w{3},\s*)?([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/);
  if (named) {
    const month = MONTHS[named[1].toLowerCase()];
    if (month) return `${named[3]}-${month}-${named[2].padStart(2, "0")}`;
  }
  return undefined;
}

export function extractKsumTenders(body: string, source: SourceDefinition): OpportunityRecord[] {
  return rowsFrom(body).flatMap((row) => {
    if (row.open !== true) return [];
    const title = stringField(row, "name", "title");
    const detailUrl = sourceUrl(stringField(row, "url", "file", "link"), source.url);
    if (!title || !detailUrl) return [];
    const reference = stringField(row, "ref", "reference") ?? title;
    const summary = stripHtml(stringField(row, "brief", "description") ?? title).slice(0, 320);
    return [{
      id: `${source.id}-${slugify(reference)}`,
      title,
      type: "other" as const,
      organization: source.organization ?? "Kerala Startup Mission",
      summary,
      deadlineAt: parseKsumDate(row.date ?? row.deadline),
      locationScope: "kerala" as const,
      benefit: stringField(row, "type", "category"),
      applicationUrl: detailUrl,
      url: detailUrl,
      sourceUrls: [source.url, detailUrl],
      sourceIds: [source.id],
      tags: ["KSUM", "RFP", "tender"],
    }];
  });
}

export function extractKsumCareers(body: string, source: SourceDefinition): JobRecord[] {
  return rowsFrom(body).flatMap((row) => {
    const title = stringField(row, "title", "name", "position", "post");
    const detailUrl = sourceUrl(stringField(row, "url", "link", "file", "notification"), source.url);
    const location = stringField(row, "location", "place", "venue") ?? source.defaultCity ?? "Kerala";
    const context = `${title ?? ""} ${location} ${stringField(row, "description", "brief") ?? ""}`;
    if (!title || !detailUrl || !isKochiJobLocation(context)) return [];
    return [{
      id: `${source.id}-${slugify(stringField(row, "id", "ref") ?? detailUrl)}`,
      title,
      company: source.organization ?? "Kerala Startup Mission",
      postedAt: parseKsumDate(row.published_at ?? row.date),
      deadlineAt: parseKsumDate(row.deadline ?? row.last_date ?? row.end_date),
      location,
      category: classifyJob(title),
      detailUrl,
      sourceUrl: source.url,
      sourceId: source.id,
    }];
  });
}

export function extractKsumEvents(body: string, source: SourceDefinition): EventRecord[] {
  return rowsFrom(body).flatMap((row) => {
    const title = stringField(row, "title", "name");
    const start = parseKsumDate(row.start_date ?? row.date ?? row.starts_at);
    const end = parseKsumDate(row.end_date ?? row.date ?? row.ends_at) ?? start;
    const detailUrl = sourceUrl(stringField(row, "url", "link", "registration_url"), source.url) ?? source.url;
    const venue = stringField(row, "venue", "location", "place") ?? "Venue TBA";
    const city = stringField(row, "city") ?? (isKochiJobLocation(venue) ? "Kochi" : source.defaultCity ?? "Kerala");
    const description = stripHtml(stringField(row, "description", "brief", "summary") ?? title ?? "");
    if (!title || !start || !end) return [];
    return [{
      id: `${source.id}-${slugify(stringField(row, "id", "slug") ?? `${title}-${start}`)}`,
      title,
      start,
      end,
      category: classifyEventCategory(`${title} ${description}`),
      venue,
      city,
      organizer: source.organization ?? "Kerala Startup Mission",
      blurb: description.slice(0, 280) || title,
      tags: ["KSUM"],
      url: detailUrl,
      sourceUrls: [source.url, detailUrl],
      sourceIds: [source.id],
    }];
  });
}
