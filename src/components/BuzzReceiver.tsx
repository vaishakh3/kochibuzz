"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

export type BuzzPick = {
  id: string;
  kind: "event" | "community" | "place" | "job" | "opportunity" | "project";
  eyebrow: string;
  title: string;
  detail: string;
  meta: string;
  href: string;
  external?: boolean;
  calendarHref?: string;
};

export type BuzzTrack = {
  id: "go" | "people" | "career" | "build";
  label: string;
  shortLabel: string;
  color: string;
  items: BuzzPick[];
};

type SavedPick = BuzzPick & { trackLabel: string };

const TRACK_KEY = "kochibuzz:frequency:v1";
const SAVED_KEY = "kochibuzz:saved:v1";

function readSaved(): SavedPick[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedPick =>
        Boolean(item) &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.href === "string",
    );
  } catch {
    return [];
  }
}

function PickLink({
  pick,
  className,
  children,
}: {
  pick: BuzzPick;
  className: string;
  children: React.ReactNode;
}) {
  if (pick.external) {
    return (
      <a
        href={pick.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={pick.href} className={className}>
      {children}
    </Link>
  );
}

export default function BuzzReceiver({
  tracks,
  dateLabel,
}: {
  tracks: BuzzTrack[];
  dateLabel: string;
}) {
  const [trackId, setTrackId] = useState<BuzzTrack["id"]>(tracks[0]?.id ?? "go");
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<SavedPick[]>([]);
  const [queueOpen, setQueueOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Choose what you need from the city today.");
  const queueButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const queueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const remembered = window.localStorage.getItem(TRACK_KEY);
      if (tracks.some((track) => track.id === remembered)) {
        setTrackId(remembered as BuzzTrack["id"]);
      }
      setSaved(readSaved());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tracks]);

  useEffect(() => {
    if (!queueOpen) return;
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setQueueOpen(false);
        window.requestAnimationFrame(() => queueButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = queueRef.current?.querySelectorAll<HTMLElement>(
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
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [queueOpen]);

  const track = tracks.find((candidate) => candidate.id === trackId) ?? tracks[0];
  const position = positions[track?.id ?? "go"] ?? 0;
  const pick = track?.items[position % Math.max(track.items.length, 1)];
  const trackIndex = Math.max(0, tracks.findIndex((candidate) => candidate.id === track?.id));
  const isSaved = Boolean(pick && saved.some((item) => item.id === pick.id));

  function chooseTrack(id: BuzzTrack["id"]) {
    setTrackId(id);
    window.localStorage.setItem(TRACK_KEY, id);
    const next = tracks.find((candidate) => candidate.id === id);
    setMessage(next ? `${next.label} is now on your frequency.` : "Frequency changed.");
  }

  function nextPick() {
    if (!track || track.items.length < 2) return;
    setPositions((current) => ({
      ...current,
      [track.id]: ((current[track.id] ?? 0) + 1) % track.items.length,
    }));
    setMessage("Skipped. Here’s another real signal.");
  }

  function toggleSaved() {
    if (!pick || !track) return;
    const alreadySaved = saved.some((item) => item.id === pick.id);
    const next = alreadySaved
      ? saved.filter((item) => item.id !== pick.id)
      : [...saved, { ...pick, trackLabel: track.label }];
    setSaved(next);
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("kochibuzz:saved", { detail: next.length }));
    setMessage(alreadySaved ? "Removed from My Buzz." : "Saved to My Buzz on this device.");
  }

  function clearSaved() {
    setSaved([]);
    window.localStorage.removeItem(SAVED_KEY);
    window.dispatchEvent(new CustomEvent("kochibuzz:saved", { detail: 0 }));
    setMessage("My Buzz is clear.");
  }

  function closeQueue() {
    setQueueOpen(false);
    window.requestAnimationFrame(() => queueButtonRef.current?.focus());
  }

  async function sharePick() {
    if (!pick) return;
    const url = new URL(pick.href, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: pick.title, text: pick.detail, url });
        setMessage("Signal shared.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage("Signal link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Sharing isn’t available here. Open the signal to copy its address.");
    }
  }

  function moveArtwork(event: ReactPointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--receiver-x", x.toFixed(3));
    event.currentTarget.style.setProperty("--receiver-y", y.toFixed(3));
  }

  function resetArtwork(event: ReactPointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--receiver-x", "0");
    event.currentTarget.style.setProperty("--receiver-y", "0");
  }

  if (!track || !pick) return null;

  return (
    <section
      id="tune-your-buzz"
      aria-labelledby="receiver-title"
      className="buzz-receiver"
      style={{ "--receiver-accent": track.color } as CSSProperties}
    >
      <div
        className="buzz-receiver__picture"
        onPointerMove={moveArtwork}
        onPointerLeave={resetArtwork}
      >
        <Image
          src="/images/kochi-city-frequency.webp"
          alt="Illustrated Kochi waterfront, metro, port and gathering spaces connected by a city frequency"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="buzz-receiver__image object-cover object-[61%_52%]"
        />
        <div className="buzz-receiver__scan" aria-hidden />
        <div className="buzz-receiver__coordinates">
          <span className="signal-dot signal-dot--pulse" aria-hidden />
          09.9312°N · 76.2673°E
        </div>
        <div className="buzz-receiver__date">{dateLabel}</div>
      </div>

      <div className="buzz-receiver__console">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="buzz-receiver__kicker">Live city receiver</p>
            <h2 id="receiver-title" className="font-display mt-1 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
              What do you need from Kochi today?
            </h2>
          </div>
          <button
            ref={queueButtonRef}
            type="button"
            onClick={() => setQueueOpen(true)}
            className="buzz-receiver__queue-button"
            aria-label={`Open My Buzz, ${saved.length} saved ${saved.length === 1 ? "signal" : "signals"}`}
          >
            My Buzz
            <span>{ready ? saved.length : "·"}</span>
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose a city frequency">
          {tracks.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => chooseTrack(candidate.id)}
              aria-pressed={candidate.id === track.id}
              className="buzz-receiver__track"
              style={{ "--track-color": candidate.color } as CSSProperties}
            >
              <span aria-hidden />
              {candidate.shortLabel}
            </button>
          ))}
        </div>

        <div className="buzz-receiver__readout">
          <div
            className="buzz-receiver__dial"
            style={{ "--dial-angle": `${trackIndex * 78 - 112}deg` } as CSSProperties}
            aria-hidden
          >
            <span className="buzz-receiver__dial-needle" />
            <span className="buzz-receiver__dial-core">{String(trackIndex + 1).padStart(2, "0")}</span>
          </div>

          <article key={`${track.id}-${position}`} className="buzz-receiver__pick">
            <div className="flex items-start justify-between gap-3">
              <p className="buzz-receiver__eyebrow">{pick.eyebrow}</p>
              <span className="buzz-receiver__counter">
                {String((position % track.items.length) + 1).padStart(2, "0")}/{String(track.items.length).padStart(2, "0")}
              </span>
            </div>
            <h3 className="font-display mt-2 text-2xl font-semibold leading-[1.02] tracking-[-0.025em] text-white sm:text-[1.8rem]">
              {pick.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/55 sm:text-sm">
              {pick.detail}
            </p>
            <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.14em] text-white/38">
              {pick.meta}
            </p>
          </article>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button type="button" onClick={nextPick} className="buzz-receiver__action buzz-receiver__action--quiet">
            Not today <span aria-hidden>↻</span>
          </button>
          <button
            type="button"
            onClick={toggleSaved}
            className={`buzz-receiver__action buzz-receiver__action--save ${isSaved ? "is-saved" : ""}`}
            aria-pressed={isSaved}
          >
            {isSaved ? "Saved" : "Save signal"} <span aria-hidden>{isSaved ? "✓" : "+"}</span>
          </button>
          <button type="button" onClick={sharePick} className="buzz-receiver__action buzz-receiver__action--quiet">
            Share <span aria-hidden>↗</span>
          </button>
          {pick.calendarHref && (
            <a href={pick.calendarHref} className="buzz-receiver__action buzz-receiver__action--quiet">
              Calendar <span aria-hidden>↓</span>
            </a>
          )}
          <PickLink pick={pick} className="buzz-receiver__open">
            Open signal <span aria-hidden>↗</span>
          </PickLink>
        </div>
        <p className="sr-only" aria-live="polite">{message}</p>
      </div>

      {queueOpen && (
        <div
          ref={queueRef}
          className="buzz-receiver__queue"
          role="dialog"
          aria-modal="true"
          aria-labelledby="my-buzz-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="buzz-receiver__kicker">Saved on this device</p>
              <h3 id="my-buzz-title" className="font-display mt-1 text-3xl font-semibold tracking-tight text-white">My Buzz</h3>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeQueue}
              className="buzz-receiver__close"
              aria-label="Close My Buzz"
            >
              ×
            </button>
          </div>
          {saved.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-6 text-center">
              <p className="font-display text-2xl text-white">Nothing saved yet.</p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/45">Tune a frequency and keep the signals you want to act on later.</p>
            </div>
          ) : (
            <ol className="mt-6 max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {saved.map((item, index) => (
                <li key={item.id}>
                  <PickLink pick={item} className="buzz-receiver__saved-item">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <strong>{item.title}</strong>
                      <small>{item.trackLabel} · {item.meta}</small>
                    </span>
                    <span aria-hidden>↗</span>
                  </PickLink>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-[10px] leading-relaxed text-white/35">No account. No cloud profile.</span>
            {saved.length > 0 && (
              <button type="button" onClick={clearSaved} className="text-xs font-semibold text-white/45 transition hover:text-white">Clear all</button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
