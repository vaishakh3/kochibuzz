import { describe, expect, it } from "vitest";
import { decideLocality } from "./classify";
import {
  applyOverrides,
  applyManualTravelAllowances,
  canRefreshFromExpiredLinkedEvent,
  comparableTitle,
  dedupeEvents,
  dedupeJobs,
  eventsShareCanonicalUrl,
  eventsShareEditorialIdentity,
  filterActiveEvents,
  filterActiveJobs,
  sortEvents,
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

  it("refreshes mutable facts for a manual event linked to a live source", () => {
    const manual = makeEvent({
      id: "stable-kochi-id",
      title: "Curated working title",
      start: "2026-09-10",
      end: "2026-09-10",
      venue: "Venue TBA",
      organizer: "Kochi community",
      blurb: "Curated Kochi Buzz description.",
      tags: ["Builders"],
      url: "https://luma.com/abc123?utm_source=kochi",
      sourceUrls: ["https://luma.com/abc123"],
      sourceIds: [],
      manual: true,
    });
    const live = makeEvent({
      id: "luma-abc123",
      title: "Official updated title",
      start: "2026-09-12",
      end: "2026-09-12",
      startTime: "18:30",
      endTime: "21:00",
      venue: "TinkerSpace",
      organizer: "Maya, Kochi Builders",
      blurb: "Raw source description.",
      tags: [],
      url: "https://lu.ma/abc123",
      sourceUrls: ["https://luma.com/abc123"],
      sourceIds: ["luma-kochi"],
      manual: false,
    });

    const result = dedupeEvents([manual, live], trust);
    expect(result.merged).toBe(1);
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      id: "stable-kochi-id",
      title: "Official updated title",
      start: "2026-09-12",
      startTime: "18:30",
      venue: "TinkerSpace",
      organizer: "Maya, Kochi Builders",
      blurb: "Curated Kochi Buzz description.",
      tags: ["Builders"],
      manual: true,
    });
    expect(result.events[0].sourceIds).toContain("luma-kochi");
  });

  it("keeps the last live facts when a linked source is temporarily unavailable", () => {
    const manual = makeEvent({
      id: "stable-kochi-id",
      title: "Old curated title",
      start: "2026-09-10",
      end: "2026-09-10",
      url: "https://luma.com/abc123",
      sourceIds: [],
      manual: true,
    });
    const carried = makeEvent({
      id: "stable-kochi-id",
      title: "Last verified title",
      start: "2026-07-28",
      end: "2026-07-28",
      startTime: "18:00",
      url: "https://luma.com/abc123",
      sourceIds: ["luma-kochi"],
      manual: true,
    });

    const result = dedupeEvents([manual, carried], trust);
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      id: "stable-kochi-id",
      title: "Last verified title",
      start: "2026-07-28",
      startTime: "18:00",
      manual: true,
    });
  });
});

describe("eventsShareCanonicalUrl", () => {
  it("matches Luma aliases while ignoring tracking parameters", () => {
    const manual = makeEvent({ url: "https://www.luma.com/abc123?utm_source=kochi" });
    const live = makeEvent({ url: "https://lu.ma/abc123", sourceUrls: ["https://luma.com/abc123"] });
    expect(eventsShareCanonicalUrl(manual, live)).toBe(true);
  });

  it("does not treat a shared calendar provenance URL as event identity", () => {
    const manual = makeEvent({ url: "https://luma.com/codex-community", manual: true });
    const live = makeEvent({
      url: "https://luma.com/yvy17hzh",
      sourceUrls: ["https://luma.com/codex-community"],
      sourceIds: ["luma-kochi"],
    });
    expect(eventsShareCanonicalUrl(manual, live)).toBe(false);
  });
});

describe("eventsShareEditorialIdentity", () => {
  it("matches a future live record to a curated event by title and date", () => {
    const manual = makeEvent({
      title: "Codex Community Hackathon — Calicut",
      start: "2026-09-19",
      end: "2026-09-19",
      url: "https://luma.com/codex-community",
      manual: true,
    });
    const live = makeEvent({
      title: "Codex Community Hackathon - Calicut",
      start: "2026-09-19",
      end: "2026-09-19",
      url: "https://luma.com/new-event-url",
      sourceIds: ["codex-community-luma"],
    });

    expect(eventsShareEditorialIdentity(manual, live)).toBe(true);
  });

  it("carries an explicit travel inclusion onto the matching live record", () => {
    const manual = makeEvent({
      title: "Codex Community Hackathon — Calicut",
      start: "2026-09-19",
      end: "2026-09-19",
      travel: true,
      manual: true,
    });
    const live = makeEvent({
      title: "Codex Community Hackathon - Calicut",
      start: "2026-09-19",
      end: "2026-09-19",
      city: "Unknown",
      venue: "Calicut",
      sourceIds: ["codex-community-luma"],
    });

    expect(applyManualTravelAllowances([live], [manual])[0].travel).toBe(true);
  });
});

describe("canRefreshFromExpiredLinkedEvent", () => {
  it("does not let a stale Luma page pull a newer manual date into the past", () => {
    const manual = makeEvent({
      start: "2026-09-16",
      end: "2026-09-16",
      url: "https://luma.com/abc123",
      manual: true,
    });
    const staleLive = makeEvent({
      start: "2026-07-28",
      end: "2026-07-28",
      url: "https://luma.com/abc123",
      sourceIds: ["luma-kochi"],
    });

    expect(canRefreshFromExpiredLinkedEvent(manual, staleLive, "2026-08-25")).toBe(false);
  });

  it("still allows an expired source to enrich its matching archived record", () => {
    const manual = makeEvent({
      start: "2026-07-28",
      end: "2026-07-28",
      url: "https://luma.com/abc123",
      manual: true,
    });
    const live = makeEvent({
      start: "2026-07-28",
      end: "2026-07-28",
      url: "https://luma.com/abc123",
      sourceIds: ["luma-kochi"],
    });

    expect(canRefreshFromExpiredLinkedEvent(manual, live, "2026-08-25")).toBe(true);
  });
});

describe("sortEvents", () => {
  it("places a featured event first when a day has multiple events", () => {
    const regular = makeEvent({ id: "a-regular" });
    const featured = makeEvent({ id: "z-featured", featured: true });

    expect(sortEvents([regular, featured]).map((event) => event.id))
      .toEqual(["z-featured", "a-regular"]);
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

describe("filterActiveEvents", () => {
  it("keeps an event through its final day and preserves the curated archive", () => {
    const ongoing = makeEvent({ id: "ongoing", start: "2026-08-20", end: "2026-08-23" });
    const future = makeEvent({ id: "future", start: "2026-08-24", end: "2026-08-24" });
    const expired = makeEvent({ id: "expired", start: "2026-08-21", end: "2026-08-22" });
    const curated = makeEvent({ id: "curated", start: "2026-07-01", end: "2026-07-01", manual: true });
    expect(filterActiveEvents([ongoing, future, expired, curated], "2026-08-23").map((event) => event.id))
      .toEqual(["ongoing", "future", "curated"]);
  });
});

describe("dedupeJobs", () => {
  it("deduplicates the same company/title and prefers the trusted source", () => {
    const low = makeJob({ id: "low", sourceId: "aggregator", postedAt: "2026-08-22" });
    const high = makeJob({ id: "high", sourceId: "official", postedAt: "2026-08-20" });
    const distinct = makeJob({ id: "distinct", title: "Senior Engineer", sourceId: "official" });
    const result = dedupeJobs(
      [low, high, distinct],
      (job) => job.sourceId === "official" ? 5 : 2,
    );
    expect(result.merged).toBe(1);
    expect(result.jobs.map((job) => job.id)).toEqual(["high", "distinct"]);
  });

  it("keeps same-title requisitions published by one authoritative source", () => {
    const first = makeJob({ id: "first", sourceId: "official" });
    const second = makeJob({ id: "second", sourceId: "official" });
    const result = dedupeJobs([first, second], () => 5);
    expect(result.merged).toBe(0);
    expect(result.jobs.map((job) => job.id)).toEqual(["first", "second"]);
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
