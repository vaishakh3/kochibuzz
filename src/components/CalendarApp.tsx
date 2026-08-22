"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore } from "react";
import AgendaView from "@/components/AgendaView";
import DayView from "@/components/DayView";
import EventDetail from "@/components/EventDetail";
import { ArrowUpRightIcon, CalendarPlusIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import MiniCalendar from "@/components/MiniCalendar";
import MonthView from "@/components/MonthView";
import SearchBox from "@/components/SearchBox";
import WeekView from "@/components/WeekView";
import { CategoryId, TechEvent, categories, categoryById, events } from "@/data/events";
import { communityDirectory, submitEventUrl } from "@/data/directory";
import {
  MONTHS,
  WEEKDAYS,
  WEEKDAYS_LONG,
  addDays,
  countdownLabel,
  eventsOn,
  nextEvent,
  parseDate,
  startOfMonth,
  startOfWeek,
  toISODate,
  todayInIST,
} from "@/lib/calendar";
import {
  getMyBuzzSnapshot,
  getServerMyBuzzSnapshot,
  parseMyBuzz,
  subscribeMyBuzz,
  writeMyBuzz,
} from "@/lib/myBuzz";

type View = "month" | "week" | "day" | "agenda";
type CityCounts = { jobs: number; opportunities: number; communities: number };

const ALL_CATEGORIES = new Set<CategoryId>(categories.map((category) => category.id));
const VIEW_KEY = "kochibuzz:calendar-view:v1";

function MyBuzzDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const snapshot = useSyncExternalStore(subscribeMyBuzz, getMyBuzzSnapshot, getServerMyBuzzSnapshot);
  const saved = parseMyBuzz(snapshot);
  const [message, setMessage] = useState("Saved only on this device.");
  const closeDrawer = useEffectEvent(() => onClose());

  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
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
      document.body.style.overflow = previousOverflow;
      returnTo?.focus();
    };
  }, [open]);

  if (!open) return null;

  function savedText() {
    const lines = saved.map((item, index) =>
      `${index + 1}. ${item.title}\n${item.meta}\n${new URL(item.href, window.location.origin)}`,
    );
    return `MY KOCHI BUZZ\n\n${lines.join("\n\n")}\n\nkochi.buzz`;
  }

  async function copyList() {
    try {
      await navigator.clipboard.writeText(savedText());
      setMessage("My Buzz copied.");
    } catch {
      setMessage("Could not copy this list.");
    }
  }

  return (
    <div className="calendar-saved-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className="calendar-saved-panel" role="dialog" aria-modal="true" aria-labelledby="calendar-saved-title">
        <header>
          <div>
            <p>Private · device local</p>
            <h2 id="calendar-saved-title" className="font-display">My Buzz</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close My Buzz"><CloseIcon /></button>
        </header>
        {saved.length === 0 ? (
          <div className="calendar-saved-empty">
            <strong className="font-display">Your pocket is empty.</strong>
            <p>Open an event and save it here to build a small city plan.</p>
          </div>
        ) : (
          <ol className="calendar-saved-list">
            {saved.map((item, index) => (
              <li key={item.id}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <span>{String(index + 1).padStart(2, "0")}</span><span><strong>{item.title}</strong><small>{item.meta}</small></span><ArrowUpRightIcon className="ui-arrow-up-right" />
                  </a>
                ) : (
                  <Link href={item.href} onClick={onClose}>
                    <span>{String(index + 1).padStart(2, "0")}</span><span><strong>{item.title}</strong><small>{item.meta}</small></span><ChevronRightIcon className="h-4 w-4" />
                  </Link>
                )}
                <button type="button" onClick={() => writeMyBuzz(saved.filter((candidate) => candidate.id !== item.id))} aria-label={`Remove ${item.title}`}>Remove</button>
              </li>
            ))}
          </ol>
        )}
        <footer>
          <span aria-live="polite">{message}</span>
          {saved.length > 0 && <div><button type="button" onClick={copyList}>Copy list</button><button type="button" onClick={() => writeMyBuzz([])}>Clear</button></div>}
        </footer>
      </div>
    </div>
  );
}

export default function CalendarApp({ cityCounts = { jobs: 0, opportunities: 0, communities: communityDirectory.length } }: { cityCounts?: CityCounts }) {
  const [today] = useState<Date>(todayInIST);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [selected, setSelected] = useState<Date>(today);
  const [active, setActive] = useState<Set<CategoryId>>(ALL_CATEGORIES);
  const [openEventId, setOpenEventId] = useState<string>();
  const [savedOpen, setSavedOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  function chooseView(nextView: View) {
    setView(nextView);
    try { window.localStorage.setItem(VIEW_KEY, nextView); } catch { /* keep this session only */ }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("e");
    const event = id && events.find((candidate) => candidate.id === id);
    const requested = params.getAll("category").flatMap((value) => value.split(",")).filter((value): value is CategoryId => ALL_CATEGORIES.has(value as CategoryId));
    const compact = window.matchMedia("(max-width: 767px)").matches;
    let remembered: View | null = null;
    try {
      const candidate = window.localStorage.getItem(VIEW_KEY);
      if (["month", "week", "day", "agenda"].includes(candidate ?? "")) remembered = candidate as View;
    } catch { /* use the responsive default */ }
    const timer = window.setTimeout(() => {
      setHydrated(true);
      setView(remembered ?? (compact ? "agenda" : "month"));
      if (requested.length > 0) setActive(new Set(requested));
      if (event) jumpTo(event);
      if (params.get("mybuzz") === "1") {
        setSavedOpen(true);
        params.delete("mybuzz");
        const clean = `${window.location.pathname}${params.size ? `?${params}` : ""}${window.location.hash}`;
        window.history.replaceState(window.history.state, "", clean);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function openSaved() { setSavedOpen(true); }
    window.addEventListener("kochibuzz:open-saved", openSaved);
    return () => window.removeEventListener("kochibuzz:open-saved", openSaved);
  }, []);

  useEffect(() => {
    if (!hydrated || !tickerRef.current || tickerRef.current.scrollWidth <= tickerRef.current.clientWidth) return;
    const selectedButton = tickerRef.current.querySelector<HTMLElement>(`[data-date="${toISODate(selected)}"]`);
    selectedButton?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [hydrated, selected]);

  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    if (openEventId) url.searchParams.set("e", openEventId);
    else url.searchParams.delete("e");
    window.history.replaceState(window.history.state, "", url);
  }, [openEventId, hydrated]);

  const visibleEvents = useMemo(() => events.filter((event) => active.has(event.category)), [active]);
  const selectedEvents = useMemo(() => eventsOn(visibleEvents, selected), [selected, visibleEvents]);
  const openEvent = events.find((event) => event.id === openEventId);
  const upcoming = nextEvent(visibleEvents, today);
  const monthEvents = visibleEvents.filter((event) => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return parseDate(event.start) <= monthEnd && parseDate(event.end) >= monthStart;
  });
  const weekStart = startOfWeek(selected);
  const tickerDays = Array.from({ length: 14 }, (_, index) => addDays(weekStart, index));

  function toggleCategory(id: CategoryId) {
    setActive((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectDate(date: Date) {
    setSelected(date);
    if (date.getMonth() !== cursor.getMonth() || date.getFullYear() !== cursor.getFullYear()) setCursor(startOfMonth(date));
    if (view === "agenda") scrollAgendaTo(date);
  }

  function scrollAgendaTo(date: Date) {
    const iso = toISODate(date);
    window.requestAnimationFrame(() => {
      for (const row of document.querySelectorAll<HTMLElement>("[data-event-start]")) {
        if ((row.dataset.eventStart ?? "") >= iso) {
          row.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
          return;
        }
      }
    });
  }

  function shift(direction: 1 | -1) {
    if (view === "month") {
      const next = new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1);
      setCursor(next);
      setSelected(next);
      return;
    }
    const next = addDays(selected, (view === "week" ? 7 : 1) * direction);
    setSelected(next);
    setCursor(startOfMonth(next));
  }

  function goToToday() {
    setSelected(today);
    setCursor(startOfMonth(today));
    if (view === "agenda") scrollAgendaTo(today);
  }

  function jumpTo(event: TechEvent) {
    const start = parseDate(event.start);
    setSelected(start);
    setCursor(startOfMonth(start));
    setOpenEventId(event.id);
  }

  const onKeyboard = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const typing = target.matches("input, textarea, select, [contenteditable='true']");
    if (event.key === "Escape") { setOpenEventId(undefined); return; }
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "ArrowLeft") shift(-1);
    else if (event.key === "ArrowRight") shift(1);
    else if (event.key.toLowerCase() === "t") goToToday();
    else if (event.key.toLowerCase() === "m") chooseView("month");
    else if (event.key.toLowerCase() === "w") chooseView("week");
    else if (event.key.toLowerCase() === "d") chooseView("day");
    else if (event.key.toLowerCase() === "a") chooseView("agenda");
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyboard);
    return () => window.removeEventListener("keydown", onKeyboard);
  }, []);

  const viewHeading = view === "day"
    ? `${WEEKDAYS_LONG[selected.getDay()]}, ${selected.getDate()} ${MONTHS[selected.getMonth()]}`
    : view === "week"
      ? `Week of ${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]}`
      : view === "agenda" ? "The city schedule" : `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <div className="city-calendar-shell">
      <header className="city-calendar-hero">
        <div className="city-calendar-title">
          <p><i aria-hidden />The Kochi calendar <span>· Asia/Kolkata</span></p>
          <h1 className="font-display">{MONTHS[cursor.getMonth()]} <em>{cursor.getFullYear()}</em></h1>
          <span>The city’s dates, one clear view.</span>
        </div>
        <div className="city-calendar-today" aria-label="Calendar status">
          <span>{WEEKDAYS_LONG[today.getDay()]}</span>
          <strong className="font-display">{today.getDate()}</strong>
          <small>{eventsOn(events, today).length} happening today</small>
        </div>
        <div className="city-calendar-tools">
          <SearchBox events={events} onPick={jumpTo} />
          <div className="calendar-view-switch" aria-label="Calendar view">
            {(["month", "week", "day", "agenda"] as View[]).map((option) => (
              <button key={option} type="button" onClick={() => chooseView(option)} aria-pressed={view === option}>
                {option === "agenda" ? "Schedule" : option}<kbd aria-hidden>{option[0].toUpperCase()}</kbd>
              </button>
            ))}
          </div>
          <div className="calendar-navigation">
            <button type="button" onClick={() => shift(-1)} aria-label="Previous period"><ChevronRightIcon className="h-4 w-4 rotate-180" /></button>
            <button type="button" onClick={goToToday}>Today <kbd aria-hidden>T</kbd></button>
            <button type="button" onClick={() => shift(1)} aria-label="Next period"><ChevronRightIcon className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <nav className="city-dayticker" aria-label="Choose a date">
        <div className="city-dayticker__label"><span>Two-week scan</span><strong>{viewHeading}</strong></div>
        <div ref={tickerRef} className="city-dayticker__days">
          {tickerDays.map((day) => {
            const dayEvents = eventsOn(visibleEvents, day);
            const selectedDay = toISODate(day) === toISODate(selected);
            const todayDay = toISODate(day) === toISODate(today);
            return (
              <button key={toISODate(day)} data-date={toISODate(day)} type="button" onClick={() => selectDate(day)} aria-pressed={selectedDay} className={todayDay ? "is-today" : ""}>
                <span>{WEEKDAYS[day.getDay()]}</span><strong>{day.getDate()}</strong>
                <i aria-label={`${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}`}>{dayEvents.length || "·"}</i>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="city-calendar-mobile-layers">
        <button type="button" onClick={() => setActive(new Set(ALL_CATEGORIES))} aria-pressed={active.size === categories.length}>All</button>
        {categories.map((category) => <button key={category.id} type="button" onClick={() => toggleCategory(category.id)} aria-pressed={active.has(category.id)}><i className={category.dot} aria-hidden />{category.label}</button>)}
      </div>

      <div className="city-calendar-workspace">
        <aside className="city-calendar-rail" aria-label="Calendar controls and city overview">
          <MiniCalendar cursor={cursor} selected={selected} today={today} events={visibleEvents} onSelect={selectDate} onCursorChange={(date) => { setCursor(date); setSelected(date); }} />

          <section className="calendar-selected-day">
            <header><div><p>{WEEKDAYS_LONG[selected.getDay()]}</p><h2 className="font-display">{selected.getDate()} {MONTHS[selected.getMonth()]}</h2></div><span>{selectedEvents.length}</span></header>
            {selectedEvents.length > 0 ? (
              <ul>{selectedEvents.map((event) => { const category = categoryById.get(event.category)!; return <li key={event.id}><button type="button" onClick={() => setOpenEventId(event.id)}><i className={category.dot} aria-hidden /><span><strong>{event.title}</strong><small>{event.startTime ? event.startTime : "Time TBA"} · {event.venue}</small></span><ChevronRightIcon className="h-4 w-4" /></button></li>; })}</ul>
            ) : (
              <p>No dated signal here yet. The next verified event is {upcoming ? <button type="button" onClick={() => jumpTo(upcoming)}>{upcoming.title}</button> : "still being sourced"}.</p>
            )}
          </section>

          <section className="calendar-layers">
            <div className="calendar-rail-heading"><p>Event layers</p><button type="button" onClick={() => setActive(active.size === categories.length ? new Set() : new Set(ALL_CATEGORIES))}>{active.size === categories.length ? "Hide all" : "Show all"}</button></div>
            <ul>{categories.map((category) => { const total = events.filter((event) => event.category === category.id).length; return <li key={category.id}><button type="button" onClick={() => toggleCategory(category.id)} aria-pressed={active.has(category.id)}><i className={category.dot} aria-hidden /><span>{category.label}</span><b>{total}</b></button></li>; })}</ul>
          </section>

          <section className="calendar-city-desk">
            <p>Elsewhere in the city</p>
            <div>
              <Link href="/jobs"><strong>{cityCounts.jobs}</strong><span>open roles</span></Link>
              <Link href="/opportunities"><strong>{cityCounts.opportunities}</strong><span>open doors</span></Link>
              <Link href="/communities"><strong>{cityCounts.communities}</strong><span>communities</span></Link>
            </div>
          </section>
        </aside>

        <section aria-label="Kochi events calendar" className="city-calendar-canvas">
          <header className="city-calendar-canvas__head">
            <div><p>Source-backed city time</p><h2>{viewHeading}</h2></div>
            <div><span><i aria-hidden />{monthEvents.length} in this month</span><a href="/calendar.ics"><CalendarPlusIcon className="h-4 w-4" />Subscribe</a><a href={submitEventUrl} target="_blank" rel="noreferrer">Submit <ArrowUpRightIcon className="ui-arrow-up-right" /></a></div>
          </header>

          {view === "agenda" && <AgendaView today={today} events={visibleEvents} selectedEventId={openEventId} onOpenEvent={(event) => jumpTo(event)} />}
          {view === "month" && <MonthView cursor={cursor} selected={selected} today={today} events={visibleEvents} selectedEventId={openEventId} onSelectDate={selectDate} onOpenEvent={(event) => jumpTo(event)} />}
          {view === "week" && <WeekView selected={selected} today={today} events={visibleEvents} selectedEventId={openEventId} onSelectDate={selectDate} onOpenEvent={(event) => jumpTo(event)} />}
          {view === "day" && <DayView selected={selected} events={visibleEvents} selectedEventId={openEventId} onOpenEvent={(event) => jumpTo(event)} />}
        </section>
      </div>

      {openEvent && <div className="city-calendar-detail" key={openEvent.id}><button type="button" className="city-calendar-detail__scrim" onClick={() => setOpenEventId(undefined)} aria-label="Close event details" /><EventDetail event={openEvent} today={today} onClose={() => setOpenEventId(undefined)} /></div>}
      <MyBuzzDrawer open={savedOpen} onClose={() => setSavedOpen(false)} />
    </div>
  );
}
