"use client";

import Link from "next/link";

import MiniCalendar from "@/components/MiniCalendar";
import {
  Category,
  CategoryId,
  TechEvent,
  categories,
  communities,
} from "@/data/events";
import { submitEventUrl } from "@/data/directory";
import {
  countdownLabel,
  daysUntil,
  formatDateRange,
  upcomingEvents,
} from "@/lib/calendar";

type Props = {
  cursor: Date;
  selected: Date;
  today: Date;
  allEvents: TechEvent[];
  visibleEvents: TechEvent[];
  active: Set<CategoryId>;
  upcoming?: TechEvent;
  onToggleCategory: (id: CategoryId) => void;
  onSelectDate: (date: Date) => void;
  onCursorChange: (date: Date) => void;
  onOpenEvent: (event: TechEvent) => void;
};

export default function Sidebar({
  cursor,
  selected,
  today,
  allEvents,
  visibleEvents,
  active,
  upcoming,
  onToggleCategory,
  onSelectDate,
  onCursorChange,
  onOpenEvent,
}: Props) {
  const countFor = (category: Category) =>
    allEvents.filter((e) => e.category === category.id).length;
  const comingUp = upcomingEvents(visibleEvents, today, 4).filter(
    (e) => e.id !== upcoming?.id,
  );

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 bg-[#0d0d10] p-5 lg:w-[320px]">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300/70">
            Kochi Tech Events
          </p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-white">
            kochi<span className="text-violet-400">.buzz</span>
          </h1>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-200 ring-1 ring-violet-400/30">
          {allEvents.length}
        </span>
      </header>

      <MiniCalendar
        cursor={cursor}
        selected={selected}
        today={today}
        events={visibleEvents}
        onSelect={onSelectDate}
        onCursorChange={onCursorChange}
      />

      {upcoming && (
        <button
          onClick={() => onOpenEvent(upcoming)}
          className="group rounded-3xl bg-gradient-to-br from-violet-600/30 via-violet-500/10 to-transparent p-4 text-left ring-1 ring-violet-400/25 transition hover:ring-violet-300/50"
        >
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span>{formatDateRange(upcoming)}</span>
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-violet-200">
              {daysUntil(upcoming, today) <= 0
                ? "happening now"
                : countdownLabel(upcoming, today)}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-white">
            {upcoming.title}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {upcoming.venue}, {upcoming.city}
          </p>
          <p className="mt-3 text-xs font-medium text-violet-200 group-hover:text-white">
            Details →
          </p>
        </button>
      )}

      {comingUp.length > 0 && (
        <section className="rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <h2 className="mb-3 text-sm font-semibold text-white">Coming up</h2>
          <ul className="space-y-1">
            {comingUp.map((event) => (
              <li key={event.id}>
                <button
                  onClick={() => onOpenEvent(event)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-white/75">
                      {event.title}
                    </span>
                    <span className="block text-[11px] text-white/35">
                      {formatDateRange(event)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                    {countdownLabel(event, today)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-semibold text-white">Categories</h2>
        <ul className="space-y-2.5">
          {categories.map((category) => {
            const isActive = active.has(category.id);
            const total = countFor(category);
            return (
              <li key={category.id}>
                <button
                  onClick={() => onToggleCategory(category.id)}
                  aria-pressed={isActive}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={[
                      "grid h-4 w-4 shrink-0 place-items-center rounded-[5px] ring-1 transition",
                      isActive
                        ? `${category.bar} ring-transparent`
                        : "bg-transparent ring-white/25",
                    ].join(" ")}
                  >
                    {isActive && (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-black/70">
                        <path
                          d="M2.5 6.2l2.2 2.2 4.8-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={[
                      "flex-1 text-[13px] transition",
                      isActive ? "text-white/85" : "text-white/40",
                    ].join(" ")}
                  >
                    {category.label}
                  </span>
                  <span className="text-[11px] text-white/35">{total}</span>
                </button>
                <span className="mt-1.5 block h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                  <span
                    className={`block h-full rounded-full ${category.bar} transition-all`}
                    style={{
                      width: isActive
                        ? `${Math.max(12, (total / allEvents.length) * 100)}%`
                        : "0%",
                    }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10">
        <h2 className="mb-3 text-sm font-semibold text-white">
          Communities to follow
        </h2>
        <ul className="space-y-2">
          {communities.map((community) => (
            <li key={community.name}>
              <a
                href={community.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl px-2 py-1.5 text-[13px] text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <span>{community.name}</span>
                <span className="text-[11px] text-white/35">
                  {community.cadence}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/communities"
          className="mt-2 block rounded-xl px-2 py-1.5 text-[13px] font-medium text-violet-300 transition hover:bg-white/5 hover:text-white"
        >
          All communities →
        </Link>
      </section>

      <section className="rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10">
        <h2 className="mb-2 text-sm font-semibold text-white">Explore</h2>
        <div className="space-y-1">
          <Link
            href="/spaces"
            className="flex items-center justify-between rounded-xl px-2 py-1.5 text-[13px] text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <span>Places to build</span>
            <span className="text-[11px] text-white/35">labs · coworking</span>
          </Link>
          <a
            href={submitEventUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl px-2 py-1.5 text-[13px] text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <span>Submit an event</span>
            <span className="text-[11px] text-white/35">GitHub →</span>
          </a>
        </div>
      </section>

      <p className="mt-auto text-[11px] leading-relaxed text-white/30">
        Dates taken from organiser sites and community announcements. Confirm on
        the event page before you travel.
      </p>
    </aside>
  );
}
