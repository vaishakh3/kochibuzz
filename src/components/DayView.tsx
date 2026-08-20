"use client";

import { TechEvent, categoryById } from "@/data/events";
import {
  MONTHS,
  WEEKDAYS_LONG,
  eventsOn,
  formatDateRange,
  formatTimeRange,
} from "@/lib/calendar";

type Props = {
  selected: Date;
  events: TechEvent[];
  selectedEventId?: string;
  onOpenEvent: (event: TechEvent) => void;
};

export default function DayView({
  selected,
  events,
  selectedEventId,
  onOpenEvent,
}: Props) {
  const dayEvents = eventsOn(events, selected);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
      <p className="text-sm text-slate-600">
        {WEEKDAYS_LONG[selected.getDay()]}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
        {selected.getDate()} {MONTHS[selected.getMonth()]}{" "}
        <span className="text-slate-500">{selected.getFullYear()}</span>
      </h2>

      {dayEvents.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
          No events on this day. Pick another date, or switch to Month to see
          what&apos;s coming up.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {dayEvents.map((event) => {
            const category = categoryById.get(event.category)!;
            return (
              <li key={event.id}>
                <button
                  onClick={() => onOpenEvent(event)}
                  className={[
                    "flex w-full gap-4 rounded-2xl bg-white p-4 text-left ring-1 transition",
                    event.id === selectedEventId
                      ? "ring-2 ring-slate-900/70"
                      : "ring-slate-200 hover:ring-slate-300",
                  ].join(" ")}
                >
                  <span className={`w-1.5 shrink-0 rounded-full ${category.bar}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-slate-900">
                        {event.title}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${category.chip}`}
                      >
                        {category.label}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {formatTimeRange(event)} · {event.venue}, {event.city}
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-slate-500">
                      {event.blurb}
                    </span>
                    <span className="mt-2 block text-[11px] text-slate-600">
                      {formatDateRange(event)} · {event.organizer}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
