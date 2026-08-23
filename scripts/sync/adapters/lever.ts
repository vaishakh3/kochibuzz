import type { JobRecord, SourceDefinition } from "../schemas";
import { classifyJob, isKochiJobLocation } from "./jobs";

type LeverPosting = {
  id?: unknown;
  text?: unknown;
  createdAt?: unknown;
  hostedUrl?: unknown;
  applyUrl?: unknown;
  categories?: {
    location?: unknown;
    allLocations?: unknown;
  };
};

export function extractLeverJobs(body: string, source: SourceDefinition): JobRecord[] {
  const parsed = JSON.parse(body) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Lever response was not a postings array");

  const company = source.organization ?? source.name;
  const jobs: JobRecord[] = [];
  for (const item of parsed as LeverPosting[]) {
    const id = typeof item.id === "string" ? item.id : "";
    const title = typeof item.text === "string" ? item.text.trim() : "";
    const primaryLocation = typeof item.categories?.location === "string"
      ? item.categories.location.trim()
      : "";
    const allLocations = Array.isArray(item.categories?.allLocations)
      ? item.categories.allLocations.filter((value): value is string => typeof value === "string")
      : [primaryLocation];
    const detailUrl = typeof item.hostedUrl === "string"
      ? item.hostedUrl
      : typeof item.applyUrl === "string" ? item.applyUrl : "";

    if (!id || !title || !detailUrl || !allLocations.some(isKochiJobLocation)) continue;
    const createdAt = typeof item.createdAt === "number" ? item.createdAt : undefined;
    jobs.push({
      id: `${source.id}-${id.toLowerCase()}`,
      title,
      company,
      postedAt: createdAt ? new Date(createdAt).toISOString().slice(0, 10) : undefined,
      location: primaryLocation || allLocations.find(isKochiJobLocation),
      category: classifyJob(title),
      detailUrl,
      sourceUrl: source.url,
      sourceId: source.id,
    });
  }
  return jobs;
}

