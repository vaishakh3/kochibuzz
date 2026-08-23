import * as cheerio from "cheerio";
import type { EventRecord, SourceDefinition } from "../schemas";
import { mapWithConcurrency, politeFetch } from "../fetch";
import { classifyEventCategory, dateTimeParts, slugify, stripHtml } from "./events";

type JsonObject = Record<string, unknown>;

function hasType(value: unknown, type: string): boolean {
  return value === type || (Array.isArray(value) && value.includes(type));
}

function objectsIn(value: unknown): JsonObject[] {
  if (Array.isArray(value)) return value.flatMap(objectsIn);
  if (!value || typeof value !== "object") return [];
  const object = value as JsonObject;
  return [object, ...objectsIn(object["@graph"]), ...objectsIn(object.itemListElement), ...objectsIn(object.item)];
}

function jsonLdObjects(html: string): JsonObject[] {
  const $ = cheerio.load(html);
  const objects: JsonObject[] = [];
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      objects.push(...objectsIn(JSON.parse($(script).text())));
    } catch {
      // A malformed block should not hide valid blocks on the same page.
    }
  });
  return objects;
}

function absoluteUrl(value: unknown, baseUrl: string): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function nameOf(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (value && typeof value === "object" && typeof (value as JsonObject).name === "string") {
    return ((value as JsonObject).name as string).trim() || undefined;
  }
  return undefined;
}

function firstOfferUrl(value: unknown, baseUrl: string): string | undefined {
  const offers = Array.isArray(value) ? value : [value];
  for (const offer of offers) {
    if (offer && typeof offer === "object") {
      const url = absoluteUrl((offer as JsonObject).url, baseUrl);
      if (url) return url;
    }
  }
  return undefined;
}

export function normalizeJsonLdEvent(
  node: JsonObject,
  source: SourceDefinition,
  pageUrl = source.url,
): EventRecord | undefined {
  if (!hasType(node["@type"], "Event")) return undefined;
  const status = typeof node.eventStatus === "string" ? node.eventStatus : "";
  if (/cancelled/i.test(status)) return undefined;
  const title = typeof node.name === "string" ? stripHtml(node.name) : "";
  const start = dateTimeParts(node.startDate);
  const end = dateTimeParts(node.endDate) ?? start;
  if (!title || !start || !end) return undefined;

  const location = node.location && typeof node.location === "object"
    ? node.location as JsonObject
    : {};
  const address = location.address && typeof location.address === "object"
    ? location.address as JsonObject
    : {};
  const venue = nameOf(location) ?? nameOf(node.location) ?? "Venue TBA";
  const city = typeof address.addressLocality === "string"
    ? address.addressLocality
    : source.defaultCity ?? "Kochi";
  const description = typeof node.description === "string" ? stripHtml(node.description) : title;
  const eventUrl = absoluteUrl(node.url, pageUrl) ?? pageUrl;
  const registerUrl = firstOfferUrl(node.offers, pageUrl);
  const organizer = nameOf(node.organizer) ?? source.organization ?? source.name;
  const sourceKey = slugify(new URL(eventUrl).pathname) || slugify(`${title}-${start.date}`);

  return {
    id: `${source.id}-${sourceKey}`.slice(0, 120),
    title,
    start: start.date,
    end: end.date,
    startTime: start.time,
    endTime: end.time,
    category: classifyEventCategory(`${title} ${description}`),
    venue,
    city,
    organizer,
    blurb: description.slice(0, 280),
    tags: [],
    url: eventUrl,
    registerUrl: registerUrl && registerUrl !== eventUrl ? registerUrl : undefined,
    sourceUrls: [pageUrl],
    sourceIds: [source.id],
  };
}

export function extractJsonLdEvents(
  html: string,
  source: SourceDefinition,
  pageUrl = source.url,
): EventRecord[] {
  return jsonLdObjects(html)
    .map((node) => normalizeJsonLdEvent(node, source, pageUrl))
    .filter((event): event is EventRecord => Boolean(event));
}

export function extractJsonLdEventLinks(html: string, source: SourceDefinition): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();
  const sourceOrigin = new URL(source.url).origin;
  for (const object of jsonLdObjects(html)) {
    if (!hasType(object["@type"], "ListItem")) continue;
    const item = object.item;
    const candidate = typeof item === "string"
      ? item
      : item && typeof item === "object" ? (item as JsonObject).url : undefined;
    const url = absoluteUrl(candidate, source.url);
    if (url && new URL(url).origin === sourceOrigin) links.add(url);
  }
  $("a[href]").each((_, anchor) => {
    const url = absoluteUrl($(anchor).attr("href"), source.url);
    if (!url || new URL(url).origin !== sourceOrigin) return;
    if (new URL(url).pathname.includes("/events/details/")) links.add(url);
  });
  return [...links].slice(0, 30);
}

export async function fetchJsonLdEvents(source: SourceDefinition): Promise<EventRecord[]> {
  const landingHtml = await politeFetch(source.url);
  const events = extractJsonLdEvents(landingHtml, source);
  const links = extractJsonLdEventLinks(landingHtml, source);
  const details = await mapWithConcurrency(links, 4, async (url) =>
    extractJsonLdEvents(await politeFetch(url), source, url),
  );
  for (const result of details) {
    if (result.status === "fulfilled") events.push(...result.value);
  }
  return [...new Map(events.map((event) => [event.id, event])).values()];
}

