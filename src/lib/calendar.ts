import { TechEvent } from "@/data/events";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Parses YYYY-MM-DD as a local date, avoiding UTC drift from `new Date(iso)`. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -date.getDay());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export function occursOn(event: TechEvent, date: Date): boolean {
  const iso = toISODate(date);
  return iso >= event.start && iso <= event.end;
}

export function eventsOn(events: TechEvent[], date: Date): TechEvent[] {
  return events.filter((e) => occursOn(e, date)).sort(sortByStart);
}

export function sortByStart(a: TechEvent, b: TechEvent): number {
  if (a.start !== b.start) return a.start < b.start ? -1 : 1;
  return (a.startTime ?? "00:00") < (b.startTime ?? "00:00") ? -1 : 1;
}

export function isMultiDay(event: TechEvent): boolean {
  return event.start !== event.end;
}

export function dayCount(event: TechEvent): number {
  const diff = parseDate(event.end).getTime() - parseDate(event.start).getTime();
  return Math.round(diff / 86_400_000) + 1;
}

/** Six-week grid (42 cells) covering the month of `date`, Sunday-first. */
export function monthGrid(date: Date): Date[] {
  const first = startOfMonth(date);
  const gridStart = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

/** Same grid trimmed to the weeks that actually contain days of the month. */
export function compactMonthGrid(date: Date): Date[] {
  const cells = monthGrid(date);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const weeks = Math.ceil(
    (lastDay.getDate() + startOfMonth(date).getDay()) / 7,
  );
  return cells.slice(0, weeks * 7);
}

export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${`${m}`.padStart(2, "0")} ${suffix}`;
}

export function formatDateRange(event: TechEvent): string {
  const start = parseDate(event.start);
  const end = parseDate(event.end);
  if (event.start === event.end) {
    return `${WEEKDAYS_LONG[start.getDay()]}, ${start.getDate()} ${MONTHS[start.getMonth()]}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS[start.getMonth()]}`;
  }
  return `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]}`;
}

export function formatTimeRange(event: TechEvent): string {
  if (!event.startTime) return "All day · timings TBA";
  return event.endTime
    ? `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`
    : formatTime(event.startTime);
}

export function isPast(event: TechEvent, today: Date): boolean {
  return event.end < toISODate(today);
}

/** "today", "day 2 of 3", "tomorrow", "in N days" or "ended". */
export function countdownLabel(event: TechEvent, today: Date): string {
  const iso = toISODate(today);
  if (iso > event.end) return "ended";
  if (iso >= event.start) {
    if (!isMultiDay(event)) return "today";
    const day =
      Math.round(
        (parseDate(iso).getTime() - parseDate(event.start).getTime()) /
          86_400_000,
      ) + 1;
    return `day ${day} of ${dayCount(event)}`;
  }
  const days = daysUntil(event, today);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

export function daysUntil(event: TechEvent, from: Date): number {
  const diff = parseDate(event.start).getTime() - parseDate(toISODate(from)).getTime();
  return Math.round(diff / 86_400_000);
}

/** Today as seen in Kochi (IST), so the calendar agrees on server and client. */
export function todayInIST(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parseDate(parts);
}

export function googleCalendarUrl(event: TechEvent): string {
  const compact = (iso: string) => iso.replaceAll("-", "");
  const dates = event.startTime
    ? `${compact(event.start)}T${event.startTime.replace(":", "")}00/${compact(
        event.end,
      )}T${(event.endTime ?? "18:00").replace(":", "")}00`
    : `${compact(event.start)}/${compact(toISODate(addDays(parseDate(event.end), 1)))}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates,
    ctz: "Asia/Kolkata",
    location: `${event.venue}, ${event.city}`,
    details: `${event.blurb}\n\n${event.url}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function nextEvent(events: TechEvent[], from: Date): TechEvent | undefined {
  const iso = toISODate(from);
  return [...events].sort(sortByStart).find((e) => e.end >= iso);
}

export function upcomingEvents(
  events: TechEvent[],
  from: Date,
  limit: number,
): TechEvent[] {
  const iso = toISODate(from);
  return [...events]
    .sort(sortByStart)
    .filter((e) => e.end >= iso)
    .slice(0, limit);
}

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function veventLines(event: TechEvent): string[] {
  const compact = (iso: string) => iso.replaceAll("-", "");
  const dt = event.startTime
    ? [
        `DTSTART;TZID=Asia/Kolkata:${compact(event.start)}T${event.startTime.replace(":", "")}00`,
        `DTEND;TZID=Asia/Kolkata:${compact(event.end)}T${(event.endTime ?? "18:00").replace(":", "")}00`,
      ]
    : [
        `DTSTART;VALUE=DATE:${compact(event.start)}`,
        `DTEND;VALUE=DATE:${compact(toISODate(addDays(parseDate(event.end), 1)))}`,
      ];
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@kochi.buzz`,
    ...dt,
    `SUMMARY:${icsEscape(event.title)}`,
    `LOCATION:${icsEscape(`${event.venue}, ${event.city}`)}`,
    `DESCRIPTION:${icsEscape(`${event.blurb}\n\n${event.url}`)}`,
    `URL:${event.url}`,
    "END:VEVENT",
  ];
}

/** RFC 5545 .ics file contents for a single event, as a data URI-safe string. */
export function icsFor(event: TechEvent): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//kochi.buzz//EN",
    ...veventLines(event),
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Full subscribable calendar feed containing every event. */
export function icsCalendar(events: TechEvent[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//kochi.buzz//EN",
    "X-WR-CALNAME:kochi.buzz — Kochi Tech Events",
    "X-WR-TIMEZONE:Asia/Kolkata",
    ...events.flatMap(veventLines),
    "END:VCALENDAR",
  ].join("\r\n");
}
