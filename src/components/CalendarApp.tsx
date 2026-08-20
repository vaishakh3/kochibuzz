"use client";

import { useEffect, useMemo, useState } from "react";
import AgendaView from "@/components/AgendaView";
import DayView from "@/components/DayView";
import EventDetail from "@/components/EventDetail";
import MobileHeader from "@/components/MobileHeader";
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
  toISODate,
  todayInIST,
} from "@/lib/calendar";

type View = "month" | "week" | "day" | "agenda";

const ALL_CATEGORIES = new Set<CategoryId>(categories.map((c) => c.id));

export default function CalendarApp() {
  const [today] = useState<Date>(todayInIST);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [selected, setSelected] = useState<Date>(today);
  const [active, setActive] = useState<Set<CategoryId>>(ALL_CATEGORIES);
  const [openEventId, setOpenEventId] = useState<string | undefined>();
  const [hydrated, setHydrated] = useState(false);

  // Honour a ?e= deep link on load (deferred so hydration matches the server).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("e");
    const event = id && events.find((e) => e.id === id);
    const requested = params
      .getAll("category")
      .flatMap((value) => value.split(","))
      .filter((value): value is CategoryId => ALL_CATEGORIES.has(value as CategoryId));
    const compact = window.matchMedia("(max-width: 1023px)").matches;
    const timer = setTimeout(() => {
      setHydrated(true);
      if (compact) setView("agenda");
      if (requested.length > 0) setActive(new Set(requested));
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
    if (view === "agenda") scrollAgendaTo(date);
  }

  function scrollAgendaTo(date: Date) {
    const iso = toISODate(date);
    requestAnimationFrame(() => {
      const rows = document.querySelectorAll<HTMLElement>("[data-event-start]");
      for (const row of rows) {
        if ((row.dataset.eventStart ?? "") >= iso) {
          row.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
    });
  }

  function shift(direction: 1 | -1) {
    if (view === "agenda") return;
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
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const heading =
    view === "agenda"
      ? "All events"
      : view === "week"
        ? `Week of ${startOfWeek(selected).getDate()} ${MONTHS[startOfWeek(selected).getMonth()]}`
        : `${MONTHS[cursor.getMonth()]}, ${cursor.getFullYear()}`;

  return (
    <div className="relative mx-auto flex w-full max-w-[1480px] h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-xl ring-1 ring-white/10 lg:h-[min(900px,calc(100vh-7rem))] lg:flex-row lg:gap-2">
      <MobileHeader
        cursor={cursor}
        selected={selected}
        today={today}
        allEvents={events}
        visibleEvents={visibleEvents}
        active={active}
        onToggleCategory={toggleCategory}
        onSelectDate={selectDate}
        onCursorChange={setCursor}
      />
      <div className="hidden overflow-hidden rounded-l-xl lg:block lg:h-full">
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

      <main className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-[#faf8f2] lg:mt-0 lg:rounded-l-none">
        <header className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="mr-auto text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {heading}
          </h2>

          <SearchBox events={events} onPick={jumpTo} />

          <div className="hidden rounded-full bg-slate-100 p-1 md:flex">
            {(["month", "week", "day", "agenda"] as View[]).map((option) => (
              <button
                key={option}
                onClick={() => setView(option)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium capitalize transition",
                  view === option
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 md:flex">
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

        {view === "agenda" && (
          <AgendaView
            today={today}
            events={visibleEvents}
            selectedEventId={openEventId}
            onOpenEvent={(event) => setOpenEventId(event.id)}
          />
        )}

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
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center lg:absolute lg:inset-auto lg:bottom-auto lg:right-8 lg:top-24"
        >
          <EventDetail
            event={openEvent}
            today={today}
            onClose={() => setOpenEventId(undefined)}
          />
        </div>
      )}
    </div>
  );
}
