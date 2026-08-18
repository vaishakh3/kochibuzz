"use client";

import { useMemo, useRef, useState } from "react";
import { TechEvent, categoryById } from "@/data/events";
import { formatDateRange } from "@/lib/calendar";

type Props = {
  events: TechEvent[];
  onPick: (event: TechEvent) => void;
};

export default function SearchBox({ events, onPick }: Props) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search events…"
        className="w-40 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:w-56 focus:bg-white focus:ring-2 focus:ring-violet-200"
        aria-label="Search events"
      />
      {focused && query.trim() && (
        <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          {matches.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-400">No matches.</p>
          )}
          {matches.map((event) => {
            const category = categoryById.get(event.category)!;
            return (
              <button
                key={event.id}
                onMouseDown={() => {
                  onPick(event);
                  setQuery("");
                  inputRef.current?.blur();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${category.dot}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {event.title}
                  </span>
                  <span className="block text-xs text-slate-400">
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
