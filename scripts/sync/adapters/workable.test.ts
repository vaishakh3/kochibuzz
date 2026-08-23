import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "../schemas";
import { extractWorkableJobs } from "./workable";

const source: SourceDefinition = {
  id: "acme-workable",
  name: "Acme jobs",
  kind: "markdown",
  entityTypes: ["job"],
  url: "https://apply.workable.com/acme/jobs.md",
  enabled: true,
  trustLevel: 4,
  parser: "workable",
  organization: "Acme",
};

describe("extractWorkableJobs", () => {
  it("reads the machine-friendly table and creates human job URLs", () => {
    const markdown = [
      "| Title | Department | Location | Type | Salary | Posted | Details |",
      "|---|---|---|---|---|---|---|",
      "| Product Designer | Product | Kochi, India | Full-time | — | 2026-08-20 | [View](https://apply.workable.com/acme/jobs/view/ABC123.md) |",
      "| Developer | Tech | London, UK | Full-time | — | 2026-08-20 | [View](https://apply.workable.com/acme/jobs/view/DEF456.md) |",
    ].join("\n");
    const jobs = extractWorkableJobs(markdown, source);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      id: "acme-workable-abc123",
      company: "Acme",
      category: "design",
      detailUrl: "https://apply.workable.com/acme/j/ABC123/",
    });
  });
});
