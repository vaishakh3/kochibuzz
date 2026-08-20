/**
 * kochi.buzz data sync.
 *
 *   npx tsx scripts/sync/index.ts            # sync and write generated data
 *   npx tsx scripts/sync/index.ts --dry-run  # fetch/validate/diff, write nothing
 *
 * Flow: manual data + source adapters → validate → relevance → dedupe →
 * overrides → canonical generated JSON (+ public/api/v1 mirrors).
 * Writes only when meaningful data changed; timestamps are never rewritten
 * on unchanged records.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  announcementSchema,
  eventSchema,
  jobSchema,
  opportunitySchema,
  projectSchema,
  sourceSchema,
  sourceStateSchema,
  EventRecord,
  JobRecord,
  SourceDefinition,
  SourceState,
} from "./schemas";
import { fetchInfoparkJobs } from "./adapters/infopark";
import { parseIcs, normalizeIcsEvents } from "./adapters/ics";
import { politeFetch, mapWithConcurrency } from "./fetch";
import {
  applyOverrides,
  dedupeEvents,
  filterActiveJobs,
  filterRelevantEvents,
  sortEvents,
  sortJobs,
  trustForSource,
} from "./pipeline";

const ROOT = path.resolve(__dirname, "../..");
const DRY_RUN = process.argv.includes("--dry-run");

function readJson<T>(relative: string, schema: z.ZodType<T>): T {
  const raw = fs.readFileSync(path.join(ROOT, relative), "utf8");
  return schema.parse(JSON.parse(raw));
}

function todayIst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

interface SourceHealth {
  sourceId: string;
  status: "ok" | "warning" | "failed";
  records: number;
  detail?: string;
}

interface Stats {
  candidates: number;
  accepted: number;
  invalid: number;
  duplicatesMerged: number;
  rejectedIrrelevant: number;
  expiredJobsDropped: number;
}

function validateEach<T>(
  items: unknown[],
  schema: z.ZodType<T>,
  stats: Stats,
  label: string,
): T[] {
  const valid: T[] = [];
  for (const item of items) {
    const result = schema.safeParse(item);
    if (result.success) valid.push(result.data);
    else {
      stats.invalid++;
      console.warn(`  invalid ${label} rejected:`, result.error.issues[0]?.message);
    }
  }
  return valid;
}

async function main() {
  const startedAt = Date.now();
  const today = todayIst();
  const sources = readJson("data/sources/registry.json", z.array(sourceSchema));
  const state = readJson("data/state/source-state.json", sourceStateSchema);

  const manualEvents = readJson("data/manual/events.json", z.array(eventSchema));
  const manualOpportunities = readJson(
    "data/manual/opportunities.json",
    z.array(opportunitySchema),
  );
  const manualProjects = readJson("data/manual/projects.json", z.array(projectSchema));
  const manualAnnouncements = readJson(
    "data/manual/announcements.json",
    z.array(announcementSchema),
  );
  const eventOverrides = readJson(
    "data/overrides/events.json",
    z.record(z.string(), eventSchema.partial()),
  );
  const jobOverrides = readJson(
    "data/overrides/jobs.json",
    z.record(z.string(), jobSchema.partial()),
  );

  const stats: Stats = {
    candidates: 0,
    accepted: 0,
    invalid: 0,
    duplicatesMerged: 0,
    rejectedIrrelevant: 0,
    expiredJobsDropped: 0,
  };
  const health: SourceHealth[] = [];
  const enabled = sources.filter((s) => s.enabled);

  const eventCandidates: unknown[] = [];
  const jobCandidates: unknown[] = [];

  await mapWithConcurrency(enabled, 4, async (source: SourceDefinition) => {
    try {
      let records = 0;
      if (source.parser === "infopark") {
        const jobs = await fetchInfoparkJobs(source);
        jobCandidates.push(...jobs);
        records = jobs.length;
      } else if (source.kind === "ics") {
        const body = await politeFetch(source.url);
        const events = normalizeIcsEvents(parseIcs(body), source);
        eventCandidates.push(...events);
        records = events.length;
      } else {
        health.push({
          sourceId: source.id,
          status: "warning",
          records: 0,
          detail: `no adapter for parser=${source.parser ?? source.kind}`,
        });
        return;
      }
      const previous = state.lastCounts[source.id] ?? 0;
      if (records === 0 && previous > 0) {
        // Never convert a broken parser into a healthy empty result.
        health.push({
          sourceId: source.id,
          status: "warning",
          records,
          detail: `returned 0 records (previously ${previous}) — likely parser/source change; keeping previous data`,
        });
      } else {
        health.push({ sourceId: source.id, status: "ok", records });
        state.lastCounts[source.id] = records;
      }
    } catch (error) {
      health.push({
        sourceId: source.id,
        status: "failed",
        records: 0,
        detail: String(error),
      });
    }
  });

  stats.candidates = eventCandidates.length + jobCandidates.length;

  // Events: manual + ingested → validate → relevance → dedupe → overrides.
  const validIngestedEvents = validateEach(eventCandidates, eventSchema, stats, "event");
  const relevance = filterRelevantEvents(validIngestedEvents);
  stats.rejectedIrrelevant = relevance.rejected;
  const deduped = dedupeEvents(
    [...manualEvents, ...relevance.kept],
    trustForSource(sources),
  );
  stats.duplicatesMerged = deduped.merged;
  const previousEvents = readExisting<EventRecord[]>("data/generated/events.json") ?? [];
  const previousFirstSeen = new Map(
    previousEvents.map((e) => [e.id, e.firstSeenAt] as const),
  );
  const events = sortEvents(
    applyOverrides(deduped.events, eventOverrides).map((event) => ({
      ...event,
      firstSeenAt:
        event.firstSeenAt ??
        previousFirstSeen.get(event.id) ??
        state.firstSeen[event.id] ??
        today,
    })),
  );
  for (const event of events) {
    if (!state.firstSeen[event.id]) state.firstSeen[event.id] = event.firstSeenAt ?? today;
  }

  // Jobs: ingested → validate → active-only → overrides. If a job source
  // failed or looked broken, keep the previous dataset for it (resilience).
  const previousJobs = readExisting<JobRecord[]>("data/generated/jobs.json") ?? [];
  const brokenJobSources = new Set(
    health
      .filter((h) => h.status !== "ok")
      .filter((h) => enabled.find((s) => s.id === h.sourceId)?.entityTypes.includes("job"))
      .map((h) => h.sourceId),
  );
  const carriedJobs = previousJobs.filter((job) => brokenJobSources.has(job.sourceId));
  const validJobs = validateEach(jobCandidates, jobSchema, stats, "job");
  const previousJobFirstSeen = new Map(
    previousJobs.map((j) => [j.id, j.firstSeenAt] as const),
  );
  const activeJobs = filterActiveJobs([...validJobs, ...carriedJobs], today);
  stats.expiredJobsDropped = validJobs.length + carriedJobs.length - activeJobs.length;
  const jobs = sortJobs(
    applyOverrides(activeJobs, jobOverrides).map((job) => ({
      ...job,
      firstSeenAt:
        job.firstSeenAt ?? previousJobFirstSeen.get(job.id) ?? state.firstSeen[job.id] ?? today,
    })),
  );
  for (const job of jobs) {
    if (!state.firstSeen[job.id]) state.firstSeen[job.id] = job.firstSeenAt ?? today;
  }

  const opportunities = manualOpportunities;
  const projects = manualProjects;
  const announcements = manualAnnouncements.filter(
    (a) => !a.expiresAt || a.expiresAt >= today,
  );

  stats.accepted = events.length + jobs.length + opportunities.length;

  // Prune state for entities that no longer exist anywhere.
  const liveIds = new Set([
    ...events.map((e) => e.id),
    ...jobs.map((j) => j.id),
  ]);
  for (const id of Object.keys(state.firstSeen)) {
    if (!liveIds.has(id)) delete state.firstSeen[id];
  }

  const outputs: Array<[string, unknown]> = [
    ["data/generated/events.json", events],
    ["data/generated/jobs.json", jobs],
    ["data/generated/opportunities.json", opportunities],
    ["data/generated/projects.json", projects],
    ["data/generated/announcements.json", announcements],
  ];
  const apiOutputs: Array<[string, unknown]> = [
    ["public/api/v1/events.json", { schemaVersion: 1, events }],
    ["public/api/v1/jobs.json", { schemaVersion: 1, jobs }],
    ["public/api/v1/opportunities.json", { schemaVersion: 1, opportunities }],
  ];

  const changes: string[] = [];
  for (const [relative, value] of [...outputs, ...apiOutputs]) {
    const next = JSON.stringify(value, null, 2) + "\n";
    const current = readRaw(relative);
    if (current !== next) changes.push(relative);
  }
  const stateOut = JSON.stringify(state, null, 2) + "\n";
  const stateChanged = readRaw("data/state/source-state.json") !== stateOut;

  const summaryLines = [
    `Sources: ${enabled.length}`,
    `Successful: ${health.filter((h) => h.status === "ok").length}`,
    `Warnings: ${health.filter((h) => h.status === "warning").length}`,
    `Failed: ${health.filter((h) => h.status === "failed").length}`,
    "",
    `Fetched candidates: ${stats.candidates}`,
    `Accepted records: ${stats.accepted}`,
    `Duplicates merged: ${stats.duplicatesMerged}`,
    `Rejected irrelevant: ${stats.rejectedIrrelevant}`,
    `Invalid: ${stats.invalid}`,
    `Expired jobs dropped: ${stats.expiredJobsDropped}`,
    "",
    `Events: ${events.length} · Jobs: ${jobs.length} · Opportunities: ${opportunities.length} · Projects: ${projects.length}`,
    "",
    ...health.map(
      (h) => `- [${h.status}] ${h.sourceId}: ${h.records} records${h.detail ? ` — ${h.detail}` : ""}`,
    ),
    "",
    changes.length
      ? `Changed files:\n${changes.map((c) => `- ${c}`).join("\n")}`
      : "No data changes.",
    `Duration: ${((Date.now() - startedAt) / 1000).toFixed(1)}s`,
  ];
  const summary = summaryLines.join("\n");
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## kochi.buzz data sync\n\n${summary}\n`,
    );
  }

  if (DRY_RUN) {
    console.log("\nDry run — nothing written.");
    return;
  }

  if (changes.length === 0 && !stateChanged) {
    console.log("No data changes. Exiting.");
    return;
  }

  // Atomic-ish write: validated candidate datasets only, temp file then rename.
  for (const [relative, value] of [...outputs, ...apiOutputs]) {
    writeAtomic(relative, JSON.stringify(value, null, 2) + "\n");
  }
  writeAtomic("data/state/source-state.json", stateOut);
  console.log(`Wrote ${outputs.length + apiOutputs.length + 1} files.`);
}

function readRaw(relative: string): string | undefined {
  const file = path.join(ROOT, relative);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : undefined;
}

function readExisting<T>(relative: string): T | undefined {
  const raw = readRaw(relative);
  return raw ? (JSON.parse(raw) as T) : undefined;
}

function writeAtomic(relative: string, contents: string) {
  const file = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.next`;
  fs.writeFileSync(temp, contents);
  fs.renameSync(temp, file);
}

main().catch((error) => {
  console.error("Sync aborted; previous data kept.", error);
  process.exit(1);
});
