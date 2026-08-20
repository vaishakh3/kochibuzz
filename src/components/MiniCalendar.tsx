"use client";

import {
  MONTHS,
  compactMonthGrid,
  isSameDay,
  occursOn,
  toISODate,
} from "@/lib/calendar";
import { TechEvent } from "@/data/events";

type Props = {
  cursor: Date;
  selected: Date;
  today: Date;
  events: TechEvent[];
  onSelect: (date: Date) => void;
  onCursorChange: (date: Date) => void;
};

const MINI_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniCalendar({
  cursor,
  selected,
  today,
  events,
  onSelect,
  onCursorChange,
}: Props) {
  const cells = compactMonthGrid(cursor);

  return (
    <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/10">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <div className="flex gap-1">
          <button
            aria-label="Previous month"
            onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            ‹
          </button>
          <button
            aria-label="Next month"
            onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-white/40">
        {MINI_WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-[13px]">
        {cells.map((day) => {
          const inMonth = day.getMonth() === cursor.getMonth();
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const hasEvent = events.some((e) => occursOn(e, day));
          return (
            <button
              key={toISODate(day)}
              onClick={() => onSelect(day)}
              className="relative flex h-8 items-center justify-center"
            >
              <span
                className={[
                  "grid h-7 w-7 place-items-center rounded-full transition",
                  isSelected
                    ? "bg-[var(--signal)] font-semibold text-[var(--signal-ink)]"
                    : inMonth
                      ? "text-white/80 hover:bg-white/10"
                      : "text-white/25 hover:bg-white/5",
                  !isSelected && isToday ? "ring-1 ring-[var(--signal-dim)]" : "",
                ].join(" ")}
              >
                {day.getDate()}
              </span>
              {hasEvent && !isSelected && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[var(--signal)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
