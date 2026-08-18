"use client";

import { useEffect, useMemo, useState } from "react";
import DayView from "@/components/DayView";
import EventDetail from "@/components/EventDetail";
import MonthView from "@/components/MonthView";
import SearchBox from "@/components/SearchBox";
import Sidebar from "@/components/Sidebar";
import WeekView from "@/components/WeekView";
import { CategoryId, TechEvent, categories, events } from "@/data/events";
import {
  MONTHS,
  addDays,
  nextEvent,
  parseDate,
  startOfMonth,
  startOfWeek,
  todayInIST,
} from "@/lib/calendar";
import { useProfile } from "@/lib/useProfile";

type View = "month" | "week" | "day";

const ALL_CATEGORIES = new Set<CategoryId>(categories.map((c) => c.id));

export default function CalendarApp() {
  const [today] = useState<Date>(todayInIST);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [selected, setSelected] = useState<Date>(today);
  const [active, setActive] = useState<Set<CategoryId>>(ALL_CATEGORIES);
  const [openEventId, setOpenEventId] = useState<string | undefined>();
  const [hydrated, setHydrated] = useState(false);
  const { profile, setProfile, going, setGoing } = useProfile();

  // Honour a ?e= deep link on load (deferred so hydration matches the server).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("e");
    const event = id && events.find((e) => e.id === id);
    const timer = setTimeout(() => {
      setHydrated(true);
      if (event) jumpTo(event);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    if (openEventId) url.searchParams.set("e", openEventId);
    else url.searchParams.delete("e");
    window.history.replaceState(null, "", url);
  }, [openEventId, hydrated]);

  const visibleEvents = useMemo(
    () => events.filter((e) => active.has(e.category)),
    [active],
  );

  const openEvent = events.find((e) => e.id === openEventId);
  const upcoming = nextEvent(visibleEvents, today);

  const monthHasEvents = visibleEvents.some((e) => {
    const start = parseDate(e.start);
    const end = parseDate(e.end);
    const monthStart = startOfMonth(cursor);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });

  function toggleCategory(id: CategoryId) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectDate(date: Date) {
    setSelected(date);
    if (date.getMonth() !== cursor.getMonth() || date.getFullYear() !== cursor.getFullYear()) {
      setCursor(startOfMonth(date));
    }
  }

  function shift(direction: 1 | -1) {
    if (view === "month") {
      const next = new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1);
      setCursor(next);
      setSelected(next);
      return;
    }
    const step = view === "week" ? 7 : 1;
    const next = addDays(selected, step * direction);
    setSelected(next);
    setCursor(startOfMonth(next));
  }

  function goToToday() {
    setSelected(today);
    setCursor(startOfMonth(today));
  }

  function jumpTo(event: TechEvent) {
    const start = parseDate(event.start);
    setSelected(start);
    setCursor(startOfMonth(start));
    setOpenEventId(event.id);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "Escape") {
        setOpenEventId(undefined);
        if (typing) target.blur();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") shift(-1);
      else if (e.key === "ArrowRight") shift(1);
      else if (e.key === "t") goToToday();
      else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("event-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const heading =
    view === "week"
      ? `Week of ${startOfWeek(selected).getDate()} ${MONTHS[startOfWeek(selected).getMonth()]}`
      : `${MONTHS[cursor.getMonth()]}, ${cursor.getFullYear()}`;

  return (
    <div className="relative mx-auto flex w-full max-w-[1480px] flex-col overflow-hidden rounded-[36px] bg-black/90 p-2.5 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/10 lg:h-[min(900px,calc(100vh-4rem))] lg:flex-row">
      <div className="overflow-hidden rounded-[28px] lg:h-full">
        <div className="h-full overflow-y-auto">
          <Sidebar
            cursor={cursor}
            selected={selected}
            today={today}
            allEvents={events}
            visibleEvents={visibleEvents}
            active={active}
            upcoming={upcoming}
            onToggleCategory={toggleCategory}
            onSelectDate={selectDate}
            onCursorChange={setCursor}
            onOpenEvent={jumpTo}
          />
        </div>
      </div>

      <main className="mt-2.5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-white lg:mt-0 lg:ml-2.5">
        <header className="flex flex-wrap items-center gap-3 px-6 py-5">
          <h2 className="mr-auto text-2xl font-semibold tracking-tight text-slate-900">
            {heading}
          </h2>

          <SearchBox events={events} onPick={jumpTo} />

          <div className="flex rounded-full bg-slate-100 p-1">
            {(["month", "week", "day"] as View[]).map((option) => (
              <button
                key={option}
                onClick={() => setView(option)}
                className={[
                  "rounded-full px-5 py-2 text-sm font-medium capitalize transition",
                  view === option
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
            <button
              onClick={() => shift(-1)}
              aria-label="Previous"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              ‹
            </button>
            <button
              onClick={goToToday}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm"
            >
              Today
            </button>
            <button
              onClick={() => shift(1)}
              aria-label="Next"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              ›
            </button>
          </div>
        </header>

        {!monthHasEvents && view === "month" && upcoming && (
          <div className="mx-6 mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-100">
            <span>
              Nothing on the radar in {MONTHS[cursor.getMonth()]}. Next up:{" "}
              <strong className="font-semibold text-slate-800">
                {upcoming.title}
              </strong>
              .
            </span>
            <button
              onClick={() => jumpTo(upcoming)}
              className="ml-auto rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              Jump to {MONTHS[parseDate(upcoming.start).getMonth()]}
            </button>
          </div>
        )}

        {view === "month" && (
          <MonthView
            cursor={cursor}
            selected={selected}
            today={today}
            events={visibleEvents}
            selectedEventId={openEventId}
            onSelectDate={selectDate}
            onOpenEvent={(event) => setOpenEventId(event.id)}
          />
        )}
        {view === "week" && (
          <WeekView
            selected={selected}
            today={today}
            events={visibleEvents}
            selectedEventId={openEventId}
            onSelectDate={selectDate}
            onOpenEvent={(event) => setOpenEventId(event.id)}
          />
        )}
        {view === "day" && (
          <DayView
            selected={selected}
            events={visibleEvents}
            selectedEventId={openEventId}
            onOpenEvent={(event) => setOpenEventId(event.id)}
          />
        )}
      </main>

      {openEvent && (
        <div
          key={openEvent.id}
          className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 lg:absolute lg:inset-auto lg:bottom-auto lg:right-8 lg:top-24 lg:px-0"
        >
          <EventDetail
            event={openEvent}
            today={today}
            onClose={() => setOpenEventId(undefined)}
            profile={profile}
            going={going}
            onSaveProfile={setProfile}
            onSetGoing={setGoing}
          />
        </div>
      )}
    </div>
  );
}
