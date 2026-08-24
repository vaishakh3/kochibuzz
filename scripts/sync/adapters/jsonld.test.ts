import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "../schemas";
import { extractJsonLdDetailEvent, extractJsonLdEvents } from "./jsonld";

const source: SourceDefinition = {
  id: "gdg-test",
  name: "GDG Test",
  kind: "jsonld",
  entityTypes: ["event"],
  url: "https://gdg.example/chapter/",
  enabled: true,
  trustLevel: 5,
  parser: "jsonld-events",
  organization: "GDG Test",
  defaultCity: "Kochi",
};

describe("extractJsonLdEvents", () => {
  it("normalizes Schema.org Event data from an official detail page", () => {
    const html = `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Kochi AI Builders Night",
      startDate: "2026-09-12T17:30:00+05:30",
      endDate: "2026-09-12T20:00:00+05:30",
      description: "<p>An agentic AI build night.</p>",
      url: "/events/details/build-night/",
      location: {
        "@type": "Place",
        name: "Infopark",
        address: { addressLocality: "Kochi" },
      },
      organizer: [{ name: "GDG Cochin" }, { name: "Maya" }],
      offers: { url: "https://gdg.example/register" },
    })}</script>`;
    const [event] = extractJsonLdEvents(html, source, "https://gdg.example/events/details/build-night/");
    expect(event).toMatchObject({
      title: "Kochi AI Builders Night",
      start: "2026-09-12",
      startTime: "17:30",
      category: "ai",
      venue: "Infopark",
      city: "Kochi",
      organizer: "GDG Cochin, Maya",
      registerUrl: "https://gdg.example/register",
    });
  });

  it("rejects a calendar page when it is supplied as an event permalink", () => {
    const html = ["Kochi", "Chiang Mai"].map((city, index) =>
      `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Event",
        name: `Codex meetup ${city}`,
        startDate: `2026-09-${19 + index}T10:00:00+05:30`,
        endDate: `2026-09-${19 + index}T12:00:00+05:30`,
        url: `https://luma.com/event${index}`,
      })}</script>`,
    ).join("");

    expect(extractJsonLdDetailEvent(html, source, "https://luma.com/codex-community"))
      .toEqual([]);
  });
});
