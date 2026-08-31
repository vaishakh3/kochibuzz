import type { EventRecord, SourceDefinition } from "../schemas";
import { classifyEventCategory, slugify, stripHtml } from "./events";

type JsonObject = Record<string, unknown>;

const KOCHI_LOCATION = /\b(?:kochi|cochin|ernakulam|kalamassery|kakkanad|thrikkakara)\b/i;

function stringField(row: JsonObject, key: string): string | undefined {
  const value = row[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function rowsFrom(body: string): JsonObject[] {
  const parsed = JSON.parse(body) as unknown;
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as JsonObject).data)) {
    throw new Error("TinkerHub response did not contain a data array");
  }
  return ((parsed as JsonObject).data as unknown[]).filter(
    (row): row is JsonObject => Boolean(row) && typeof row === "object",
  );
}

function istParts(value: string): { date: string; time: string } | undefined {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

function validUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function eventUrl(uniqueId: string, title: string): string {
  return `https://tinkerhub.org/events/${encodeURIComponent(uniqueId)}/${slugify(title)}`;
}

function isKochiEvent(row: JsonObject): boolean {
  if (row.campusExclusive === true) return false;
  const location = stringField(row, "location") ?? "";
  // TinkerSpace Kochi is space 1. TinkerSpace Calicut is space 2, so the
  // generic isSpace flag alone is deliberately not enough.
  if (row.isSpace === true && typeof row.spaceId === "number") return row.spaceId === 1;
  return KOCHI_LOCATION.test(location);
}

function venueName(location: string | undefined): string {
  if (!location) return "TinkerSpace, Kalamassery";
  if (/tinkerspace/i.test(location) && /kalamassery|kochi|thrikkakara/i.test(location)) {
    return "TinkerSpace, Kalamassery";
  }
  return location.split(",").slice(0, 2).join(",").trim() || "Venue TBA";
}

function eventTags(row: JsonObject): string[] {
  const type = stringField(row, "type")?.replace(/_/g, " ");
  const interests = stringField(row, "interests")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(["TinkerHub", ...(type ? [type] : []), ...(interests ?? [])])].slice(0, 4);
}

function daysBetween(start: string, end: string): number {
  return Math.round(
    (Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86_400_000,
  );
}

function humanDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${value}T12:00:00Z`));
}

/** Normalize TinkerHub's official public event feed to Kochi Buzz events. */
export function extractTinkerHubEvents(
  body: string,
  source: SourceDefinition,
): EventRecord[] {
  return rowsFrom(body).flatMap((row) => {
    if (row.status !== "published" || !isKochiEvent(row)) return [];

    const title = stringField(row, "name");
    const uniqueId = stringField(row, "uniqueId");
    const start = istParts(stringField(row, "startDate") ?? "");
    const end = istParts(stringField(row, "endDate") ?? stringField(row, "startDate") ?? "");
    if (!title || !uniqueId || !start || !end) return [];

    const detailUrl = eventUrl(uniqueId, title);
    const registrationUrl = validUrl(stringField(row, "externalEventUrl"));
    const location = stringField(row, "location");
    const description = stripHtml(stringField(row, "description") ?? title).slice(0, 280);
    const context = `${title} ${description} ${stringField(row, "type") ?? ""} ${stringField(row, "interests") ?? ""}`;
    // Some TinkerHub learning programmes expose the whole cohort window as a
    // single date range. Painting a five-week bar across every calendar cell
    // would imply a continuous event, so publish the opening date and retain
    // the programme end as plain-language context instead.
    const extendedProgram = daysBetween(start.date, end.date) > 7;

    return [{
      id: `${source.id}-${uniqueId.toLowerCase()}`,
      title,
      start: start.date,
      end: extendedProgram ? start.date : end.date,
      startTime: start.time,
      endTime: extendedProgram ? undefined : end.time,
      category: classifyEventCategory(context),
      venue: venueName(location),
      city: "Kochi",
      organizer: source.organization ?? "TinkerHub Foundation",
      blurb: description || title,
      tags: eventTags(row),
      url: detailUrl,
      registerUrl: registrationUrl && registrationUrl !== detailUrl ? registrationUrl : undefined,
      note: extendedProgram ? `Programme runs through ${humanDate(end.date)}.` : undefined,
      sourceUrls: [...new Set([source.url, detailUrl, ...(registrationUrl ? [registrationUrl] : [])])],
      sourceIds: [source.id],
    }];
  });
}
