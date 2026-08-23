"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState, type KeyboardEvent } from "react";
import EventChip from "@/components/EventChip";
import { ChevronRightIcon, CloseIcon } from "@/components/icons";
import { TechEvent, categoryById } from "@/data/events";
import {
  WEEKDAYS,
  addDays,
  eventsOn,
  formatTimeRange,
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

function DayLens({
  day,
  events,
  onClose,
  onOpenEvent,
}: {
  day: Date;
  events: TechEvent[];
  onClose: () => void;
  onOpenEvent: (event: TechEvent) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeLens = useEffectEvent(onClose);

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") closeLens();
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnTo?.focus();
    };
  }, []);

  return (
    <div
      className="calendar-day-lens-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        className="calendar-day-lens"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-day-lens-title"
      >
        <header>
          <div>
            <p>Day lens · {events.length} {events.length === 1 ? "signal" : "signals"}</p>
            <h2 id="calendar-day-lens-title" className="font-display">
              {dayLabelFormatter.format(day)}
            </h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close day lens">
            <CloseIcon />
          </button>
        </header>

        <ol>
          {events.map((event, index) => {
            const category = categoryById.get(event.category)!;
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEvent(event);
                  }}
                >
                  <span className="calendar-day-lens__index">{String(index + 1).padStart(2, "0")}</span>
                  <i className={category.dot} aria-hidden />
                  <span>
                    <small>{formatTimeRange(event)} · {category.label}</small>
                    <strong>{event.title}</strong>
                    <em>{event.venue}</em>
                  </span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ol>
        <footer>Choose a signal to open the full event brief.</footer>
      </div>
    </div>
  );
}

export default function MonthView({
  cursor,
  selected,
  today,
  events,
  selectedEventId,
  onSelectDate,
  onOpenEvent,
}: Props) {
  const cells = useMemo(() => monthGrid(cursor), [cursor]);
  const weeks = useMemo(
    () => Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7)),
    [cells],
  );
  const eventsByDay = useMemo(
    () => new Map(cells.map((day) => [toISODate(day), eventsOn(events, day)])),
    [cells, events],
  );
  const [openDay, setOpenDay] = useState<Date | null>(null);

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, day: Date, offset: number) {
    event.preventDefault();
    event.stopPropagation();
    const next = addDays(day, offset);
    onSelectDate(next);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>(`[data-calendar-date="${toISODate(next)}"]`)?.focus();
    });
  }

  function selectDay(day: Date, dayEvents: TechEvent[]) {
    onSelectDate(day);
    if (dayEvents.length > 0 && window.matchMedia("(max-width: 1023px)").matches) {
      setOpenDay(day);
    }
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
          const dayEvents = eventsByDay.get(toISODate(day)) ?? [];
          const visibleDayEvents = dayEvents.slice(0, 1);
          const hiddenEventCount = dayEvents.length - visibleDayEvents.length;
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
                onClick={() => selectDay(day, dayEvents)}
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

              <div className={["calendar-month-day__events", hiddenEventCount > 0 ? "has-overflow" : ""].join(" ")}>
                {visibleDayEvents.map((event) => (
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
                {hiddenEventCount > 0 && (
                  <button
                    type="button"
                    className="calendar-month-day__more"
                    aria-haspopup="dialog"
                    aria-label={`Show all ${dayEvents.length} events on ${dayLabelFormatter.format(day)}`}
                    onClick={() => {
                      onSelectDate(day);
                      setOpenDay(day);
                    }}
                  >
                    <span>+{hiddenEventCount} more</span>
                    <small>Open day</small>
                    <ChevronRightIcon className="h-3 w-3" />
                  </button>
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
      {openDay && (
        <DayLens
          day={openDay}
          events={eventsByDay.get(toISODate(openDay)) ?? []}
          onClose={() => setOpenDay(null)}
          onOpenEvent={onOpenEvent}
        />
      )}
    </div>
  );
}
