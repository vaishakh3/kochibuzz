import { TechEvent, events } from "@/data/events";
import { announcements, jobs, opportunities, projects } from "@/data/dataset";
import type { Announcement, Job, Opportunity, Project } from "@/data/types";
import { addDays, sortByStart, toISODate } from "@/lib/calendar";

/** "New" badge window (days since first seen). */
export const NEW_DAYS = 3;
/** "Closing soon" window for deadlines (days). */
export const CLOSING_SOON_DAYS = 3;

export type BuzzType =
  | "event_new"
  | "event_today"
  | "event_tomorrow"
  | "event_weekend"
  | "job_new"
  | "opportunity_closing"
  | "announcement";

export type BuzzItem =
  | { type: "event_new" | "event_today" | "event_tomorrow" | "event_weekend"; label: string; event: TechEvent; score: number }
  | { type: "job_new"; label: string; jobs: Job[]; score: number }
  | { type: "opportunity_closing"; label: string; opportunity: Opportunity; score: number }
  | { type: "announcement"; label: string; announcement: Announcement; score: number };

function iso(date: Date): string {
  return toISODate(date);
}

/** Upcoming Saturday & Sunday (or the current weekend when today is Sat/Sun), IST. */
export function weekendRange(today: Date): { start: string; end: string } {
  const day = today.getDay();
  const toSaturday = day === 0 ? -1 : 6 - day;
  const saturday = addDays(today, toSaturday);
  return { start: iso(saturday), end: iso(addDays(saturday, 1)) };
}

export function daysBetween(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000,
  );
}

export function isNew(firstSeenAt: string | undefined, todayIso: string): boolean {
  if (!firstSeenAt) return false;
  const age = daysBetween(firstSeenAt, todayIso);
  return age >= 0 && age <= NEW_DAYS;
}

/** Opportunities with a real deadline within the closing-soon window. */
export function closingSoon(today: Date): Opportunity[] {
  const todayIso = iso(today);
  return opportunities
    .filter((o) => !o.ongoing && o.deadlineAt)
    .filter((o) => {
      const days = daysBetween(todayIso, o.deadlineAt!);
      return days >= 0 && days <= CLOSING_SOON_DAYS;
    })
    .sort((a, b) => a.deadlineAt!.localeCompare(b.deadlineAt!));
}

/** Opportunities that are still open (deadline today or later, or rolling). */
export function openOpportunities(today: Date): Opportunity[] {
  const todayIso = iso(today);
  return opportunities
    .filter((o) => o.ongoing || !o.deadlineAt || o.deadlineAt >= todayIso)
    .sort((a, b) => {
      if (a.deadlineAt && b.deadlineAt) return a.deadlineAt.localeCompare(b.deadlineAt);
      if (a.deadlineAt) return -1;
      if (b.deadlineAt) return 1;
      return a.title.localeCompare(b.title);
    });
}

export function eventsToday(today: Date): TechEvent[] {
  const todayIso = iso(today);
  return events
    .filter((e) => e.start <= todayIso && e.end >= todayIso)
    .sort(sortByStart);
}

export function eventsThisWeek(today: Date): TechEvent[] {
  const from = iso(today);
  const to = iso(addDays(today, 7));
  return events
    .filter((e) => e.end >= from && e.start <= to)
    .sort(sortByStart);
}

export function newJobs(today: Date): Job[] {
  const todayIso = iso(today);
  return jobs.filter((j) => isNew(j.firstSeenAt, todayIso));
}

export function activeAnnouncements(today: Date): Announcement[] {
  const todayIso = iso(today);
  return announcements.filter((a) => !a.expiresAt || a.expiresAt >= todayIso);
}

export function featuredProjects(): Project[] {
  return [...projects].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
}

/**
 * The Buzz feed: deterministic, generated from structured data. Factual labels
 * only — nothing is called trending or popular. Ranked by urgency + freshness
 * (+ manual editorial boost via `featured`).
 */
export function buildBuzz(today: Date, limit = 10): BuzzItem[] {
  const todayIso = iso(today);
  const tomorrowIso = iso(addDays(today, 1));
  const weekend = weekendRange(today);
  const items: BuzzItem[] = [];
  const usedEventIds = new Set<string>();

  for (const event of eventsToday(today)) {
    usedEventIds.add(event.id);
    items.push({ type: "event_today", label: "Today", event, score: 100 + boost(event) });
  }
  for (const event of events.filter((e) => e.start === tomorrowIso)) {
    usedEventIds.add(event.id);
    items.push({ type: "event_tomorrow", label: "Tomorrow", event, score: 80 + boost(event) });
  }
  for (const opportunity of closingSoon(today)) {
    const days = daysBetween(todayIso, opportunity.deadlineAt!);
    items.push({
      type: "opportunity_closing",
      label: days === 0 ? "Closes today" : "Closing soon",
      opportunity,
      score: 90 - days * 5,
    });
  }
  for (const event of events) {
    if (usedEventIds.has(event.id)) continue;
    if (event.start >= weekend.start && event.start <= weekend.end && event.start > todayIso) {
      usedEventIds.add(event.id);
      items.push({ type: "event_weekend", label: "This weekend", event, score: 60 + boost(event) });
    }
  }
  for (const event of events) {
    if (usedEventIds.has(event.id)) continue;
    if (event.end >= todayIso && isNew(event.firstSeenAt, todayIso)) {
      items.push({ type: "event_new", label: "New", event, score: 50 + boost(event) });
    }
  }
  const fresh = newJobs(today);
  if (fresh.length > 0) {
    items.push({
      type: "job_new",
      label: "Hiring",
      jobs: fresh.slice(0, 5),
      score: 40,
    });
  }
  for (const announcement of activeAnnouncements(today)) {
    items.push({ type: "announcement", label: "Announcement", announcement, score: 70 });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, limit);
}

function boost(event: TechEvent): number {
  return event.featured ? 20 : 0;
}
