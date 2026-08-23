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

/** Events remain in the live calendar through their final day. */
export function filterActiveEvents(events: EventRecord[], todayIso: string): EventRecord[] {
  return events.filter((event) => event.end >= todayIso);
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
