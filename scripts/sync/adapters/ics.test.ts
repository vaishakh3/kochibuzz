import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "../schemas";
import { normalizeIcsEvents, parseIcs } from "./ics";

const source: SourceDefinition = {
  id: "test-ics",
  name: "Test calendar",
  kind: "ics",
  entityTypes: ["event"],
  url: "https://example.com/calendar.ics",
  enabled: true,
  trustLevel: 3,
  parser: "ics",
};

function vcal(body: string): string {
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${body}\r\nEND:VCALENDAR\r\n`;
}

describe("parseIcs", () => {
  it("parses a timed event with unfolded lines", () => {
    const ics = vcal(
      [
        "BEGIN:VEVENT",
        "UID:evt-1",
        "SUMMARY:Kochi Meetup — Cloud",
        " Native Edition",
        "DTSTART;TZID=Asia/Kolkata:20260905T100000",
        "DTEND;TZID=Asia/Kolkata:20260905T130000",
        "LOCATION:Infopark\\, Kochi",
        "URL:https://example.com/meetup",
        "END:VEVENT",
      ].join("\r\n"),
    );
    const [event] = parseIcs(ics);
    expect(event.summary).toBe("Kochi Meetup — CloudNative Edition");
    expect(event.dtstart).toEqual({ date: "2026-09-05", time: "10:00" });
    expect(event.dtend).toEqual({ date: "2026-09-05", time: "13:00" });
    expect(event.location).toBe("Infopark, Kochi");
  });

  it("parses date-only events", () => {
    const ics = vcal(
      [
        "BEGIN:VEVENT",
        "UID:evt-2",
        "SUMMARY:All-day event",
        "DTSTART;VALUE=DATE:20260910",
        "DTEND;VALUE=DATE:20260912",
        "END:VEVENT",
      ].join("\r\n"),
    );
    const [event] = parseIcs(ics);
    expect(event.dtstart).toEqual({ date: "2026-09-10", time: undefined });
    expect(event.dtend).toEqual({ date: "2026-09-12", time: undefined });
  });
});

describe("normalizeIcsEvents", () => {
  it("treats all-day DTEND as exclusive", () => {
    const parsed = parseIcs(
      vcal(
        [
          "BEGIN:VEVENT",
          "UID:evt-3",
          "SUMMARY:Two-day sprint",
          "DTSTART;VALUE=DATE:20260910",
          "DTEND;VALUE=DATE:20260912",
          "LOCATION:Kochi",
          "END:VEVENT",
        ].join("\r\n"),
      ),
    );
    const [event] = normalizeIcsEvents(parsed, source);
    expect(event.start).toBe("2026-09-10");
    expect(event.end).toBe("2026-09-11");
  });

  it("skips cancelled events and events missing title or start", () => {
    const parsed = parseIcs(
      vcal(
        [
          "BEGIN:VEVENT",
          "UID:evt-4",
          "SUMMARY:Cancelled thing",
          "DTSTART;VALUE=DATE:20260910",
          "STATUS:CANCELLED",
          "END:VEVENT",
          "BEGIN:VEVENT",
          "UID:evt-5",
          "DTSTART;VALUE=DATE:20260910",
          "END:VEVENT",
        ].join("\r\n"),
      ),
    );
    expect(normalizeIcsEvents(parsed, source)).toEqual([]);
  });

  it("leaves TBA time undefined instead of midnight", () => {
    const parsed = parseIcs(
      vcal(
        [
          "BEGIN:VEVENT",
          "UID:evt-6",
          "SUMMARY:Date-only meetup",
          "DTSTART;VALUE=DATE:20260920",
          "LOCATION:Kochi",
          "END:VEVENT",
        ].join("\r\n"),
      ),
    );
    const [event] = normalizeIcsEvents(parsed, source);
    expect(event.startTime).toBeUndefined();
  });
});
