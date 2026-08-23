"use client";

import { TechEvent, categoryById } from "@/data/events";
import { dayCount, formatTime, isMultiDay, parseDate, toISODate } from "@/lib/calendar";

type Props = {
  event: TechEvent;
  day: Date;
  active?: boolean;
  compact?: boolean;
  past?: boolean;
  onClick: () => void;
};

export default function EventChip({
  event,
  day,
  active,
  compact,
  past,
  onClick,
}: Props) {
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
      type="button"
      onClick={onClick}
      className={[
        "calendar-event-chip",
        category.chip,
        active ? "is-active" : "",
        compact ? "is-compact" : "",
        past ? "is-past" : "",
      ].join(" ")}
    >
      <span className="calendar-event-chip__title">
        {event.title}
      </span>
      <span className="calendar-event-chip__meta">
        {meta}
      </span>
    </button>
  );
}
