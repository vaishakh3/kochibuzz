"use client";

import EventChip from "@/components/EventChip";
import { TechEvent } from "@/data/events";
import {
  WEEKDAYS,
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-7 border-b border-slate-200 px-2 pb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {WEEKDAYS.map((day) => (
          <span key={day} className="px-2">
            {day}
          </span>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid h-full min-h-[480px] grid-cols-7 grid-rows-6 gap-px bg-slate-100">
        {cells.map((day) => {
          const inMonth = day.getMonth() === cursor.getMonth();
          const dayEvents = eventsOn(events, day);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selected);
          return (
            <div
              key={toISODate(day)}
              onClick={() => onSelectDate(day)}
              className={[
                "flex min-h-[80px] cursor-pointer flex-col gap-1 overflow-hidden p-2 transition",
                inMonth ? "bg-white" : "bg-slate-50/70",
                isSelected ? "ring-2 ring-inset ring-slate-900/80" : "hover:bg-slate-50",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  isToday
                    ? "bg-slate-900 text-white"
                    : inMonth
                      ? "text-slate-700"
                      : "text-slate-300",
                ].join(" ")}
              >
                {day.getDate()}
              </span>

              <div className="flex flex-col gap-1">
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
                  <span className="px-1 text-[10px] font-medium text-slate-400">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
