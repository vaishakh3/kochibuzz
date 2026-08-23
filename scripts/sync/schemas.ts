import { z } from "zod";

export const KOCHI_TIMEZONE = "Asia/Kolkata";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, "expected HH:MM");

export const categoryIds = [
  "hackathon",
  "ai",
  "opensource",
  "startup",
  "security",
  "enterprise",
  "cloud",
  "webdev",
] as const;

export const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  start: isoDate,
  end: isoDate,
  startTime: hhmm.optional(),
  endTime: hhmm.optional(),
  category: z.enum(categoryIds),
  venue: z.string().min(1),
  city: z.string().min(1),
  organizer: z.string().min(1),
  blurb: z.string().min(1),
  tags: z.array(z.string()),
  url: z.string().url(),
  registerUrl: z.string().url().optional(),
  note: z.string().optional(),
  travel: z.boolean().optional(),
  sourceUrls: z.array(z.string().url()).optional(),
  sourceIds: z.array(z.string()).optional(),
  firstSeenAt: isoDate.optional(),
  manual: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const jobSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  postedAt: isoDate.optional(),
  deadlineAt: isoDate.optional(),
  location: z.string().optional(),
  category: z.enum([
    "engineering",
    "ai-data",
    "devops-cloud",
    "design",
    "product",
    "business",
    "internship",
    "other",
  ]),
  detailUrl: z.string().url(),
  sourceUrl: z.string().url(),
  sourceId: z.string().min(1),
  firstSeenAt: isoDate.optional(),
});

export const opportunitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum([
    "hackathon",
    "grant",
    "fellowship",
    "accelerator",
    "competition",
    "cfp",
    "volunteer",
    "scholarship",
    "bounty",
    "program",
    "other",
  ]),
  organization: z.string().min(1),
  summary: z.string().min(1),
  opensAt: isoDate.optional(),
  deadlineAt: isoDate.optional(),
  /** Rolling/always-open programmes; never shown as "closing soon". */
  ongoing: z.boolean().optional(),
  eligibility: z.array(z.string()).optional(),
  locationScope: z.enum(["kochi", "kerala", "india", "remote", "other"]),
  benefit: z.string().optional(),
  applicationUrl: z.string().url().optional(),
  url: z.string().url(),
  sourceUrls: z.array(z.string().url()).optional(),
  sourceIds: z.array(z.string()).optional(),
  firstSeenAt: isoDate.optional(),
  manual: z.boolean().optional(),
  tags: z.array(z.string()),
  featured: z.boolean().optional(),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url(),
  repositoryUrl: z.string().url().optional(),
  makerNames: z.array(z.string()).optional(),
  categories: z.array(z.string()).min(1),
  location: z.string().optional(),
  kochiConnection: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
});

export const announcementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  publishedAt: isoDate,
  expiresAt: isoDate.optional(),
});

export const sourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["ics", "rss", "jsonld", "html", "json", "markdown", "manual"]),
  entityTypes: z.array(z.enum(["event", "job", "opportunity", "community"])),
  url: z.string().url(),
  enabled: z.boolean(),
  trustLevel: z.number().int().min(1).max(5),
  refreshHours: z.number().int().positive().optional(),
  parser: z.string().optional(),
  organization: z.string().optional(),
  defaultCity: z.string().optional(),
  /** A successful empty response is valid for sources whose inventory can reach zero. */
  allowEmpty: z.boolean().optional(),
  notes: z.string().optional(),
});

export const sourceStateSchema = z.object({
  /** entity id → first date the pipeline saw it (YYYY-MM-DD, IST). */
  firstSeen: z.record(z.string(), isoDate),
  /** source id → record count from the last successful accepted response. */
  lastCounts: z.record(z.string(), z.number().int().nonnegative()),
});

export type EventRecord = z.infer<typeof eventSchema>;
export type JobRecord = z.infer<typeof jobSchema>;
export type OpportunityRecord = z.infer<typeof opportunitySchema>;
export type ProjectRecord = z.infer<typeof projectSchema>;
export type AnnouncementRecord = z.infer<typeof announcementSchema>;
export type SourceDefinition = z.infer<typeof sourceSchema>;
export type SourceState = z.infer<typeof sourceStateSchema>;
