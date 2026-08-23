export const GITHUB_REPOSITORY_URL = "https://github.com/vaishakh3/kochibuzz";

export type SubmissionFieldType = "text" | "url" | "date" | "textarea" | "select";

export type SubmissionField = {
  name: string;
  label: string;
  type: SubmissionFieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: readonly string[];
  maxLength?: number;
  span?: "full";
};

export type SubmissionDefinition = {
  label: string;
  shortLabel: string;
  description: string;
  issuePrefix: string;
  labels: readonly string[];
  fields: readonly SubmissionField[];
};

export const submissionDefinitions = {
  event: {
    label: "Event",
    shortLabel: "Event",
    description: "Meetups, workshops, conferences and hackathons in or around Kochi.",
    issuePrefix: "Event",
    labels: ["submission", "event"],
    fields: [
      { name: "name", label: "Event name", type: "text", required: true, placeholder: "What is it called?" },
      { name: "category", label: "Category", type: "select", required: true, options: ["Hackathons", "AI & Agents", "Open Source", "Startups", "Security", "Enterprise & IT", "Cloud & DevOps", "Web Dev", "Design & Creative Tech", "Other"] },
      { name: "start", label: "Start date", type: "date", required: true },
      { name: "end", label: "End date", type: "date", hint: "Only for multi-day events." },
      { name: "time", label: "Time", type: "text", placeholder: "09:30–17:00 or TBA" },
      { name: "venue", label: "Venue / city", type: "text", required: true, placeholder: "TinkerSpace, Kalamassery" },
      { name: "organizer", label: "Organizer", type: "text", required: true },
      { name: "register", label: "Registration URL", type: "url", placeholder: "https://…" },
      { name: "source", label: "Official event page", type: "url", required: true, placeholder: "https://…", hint: "This is what we use to verify changes later." },
      { name: "notes", label: "Anything else", type: "textarea", maxLength: 1500, span: "full", placeholder: "A short factual note, accessibility details, ticket price, or anything useful." },
    ],
  },
  opportunity: {
    label: "Opportunity",
    shortLabel: "Opportunity",
    description: "Grants, fellowships, accelerators, CFPs, competitions and programs.",
    issuePrefix: "Opportunity",
    labels: ["submission", "opportunity"],
    fields: [
      { name: "name", label: "Opportunity name", type: "text", required: true },
      { name: "type", label: "Type", type: "select", required: true, options: ["Hackathon", "Grant", "Fellowship", "Accelerator", "Competition", "CFP", "Volunteer", "Scholarship", "Bounty", "Program", "Other"] },
      { name: "organization", label: "Organization", type: "text", required: true },
      { name: "deadline", label: "Deadline", type: "text", placeholder: "YYYY-MM-DD or rolling" },
      { name: "apply", label: "Application URL", type: "url", required: true, placeholder: "https://…" },
      { name: "source", label: "Official source URL", type: "url", required: true, placeholder: "https://…" },
      { name: "summary", label: "Short factual summary", type: "textarea", required: true, maxLength: 1500, span: "full", placeholder: "Who it is for, what is offered, and the important eligibility details." },
    ],
  },
  project: {
    label: "Built in Kochi",
    shortLabel: "Project",
    description: "Products, open-source projects, hardware and experiments built from Kochi.",
    issuePrefix: "Project",
    labels: ["submission", "project"],
    fields: [
      { name: "name", label: "Project name", type: "text", required: true },
      { name: "tagline", label: "One-line description", type: "text", required: true, maxLength: 180 },
      { name: "url", label: "Project URL", type: "url", required: true, placeholder: "https://…" },
      { name: "repo", label: "GitHub URL", type: "url", placeholder: "https://github.com/…" },
      { name: "makers", label: "Makers", type: "text", hint: "Only names already listed publicly." },
      { name: "categories", label: "Categories", type: "text", placeholder: "Open Source, AI, Hardware" },
      { name: "what", label: "What was built?", type: "textarea", required: true, maxLength: 1500, span: "full" },
      { name: "kochi", label: "Connection to Kochi", type: "textarea", required: true, maxLength: 600, span: "full", hint: "A real Kochi connection is required." },
    ],
  },
  community: {
    label: "Community",
    shortLabel: "Community",
    description: "Active technology and maker communities meeting in and around Kochi.",
    issuePrefix: "Community",
    labels: ["submission", "community"],
    fields: [
      { name: "name", label: "Community name", type: "text", required: true },
      { name: "url", label: "Official URL", type: "url", required: true, placeholder: "https://…" },
      { name: "focus", label: "Focus", type: "text", required: true, placeholder: "Python, cloud native, students…" },
      { name: "cadence", label: "Usual cadence", type: "text", placeholder: "Monthly meetups" },
      { name: "about", label: "About the community", type: "textarea", required: true, maxLength: 1500, span: "full" },
    ],
  },
  source: {
    label: "Data source",
    shortLabel: "Source",
    description: "Public calendars, feeds and stable pages Kochi Buzz should monitor.",
    issuePrefix: "Source",
    labels: ["submission", "source"],
    fields: [
      { name: "name", label: "Source name", type: "text", required: true },
      { name: "url", label: "Public URL", type: "url", required: true, placeholder: "https://…", hint: "iCal, RSS/Atom, Luma calendar, Meetup group, or a stable public page." },
      { name: "entity", label: "What does it list?", type: "select", required: true, options: ["Events", "Jobs", "Opportunities", "Communities"] },
      { name: "notes", label: "Verification notes", type: "textarea", maxLength: 1500, span: "full", placeholder: "Who runs it, how often it updates, and anything else that helps us verify it." },
    ],
  },
} as const satisfies Record<string, SubmissionDefinition>;

export type SubmissionKind = keyof typeof submissionDefinitions;

export type SubmissionPayload = {
  kind: SubmissionKind;
  fields: Record<string, string>;
  contact?: string;
  consent: boolean;
  website?: string;
};

export type PreparedSubmission = {
  kind: SubmissionKind;
  title: string;
  body: string;
  labels: string[];
  fallbackUrl: string;
};

export class SubmissionValidationError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = "SubmissionValidationError";
  }
}

const kinds = new Set(Object.keys(submissionDefinitions));
const controlCharacters = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

export function isSubmissionKind(value: unknown): value is SubmissionKind {
  return typeof value === "string" && kinds.has(value);
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(controlCharacters, "").replace(/\r\n?/g, "\n").trim().slice(0, maxLength);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function markdownSafe(value: string): string {
  return value
    .replaceAll("@", "@\u200b")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function prepareSubmission(input: unknown): PreparedSubmission {
  if (!input || typeof input !== "object") {
    throw new SubmissionValidationError("Check the form and try again.");
  }
  const candidate = input as Partial<SubmissionPayload> & { kind?: unknown; fields?: unknown };
  if (!isSubmissionKind(candidate.kind)) {
    throw new SubmissionValidationError("Choose what you want to add.", "kind");
  }
  if (!candidate.consent) {
    throw new SubmissionValidationError("Confirm that the information is factual and can be reviewed publicly.", "consent");
  }
  if (!candidate.fields || typeof candidate.fields !== "object" || Array.isArray(candidate.fields)) {
    throw new SubmissionValidationError("Check the form and try again.");
  }

  const definition: SubmissionDefinition = submissionDefinitions[candidate.kind];
  const values: Record<string, string> = {};
  for (const field of definition.fields) {
    const maxLength = field.maxLength ?? (field.type === "url" ? 500 : 240);
    const value = normalizeText((candidate.fields as Record<string, unknown>)[field.name], maxLength);
    if (field.required && !value) {
      throw new SubmissionValidationError(`${field.label} is required.`, field.name);
    }
    if (value && field.type === "url" && !isValidHttpUrl(value)) {
      throw new SubmissionValidationError(`${field.label} must be a complete public URL.`, field.name);
    }
    if (value && field.type === "date" && !isValidDate(value)) {
      throw new SubmissionValidationError(`${field.label} must be a valid date.`, field.name);
    }
    if (value && field.type === "select" && !field.options?.includes(value)) {
      throw new SubmissionValidationError(`Choose a valid ${field.label.toLowerCase()}.`, field.name);
    }
    values[field.name] = value;
  }

  if (candidate.kind === "event" && values.end && values.start && values.end < values.start) {
    throw new SubmissionValidationError("End date cannot be before the start date.", "end");
  }

  const titleValue = values[definition.fields[0].name];
  const title = `${definition.issuePrefix}: ${titleValue}`.slice(0, 220);
  const contact = normalizeText(candidate.contact, 160);
  const sections = definition.fields
    .filter((field) => values[field.name])
    .map((field) => `### ${field.label}\n${markdownSafe(values[field.name])}`);
  if (contact) sections.push(`### Submitted by / public contact\n${markdownSafe(contact)}`);

  const body = [
    `<!-- kochibuzz-submission:${candidate.kind} -->`,
    "Submitted through [kochi.buzz](https://kochi.buzz/submit).",
    ...sections,
    "---",
    "This submission is public and will be verified before it is added to Kochi Buzz.",
  ].join("\n\n");
  const fallback = new URL(`${GITHUB_REPOSITORY_URL}/issues/new`);
  fallback.searchParams.set("title", title);
  fallback.searchParams.set("body", body);

  return {
    kind: candidate.kind,
    title,
    body,
    labels: [...definition.labels],
    fallbackUrl: fallback.toString(),
  };
}
