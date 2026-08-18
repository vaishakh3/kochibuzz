"use client";

import { TechEvent, categoryById } from "@/data/events";
import {
  dayCount,
  formatDateRange,
  formatTimeRange,
  isMultiDay,
} from "@/lib/calendar";

type Props = {
  event: TechEvent;
  onClose: () => void;
};

function Row({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm">
        {icon}
      </span>
      <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
        {children}
      </div>
    </div>
  );
}

export default function EventDetail({ event, onClose }: Props) {
  const category = categoryById.get(event.category)!;

  return (
    <div className="pointer-events-auto w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-slate-900">
          {event.title}
        </h3>
        <button
          onClick={onClose}
          aria-label="Close event details"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2.5 px-5 pt-4">
        <Row icon="📅">
          {formatDateRange(event)}
          {isMultiDay(event) && (
            <span className="text-slate-400"> · {dayCount(event)} days</span>
          )}
        </Row>
        <Row icon="🕒">{formatTimeRange(event)}</Row>
        <Row icon="📍">
          {event.venue}
          <span className="block text-slate-400">{event.city}</span>
        </Row>
        <Row icon="👥">{event.organizer}</Row>
      </div>

      <div className="flex flex-wrap gap-2 px-5 pt-4">
        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 ${category.chip}`}
        >
          {category.label}
        </span>
        {event.travel && (
          <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white">
            Outside Kochi
          </span>
        )}
        {event.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="px-5 pt-4 text-[13px] leading-relaxed text-slate-600">
        {event.blurb}
      </p>

      {event.note && (
        <p className="mx-5 mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800 ring-1 ring-amber-100">
          {event.note}
        </p>
      )}

      <div className="mt-5 flex items-stretch gap-px bg-slate-100 p-1">
        <a
          href={event.url}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-[20px] bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Event page
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${event.venue} ${event.city}`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="grid w-14 place-items-center rounded-[20px] bg-white text-slate-500 ring-1 ring-slate-200 transition hover:text-slate-900"
          aria-label="Open venue in maps"
        >
          ↗
        </a>
      </div>
    </div>
  );
}
