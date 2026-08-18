"use client";

import { ChevronRightIcon } from "@/components/icons";
import { TechEvent, categoryById } from "@/data/events";
import {
  MONTHS,
  countdownLabel,
  formatDateRange,
  formatTimeRange,
  isPast,
  parseDate,
  sortByStart,
} from "@/lib/calendar";

type Props = {
  today: Date;
  events: TechEvent[];
  selectedEventId?: string;
  onOpenEvent: (event: TechEvent) => void;
};

function groupByMonth(events: TechEvent[]): [string, TechEvent[]][] {
  const groups = new Map<string, TechEvent[]>();
  for (const event of events) {
    const start = parseDate(event.start);
    const key = `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  return [...groups.entries()];
}

function EventRow({
  event,
  today,
  selectedEventId,
  onOpenEvent,
  muted,
}: {
  event: TechEvent;
  today: Date;
  selectedEventId?: string;
  onOpenEvent: (event: TechEvent) => void;
  muted?: boolean;
}) {
  const category = categoryById.get(event.category)!;
  const start = parseDate(event.start);
  return (
    <button
      onClick={() => onOpenEvent(event)}
      className={[
        "flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left ring-1 transition",
        event.id === selectedEventId
          ? "ring-2 ring-slate-900/70"
          : "ring-slate-200 hover:ring-slate-300",
        muted ? "opacity-60 hover:opacity-100" : "",
      ].join(" ")}
    >
      <span className="grid w-12 shrink-0 place-items-center rounded-2xl bg-slate-50 py-2 ring-1 ring-slate-100">
        <span className="text-lg font-semibold leading-none text-slate-900">
          {start.getDate()}
        </span>
        <span className="mt-1 text-[10px] uppercase text-slate-400">
          {MONTHS[start.getMonth()].slice(0, 3)}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-slate-900">
            {event.title}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${category.chip}`}
          >
            {category.label}
          </span>
          {event.travel && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
              Outside Kochi
            </span>
          )}
        </span>
        <span className="mt-1 block text-xs text-slate-500">
          {formatDateRange(event)} · {formatTimeRange(event)} · {event.venue},{" "}
          {event.city}
        </span>
      </span>
      <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 sm:block">
        {countdownLabel(event, today)}
      </span>
    </button>
  );
}

export default function AgendaView({
  today,
  events,
  selectedEventId,
  onOpenEvent,
}: Props) {
  const ordered = [...events].sort(sortByStart);
  const past = ordered.filter((event) => isPast(event, today));
  const upcoming = ordered.filter((event) => !isPast(event, today));
  const selectedIsPast = past.some((event) => event.id === selectedEventId);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
      {past.length > 0 && (
        <details
          open={selectedIsPast}
          className="group mb-8 rounded-3xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
        >
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800">
            <ChevronRightIcon className="h-3.5 w-3.5 transition group-open:rotate-90" />
            Archive · {past.length} past{" "}
            {past.length === 1 ? "event" : "events"}
          </summary>
          <div className="mt-3 space-y-6">
            {groupByMonth(past).map(([month, monthEvents]) => (
              <section key={month}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  {month}
                </h3>
                <ul className="mt-2 space-y-2.5">
                  {monthEvents.map((event) => (
                    <li key={event.id}>
                      <EventRow
                        event={event}
                        today={today}
                        selectedEventId={selectedEventId}
                        onOpenEvent={onOpenEvent}
                        muted
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </details>
      )}

      {upcoming.length === 0 ? (
        <p className="rounded-3xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-100">
          Nothing upcoming in this selection yet — try enabling more categories.
        </p>
      ) : (
        groupByMonth(upcoming).map(([month, monthEvents]) => (
          <section key={month} className="mb-8">
            <h2 className="sticky top-0 z-10 -mx-2 bg-white/95 px-2 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-400 backdrop-blur">
              {month}
            </h2>
            <ul className="mt-2 space-y-2.5">
              {monthEvents.map((event) => (
                <li key={event.id}>
                  <EventRow
                    event={event}
                    today={today}
                    selectedEventId={selectedEventId}
                    onOpenEvent={onOpenEvent}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
