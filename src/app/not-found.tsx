import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooter";
import GlobalHeader from "@/components/GlobalHeader";
import { events } from "@/data/events";
import { formatDateRange, nextEvent, todayInIST } from "@/lib/calendar";

export default function NotFound() {
  const next = nextEvent(events, todayInIST());

  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader current="" />
      <main id="main-content" className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-4 py-20 sm:px-6">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[var(--signal)]">
          Signal lost
        </p>
        <h1 className="font-display mt-4 text-[clamp(5rem,18vw,12rem)] font-semibold leading-none tracking-tight text-white/90">
          404
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
          Nothing transmitting from this address.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--signal)] transition hover:opacity-80"
          >
            ← Back to the buzz
          </Link>
        </div>
        {next && (
          <Link
            href={`/events/${next.id}`}
            className="group mt-12 block max-w-md border-t border-white/10 pt-5"
          >
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/40">
              Meanwhile, next in Kochi tech
            </span>
            <span className="mt-1.5 block text-sm font-semibold text-white transition group-hover:text-[var(--signal)]">
              {next.title}
            </span>
            <span className="mt-0.5 block text-xs text-white/50">
              {formatDateRange(next)} · {next.venue}, {next.city}
            </span>
          </Link>
        )}
      </main>
      <GlobalFooter />
    </div>
  );
}
