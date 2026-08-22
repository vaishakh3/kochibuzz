"use client";

import EventChip from "@/components/EventChip";
import { TechEvent, categoryById } from "@/data/events";
import {
  WEEKDAYS,
  compactMonthGrid,
  eventsOn,
  isPast,
  isSameDay,
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

export default function MonthView({
  cursor,
  selected,
  today,
  events,
  selectedEventId,
  onSelectDate,
  onOpenEvent,
}: Props) {
  const cells = compactMonthGrid(cursor);

  return (
    <div className="calendar-month-view">
      <div className="calendar-month-weekdays">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-month-scroll">
        <div className="calendar-month-grid">
        {cells.map((day) => {
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
            >
              <button type="button" onClick={() => onSelectDate(day)} className="calendar-month-day__date" aria-label={`Select ${day.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}>
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
        })}
        </div>
      </div>
    </div>
  );
}
