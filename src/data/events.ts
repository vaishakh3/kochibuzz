export type CategoryId =
  | "hackathon"
  | "ai"
  | "opensource"
  | "startup"
  | "security"
  | "enterprise"
  | "cloud"
  | "webdev";

export type Category = {
  id: CategoryId;
  label: string;
  dot: string;
  chip: string;
  bar: string;
};

export const categories: Category[] = [
  {
    id: "hackathon",
    label: "Hackathons",
    dot: "bg-violet-400",
    chip: "bg-violet-100 text-violet-900 ring-violet-200",
    bar: "bg-violet-400",
  },
  {
    id: "ai",
    label: "AI & Agents",
    dot: "bg-amber-400",
    chip: "bg-amber-100 text-amber-900 ring-amber-200",
    bar: "bg-amber-400",
  },
  {
    id: "opensource",
    label: "Open Source",
    dot: "bg-emerald-400",
    chip: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    bar: "bg-emerald-400",
  },
  {
    id: "startup",
    label: "Startups",
    dot: "bg-sky-400",
    chip: "bg-sky-100 text-sky-900 ring-sky-200",
    bar: "bg-sky-400",
  },
  {
    id: "security",
    label: "Security",
    dot: "bg-rose-400",
    chip: "bg-rose-100 text-rose-900 ring-rose-200",
    bar: "bg-rose-400",
  },
  {
    id: "enterprise",
    label: "Enterprise & IT",
    dot: "bg-slate-400",
    chip: "bg-slate-200 text-slate-900 ring-slate-300",
    bar: "bg-slate-400",
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    dot: "bg-teal-400",
    chip: "bg-teal-100 text-teal-900 ring-teal-200",
    bar: "bg-teal-400",
  },
  {
    id: "webdev",
    label: "Web Dev",
    dot: "bg-orange-400",
    chip: "bg-orange-100 text-orange-900 ring-orange-200",
    bar: "bg-orange-400",
  },
];

export const categoryById = new Map(categories.map((c) => [c.id, c]));

export type TechEvent = {
  id: string;
  title: string;
  /** Inclusive start date, YYYY-MM-DD (IST). */
  start: string;
  /** Inclusive end date, YYYY-MM-DD (IST). Same as start for single-day events. */
  end: string;
  /** 24h local start/end time. Omitted when the schedule is not published yet. */
  startTime?: string;
  endTime?: string;
  category: CategoryId;
  venue: string;
  city: string;
  organizer: string;
  blurb: string;
  tags: string[];
  url: string;
  /** Direct registration link, when different from the event page. */
  registerUrl?: string;
  /** Shown as a caveat on the event card. */
  note?: string;
  /** Outside Kochi, but part of the same circuit — worth the trip. */
  travel?: boolean;
  /** Every URL this record was sourced from. */
  sourceUrls?: string[];
  sourceIds?: string[];
  /** Date (IST) the pipeline first saw this record. */
  firstSeenAt?: string;
  /** Manually curated record (as opposed to automatically ingested). */
  manual?: boolean;
  featured?: boolean;
};

import generatedEvents from "../../data/generated/events.json";

/**
 * Canonical events come from the generated dataset (data/generated/events.json),
 * produced by the sync pipeline from data/manual + registered sources.
 */
export const events: TechEvent[] = generatedEvents as TechEvent[];

export const eventById = new Map(events.map((e) => [e.id, e]));
