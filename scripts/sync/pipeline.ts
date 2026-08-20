import { EventRecord, JobRecord, SourceDefinition } from "./schemas";
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
  const byKey = new Map<string, EventRecord>();
  let merged = 0;
  for (const event of events) {
    const key = `${comparableTitle(event.title)}|${event.start}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, event);
      continue;
    }
    merged++;
    const keepExisting =
      (existing.manual && !event.manual) ||
      (existing.manual === event.manual && trustFor(existing) >= trustFor(event));
    const winner = keepExisting ? existing : event;
    const loser = keepExisting ? event : existing;
    byKey.set(key, {
      ...winner,
      sourceUrls: uniq([...(winner.sourceUrls ?? []), ...(loser.sourceUrls ?? [])]),
      sourceIds: uniq([...(winner.sourceIds ?? []), ...(loser.sourceIds ?? [])]),
    });
  }
  return { events: [...byKey.values()], merged };
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
    a.start === b.start ? a.id.localeCompare(b.id) : a.start.localeCompare(b.start),
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
): (event: EventRecord) => number {
  const bySourceId = new Map(sources.map((s) => [s.id, s.trustLevel]));
  return (event) =>
    Math.max(0, ...(event.sourceIds ?? []).map((id) => bySourceId.get(id) ?? 0));
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}
