"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import LiveClock from "@/components/LiveClock";
import { readMyBuzz, writeMyBuzz, type MyBuzzItem } from "@/lib/myBuzz";

export type BuzzPick = Omit<MyBuzzItem, "trackLabel">;

export type BuzzTrack = {
  id: "go" | "people" | "career" | "build";
  label: string;
  shortLabel: string;
  color: string;
  items: BuzzPick[];
};

type SavedPick = MyBuzzItem;

const TRACK_KEY = "kochibuzz:frequency:v1";
const VISIT_KEY = "kochibuzz:last-visit:v1";
const SCAN_KEY = "kochibuzz:daily-scan:v1";

type DailyScan = {
  date: string;
  trackIds: BuzzTrack["id"][];
};

function getLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setLocal(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The receiver still works for this session when storage is unavailable.
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

function readDailyScan(date: string): BuzzTrack["id"][] {
  try {
    const parsed = JSON.parse(getLocal(SCAN_KEY) ?? "null") as DailyScan | null;
    if (!parsed || parsed.date !== date || !Array.isArray(parsed.trackIds)) return [];
    return parsed.trackIds.filter((id): id is BuzzTrack["id"] => ["go", "people", "career", "build"].includes(id));
  } catch {
    return [];
  }
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
  const [tunedToday, setTunedToday] = useState<BuzzTrack["id"][]>([]);
  const [queueOpen, setQueueOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [visitNote, setVisitNote] = useState("Your city scan is ready.");
  const [message, setMessage] = useState("Choose a station to tune the city.");
  const queueButtonRef = useRef<HTMLButtonElement>(null);
  const firstStationRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const queueRef = useRef<HTMLDivElement>(null);

  const track = tracks.find((candidate) => candidate.id === trackId) ?? tracks[0];
  const position = positions[track?.id ?? "go"] ?? 0;
  const pick = track?.items[position % Math.max(track.items.length, 1)];
  const trackIndex = Math.max(0, tracks.findIndex((candidate) => candidate.id === track?.id));
  const isSaved = Boolean(pick && saved.some((item) => item.id === pick.id));
  const tunedCount = tracks.filter((candidate) => tunedToday.includes(candidate.id)).length;
  const scanComplete = ready && tunedCount === tracks.length;

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
      const remembered = getLocal(TRACK_KEY);
      const initialTrack = tracks.some((candidate) => candidate.id === remembered)
        ? remembered as BuzzTrack["id"]
        : tracks[0]?.id;
      if (initialTrack) setTrackId(initialTrack);
      setSaved(readMyBuzz());
      const previousVisit = getLocal(VISIT_KEY);
      const today = todayKey();
      const scanned = readDailyScan(today);
      const initialScan = initialTrack && !scanned.includes(initialTrack) ? [...scanned, initialTrack] : scanned;
      setTunedToday(initialScan);
      setLocal(SCAN_KEY, JSON.stringify({ date: today, trackIds: initialScan } satisfies DailyScan));
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
      setLocal(VISIT_KEY, today);
      if (new URLSearchParams(window.location.search).get("mybuzz") === "1") {
        setMessage("No account. Nothing uploaded.");
        setQueueOpen(true);
        const cleanUrl = `${window.location.pathname}${window.location.hash}`;
        window.history.replaceState(window.history.state, "", cleanUrl);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tracks]);

  useEffect(() => {
    function openSaved() {
      setMessage("No account. Nothing uploaded.");
      setQueueOpen(true);
    }
    window.addEventListener("kochibuzz:open-saved", openSaved);
    return () => window.removeEventListener("kochibuzz:open-saved", openSaved);
  }, []);

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
    setLocal(TRACK_KEY, id);
    setTunedToday((current) => {
      if (current.includes(id)) return current;
      const nextTuned = [...current, id];
      setLocal(SCAN_KEY, JSON.stringify({ date: todayKey(), trackIds: nextTuned } satisfies DailyScan));
      return nextTuned;
    });
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
    if (writeMyBuzz(next)) {
      setSaved(next);
      setMessage(alreadySaved ? "Removed from My Buzz." : "Saved to My Buzz on this device.");
    } else {
      setMessage("This browser could not update My Buzz.");
    }
  }

  function clearSaved() {
    if (writeMyBuzz([])) {
      setSaved([]);
      setMessage("My Buzz is clear.");
    } else {
      setMessage("This browser could not clear My Buzz.");
    }
  }

  function removeSaved(id: string) {
    const next = saved.filter((item) => item.id !== id);
    if (writeMyBuzz(next)) {
      setSaved(next);
      setMessage("Signal removed from My Buzz.");
    } else {
      setMessage("This browser could not update My Buzz.");
    }
  }

  function savedText() {
    const lines = saved.map((item, index) => {
      const url = new URL(item.href, window.location.origin).toString();
      return `${index + 1}. ${item.title}\n${item.meta}\n${url}`;
    });
    return `MY KOCHI BUZZ\n${todayKey()}\n\n${lines.join("\n\n")}\n\nTuned at kochi.buzz`;
  }

  async function copySaved() {
    try {
      await navigator.clipboard.writeText(savedText());
      setMessage("My Buzz copied.");
    } catch {
      setMessage("Could not copy. Open a signal to copy its address.");
    }
  }

  async function shareSaved() {
    const text = savedText();
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Kochi Buzz", text });
        setMessage("My Buzz shared.");
        return;
      }
      await navigator.clipboard.writeText(text);
      setMessage("My Buzz copied for sharing.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Could not share My Buzz.");
    }
  }

  function closeQueue() {
    setQueueOpen(false);
    window.requestAnimationFrame(() => queueButtonRef.current?.focus());
  }

  function openQueue() {
    setMessage("No account. Nothing uploaded.");
    setQueueOpen(true);
  }

  function tuneFromEmpty() {
    setQueueOpen(false);
    window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      firstStationRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      firstStationRef.current?.focus({ preventScroll: true });
    });
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
            <div className="broadcast-console__status">
              <span>City receiver · visual broadcast</span>
              <small>{ready ? (scanComplete ? "Today’s city scan is complete." : visitNote) : "Connecting to the city…"}</small>
            </div>
            <div className="broadcast-daily" aria-label={`Today’s city scan: ${tunedCount} of ${tracks.length} stations tuned`}>
              <span>{ready ? `${tunedCount}/${tracks.length} tuned` : "—/— tuned"}</span>
              <div aria-hidden>{tracks.map((candidate) => <i key={candidate.id} className={tunedToday.includes(candidate.id) ? "is-tuned" : ""} style={{ "--track-color": candidate.color } as CSSProperties} />)}</div>
            </div>
            <button ref={queueButtonRef} type="button" onClick={openQueue} className="broadcast-queue-button" aria-label={`Open My Buzz, ${saved.length} saved ${saved.length === 1 ? "signal" : "signals"}`}>
              My Buzz <b>{ready ? saved.length : "·"}</b>
            </button>
          </div>

          <div className="broadcast-stations" role="group" aria-label="Choose a Kochi station">
            {tracks.map((candidate, index) => (
              <button ref={index === 0 ? firstStationRef : undefined} key={candidate.id} type="button" onClick={() => chooseTrack(candidate.id)} aria-pressed={candidate.id === track.id} aria-keyshortcuts={String(index + 1)} className={tunedToday.includes(candidate.id) ? "is-tuned" : ""} style={{ "--track-color": candidate.color } as CSSProperties}>
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
              <div className="broadcast-queue__empty"><strong className="font-display">Nothing saved yet.</strong><p>Save any event, role, opportunity, community, project or place—or let the receiver find a quick pick.</p><button type="button" onClick={tuneFromEmpty}>Tune the receiver →</button></div>
            ) : (
              <ol className="broadcast-queue__list">
                {saved.map((item, index) => (
                  <li key={item.id} className="broadcast-saved-row">
                    <PickLink pick={item} className="broadcast-saved-item"><span>{String(index + 1).padStart(2, "0")}</span><span><strong>{item.title}</strong><small>{item.trackLabel} · {item.meta}</small></span><span aria-hidden>↗</span></PickLink>
                    <div className="broadcast-saved-row__actions">
                      {item.calendarHref && <a href={item.calendarHref}>Calendar</a>}
                      <button type="button" onClick={() => removeSaved(item.id)} aria-label={`Remove ${item.title} from My Buzz`}>Remove</button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <div className="broadcast-queue__foot">
              <span aria-live="polite">{message}</span>
              {saved.length > 0 && <div><button type="button" onClick={copySaved}>Copy list</button><button type="button" onClick={shareSaved}>Share</button><button type="button" onClick={clearSaved}>Clear all</button></div>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
