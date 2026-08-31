import { describe, expect, it } from "vitest";
import type { TechEvent } from "@/data/events";
import { calendarDayPresentation, parseDate } from "./calendar";

function event(overrides: Partial<TechEvent> = {}): TechEvent {
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

describe("month-grid event presentation", () => {
  it("puts the cached crowded-date choice first", () => {
    const presentation = calendarDayPresentation([
      event({ id: "summit", title: "Summit" }),
      event({ id: "meetup", title: "Meetup" }),
    ], parseDate("2026-09-05"), "summit");
    expect(presentation.headline?.id).toBe("summit");
    expect(presentation.events.map((candidate) => candidate.id)).toEqual(["summit", "meetup"]);
  });

  it("never repeats a multi-day event as the visible headline after opening day", () => {
    const continuing = event({ id: "hackathon", start: "2026-09-04", end: "2026-09-06" });
    const presentation = calendarDayPresentation([continuing], parseDate("2026-09-05"));
    expect(presentation.headline).toBeUndefined();
    expect(presentation.events).toEqual([continuing]);
  });

  it("falls back to another starting event when filters hide Luna's choice", () => {
    const visible = event({ id: "visible", title: "Visible community event" });
    const presentation = calendarDayPresentation([visible], parseDate("2026-09-05"), "filtered-out");
    expect(presentation.headline?.id).toBe("visible");
  });
});
