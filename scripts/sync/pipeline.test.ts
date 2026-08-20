import { describe, expect, it } from "vitest";
import { decideLocality } from "./classify";
import {
  applyOverrides,
  comparableTitle,
  dedupeEvents,
  filterActiveJobs,
} from "./pipeline";
import type { EventRecord, JobRecord } from "./schemas";

function makeEvent(overrides: Partial<EventRecord>): EventRecord {
  return {
    id: "evt-1",
    title: "Kochi Meetup",
    start: "2026-09-05",
    end: "2026-09-05",
    category: "opensource",
    venue: "Infopark",
    city: "Kochi",
    organizer: "Kochi FOSS",
    blurb: "A meetup.",
    tags: [],
    url: "https://example.com",
    sourceUrls: ["https://example.com"],
    sourceIds: ["manual"],
    ...overrides,
  };
}

function makeJob(overrides: Partial<JobRecord>): JobRecord {
  return {
    id: "job-1",
    title: "Engineer",
    company: "Acme",
    category: "engineering",
    detailUrl: "https://infopark.in/job/1",
    sourceUrl: "https://infopark.in/companies-job",
    sourceId: "infopark-jobs",
    ...overrides,
  };
}

describe("comparableTitle", () => {
  it("normalizes punctuation, case and whitespace", () => {
    expect(comparableTitle(">.hack(); '26")).toBe(comparableTitle(">.HACK() '26"));
    expect(comparableTitle("Kochi   FOSS Meetup!")).toBe("kochi foss meetup");
  });
});

describe("dedupeEvents", () => {
  const trust = (event: EventRecord) =>
    (event.sourceIds ?? []).includes("high") ? 5 : 2;

  it("merges same title + start, keeping the higher-trust record", () => {
    const a = makeEvent({ id: "a", sourceIds: ["low"], sourceUrls: ["https://low.example"] });
    const b = makeEvent({ id: "b", sourceIds: ["high"], sourceUrls: ["https://high.example"] });
    const { events, merged } = dedupeEvents([a, b], trust);
    expect(events).toHaveLength(1);
    expect(merged).toBe(1);
    expect(events[0].sourceUrls).toContain("https://low.example");
  });

  it("always prefers manual records over ingested ones", () => {
    const manual = makeEvent({ id: "m", manual: true, sourceIds: ["manual"] });
    const auto = makeEvent({ id: "a", sourceIds: ["high"] });
    const { events } = dedupeEvents([auto, manual], trust);
    expect(events).toHaveLength(1);
    expect(events[0].manual).toBe(true);
    expect(events[0].id).toBe("m");
  });

  it("keeps distinct events apart", () => {
    const a = makeEvent({ id: "a" });
    const b = makeEvent({ id: "b", title: "Different Summit", start: "2026-10-01", end: "2026-10-01" });
    const { events, merged } = dedupeEvents([a, b], trust);
    expect(events).toHaveLength(2);
    expect(merged).toBe(0);
  });
});

describe("filterActiveJobs", () => {
  it("drops jobs past their deadline, keeps others", () => {
    const expired = makeJob({ id: "old", deadlineAt: "2026-08-01" });
    const active = makeJob({ id: "new", deadlineAt: "2026-08-30" });
    const noDeadline = makeJob({ id: "none" });
    const kept = filterActiveJobs([expired, active, noDeadline], "2026-08-18");
    expect(kept.map((j) => j.id)).toEqual(["new", "none"]);
  });
});

describe("applyOverrides", () => {
  it("shallow-merges override fields while preserving the id", () => {
    const event = makeEvent({ id: "evt-1", venue: "Wrong venue" });
    const [result] = applyOverrides([event], {
      "evt-1": { venue: "Right venue", featured: true },
    });
    expect(result.venue).toBe("Right venue");
    expect(result.featured).toBe(true);
    expect(result.id).toBe("evt-1");
  });

  it("ignores overrides for unknown ids", () => {
    const event = makeEvent({});
    const [result] = applyOverrides([event], { nope: { venue: "X" } });
    expect(result.venue).toBe("Infopark");
  });
});

describe("decideLocality", () => {
  it("accepts Kochi-area events", () => {
    expect(decideLocality(makeEvent({ city: "Kochi", manual: false })).relevant).toBe(true);
    expect(decideLocality(makeEvent({ city: "Kakkanad", venue: "Infopark", manual: false })).relevant).toBe(true);
  });
  it("rejects far-away ingested events but keeps manual ones", () => {
    const far = makeEvent({ city: "Mumbai", venue: "BKC", manual: false });
    expect(decideLocality(far).relevant).toBe(false);
    const manualFar = makeEvent({ city: "Bengaluru", venue: "NIMHANS", manual: true });
    expect(decideLocality(manualFar).relevant).toBe(true);
  });
});
