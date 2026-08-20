"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import LiveClock from "@/components/LiveClock";

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
const VISIT_KEY = "kochibuzz:last-visit:v1";

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

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function PickLink({ pick, className, children }: { pick: BuzzPick; className: string; children: React.ReactNode }) {
  return pick.external ? (
    <a href={pick.href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
  ) : (
    <Link href={pick.href} className={className}>{children}</Link>
  );
}

export default function BuzzReceiver({
  tracks,
  dateLabel,
  daypart,
  scanCounts,
}: {
  tracks: BuzzTrack[];
  dateLabel: string;
  daypart: string;
  scanCounts: { events: number; jobs: number; doors: number };
}) {
  const [trackId, setTrackId] = useState<BuzzTrack["id"]>(tracks[0]?.id ?? "go");
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<SavedPick[]>([]);
  const [queueOpen, setQueueOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [visitNote, setVisitNote] = useState("Your city scan is ready.");
  const [message, setMessage] = useState("Choose a station to tune the city.");
  const queueButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const queueRef = useRef<HTMLDivElement>(null);

  const track = tracks.find((candidate) => candidate.id === trackId) ?? tracks[0];
  const position = positions[track?.id ?? "go"] ?? 0;
  const pick = track?.items[position % Math.max(track.items.length, 1)];
  const trackIndex = Math.max(0, tracks.findIndex((candidate) => candidate.id === track?.id));
  const isSaved = Boolean(pick && saved.some((item) => item.id === pick.id));

  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.matches("input, textarea, select, [contenteditable='true']") || event.metaKey || event.ctrlKey || event.altKey) return;
    const number = Number(event.key);
    if (number >= 1 && number <= tracks.length) chooseTrack(tracks[number - 1].id);
    if (event.key.toLowerCase() === "j") nextPick();
    if (event.key.toLowerCase() === "s") toggleSaved();
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const remembered = window.localStorage.getItem(TRACK_KEY);
      if (tracks.some((candidate) => candidate.id === remembered)) {
        setTrackId(remembered as BuzzTrack["id"]);
      }
      setSaved(readSaved());
      const previousVisit = window.localStorage.getItem(VISIT_KEY);
      const today = todayKey();
      if (!previousVisit) {
        setVisitNote("First transmission on this device.");
      } else if (previousVisit === today) {
        setVisitNote("Welcome back. You’re tuned in today.");
      } else {
        const readable = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "numeric",
          month: "short",
        }).format(new Date(`${previousVisit}T12:00:00+05:30`));
        setVisitNote(`Welcome back. Last tuned ${readable}.`);
      }
      window.localStorage.setItem(VISIT_KEY, today);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tracks]);

  useEffect(() => {
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  useEffect(() => {
    if (!queueOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeQueue();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = queueRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
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
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [queueOpen]);

  function chooseTrack(id: BuzzTrack["id"]) {
    setTrackId(id);
    window.localStorage.setItem(TRACK_KEY, id);
    const next = tracks.find((candidate) => candidate.id === id);
    setMessage(next ? `${next.label} is now tuned.` : "Station changed.");
  }

  function nextPick() {
    if (!track || track.items.length < 2) return;
    setPositions((current) => ({ ...current, [track.id]: ((current[track.id] ?? 0) + 1) % track.items.length }));
    setMessage("Next real signal, now transmitting.");
  }

  function toggleSaved() {
    if (!pick || !track) return;
    const alreadySaved = saved.some((item) => item.id === pick.id);
    const next = alreadySaved ? saved.filter((item) => item.id !== pick.id) : [...saved, { ...pick, trackLabel: track.label }];
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
      setMessage("Open the signal to copy its address.");
    }
  }

  if (!track || !pick) return null;

  return (
    <section id="tune-your-buzz" aria-labelledby="broadcast-title" className="broadcast-hero" style={{ "--receiver-accent": track.color } as CSSProperties}>
      <Image
        src="/images/broadcast/kochi-on-air.webp"
        alt="Editorial illustration of people talking over chai, recording community radio, building electronics and meeting across Kochi"
        fill
        priority
        sizes="100vw"
        className="broadcast-hero__art"
      />
      <div className="broadcast-hero__wash" aria-hidden />
      <div className="broadcast-hero__grain" aria-hidden />

      <div className="broadcast-hero__inner">
        <div className="broadcast-hero__masthead">
          <div className="broadcast-live"><i aria-hidden />Kochi on air</div>
          <div className="broadcast-hero__date"><span>{dateLabel}</span><LiveClock /></div>
          <div className="broadcast-hero__coordinates">09.9312°N · 76.2673°E</div>
        </div>

        <div className="broadcast-hero__copy">
          <p>{daypart}</p>
          <h1 id="broadcast-title" aria-label="The city is talking." className="font-display">The city is<br /><em>talking.</em></h1>
          <span>Tune in.</span>
          <p className="broadcast-hero__dek">Real things to do. People worth meeting. Work with momentum. Ideas made down the road.</p>
        </div>

        <div className="broadcast-scan" aria-label="Latest source-backed scan">
          <div><strong>{scanCounts.events}</strong><span>events<br />this week</span></div>
          <div><strong>{scanCounts.jobs}</strong><span>open<br />roles</span></div>
          <div><strong>{scanCounts.doors}</strong><span>doors<br />open</span></div>
        </div>

        <div className="broadcast-console">
          <div className="broadcast-console__topline">
            <div>
              <span>City receiver · visual broadcast</span>
              <small>{ready ? visitNote : "Connecting to the city…"}</small>
            </div>
            <button ref={queueButtonRef} type="button" onClick={() => setQueueOpen(true)} className="broadcast-queue-button" aria-label={`Open My Buzz, ${saved.length} saved ${saved.length === 1 ? "signal" : "signals"}`}>
              My Buzz <b>{ready ? saved.length : "·"}</b>
            </button>
          </div>

          <div className="broadcast-stations" role="group" aria-label="Choose a Kochi station">
            {tracks.map((candidate, index) => (
              <button key={candidate.id} type="button" onClick={() => chooseTrack(candidate.id)} aria-pressed={candidate.id === track.id} aria-keyshortcuts={String(index + 1)} style={{ "--track-color": candidate.color } as CSSProperties}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{candidate.shortLabel}</strong>
                <i aria-hidden />
              </button>
            ))}
          </div>

          <div className="broadcast-readout">
            <div className="broadcast-dial" style={{ "--dial-angle": `${trackIndex * 78 - 112}deg` } as CSSProperties} aria-hidden>
              <span /><b>{String(trackIndex + 1).padStart(2, "0")}</b>
            </div>
            <article key={`${track.id}-${position}`} className="broadcast-pick">
              <div><p>{pick.eyebrow}</p><span>{String((position % track.items.length) + 1).padStart(2, "0")} / {String(track.items.length).padStart(2, "0")}</span></div>
              <h2 className="font-display">{pick.title}</h2>
              <p>{pick.detail}</p>
              <small>{pick.meta}</small>
            </article>
            <div className="broadcast-actions">
              <button type="button" onClick={nextPick} aria-keyshortcuts="J">Next signal <span aria-hidden>J</span></button>
              <button type="button" onClick={toggleSaved} aria-pressed={isSaved} aria-keyshortcuts="S" className={isSaved ? "is-saved" : ""}>{isSaved ? "Saved" : "Save"} <span aria-hidden>S</span></button>
              <button type="button" onClick={sharePick}>Share <span aria-hidden>↗</span></button>
              {pick.calendarHref && <a href={pick.calendarHref}>Calendar <span aria-hidden>↓</span></a>}
              <PickLink pick={pick} className="broadcast-open">Open signal <span aria-hidden>↗</span></PickLink>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">{message}</p>
        </div>
      </div>

      {queueOpen && (
        <div ref={queueRef} className="broadcast-queue" role="dialog" aria-modal="true" aria-labelledby="my-buzz-title">
          <div className="broadcast-queue__panel">
            <div className="broadcast-queue__head">
              <div><p>Your device-local tracklist</p><h2 id="my-buzz-title" className="font-display">My Buzz</h2></div>
              <button ref={closeButtonRef} type="button" onClick={closeQueue} aria-label="Close My Buzz">×</button>
            </div>
            {saved.length === 0 ? (
              <div className="broadcast-queue__empty"><strong className="font-display">Nothing saved yet.</strong><p>Tune a station and keep the signals you want to act on later.</p></div>
            ) : (
              <ol className="broadcast-queue__list">
                {saved.map((item, index) => (
                  <li key={item.id}><PickLink pick={item} className="broadcast-saved-item"><span>{String(index + 1).padStart(2, "0")}</span><span><strong>{item.title}</strong><small>{item.trackLabel} · {item.meta}</small></span><span aria-hidden>↗</span></PickLink></li>
                ))}
              </ol>
            )}
            <div className="broadcast-queue__foot"><span>No account. Nothing uploaded.</span>{saved.length > 0 && <button type="button" onClick={clearSaved}>Clear all</button>}</div>
          </div>
        </div>
      )}
    </section>
  );
}
