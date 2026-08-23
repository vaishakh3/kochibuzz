import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "../schemas";
import { extractJsonLdEvents } from "./jsonld";

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
      organizer: { name: "GDG Cochin" },
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
      registerUrl: "https://gdg.example/register",
    });
  });
});
