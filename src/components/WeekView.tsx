"use client";

import EventChip from "@/components/EventChip";
import { TechEvent, categoryById } from "@/data/events";
import {
  WEEKDAYS,
  eventsOn,
  formatTime,
  formatTimeRange,
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
        className="grid border-b border-slate-200 px-2 pb-3"
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
                "mx-1 rounded-2xl px-2 py-2 text-center transition",
                isSelected
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/70",
              ].join(" ")}
            >
              <span className="block text-[11px] font-medium opacity-70">
                {WEEKDAYS[day.getDay()]}
                {isSameDay(day, today) ? " · today" : ""}
              </span>
              <span className="block text-lg font-semibold leading-tight">
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="grid border-b border-slate-200 bg-slate-50/60 px-2 py-2"
        style={{ gridTemplateColumns: `64px repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        <span className="pl-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
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
                  active={event.id === selectedEventId}
                  onClick={() => onOpenEvent(event)}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
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
                className="absolute right-3 -translate-y-1/2 text-[11px] font-medium text-slate-400"
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
                className="relative border-l border-slate-100"
                onClick={() => onSelectDate(day)}
              >
                {hours.map((hour, i) => (
                  <span
                    key={hour}
                    className="absolute left-0 right-0 border-t border-slate-100"
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
                        "absolute left-1 right-1 overflow-hidden rounded-2xl px-2.5 py-2 text-left ring-1 transition",
                        category.chip,
                        event.id === selectedEventId
                          ? "ring-2 ring-slate-900/50"
                          : "hover:brightness-[0.97]",
                      ].join(" ")}
                    >
                      <span className="block truncate text-xs font-semibold leading-tight">
                        {event.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] font-medium opacity-70">
                        {formatTimeRange(event)}
                      </span>
                      <span className="mt-1 block truncate text-[10px] opacity-60">
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
