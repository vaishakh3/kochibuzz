"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  CalendarIcon,
  CalendarPlusIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
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
  isMultiDay,
} from "@/lib/calendar";
import SaveToBuzzButton from "@/components/SaveToBuzzButton";
import AttendancePanel from "@/components/AttendancePanel";

type Props = {
  event: TechEvent;
  today: Date;
  onClose: () => void;
};

function Fact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="event-detail-fact">
      <span aria-hidden>
        {icon}
      </span>
      <div>
        <small>{label}</small>
        <strong>{children}</strong>
      </div>
    </div>
  );
}

export default function EventDetail({ event, today, onClose }: Props) {
  const category = categoryById.get(event.category)!;
  const [copied, setCopied] = useState(false);
  const [attendanceEditing, setAttendanceEditing] = useState(false);
  const countdown = countdownLabel(event, today);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeDialog = useEffectEvent(() => onClose());

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
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
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnTo?.focus();
    };
  }, []);

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
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label={`${event.title} details`} className="event-detail-panel animate-sheet-up pointer-events-auto w-full overflow-y-auto rounded-t-2xl bg-white shadow-[0_-20px_60px_-20px_rgba(15,23,42,0.5)] ring-1 ring-slate-200 lg:animate-card-pop lg:w-[360px] lg:max-w-[calc(100vw-2rem)] lg:rounded-2xl lg:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)]">
      <div
        aria-hidden
        className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200 lg:hidden"
      />
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5 lg:pt-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">
            {category.label}{event.travel ? " · Outside Kochi" : ""} · {countdown}
          </p>
          <h3 className="mt-1 text-[17px] font-semibold leading-tight tracking-tight text-slate-950">
            {event.title}
          </h3>
        </div>
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
            ref={closeRef}
            onClick={onClose}
            aria-label="Close event details"
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="event-detail-facts">
        <Fact icon={<CalendarIcon />} label="Date">
          {formatDateRange(event)}
          {isMultiDay(event) && (
            <span> · {dayCount(event)} days</span>
          )}
        </Fact>
        <Fact icon={<ClockIcon />} label="Time">{formatTimeRange(event)}</Fact>
        <Fact icon={<MapPinIcon />} label="Venue">
          {event.venue}, {event.city}
        </Fact>
        <Fact icon={<UsersIcon />} label="Host">{event.organizer}</Fact>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 px-4 pt-3">
        <a
          href={event.registerUrl ?? event.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-lg bg-slate-950 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          {event.registerUrl ? "Register" : "Event page"}
        </a>
        <SaveToBuzzButton
          tone="light"
          compact
          className="min-h-9 rounded-lg px-3 text-xs"
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

      {!attendanceEditing && (
        <p className="event-detail-summary">{event.blurb}</p>
      )}

      <AttendancePanel eventId={event.id} onEditingChange={setAttendanceEditing} />

      {!attendanceEditing && <div className="grid grid-cols-2 gap-2 px-4 pb-4 pt-3">
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-950"
          title="Add to Google Calendar"
        >
          <CalendarPlusIcon className="h-3.5 w-3.5" />
          Google Calendar
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${event.venue} ${event.city}`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-2 py-2 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-950"
          title="Open venue in Google Maps"
        >
          <NavigationIcon className="h-3.5 w-3.5" />
          Map
        </a>
      </div>}
    </div>
  );
}
