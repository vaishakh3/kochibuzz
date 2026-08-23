import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "../schemas";
import { extractKsumTenders, parseKsumDate } from "./ksum";

const source: SourceDefinition = {
  id: "ksum-tenders",
  name: "KSUM tenders",
  kind: "json",
  entityTypes: ["opportunity"],
  url: "https://startupmission.kerala.gov.in/api/public/tenders",
  enabled: true,
  trustLevel: 5,
  parser: "ksum-tenders",
  organization: "Kerala Startup Mission",
};

describe("KSUM adapter", () => {
  it("parses the endpoint date format", () => {
    expect(parseKsumDate("Fri, Sep 11, 2026 5:00 PM")).toBe("2026-09-11");
  });

  it("publishes open calls and ignores closed records", () => {
    const opportunities = extractKsumTenders(JSON.stringify({ data: [
      {
        name: "RFP for Huddle Global",
        date: "Fri, Sep 11, 2026 5:00 PM",
        ref: "KSUM/RFP/1",
        brief: "Event management partner",
        type: "eTender",
        file: "https://example.com/rfp.pdf",
        open: true,
      },
      {
        name: "Closed RFP",
        date: "Fri, Aug 1, 2026 5:00 PM",
        file: "https://example.com/closed.pdf",
        open: false,
      },
    ] }), source);
    expect(opportunities).toHaveLength(1);
    expect(opportunities[0]).toMatchObject({
      title: "RFP for Huddle Global",
      deadlineAt: "2026-09-11",
      locationScope: "kerala",
      sourceIds: ["ksum-tenders"],
    });
  });
});
