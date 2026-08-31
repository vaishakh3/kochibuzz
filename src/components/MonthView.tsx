"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState, type KeyboardEvent } from "react";
import EventChip from "@/components/EventChip";
import { ChevronRightIcon, CloseIcon } from "@/components/icons";
import { TechEvent, categoryById } from "@/data/events";
import {
  MONTHS,
  WEEKDAYS,
  WEEKDAYS_LONG,
  addDays,
  calendarDayPresentation,
  eventPlace,
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
  headlineByDate: Record<string, string>;
};

/** Stable across Node, Chromium, and Safari; Intl punctuation varies by engine. */
function dayLabel(date: Date): string {
  return `${WEEKDAYS_LONG[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function monthLabel(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function MobileDayAgenda({
  day,
  events,
  onOpenEvent,
}: {
  day: Date;
  events: TechEvent[];
  onOpenEvent: (event: TechEvent) => void;
}) {
  return (
    <section className="calendar-month-selection" aria-label={`Events on ${dayLabel(day)}`}>
      <header>
        <div>
          <p>Selected date</p>
          <h2 className="font-display" aria-live="polite">{dayLabel(day)}</h2>
        </div>
        <span>{events.length} {events.length === 1 ? "event" : "events"}</span>
      </header>

      {events.length > 0 ? (
        <ol>
          {events.map((event) => {
            const category = categoryById.get(event.category)!;
            return (
              <li key={event.id}>
                <button type="button" onClick={() => onOpenEvent(event)}>
                  <i className={category.dot} aria-hidden />
                  <span>
                    <small>{formatTimeRange(event)} · {category.label}</small>
                    <strong>{event.title}</strong>
                    <em>{eventPlace(event)}</em>
                  </span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="calendar-month-selection__empty">Nothing scheduled on this date.</p>
      )}
    </section>
  );
}

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
              {dayLabel(day)}
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
  headlineByDate,
}: Props) {
  const cells = useMemo(() => monthGrid(cursor), [cursor]);
  const weeks = useMemo(
    () => Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7)),
    [cells],
  );
  const presentationByDay = useMemo(
    () => new Map(cells.map((day) => {
      const iso = toISODate(day);
      return [iso, calendarDayPresentation(events, day, headlineByDate[iso])] as const;
    })),
    [cells, events, headlineByDate],
  );
  const selectedDayEvents = useMemo(() => {
    const iso = toISODate(selected);
    return calendarDayPresentation(events, selected, headlineByDate[iso]).events;
  }, [events, headlineByDate, selected]);
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
    if (dayEvents.length > 0 && !window.matchMedia("(max-width: 767px)").matches) setOpenDay(day);
  }

  return (
    <div className="calendar-month-view">
      <div className="calendar-month-grid-shell" role="grid" aria-label={`${monthLabel(cursor)} events calendar`} aria-rowcount={6} aria-colcount={7}>
        <div className="calendar-month-weekdays" role="row">
          {WEEKDAYS.map((day) => (
            <span key={day} role="columnheader">{day}</span>
          ))}
        </div>

        <div className="calendar-month-scroll">
          <div className="calendar-month-grid" role="rowgroup">
          {weeks.map((week) => <div className="calendar-month-week" role="row" key={toISODate(week[0])}>{week.map((day) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            const presentation = presentationByDay.get(toISODate(day)) ?? { events: [] };
            const dayEvents = presentation.events;
            const visibleDayEvents = presentation.headline ? [presentation.headline] : [];
            const hiddenEventCount = dayEvents.length - visibleDayEvents.length;
            const eventNoun = dayEvents.length === 1 ? "event" : "events";
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
                  aria-label={`${dayLabel(day)}, ${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`}
                >
                  <span>{day.getDate()}</span>
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
                      aria-label={`Show all ${dayEvents.length} ${presentation.headline ? eventNoun : `ongoing ${eventNoun}`} on ${dayLabel(day)}`}
                      onClick={() => {
                        onSelectDate(day);
                        setOpenDay(day);
                      }}
                    >
                      <span>+{hiddenEventCount} {presentation.headline ? "more" : "ongoing"}</span>
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
      </div>

      <MobileDayAgenda day={selected} events={selectedDayEvents} onOpenEvent={onOpenEvent} />
      {openDay && (
        <DayLens
          day={openDay}
          events={presentationByDay.get(toISODate(openDay))?.events ?? []}
          onClose={() => setOpenDay(null)}
          onOpenEvent={onOpenEvent}
        />
      )}
    </div>
  );
}
