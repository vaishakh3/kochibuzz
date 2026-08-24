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
    <div className="calendar-day-view">
      <p className="calendar-day-view__weekday">
        {WEEKDAYS_LONG[selected.getDay()]}
      </p>
      <h2 className="font-display">
        {selected.getDate()} {MONTHS[selected.getMonth()]}{" "}
        <span>{selected.getFullYear()}</span>
      </h2>

      {dayEvents.length === 0 ? (
        <p className="calendar-day-view__empty">
          No events on this day. Pick another date, or switch to Month to see
          what&apos;s coming up.
        </p>
      ) : (
        <ul className="calendar-day-list">
          {dayEvents.map((event) => {
            const category = categoryById.get(event.category)!;
            return (
              <li key={event.id}>
                <button
                  onClick={() => onOpenEvent(event)}
                  className={[
                    "calendar-day-event",
                    event.id === selectedEventId ? "is-active" : "",
                  ].join(" ")}
                >
                  <i className={category.bar} aria-hidden />
                  <span>
                    <span className="calendar-day-event__title">
                      <strong>
                        {event.title}
                      </strong>
                      <em><b className={category.dot} aria-hidden />{category.label}</em>
                    </span>
                    <span className="calendar-day-event__meta">
                      {formatTimeRange(event)} · {event.venue}, {event.city}
                    </span>
                    <span className="calendar-day-event__blurb">
                      {event.blurb}
                    </span>
                    <span className="calendar-day-event__source">
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
