"use client";

import { useState } from "react";
import Attendees from "@/components/Attendees";
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
import { Profile } from "@/lib/useProfile";

type Props = {
  event: TechEvent;
  today: Date;
  onClose: () => void;
  profile: Profile | null;
  going: string[];
  onSaveProfile: (name: string, emoji: string) => void;
  onSetGoing: (eventId: string, isGoing: boolean) => void;
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
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-100">
        {icon}
      </span>
      <div className="min-w-0 flex-1 text-[13px] leading-snug text-slate-700">
        {children}
      </div>
    </div>
  );
}

export default function EventDetail({
  event,
  today,
  onClose,
  profile,
  going,
  onSaveProfile,
  onSetGoing,
}: Props) {
  const category = categoryById.get(event.category)!;
  const [copied, setCopied] = useState(false);
  const countdown = countdownLabel(event, today);

  async function share() {
    const url = `${window.location.origin}/?e=${event.id}`;
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
    <div className="animate-card-pop pointer-events-auto max-h-[calc(100vh-8rem)] w-[360px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[28px] bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
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

      <div className="mx-5 mt-4 divide-y divide-slate-100 rounded-2xl bg-white px-3 ring-1 ring-slate-100">
        <Row icon={<CalendarIcon />}>
          {formatDateRange(event)}
          {isMultiDay(event) && (
            <span className="text-slate-400"> · {dayCount(event)} days</span>
          )}
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              countdown === "ended"
                ? "bg-slate-200 text-slate-500"
                : countdown === "today" || countdown.startsWith("day ")
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-violet-100 text-violet-700"
            }`}
          >
            {countdown}
          </span>
        </Row>
        <Row icon={<ClockIcon />}>{formatTimeRange(event)}</Row>
        <Row icon={<MapPinIcon />}>
          {event.venue}
          <span className="block text-slate-400">{event.city}</span>
        </Row>
        <Row icon={<UsersIcon />}>{event.organizer}</Row>
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

      <Attendees
        eventId={event.id}
        profile={profile}
        going={going}
        onSaveProfile={onSaveProfile}
        onSetGoing={onSetGoing}
      />

      <div className="space-y-2 px-5 pb-5 pt-5">
        <a
          href={event.registerUrl ?? event.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {event.registerUrl ? "Register" : "Event page"}
        </a>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-50 px-2 py-2.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
            title="Add to Google Calendar"
          >
            <CalendarPlusIcon className="h-3.5 w-3.5" />
            Google
          </a>
          <a
            href={`data:text/calendar;charset=utf-8,${encodeURIComponent(icsFor(event))}`}
            download={`${event.id}.ics`}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-50 px-2 py-2.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
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
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-50 px-2 py-2.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
            title="Open venue in Google Maps"
          >
            <NavigationIcon className="h-3.5 w-3.5" />
            Map
          </a>
        </div>
      </div>
    </div>
  );
}
