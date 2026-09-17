import { describe, expect, it } from "vitest";
import schedule from "../../data/manual/sponsorships.json";
import {
  activeSponsorship,
  sponsorshipInquiryUrl,
  sponsorshipRequestSchema,
  sponsorshipScheduleSchema,
} from "./sponsorship";

const campaign = {
  id: "example-business",
  business: "Example Business",
  headline: "Build with us in Kochi",
  description: "Find our open roles.",
  url: "https://example.com/careers",
  startsOn: "2026-10-01",
  endsBefore: "2026-10-08",
};

const request = {
  business: "Example Business",
  url: "https://example.com",
  contactUrl: "https://example.com/contact",
  message: "We are hiring engineers in Kochi.",
  consent: true,
};

describe("sponsorship schedule", () => {
  it("validates the checked-in schedule", () => {
    expect(sponsorshipScheduleSchema.safeParse(schedule).success).toBe(true);
  });

  it("activates and expires at midnight in India, independently of the server timezone", () => {
    expect(activeSponsorship([campaign], new Date("2026-09-30T18:29:59Z"))).toBeUndefined();
    expect(activeSponsorship([campaign], new Date("2026-09-30T18:30:00Z"))?.id).toBe(campaign.id);
    expect(activeSponsorship([campaign], new Date("2026-10-07T18:29:59Z"))?.id).toBe(campaign.id);
    expect(activeSponsorship([campaign], new Date("2026-10-07T18:30:00Z"))).toBeUndefined();
    expect(activeSponsorship([], new Date("2026-10-01"))).toBeUndefined();
  });

  it("rejects overlaps and duplicate IDs but permits adjacent campaigns", () => {
    const next = { ...campaign, id: "second-business", startsOn: "2026-10-08", endsBefore: "2026-10-15" };
    expect(sponsorshipScheduleSchema.safeParse([next, campaign]).success).toBe(true);
    expect(sponsorshipScheduleSchema.safeParse([campaign, { ...next, id: campaign.id }]).success).toBe(false);
    expect(sponsorshipScheduleSchema.safeParse([campaign, { ...next, startsOn: "2026-10-07", endsBefore: "2026-10-14" }]).success).toBe(false);
  });

  it.each([
    { startsOn: "2026-02-30" },
    { endsBefore: "2026-10-01" },
    { endsBefore: "2026-10-09" },
    { endsBefore: "2026-09-30" },
    { url: "javascript:alert(1)" },
    { url: "not a URL" },
  ])("rejects an invalid campaign: %j", (overrides) => {
    expect(sponsorshipScheduleSchema.safeParse([{ ...campaign, ...overrides }]).success).toBe(false);
  });
});

describe("sponsorship inquiries", () => {
  it("prepares an unpaid inquiry without triggering the editorial submission workflow", () => {
    const url = new URL(sponsorshipInquiryUrl(request));
    expect(url.origin + url.pathname).toBe("https://github.com/vaishakh3/kochibuzz/issues/new");
    expect(url.searchParams.get("title")).toBe("Sponsorship inquiry: Example Business");
    expect(url.searchParams.get("body")).toContain("₹1,499");
    expect(url.searchParams.get("body")).toContain("not a paid order or a reserved slot");
    expect(url.searchParams.get("body")).not.toContain("kochibuzz-submission:");
    expect(url.searchParams.has("labels")).toBe(false);
  });

  it.each([
    { consent: false },
    { consent: "true" },
    { business: " " },
    { message: "x".repeat(181) },
    { url: "invalid" },
    { url: "javascript:alert(1)" },
    { contactUrl: "https://user:password@example.com" },
    { contactUrl: "mailto:private@example.com" },
  ])("rejects invalid public inquiry details: %j", (overrides) => {
    expect(sponsorshipRequestSchema.safeParse({ ...request, ...overrides }).success).toBe(false);
  });

  it("neutralizes mentions and HTML and keeps URL query values intact", () => {
    const url = new URL(sponsorshipInquiryUrl({
      ...request,
      business: "A & B",
      message: "<img src=x> @everyone",
      url: "https://example.com/?role=engineering&city=Kochi",
    }));
    expect(url.searchParams.get("title")).toBe("Sponsorship inquiry: A & B");
    expect(url.searchParams.get("body")).toContain("&lt;img src=x&gt; @\u200beveryone");
    expect(url.searchParams.get("body")).toContain("https://example.com/?role=engineering&city=Kochi");
  });
});
