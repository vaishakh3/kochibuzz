import { describe, expect, it } from "vitest";
import { discoveryDue, isSafePublicUrl, overlapsKnownEvent, pageSupportsCandidate, type AiEventCandidate } from "./events";
import type { EventRecord } from "../sync/schemas";

const candidate: AiEventCandidate = {
  title: "Kochi AI Builders Night",
  start: "2026-09-16",
  end: null,
  startTime: "18:00",
  endTime: "20:00",
  venue: "TinkerSpace, Kalamassery",
  city: "Kochi",
  organizer: "Kochi Builders",
  description: "An evening for AI builders.",
  categoryHint: "AI",
  evidenceUrl: "https://events.example.com/kochi-ai-builders",
  registrationUrl: null,
  sourceKind: "official_event_page",
  confidence: 0.95,
};

describe("event discovery safeguards", () => {
  it("requires independent title, date and Kochi locality evidence", () => {
    expect(pageSupportsCandidate(candidate, `
      <html><body><h1>Kochi AI Builders Night</h1>
      <p>16 September 2026 · TinkerSpace, Kalamassery</p></body></html>
    `)).toBe(true);
    expect(pageSupportsCandidate(candidate, "<h1>Kochi AI Builders Night</h1><p>Coming soon</p>")).toBe(false);
  });

  it("rejects local, credentialed and private-network URLs", () => {
    expect(isSafePublicUrl(new URL("https://luma.com/abc"))).toBe(true);
    expect(isSafePublicUrl(new URL("http://localhost/admin"))).toBe(false);
    expect(isSafePublicUrl(new URL("http://127.0.0.1/admin"))).toBe(false);
    expect(isSafePublicUrl(new URL("https://user:pass@example.com/"))).toBe(false);
  });

  it("honours the configured refresh interval", () => {
    const now = new Date("2026-08-30T12:00:00Z");
    expect(discoveryDue(null, now, 12)).toBe(true);
    expect(discoveryDue("2026-08-30T01:00:00Z", now, 12)).toBe(false);
    expect(discoveryDue("2026-08-29T23:00:00Z", now, 12)).toBe(true);
  });

  it("suppresses expanded titles for an event already on the same dates", () => {
    const known = [{
      title: "OpenSpeaks: Language Documentation & Archiving",
      start: "2026-09-07",
      end: "2026-09-07",
    } as EventRecord];
    expect(overlapsKnownEvent({
      title: "OpenSpeaks: Community language documentation and archiving training",
      start: "2026-09-07",
      end: "2026-09-07",
    }, known)).toBe(true);
    expect(overlapsKnownEvent({
      title: "Another AI Meetup",
      start: "2026-09-07",
      end: "2026-09-07",
    }, known)).toBe(false);
  });
});
