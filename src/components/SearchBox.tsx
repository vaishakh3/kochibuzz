"use client";

import { useId, useMemo, useRef, useState } from "react";
import { TechEvent, categoryById } from "@/data/events";
import { formatDateRange } from "@/lib/calendar";

type Props = {
  events: TechEvent[];
  onPick: (event: TechEvent) => void;
};

export default function SearchBox({ events, onPick }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return events
      .filter((e) =>
        [e.title, e.venue, e.city, e.organizer, ...e.tags]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 6);
  }, [events, query]);

  function choose(event: TechEvent) {
    onPick(event);
    setQuery("");
    setFocused(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }

  return (
    <div
      className="relative"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
          setActiveIndex(-1);
        }
      }}
    >
      <input
        id="event-search"
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && matches.length > 0) {
            event.preventDefault();
            const next = (activeIndex + 1) % matches.length;
            setActiveIndex(next);
            document.getElementById(`${listId}-${next}`)?.focus();
          } else if (event.key === "ArrowUp" && matches.length > 0) {
            event.preventDefault();
            const next = activeIndex <= 0 ? matches.length - 1 : activeIndex - 1;
            setActiveIndex(next);
            document.getElementById(`${listId}-${next}`)?.focus();
          } else if (event.key === "Escape") {
            setFocused(false);
            setActiveIndex(-1);
          }
        }}
        placeholder="Search events"
        className="w-40 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:w-56 focus:bg-white focus:ring-2 focus:ring-violet-200"
        aria-label="Search events"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={focused && Boolean(query.trim())}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
      />
      {focused && query.trim() && (
        <div id={listId} role="listbox" aria-label="Event search results" className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          {matches.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-600">No matches.</p>
          )}
          {matches.map((event, index) => {
            const category = categoryById.get(event.category)!;
            return (
              <button
                key={event.id}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                onFocus={() => setActiveIndex(index)}
                onClick={() => choose(event)}
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "ArrowDown" || keyEvent.key === "ArrowUp") {
                    keyEvent.preventDefault();
                    const direction = keyEvent.key === "ArrowDown" ? 1 : -1;
                    const next = (index + direction + matches.length) % matches.length;
                    setActiveIndex(next);
                    document.getElementById(`${listId}-${next}`)?.focus();
                  }
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${category.dot}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {event.title}
                  </span>
                  <span className="block text-xs text-slate-600">
                    {formatDateRange(event)} · {event.city}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
