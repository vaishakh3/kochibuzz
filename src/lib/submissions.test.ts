import { describe, expect, it } from "vitest";
import {
  prepareSubmission,
  submissionDefinitions,
  SubmissionValidationError,
  type SubmissionDefinition,
  type SubmissionKind,
} from "./submissions";

function validFields(kind: SubmissionKind): Record<string, string> {
  const definition: SubmissionDefinition = submissionDefinitions[kind];
  return Object.fromEntries(definition.fields.map((field) => {
    if (field.type === "url") return [field.name, "https://example.com/source"];
    if (field.type === "date") return [field.name, field.required ? "2026-09-10" : ""];
    if (field.type === "select") return [field.name, field.options?.[0] ?? ""];
    return [field.name, field.required ? `${field.label} value` : ""];
  }));
}

describe("prepareSubmission", () => {
  it.each(Object.keys(submissionDefinitions) as SubmissionKind[])("prepares a public %s issue", (kind) => {
    const prepared = prepareSubmission({
      kind,
      fields: validFields(kind),
      contact: "Maya @kochi",
      consent: true,
    });

    expect(prepared.title).toMatch(new RegExp(`^${submissionDefinitions[kind].issuePrefix}:`));
    expect(prepared.labels).toEqual(["submission", kind]);
    expect(prepared.body).toContain(`kochibuzz-submission:${kind}`);
    expect(prepared.body).toContain("Maya @\u200bkochi");
    expect(new URL(prepared.fallbackUrl).hostname).toBe("github.com");
  });

  it("rejects an event whose end date is before its start", () => {
    const fields = validFields("event");
    fields.end = "2026-09-09";
    expect(() => prepareSubmission({ kind: "event", fields, consent: true }))
      .toThrowError(new SubmissionValidationError("End date cannot be before the start date.", "end"));
  });

  it("rejects missing required fields and non-public URL schemes", () => {
    const fields = validFields("community");
    fields.name = "";
    expect(() => prepareSubmission({ kind: "community", fields, consent: true })).toThrow("Community name is required.");

    fields.name = "Kochi Builders";
    fields.url = "javascript:alert(1)";
    expect(() => prepareSubmission({ kind: "community", fields, consent: true })).toThrow("Official URL must be a complete public URL.");
  });

  it("requires confirmation that the issue can be reviewed publicly", () => {
    expect(() => prepareSubmission({ kind: "source", fields: validFields("source"), consent: false }))
      .toThrow("Confirm that the information is factual");
  });
});
