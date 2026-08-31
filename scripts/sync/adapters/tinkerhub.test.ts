import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "../schemas";
import { extractTinkerHubEvents } from "./tinkerhub";

const source: SourceDefinition = {
  id: "tinkerhub-events",
  name: "TinkerHub — official events",
  kind: "json",
  entityTypes: ["event"],
  url: "https://app-api.tinkerhub.org/v1/public/event/all",
  enabled: true,
  trustLevel: 5,
  refreshHours: 1,
  parser: "tinkerhub-events",
  organization: "TinkerHub Foundation",
  defaultCity: "Kochi",
};

describe("TinkerHub event adapter", () => {
  const fixture = readFileSync(
    join(__dirname, "..", "__fixtures__", "tinkerhub-events.json"),
    "utf8",
  );
  const events = extractTinkerHubEvents(fixture, source);

  it("publishes only public Kochi and TinkerSpace Kalamassery events", () => {
    expect(events).toHaveLength(2);
    expect(events[0].title).toBe("bi0s Meetups");
    expect(events[0].venue).toBe("TinkerSpace, Kalamassery");
    expect(events[0].city).toBe("Kochi");
  });

  it("does not turn a multi-week programme into a bar across every calendar day", () => {
    expect(events[1]).toMatchObject({
      title: "Nights and Weekends",
      start: "2026-09-06",
      end: "2026-09-06",
      note: "Programme runs through 11 October 2026.",
    });
  });

  it("converts the official UTC timestamps to Asia/Kolkata", () => {
    expect(events[0]).toMatchObject({
      start: "2026-09-05",
      end: "2026-09-05",
      startTime: "09:30",
      endTime: "13:00",
    });
  });

  it("keeps a stable official detail page, registration link and provenance", () => {
    expect(events[0]).toMatchObject({
      id: "tinkerhub-events-4iukv0w6p8",
      url: "https://tinkerhub.org/events/4IUKV0W6P8/bi0s-meetups",
      registerUrl: "https://forms.gle/3QZ8g7GKBhbtFkqW6",
      sourceIds: ["tinkerhub-events"],
    });
    expect(events[0].sourceUrls).toContain(source.url);
  });
});
