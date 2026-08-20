"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SearchGroup, SearchItem } from "@/lib/searchIndex";

type Grouped = { group: SearchGroup; items: SearchItem[] }[];

/**
 * Cross-entity search over events, jobs, opportunities, communities,
 * projects and places. Data is dynamically imported on first open so the
 * index never weighs down initial page loads. `/` opens it globally.
 */
export default function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Grouped>([]);
  const searchRef = useRef<((q: string) => Grouped) | null>(null);
  const queryRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const runSearch = useCallback((q: string) => {
    setQuery(q);
    queryRef.current = q;
    if (searchRef.current) setResults(searchRef.current(q));
  }, []);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    if (!searchRef.current) {
      import("@/lib/searchIndex").then((mod) => {
        searchRef.current = (q: string) => mod.searchAll(q);
        setResults(mod.searchAll(queryRef.current));
      });
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search kochi.buzz"
    >
      <div
        ref={panelRef}
        className="animate-sheet-up mx-auto mt-4 w-full max-w-xl overflow-hidden rounded-xl bg-[var(--surface)] ring-1 ring-white/15 sm:mt-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <span aria-hidden className="signal-dot" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => runSearch(e.target.value)}
            placeholder="Search events, jobs, communities…"
            className="w-full bg-transparent py-3.5 text-sm text-[var(--ink)] outline-none placeholder:text-white/65"
            aria-label="Search"
          />
          <button
            onClick={onClose}
            className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/70 transition hover:text-white"
          >
            esc
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() !== "" && results.length === 0 && (
            <p className="px-4 py-6 text-sm text-white/45">
              No signal for &ldquo;{query.trim()}&rdquo;.
            </p>
          )}
          {results.map(({ group, items }) => (
            <section key={group} className="py-2">
              <h3 className="px-4 pb-1 pt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em] text-white/70">
                {group}
              </h3>
              <ul>
                {items.map((item) =>
                  item.external ? (
                    <li key={`${item.group}-${item.href}-${item.title}`}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-baseline justify-between gap-3 px-4 py-2 transition hover:bg-white/[0.05]"
                        onClick={onClose}
                      >
                        <span className="min-w-0 truncate text-sm text-white/85">
                          {item.title}
                        </span>
                        <span className="shrink-0 text-xs text-white/70">
                          {item.meta} ↗
                        </span>
                      </a>
                    </li>
                  ) : (
                    <li key={`${item.group}-${item.href}-${item.title}`}>
                      <Link
                        href={item.href}
                        className="flex items-baseline justify-between gap-3 px-4 py-2 transition hover:bg-white/[0.05]"
                        onClick={onClose}
                      >
                        <span className="min-w-0 truncate text-sm text-white/85">
                          {item.title}
                        </span>
                        <span className="shrink-0 truncate text-xs text-white/70">
                          {item.meta}
                        </span>
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
