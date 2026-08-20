"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon } from "@/components/icons";

export type DigestEntry = {
  id: string;
  title: string;
  day: number;
  month: string;
  dateLabel: string;
  timeLabel: string;
  category: string;
  venue: string;
  city: string;
  travel: boolean;
  countdown: string;
};

export type DigestRange = {
  days: number;
  rangeLabel: string;
  entries: DigestEntry[];
  text: string;
};

type Props = {
  week: DigestRange;
  month: DigestRange;
};

export default function DigestView({ week, month }: Props) {
  const [range, setRange] = useState<7 | 30>(30);
  const [copied, setCopied] = useState(false);
  const active = range === 7 ? week : month;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(active.text)}`;

  async function copy() {
    await navigator.clipboard.writeText(active.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: active.text });
      } catch {
        // user dismissed
      }
    }
  }

  return (
    <div>
      {/* Range switch */}
      <div
        role="tablist"
        aria-label="Digest range"
        className="inline-flex rounded-md ring-1 ring-white/15"
      >
        {([7, 30] as const).map((d) => (
          <button
            key={d}
            role="tab"
            aria-selected={range === d}
            onClick={() => setRange(d)}
            className={[
              "px-4 py-2 text-xs font-semibold transition first:rounded-l-md last:rounded-r-md",
              range === d
                ? "bg-[var(--signal)] text-[var(--signal-ink)]"
                : "text-white/60 hover:text-white",
            ].join(" ")}
          >
            Next {d} days
          </button>
        ))}
      </div>

      <p className="mt-4 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-white/40">
        Kochi · {active.rangeLabel}
      </p>

      {active.entries.length === 0 ? (
        <p className="mt-6 border-t border-white/10 pt-6 text-sm text-white/50">
          Quiet on this frequency — nothing in the next {active.days} days yet.{" "}
          <Link href="/events" className="text-[var(--signal)] hover:opacity-80">
            Browse the full calendar →
          </Link>
        </p>
      ) : (
        <ol className="mt-6">
          {active.entries.map((entry) => (
            <li key={entry.id} className="border-t border-white/10">
              <Link
                href={`/events/${entry.id}`}
                className="group flex gap-5 py-4 transition hover:bg-white/[0.02]"
              >
                <span className="w-12 shrink-0 text-center">
                  <span className="font-display block text-2xl font-semibold leading-none text-white">
                    {entry.day}
                  </span>
                  <span className="font-[family-name:var(--font-geist-mono)] mt-0.5 block text-[9px] uppercase tracking-wider text-white/40">
                    {entry.month}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-white transition group-hover:text-[var(--signal)]">
                    {entry.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-white/50">
                    {entry.timeLabel} · {entry.venue}, {entry.city}
                  </span>
                  <span className="mt-1 block font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/35">
                    {entry.category}
                    {entry.travel ? " · outside Kochi" : ""}
                  </span>
                </span>
                <span className="shrink-0 self-center font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-[var(--signal-dim)]">
                  {entry.countdown}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {/* Share — message preview */}
      <section className="mt-10 overflow-hidden rounded-xl bg-[var(--surface)] ring-1 ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Forward this to your group
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--signal)] px-4 py-2 text-xs font-semibold text-[var(--signal-ink)] transition hover:opacity-90"
            >
              {copied && <CheckIcon className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy text"}
            </button>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-4 py-2 text-xs font-semibold text-white/75 ring-1 ring-white/15 transition hover:text-white"
            >
              WhatsApp
            </a>
            <button
              onClick={nativeShare}
              className="rounded-md px-4 py-2 text-xs font-semibold text-white/75 ring-1 ring-white/15 transition hover:text-white"
            >
              Share…
            </button>
          </div>
        </div>
        {/* Chat-bubble style preview */}
        <div className="bg-[var(--surface-2)] p-5">
          <div className="ml-auto max-w-md whitespace-pre-wrap rounded-lg rounded-tr-none bg-[#1f2b20] px-4 py-3 text-xs leading-relaxed text-[#e4efdd] shadow">
            {active.text}
          </div>
        </div>
      </section>
    </div>
  );
}
