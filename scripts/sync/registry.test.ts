import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { sourceSchema } from "./schemas";

const registry = z.array(sourceSchema).parse(JSON.parse(
  readFileSync(join(__dirname, "..", "..", "data", "sources", "registry.json"), "utf8"),
));

const implementedParsers = new Set([
  "infopark",
  "lever",
  "workable",
  "jsonld-events",
  "ics",
  "ksum-events",
  "ksum-careers",
  "ksum-tenders",
]);

describe("source registry", () => {
  it("has stable unique ids", () => {
    expect(new Set(registry.map((source) => source.id)).size).toBe(registry.length);
  });

  it("enables only implemented parsers on HTTPS sources", () => {
    for (const source of registry.filter((candidate) => candidate.enabled)) {
      expect(implementedParsers.has(source.parser ?? source.kind)).toBe(true);
      expect(source.url).toMatch(/^https:\/\//);
    }
  });

  it("refreshes every enabled source within four hours", () => {
    for (const source of registry.filter((candidate) => candidate.enabled)) {
      expect(source.refreshHours).toBeLessThanOrEqual(4);
    }
  });
});
