import { describe, expect, it } from "vitest";
import type { EventRecord } from "../sync/schemas";
import { crowdedStartDates, deterministicPick } from "./calendar";

function event(overrides: Partial<EventRecord> = {}): EventRecord {
  return {
    id: "event",
    title: "Event",
    start: "2026-09-05",
    end: "2026-09-05",
    category: "webdev",
    venue: "TinkerSpace",
    city: "Kochi",
    organizer: "Community",
    blurb: "A useful event.",
    tags: [],
    url: "https://example.com/event",
    ...overrides,
  };
}

describe("calendar headline ranking", () => {
  it("asks for a ranking only when multiple events begin on the same future date", () => {
    const groups = crowdedStartDates([
      event({ id: "continuing", start: "2026-09-04", end: "2026-09-06" }),
      event({ id: "summit" }),
      event({ id: "meetup" }),
      event({ id: "solo", start: "2026-09-07", end: "2026-09-07" }),
    ], "2026-09-01");
    expect(groups).toHaveLength(1);
    expect(groups[0].date).toBe("2026-09-05");
    expect(groups[0].events.map((candidate) => candidate.id)).toEqual(["meetup", "summit"]);
  });

  it("changes the cache signature when meaningful candidate data changes", () => {
    const before = crowdedStartDates([event({ id: "a" }), event({ id: "b" })], "2026-09-01")[0];
    const after = crowdedStartDates([event({ id: "a", venue: "Le Meridien" }), event({ id: "b" })], "2026-09-01")[0];
    expect(before.signature).not.toBe(after.signature);
  });

  it("uses editorial flags and Kochi locality for a stable offline fallback", () => {
    expect(deterministicPick([
      event({ id: "travel", title: "A Travel Event", travel: true }),
      event({ id: "local", title: "Local Event", manual: true }),
    ]).id).toBe("local");
    expect(deterministicPick([
      event({ id: "local" }),
      event({ id: "featured", featured: true, travel: true }),
    ]).id).toBe("featured");
  });
});
