"use client";

import { TechEvent, categoryById } from "@/data/events";
import { dayCount, formatTime, isMultiDay, parseDate, toISODate } from "@/lib/calendar";

type Props = {
  event: TechEvent;
  day: Date;
  active?: boolean;
  compact?: boolean;
  onClick: () => void;
};

export default function EventChip({ event, day, active, compact, onClick }: Props) {
  const category = categoryById.get(event.category)!;
  const index =
    Math.round(
      (parseDate(toISODate(day)).getTime() - parseDate(event.start).getTime()) /
        86_400_000,
    ) + 1;

  const meta = event.startTime
    ? `${formatTime(event.startTime)}${event.endTime ? ` – ${formatTime(event.endTime)}` : ""}`
    : isMultiDay(event)
      ? `Day ${index} of ${dayCount(event)}`
      : "All day";

  return (
    <button
      onClick={onClick}
      className={[
        "w-full overflow-hidden rounded-xl px-2.5 py-1.5 text-left ring-1 transition",
        category.chip,
        active ? "ring-2 ring-offset-1 ring-offset-white" : "hover:brightness-[0.97]",
        compact ? "text-[11px]" : "text-xs",
      ].join(" ")}
    >
      <span className="block truncate font-semibold leading-tight">
        {event.title}
      </span>
      <span className="mt-0.5 block truncate text-[10px] font-medium opacity-70">
        {meta}
      </span>
    </button>
  );
}
