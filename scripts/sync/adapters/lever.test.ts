import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "../schemas";
import { extractLeverJobs } from "./lever";

const source: SourceDefinition = {
  id: "acme-lever",
  name: "Acme jobs",
  kind: "json",
  entityTypes: ["job"],
  url: "https://api.lever.co/v0/postings/acme?mode=json",
  enabled: true,
  trustLevel: 4,
  parser: "lever",
  organization: "Acme",
};

describe("extractLeverJobs", () => {
  it("accepts Kochi-area roles and rejects other cities", () => {
    const jobs = extractLeverJobs(JSON.stringify([
      {
        id: "abc",
        text: "Cloud Engineer",
        createdAt: Date.UTC(2026, 7, 20),
        hostedUrl: "https://jobs.lever.co/acme/abc",
        categories: { location: "Kochi, Kerala", allLocations: ["Kochi, Kerala"] },
      },
      {
        id: "def",
        text: "Developer",
        hostedUrl: "https://jobs.lever.co/acme/def",
        categories: { location: "Bengaluru", allLocations: ["Bengaluru"] },
      },
    ]), source);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      id: "acme-lever-abc",
      company: "Acme",
      postedAt: "2026-08-20",
      category: "devops-cloud",
    });
  });
});
