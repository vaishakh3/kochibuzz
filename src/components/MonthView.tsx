"use client";

import type { KeyboardEvent } from "react";
import EventChip from "@/components/EventChip";
import { TechEvent, categoryById } from "@/data/events";
import {
  WEEKDAYS,
  addDays,
  eventsOn,
  isPast,
  isSameDay,
  monthGrid,
  toISODate,
} from "@/lib/calendar";

type Props = {
  cursor: Date;
  selected: Date;
  today: Date;
  events: TechEvent[];
  selectedEventId?: string;
  onSelectDate: (date: Date) => void;
  onOpenEvent: (event: TechEvent) => void;
};

const dayLabelFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const monthLabelFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
});

export default function MonthView({
  cursor,
  selected,
  today,
  events,
  selectedEventId,
  onSelectDate,
  onOpenEvent,
}: Props) {
  const cells = monthGrid(cursor);
  const weeks = Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7));

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, day: Date, offset: number) {
    event.preventDefault();
    event.stopPropagation();
    const next = addDays(day, offset);
    onSelectDate(next);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`[data-calendar-date="${toISODate(next)}"]`)?.focus();
    });
  }

  return (
    <div className="calendar-month-view" role="grid" aria-label={`${monthLabelFormatter.format(cursor)} events calendar`} aria-rowcount={6} aria-colcount={7}>
      <div className="calendar-month-weekdays" role="row">
        {WEEKDAYS.map((day) => (
          <span key={day} role="columnheader">{day}</span>
        ))}
      </div>

      <div className="calendar-month-scroll">
        <div className="calendar-month-grid" role="rowgroup">
        {weeks.map((week) => <div className="calendar-month-week" role="row" key={toISODate(week[0])}>{week.map((day) => {
          const inMonth = day.getMonth() === cursor.getMonth();
          const dayEvents = eventsOn(events, day);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selected);
          return (
            <div
              key={toISODate(day)}
              className={[
                "calendar-month-day",
                inMonth ? "is-in-month" : "is-outside-month",
                isSelected ? "is-selected" : "",
                isToday ? "is-today" : "",
              ].join(" ")}
              role="gridcell"
              aria-selected={isSelected}
            >
              <button
                type="button"
                data-calendar-date={toISODate(day)}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => onSelectDate(day)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") moveFocus(event, day, 1);
                  else if (event.key === "ArrowLeft") moveFocus(event, day, -1);
                  else if (event.key === "ArrowDown") moveFocus(event, day, 7);
                  else if (event.key === "ArrowUp") moveFocus(event, day, -7);
                  else if (event.key === "Home") moveFocus(event, day, -day.getDay());
                  else if (event.key === "End") moveFocus(event, day, 6 - day.getDay());
                }}
                className="calendar-month-day__date"
                aria-label={`${dayLabelFormatter.format(day)}, ${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`}
              >
                <span>{day.getDate()}</span>
                {dayEvents.length > 0 && <i>{dayEvents.length}</i>}
              </button>

              <div className="calendar-month-day__events">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventChip
                    key={event.id}
                    event={event}
                    day={day}
                    compact
                    past={isPast(event, today)}
                    active={event.id === selectedEventId}
                    onClick={() => onOpenEvent(event)}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="calendar-month-day__more">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
              <div className="calendar-month-day__dots" aria-hidden>
                {dayEvents.slice(0, 3).map((event) => <i key={event.id} className={categoryById.get(event.category)?.dot} />)}
              </div>
            </div>
          );
        })}</div>)}
        </div>
      </div>
    </div>
  );
}
