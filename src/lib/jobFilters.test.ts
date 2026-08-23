import { describe, expect, it } from "vitest";
import type { Job } from "@/data/types";
import {
  defaultJobFilters,
  filterJobs,
  hasActiveJobFilters,
  isJobNew,
  jobSourceGroup,
} from "./jobFilters";

const jobs: Job[] = [
  {
    id: "infopark-role",
    title: "Platform Engineer",
    company: "Harbour Labs",
    category: "engineering",
    location: "Kochi",
    deadlineAt: "2026-08-29",
    firstSeenAt: "2026-08-23",
    detailUrl: "https://example.com/platform",
    sourceUrl: "https://example.com",
    sourceId: "infopark-jobs",
  },
  {
    id: "lever-role",
    title: "Product Designer",
    company: "Lagoon Studio",
    category: "design",
    location: "Ernakulam",
    deadlineAt: "2026-10-01",
    firstSeenAt: "2026-08-01",
    detailUrl: "https://example.com/design",
    sourceUrl: "https://example.com",
    sourceId: "lagoon-lever",
  },
  {
    id: "workable-role",
    title: "Cloud Intern",
    company: "Monsoon Systems",
    category: "internship",
    detailUrl: "https://example.com/intern",
    sourceUrl: "https://example.com",
    sourceId: "monsoon-workable",
  },
];

describe("job filters", () => {
  it("classifies job feeds into user-facing source groups", () => {
    expect(jobSourceGroup("infopark-jobs")).toBe("infopark");
    expect(jobSourceGroup("reply-lever")).toBe("lever");
    expect(jobSourceGroup("dodge-workable")).toBe("workable");
    expect(jobSourceGroup("ksum-careers")).toBe("ksum");
    expect(jobSourceGroup("community-board")).toBe("other");
  });

  it("combines category, company, source, deadline and new filters", () => {
    expect(
      filterJobs(
        jobs,
        {
          ...defaultJobFilters,
          category: "engineering",
          company: "Harbour Labs",
          source: "infopark",
          deadline: "week",
          newOnly: true,
        },
        "2026-08-24",
        3,
      ).map((job) => job.id),
    ).toEqual(["infopark-role"]);
  });

  it("finds text across title, company, category and location", () => {
    expect(
      filterJobs(jobs, { ...defaultJobFilters, query: "ernakulam" }, "2026-08-24", 3)
        .map((job) => job.id),
    ).toEqual(["lever-role"]);
  });

  it("distinguishes listed and undated roles", () => {
    expect(
      filterJobs(jobs, { ...defaultJobFilters, deadline: "listed" }, "2026-08-24", 3),
    ).toHaveLength(2);
    expect(
      filterJobs(jobs, { ...defaultJobFilters, deadline: "undated" }, "2026-08-24", 3)
        .map((job) => job.id),
    ).toEqual(["workable-role"]);
  });

  it("treats newness as an inclusive rolling window", () => {
    expect(isJobNew(jobs[0], "2026-08-24", 1)).toBe(true);
    expect(isJobNew(jobs[1], "2026-08-24", 3)).toBe(false);
  });

  it("reports whether any filter is active", () => {
    expect(hasActiveJobFilters(defaultJobFilters)).toBe(false);
    expect(hasActiveJobFilters({ ...defaultJobFilters, newOnly: true })).toBe(true);
  });
});
