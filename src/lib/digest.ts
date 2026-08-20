import { TechEvent, events } from "@/data/events";
import {
  MONTHS,
  WEEKDAYS,
  addDays,
  parseDate,
  sortByStart,
  toISODate,
  todayInIST,
} from "@/lib/calendar";

export const DIGEST_DAYS = 30;

/** Events starting within the next `days` days, or already running today. */
export function digestEvents(days: number = DIGEST_DAYS): TechEvent[] {
  const today = todayInIST();
  const from = toISODate(today);
  const to = toISODate(addDays(today, days));
  return events
    .filter((event) => event.end >= from && event.start <= to)
    .sort(sortByStart);
}

function shortDate(event: TechEvent): string {
  const start = parseDate(event.start);
  const label = `${WEEKDAYS[start.getDay()]} ${start.getDate()} ${MONTHS[start.getMonth()].slice(0, 3)}`;
  if (event.end === event.start) return label;
  const end = parseDate(event.end);
  return `${label}–${end.getDate()} ${MONTHS[end.getMonth()].slice(0, 3)}`;
}

export type DigestOpportunity = {
  title: string;
  organization: string;
  deadlineAt: string;
};

function shortIso(iso: string): string {
  const date = parseDate(iso);
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

/** Plain-text digest, sized for pasting into a WhatsApp or Slack group. */
export function digestText(
  list: TechEvent[],
  days: number = DIGEST_DAYS,
  closing: DigestOpportunity[] = [],
): string {
  const today = todayInIST();
  const weekCutoff = toISODate(addDays(today, 7));
  const thisWeek = list.filter((event) => event.start <= weekCutoff);
  const later = list.filter((event) => event.start > weekCutoff);
  const line = (event: TechEvent) =>
    `• ${shortDate(event)} — ${event.title} (${event.venue}, ${event.city})`;

  const lines = [`What's on in Kochi tech — next ${days} days`, ""];
  if (thisWeek.length > 0) {
    lines.push("This week:", ...thisWeek.map(line), "");
  }
  if (later.length > 0) {
    lines.push("Coming up:", ...later.map(line), "");
  }
  if (closing.length > 0) {
    lines.push(
      "Closing soon:",
      ...closing.map(
        (o) => `• ${o.title} (${o.organization}) — by ${shortIso(o.deadlineAt)}`,
      ),
      "",
    );
  }
  lines.push("Full calendar: https://kochi.buzz");
  return lines.join("\n");
}
