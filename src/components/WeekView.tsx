"use client";

import EventChip from "@/components/EventChip";
import { TechEvent, categoryById } from "@/data/events";
import {
  WEEKDAYS,
  eventsOn,
  formatTime,
  formatTimeRange,
  isPast,
  isSameDay,
  toISODate,
  weekDays,
} from "@/lib/calendar";

const DAY_START = 8;
const DAY_END = 21;
const HOUR_HEIGHT = 64;

type Props = {
  selected: Date;
  today: Date;
  events: TechEvent[];
  days?: Date[];
  selectedEventId?: string;
  onSelectDate: (date: Date) => void;
  onOpenEvent: (event: TechEvent) => void;
};

function minutesFromStart(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h - DAY_START) * 60 + m;
}

export default function WeekView({
  selected,
  today,
  events,
  days,
  selectedEventId,
  onSelectDate,
  onOpenEvent,
}: Props) {
  const columns = days ?? weekDays(selected);
  const hours = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="calendar-week-days"
        style={{ gridTemplateColumns: `64px repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        <span />
        {columns.map((day) => {
          const isSelected = isSameDay(day, selected);
          return (
            <button
              key={toISODate(day)}
              onClick={() => onSelectDate(day)}
              className={[
                "calendar-week-day",
                isSelected ? "is-selected" : "",
              ].join(" ")}
            >
              <span>
                {WEEKDAYS[day.getDay()]}
                {isSameDay(day, today) ? " · today" : ""}
              </span>
              <strong>
                {day.getDate()}
              </strong>
            </button>
          );
        })}
      </div>

      <div
        className="calendar-week-all-day"
        style={{ gridTemplateColumns: `64px repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        <span>
          All day
        </span>
        {columns.map((day) => {
          const allDay = eventsOn(events, day).filter((e) => !e.startTime);
          return (
            <div key={toISODate(day)} className="flex flex-col gap-1 px-1">
              {allDay.map((event) => (
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
            </div>
          );
        })}
      </div>

      <div className="calendar-week-hours">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `64px repeat(${columns.length}, minmax(0, 1fr))`,
            height: hours.length * HOUR_HEIGHT,
          }}
        >
          <div className="relative">
            {hours.map((hour, i) => (
              <span
                key={hour}
                className="calendar-week-hour"
                style={{ top: i * HOUR_HEIGHT }}
              >
                {formatTime(`${hour}:00`)}
              </span>
            ))}
          </div>

          {columns.map((day) => {
            const timed = eventsOn(events, day).filter((e) => e.startTime);
            return (
              <div
                key={toISODate(day)}
                className="calendar-week-column"
                onClick={() => onSelectDate(day)}
              >
                {hours.map((hour, i) => (
                  <span
                    key={hour}
                    className="calendar-week-rule"
                    style={{ top: i * HOUR_HEIGHT }}
                  />
                ))}
                {timed.map((event) => {
                  const category = categoryById.get(event.category)!;
                  const top = (minutesFromStart(event.startTime!) / 60) * HOUR_HEIGHT;
                  const end = event.endTime
                    ? minutesFromStart(event.endTime)
                    : minutesFromStart(event.startTime!) + 90;
                  const height = Math.max(
                    52,
                    ((end - minutesFromStart(event.startTime!)) / 60) * HOUR_HEIGHT,
                  );
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEvent(event);
                      }}
                      style={{ top, height }}
                      className={[
                        "calendar-week-event",
                        event.id === selectedEventId ? "is-active" : "",
                        isPast(event, today) ? "is-past" : "",
                      ].join(" ")}
                    >
                      <i className={category.bar} aria-hidden />
                      <span className="calendar-week-event__title">
                        {event.title}
                      </span>
                      <span className="calendar-week-event__time">
                        {formatTimeRange(event)}
                      </span>
                      <span className="calendar-week-event__venue">
                        {event.venue}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
