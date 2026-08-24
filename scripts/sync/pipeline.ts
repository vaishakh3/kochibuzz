import { EventRecord, JobRecord, OpportunityRecord, SourceDefinition } from "./schemas";
import { decideLocality } from "./classify";

/** Title normalized for duplicate comparison only (display titles preserved). */
export function comparableTitle(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/['''`".:;!?()\[\]—–-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deduplicate events: strong evidence only (same normalized title + same start
 * date). Winner is manual first, then highest source trust; source URLs merge.
 */
export function dedupeEvents(
  events: EventRecord[],
  trustFor: (event: EventRecord) => number,
): { events: EventRecord[]; merged: number } {
  const output: EventRecord[] = [];
  let merged = 0;
  for (const event of events) {
    const duplicateIndex = output.findIndex((existing) =>
      `${comparableTitle(existing.title)}|${existing.start}`
        === `${comparableTitle(event.title)}|${event.start}`
      || linkedManualSourcePair(existing, event),
    );
    if (duplicateIndex === -1) {
      output.push(event);
      continue;
    }
    merged++;
    const existing = output[duplicateIndex];
    if (linkedManualSourcePair(existing, event)) {
      output[duplicateIndex] = mergeLinkedManualEvent(existing, event);
      continue;
    }
    const keepExisting =
      (existing.manual && !event.manual) ||
      (existing.manual === event.manual && trustFor(existing) >= trustFor(event));
    const winner = keepExisting ? existing : event;
    const loser = keepExisting ? event : existing;
    output[duplicateIndex] = {
      ...winner,
      sourceUrls: uniq([...(winner.sourceUrls ?? []), ...(loser.sourceUrls ?? [])]),
      sourceIds: uniq([...(winner.sourceIds ?? []), ...(loser.sourceIds ?? [])]),
    };
  }
  return { events: output, merged };
}

function canonicalEventUrls(event: EventRecord): Set<string> {
  // Provenance URLs can be broad calendar/landing pages shared by hundreds of
  // unrelated events. Only the event's own URL is strong enough identity.
  const values = [event.url];
  return new Set(values.flatMap((value) => {
    try {
      const url = new URL(value);
      url.hash = "";
      for (const parameter of [...url.searchParams.keys()]) {
        if (parameter.startsWith("utm_") || parameter === "ref") url.searchParams.delete(parameter);
      }
      const host = url.hostname.replace(/^www\./, "").replace(/^lu\.ma$/, "luma.com");
      const path = url.pathname.replace(/\/$/, "");
      return [`${url.protocol}//${host}${path}${url.search}`.toLowerCase()];
    } catch {
      return [];
    }
  }));
}

export function eventsShareCanonicalUrl(left: EventRecord, right: EventRecord): boolean {
  const leftUrls = canonicalEventUrls(left);
  return [...canonicalEventUrls(right)].some((url) => leftUrls.has(url));
}

export function eventsShareEditorialIdentity(left: EventRecord, right: EventRecord): boolean {
  return eventsShareCanonicalUrl(left, right)
    || (
      left.start === right.start
      && comparableTitle(left.title) === comparableTitle(right.title)
    );
}

/** Carry an explicit out-of-city editorial inclusion onto its future live feed record. */
export function applyManualTravelAllowances(
  liveEvents: EventRecord[],
  manualEvents: EventRecord[],
): EventRecord[] {
  return liveEvents.map((live) =>
    manualEvents.some((manual) => manual.travel && eventsShareEditorialIdentity(manual, live))
      ? { ...live, travel: true }
      : live,
  );
}

/**
 * An expired source page may remain online after organisers create or reschedule
 * a future edition. It can enrich an archived manual record, but it must never
 * drag a newer editorial date back into the past.
 */
export function canRefreshFromExpiredLinkedEvent(
  manual: EventRecord,
  live: EventRecord,
  todayIso: string,
): boolean {
  return live.end < todayIso
    && manual.end <= live.end
    && eventsShareCanonicalUrl(manual, live);
}

function linkedManualSourcePair(left: EventRecord, right: EventRecord): boolean {
  if (!eventsShareEditorialIdentity(left, right)) return false;
  if (Boolean(left.manual) !== Boolean(right.manual)) return true;
  if (!left.manual || !right.manual) return false;
  return hasLiveSource(left) !== hasLiveSource(right);
}

function hasLiveSource(event: EventRecord): boolean {
  return (event.sourceIds ?? []).some((sourceId) => sourceId !== "manual");
}

/**
 * A manually curated Luma record keeps its stable Kochi Buzz identity and
 * editorial copy, while mutable facts come from the live event page.
 */
function mergeLinkedManualEvent(left: EventRecord, right: EventRecord): EventRecord {
  const manual = left.manual && !hasLiveSource(left) ? left : right;
  const live = manual === left ? right : left;
  const venue = live.venue === "Venue TBA" ? manual.venue : live.venue;
  return {
    ...manual,
    title: live.title,
    start: live.start,
    end: live.end,
    startTime: live.startTime,
    endTime: live.endTime,
    venue,
    city: live.city === "Unknown" ? manual.city : live.city,
    organizer: live.organizer,
    url: live.url,
    registerUrl: live.registerUrl ?? manual.registerUrl,
    note: live.note,
    sourceUrls: uniq([...(manual.sourceUrls ?? []), ...(live.sourceUrls ?? [])]),
    sourceIds: uniq([...(manual.sourceIds ?? []), ...(live.sourceIds ?? [])]),
    id: manual.id,
    manual: true,
  };
}

export function filterRelevantEvents(events: EventRecord[]): {
  kept: EventRecord[];
  rejected: number;
} {
  const kept: EventRecord[] = [];
  let rejected = 0;
  for (const event of events) {
    if (event.travel || decideLocality(event).relevant) kept.push(event);
    else rejected++;
  }
  return { kept, rejected };
}

/** Active jobs only: keep when the deadline is today or later (IST). */
export function filterActiveJobs(jobs: JobRecord[], todayIso: string): JobRecord[] {
  return jobs.filter((job) => !job.deadlineAt || job.deadlineAt >= todayIso);
}

/** Events remain through their final day; curated records also form the archive. */
export function filterActiveEvents(events: EventRecord[], todayIso: string): EventRecord[] {
  return events.filter((event) => event.manual || event.end >= todayIso);
}

/**
 * Cross-source job deduplication. Company + title is deliberately stricter
 * than fuzzy title matching so similarly named openings are never collapsed.
 */
export function dedupeJobs(
  jobs: JobRecord[],
  trustFor: (job: JobRecord) => number,
): { jobs: JobRecord[]; merged: number } {
  const output: JobRecord[] = [];
  const indicesByKey = new Map<string, number[]>();
  let merged = 0;
  for (const job of jobs) {
    const key = `${comparableTitle(job.company)}|${comparableTitle(job.title)}`;
    const indices = indicesByKey.get(key) ?? [];
    // A company can legitimately publish two requisitions with the same title.
    // Collapse only when a separate feed has cross-posted the opening.
    const duplicateIndex = indices.find((index) => output[index].sourceId !== job.sourceId);
    if (duplicateIndex === undefined) {
      output.push(job);
      indices.push(output.length - 1);
      indicesByKey.set(key, indices);
      continue;
    }
    merged++;
    const existing = output[duplicateIndex];
    const existingTrust = trustFor(existing);
    const candidateTrust = trustFor(job);
    const candidateIsNewer = (job.postedAt ?? "") > (existing.postedAt ?? "");
    if (candidateTrust > existingTrust || (candidateTrust === existingTrust && candidateIsNewer)) {
      output[duplicateIndex] = job;
    }
  }
  return { jobs: output, merged };
}

export function dedupeOpportunities(
  records: OpportunityRecord[],
  trustFor: (record: OpportunityRecord) => number,
): { opportunities: OpportunityRecord[]; merged: number } {
  const byKey = new Map<string, OpportunityRecord>();
  let merged = 0;
  for (const record of records) {
    const key = `${comparableTitle(record.title)}|${record.deadlineAt ?? "ongoing"}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, record);
      continue;
    }
    merged++;
    const keepExisting = Boolean(existing.manual) && !record.manual
      || existing.manual === record.manual && trustFor(existing) >= trustFor(record);
    const winner = keepExisting ? existing : record;
    const loser = keepExisting ? record : existing;
    byKey.set(key, {
      ...winner,
      sourceUrls: uniq([...(winner.sourceUrls ?? []), ...(loser.sourceUrls ?? [])]),
      sourceIds: uniq([...(winner.sourceIds ?? []), ...(loser.sourceIds ?? [])]),
    });
  }
  return { opportunities: [...byKey.values()], merged };
}

/** Manual overrides always win: shallow-merge partial records by id. */
export function applyOverrides<T extends { id: string }>(
  records: T[],
  overrides: Record<string, Partial<T>>,
): T[] {
  return records.map((record) =>
    overrides[record.id] ? { ...record, ...overrides[record.id], id: record.id } : record,
  );
}

export function sortEvents(events: EventRecord[]): EventRecord[] {
  return [...events].sort((a, b) =>
    a.start === b.start
      ? Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.id.localeCompare(b.id)
      : a.start.localeCompare(b.start),
  );
}

export function sortJobs(jobs: JobRecord[]): JobRecord[] {
  return [...jobs].sort((a, b) => {
    const posted = (b.postedAt ?? "").localeCompare(a.postedAt ?? "");
    return posted !== 0 ? posted : a.id.localeCompare(b.id);
  });
}

export function trustForSource(
  sources: SourceDefinition[],
): (event: EventRecord | OpportunityRecord) => number {
  const bySourceId = new Map(sources.map((s) => [s.id, s.trustLevel]));
  return (event) =>
    Math.max(0, ...(event.sourceIds ?? []).map((id) => bySourceId.get(id) ?? 0));
}

export function trustForJobSource(
  sources: SourceDefinition[],
): (job: JobRecord) => number {
  const bySourceId = new Map(sources.map((s) => [s.id, s.trustLevel]));
  return (job) => bySourceId.get(job.sourceId) ?? 0;
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}
