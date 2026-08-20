"use client";

import { useState } from "react";
import Link from "next/link";
import MiniCalendar from "@/components/MiniCalendar";
import { ChevronRightIcon } from "@/components/icons";
import { CategoryId, TechEvent, categories } from "@/data/events";
import { submitEventUrl } from "@/data/directory";
import { MONTHS, isSameDay, occursOn, toISODate, weekDays } from "@/lib/calendar";

type Props = {
  cursor: Date;
  selected: Date;
  today: Date;
  allEvents: TechEvent[];
  visibleEvents: TechEvent[];
  active: Set<CategoryId>;
  onToggleCategory: (id: CategoryId) => void;
  onSelectDate: (date: Date) => void;
  onCursorChange: (date: Date) => void;
};

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function MobileHeader({
  cursor,
  selected,
  today,
  allEvents,
  visibleEvents,
  active,
  onToggleCategory,
  onSelectDate,
  onCursorChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const week = weekDays(selected);

  return (
    <div className="flex flex-col gap-3 bg-[#0d0d10] p-4 lg:hidden">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-violet-300/80">
            Kochi Tech Events
          </p>
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-white">
            kochi<span className="text-violet-400">.buzz</span>
          </h1>
        </div>
        <span
          title={`${allEvents.length} events tracked`}
          className="flex flex-col items-center justify-center rounded-full bg-violet-500/20 px-2.5 py-1 ring-1 ring-violet-400/30"
        >
          <span className="text-xs font-semibold leading-none text-violet-200">
            {allEvents.length}
          </span>
          <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.15em] text-violet-300/70">
            events
          </span>
        </span>
      </header>

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex items-center gap-1.5 text-sm font-semibold text-white"
      >
        {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        <ChevronRightIcon
          className={`h-3.5 w-3.5 text-white/50 transition ${expanded ? "-rotate-90" : "rotate-90"}`}
        />
      </button>

      {expanded ? (
        <MiniCalendar
          cursor={cursor}
          selected={selected}
          today={today}
          events={visibleEvents}
          onSelect={(date) => {
            onSelectDate(date);
            setExpanded(false);
          }}
          onCursorChange={onCursorChange}
        />
      ) : (
        <div className="grid grid-cols-7 rounded-2xl bg-white/[0.04] px-1 py-2 ring-1 ring-white/10">
          {week.map((day, i) => {
            const isSelected = isSameDay(day, selected);
            const isToday = isSameDay(day, today);
            const hasEvent = visibleEvents.some((e) => occursOn(e, day));
            return (
              <button
                key={toISODate(day)}
                onClick={() => onSelectDate(day)}
                className="relative flex flex-col items-center gap-1 py-1"
              >
                <span className="text-[10px] font-medium text-white/35">
                  {DAY_LETTERS[i]}
                </span>
                <span
                  className={[
                    "grid h-8 w-8 place-items-center rounded-full text-[13px] transition",
                    isSelected
                      ? "bg-violet-500 font-semibold text-white"
                      : "text-white/80",
                    !isSelected && isToday ? "ring-1 ring-violet-400/70" : "",
                  ].join(" ")}
                >
                  {day.getDate()}
                </span>
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-0 h-1 w-1 rounded-full bg-violet-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
        {categories.map((category) => {
          const isActive = active.has(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onToggleCategory(category.id)}
              aria-pressed={isActive}
              className={[
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                isActive
                  ? "bg-white/10 text-white ring-1 ring-white/25"
                  : "bg-transparent text-white/35 ring-1 ring-white/10",
              ].join(" ")}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
        <Link
          href="/digest"
          className="shrink-0 whitespace-nowrap rounded-full bg-violet-500/15 px-3 py-1.5 text-[11px] font-semibold text-violet-200 ring-1 ring-violet-400/25"
        >
          Next 30 days →
        </Link>
        <Link
          href="/communities"
          className="shrink-0 whitespace-nowrap rounded-full bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/60 ring-1 ring-white/10"
        >
          Communities
        </Link>
        <Link
          href="/spaces"
          className="shrink-0 whitespace-nowrap rounded-full bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/60 ring-1 ring-white/10"
        >
          Spaces
        </Link>
        <a
          href={submitEventUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 whitespace-nowrap rounded-full bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/60 ring-1 ring-white/10"
        >
          Submit an event
        </a>
      </div>
    </div>
  );
}
