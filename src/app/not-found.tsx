import Link from "next/link";
import { events } from "@/data/events";
import { formatDateRange, nextEvent, todayInIST } from "@/lib/calendar";

export default function NotFound() {
  const next = nextEvent(events, todayInIST());

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="aurora aurora-one" aria-hidden />
      <div className="aurora aurora-two" aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-[2rem] bg-[#101014]/90 p-8 text-center ring-1 ring-white/10 backdrop-blur sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-violet-300/80">
          kochi.buzz
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
          404
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          This page isn&apos;t on the calendar. The buzz moved on — or the link
          never existed.
        </p>
        {next && (
          <Link
            href={`/e/${next.id}`}
            className="mt-6 block rounded-2xl bg-white/[0.04] px-4 py-3 text-left ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:ring-violet-400/40"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-300/80">
              Up next in Kochi tech
            </span>
            <span className="mt-1 block text-sm font-semibold text-white">
              {next.title}
            </span>
            <span className="mt-0.5 block text-xs text-white/50">
              {formatDateRange(next)} · {next.venue}, {next.city}
            </span>
          </Link>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-full bg-violet-500 px-5 py-2 font-semibold text-white transition hover:bg-violet-400"
          >
            Open the calendar
          </Link>
          <Link
            href="/digest"
            className="rounded-full bg-white/[0.06] px-5 py-2 font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white"
          >
            Next 30 days
          </Link>
        </div>
      </div>
    </main>
  );
}
