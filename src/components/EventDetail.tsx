"use client";

import { useState } from "react";
import {
  CalendarIcon,
  CalendarPlusIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  DownloadIcon,
  MapPinIcon,
  NavigationIcon,
  ShareIcon,
  UsersIcon,
} from "@/components/icons";
import { TechEvent, categoryById } from "@/data/events";
import {
  countdownLabel,
  dayCount,
  formatDateRange,
  formatTimeRange,
  googleCalendarUrl,
  icsFor,
  isMultiDay,
} from "@/lib/calendar";
import SaveToBuzzButton from "@/components/SaveToBuzzButton";

type Props = {
  event: TechEvent;
  today: Date;
  onClose: () => void;
};

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-100">
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-[13px] leading-snug text-slate-700">
        {children}
      </div>
    </div>
  );
}

export default function EventDetail({ event, today, onClose }: Props) {
  const category = categoryById.get(event.category)!;
  const [copied, setCopied] = useState(false);
  const countdown = countdownLabel(event, today);

  async function share() {
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div role="region" aria-label={`${event.title} details`} className="animate-sheet-up pointer-events-auto max-h-[80dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-[0_-20px_60px_-20px_rgba(15,23,42,0.5)] ring-1 ring-slate-200 lg:animate-card-pop lg:max-h-[calc(100vh-8rem)] lg:w-[360px] lg:max-w-[calc(100vw-2rem)] lg:rounded-2xl lg:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)]">
      <div
        aria-hidden
        className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200 lg:hidden"
      />
      <div className="flex items-start justify-between gap-3 px-5 pt-4 lg:pt-5">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-slate-900">
          {event.title}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={share}
            aria-label="Share event link"
            title={copied ? "Link copied" : "Share event link"}
            className={[
              "grid h-8 w-8 place-items-center rounded-full transition",
              copied
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700",
            ].join(" ")}
          >
            {copied ? <CheckIcon /> : <ShareIcon />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close event details"
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="mx-5 mt-3 divide-y divide-slate-100 rounded-xl bg-white px-3 ring-1 ring-slate-100">
        <Row icon={<CalendarIcon />}>
          {formatDateRange(event)}
          {isMultiDay(event) && (
            <span className="text-slate-600"> · {dayCount(event)} days</span>
          )}
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              countdown === "ended"
                ? "bg-slate-200 text-slate-500"
                : countdown === "today" || countdown.startsWith("day ")
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-lime-100 text-lime-800"
            }`}
          >
            {countdown}
          </span>
        </Row>
        <Row icon={<ClockIcon />}>{formatTimeRange(event)}</Row>
        <Row icon={<MapPinIcon />}>
          {event.venue}
          <span className="block text-slate-600">{event.city}</span>
        </Row>
        <Row icon={<UsersIcon />}>{event.organizer}</Row>
      </div>

      {/* Primary action lives right after the essentials */}
      <div className="grid gap-2 px-5 pt-4 sm:grid-cols-[1fr_auto]">
        <a
          href={event.registerUrl ?? event.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {event.registerUrl ? "Register" : "Event page"}
        </a>
        <SaveToBuzzButton
          tone="light"
          className="rounded-xl px-3 text-xs"
          item={{
            id: `event:${event.id}`,
            kind: "event",
            eyebrow: `${countdown} · ${category.label}`,
            title: event.title,
            detail: event.blurb,
            meta: `${formatDateRange(event)} · ${formatTimeRange(event)} · ${event.venue}`,
            href: `/events/${event.id}`,
            calendarHref: `/e/${event.id}/event.ics`,
            trackLabel: "Go outside",
          }}
        />
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
        <p className="mx-5 mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800 ring-1 ring-amber-100">
          {event.note}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 px-5 pb-5 pt-4">
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
          title="Add to Google Calendar"
        >
          <CalendarPlusIcon className="h-3.5 w-3.5" />
          Google
        </a>
        <a
          href={`data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(event))}`}
          download={`${event.id}.ics`}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
          title="Download .ics (Apple / Outlook)"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          .ics
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${event.venue} ${event.city}`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
          title="Open venue in Google Maps"
        >
          <NavigationIcon className="h-3.5 w-3.5" />
          Map
        </a>
      </div>
    </div>
  );
}
