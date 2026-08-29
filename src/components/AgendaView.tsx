"use client";

import { ChevronRightIcon } from "@/components/icons";
import { TechEvent, categoryById } from "@/data/events";
import {
  MONTHS,
  countdownLabel,
  eventPlace,
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
      data-event-start={muted ? undefined : event.start}
      className={[
        "calendar-agenda-event",
        event.id === selectedEventId ? "is-active" : "",
        muted ? "is-muted" : "",
      ].join(" ")}
    >
      <span className="calendar-agenda-date">
        <strong>{start.getDate()}</strong>
        <small>{MONTHS[start.getMonth()].slice(0, 3)}</small>
      </span>
      <span className="calendar-agenda-copy">
        <span className="calendar-agenda-title">
          <strong>{event.title}</strong>
          <span><i className={category.dot} aria-hidden />{category.label}</span>
          {event.travel && (
            <em>Worth the trip</em>
          )}
        </span>
        <span className="calendar-agenda-meta">
          {formatDateRange(event)} · {formatTimeRange(event)} · {eventPlace(event)}
        </span>
      </span>
      <span className="calendar-agenda-countdown">
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
    <div className="calendar-agenda">
      {upcoming.length === 0 ? (
        <p className="calendar-agenda-empty">
          Nothing upcoming in this selection yet — try enabling more categories.
        </p>
      ) : (
        groupByMonth(upcoming).map(([month, monthEvents]) => (
          <section key={month} className="calendar-agenda-month">
            <h2>{month}</h2>
            <ul>
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

      {past.length > 0 && (
        <details
          open={selectedIsPast}
          className="calendar-agenda-archive group"
        >
          <summary>
            <ChevronRightIcon className="h-3.5 w-3.5 transition group-open:rotate-90" />
            Archive · {past.length} past{" "}
            {past.length === 1 ? "event" : "events"}
          </summary>
          <div>
            {groupByMonth(past).map(([month, monthEvents]) => (
              <section key={month}>
                <h3>{month}</h3>
                <ul>
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
    </div>
  );
}
