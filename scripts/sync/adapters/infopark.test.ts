import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "../schemas";
import {
  classifyJob,
  extractInfoparkJobs,
  parseDeadlineDate,
  parsePostedDate,
} from "./infopark";

const source: SourceDefinition = {
  id: "infopark-jobs",
  name: "Infopark Kochi job board",
  kind: "html",
  entityTypes: ["job"],
  url: "https://infopark.in/companies-job",
  enabled: true,
  trustLevel: 5,
  parser: "infopark",
};

const fixture = readFileSync(
  join(__dirname, "..", "__fixtures__", "infopark-jobs.html"),
  "utf8",
);

describe("parsePostedDate", () => {
  it("parses dd-mm-yyyy", () => {
    expect(parsePostedDate("20-08-2026")).toBe("2026-08-20");
  });
  it("rejects malformed dates", () => {
    expect(parsePostedDate("Aug 20")).toBeUndefined();
    expect(parsePostedDate("")).toBeUndefined();
  });
});

describe("parseDeadlineDate", () => {
  it("parses d Mon yyyy", () => {
    expect(parseDeadlineDate("21 Aug 2026")).toBe("2026-08-21");
    expect(parseDeadlineDate("3 Sep 2026")).toBe("2026-09-03");
  });
  it("rejects malformed dates", () => {
    expect(parseDeadlineDate("soon")).toBeUndefined();
  });
});

describe("classifyJob", () => {
  it("classifies deterministically by keywords", () => {
    expect(classifyJob("Senior Software Engineer")).toBe("engineering");
    expect(classifyJob("Machine Learning Engineer")).toBe("ai-data");
    expect(classifyJob("DevOps Engineer - AWS")).toBe("devops-cloud");
    expect(classifyJob("UI/UX Designer")).toBe("design");
    expect(classifyJob("Product Manager")).toBe("product");
    expect(classifyJob("Business Development Executive")).toBe("business");
    expect(classifyJob("Software Intern")).toBe("internship");
    expect(classifyJob("Housekeeping Supervisor")).toBe("other");
  });
});

describe("extractInfoparkJobs", () => {
  it("extracts jobs from the official table markup", () => {
    const jobs = extractInfoparkJobs(fixture, source);
    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      expect(job.title.length).toBeGreaterThan(0);
      expect(job.company.length).toBeGreaterThan(0);
      expect(job.detailUrl).toMatch(/^https:\/\/infopark\.in\//);
      expect(job.id).toMatch(/^infopark-/);
    }
  });

  it("returns no records for changed/unknown markup instead of junk", () => {
    const jobs = extractInfoparkJobs(
      "<html><body><div>totally different page</div></body></html>",
      source,
    );
    expect(jobs).toEqual([]);
  });
});
