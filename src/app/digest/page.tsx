import type { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import DirectoryShell from "@/components/DirectoryShell";
import { categoryById } from "@/data/events";
import {
  MONTHS,
  countdownLabel,
  formatDateRange,
  formatTimeRange,
  parseDate,
  todayInIST,
} from "@/lib/calendar";
import { DIGEST_DAYS, digestEvents, digestText } from "@/lib/digest";
import { closingSoon } from "@/lib/buzz";
import { opportunityTypeLabels } from "@/data/dataset";

export const metadata: Metadata = {
  title: "The next 30 days — kochi.buzz",
  description:
    "Everything happening in Kochi tech over the next 30 days, in one shareable list. Copy it straight into your WhatsApp or Slack group.",
  alternates: { canonical: "/digest" },
};

export const revalidate = 3600;

export default function DigestPage() {
  const today = todayInIST();
  const list = digestEvents();
  const closing = closingSoon(today);
  const text = digestText(
    list,
    DIGEST_DAYS,
    closing.map((o) => ({
      title: o.title,
      organization: o.organization,
      deadlineAt: o.deadlineAt!,
    })),
  );
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <DirectoryShell
      current="/digest"
      eyebrow="Transmission — every 30 days"
      accent="amber"
      watermark="WIRE"
      title={
        <>
          The next <span className="ink-amber">30 days</span>
        </>
      }
      intro={`Everything on the Kochi tech calendar between today and ${DIGEST_DAYS} days from now — built to be pasted into a community group, not just browsed.`}
    >
      {list.length === 0 ? (
        <p className="rounded-3xl bg-white/[0.03] px-5 py-6 text-sm text-white/50 ring-1 ring-white/10">
          Nothing on the calendar for the next {DIGEST_DAYS} days yet.{" "}
          <Link href="/" className="text-amber-300 hover:text-white">
            Browse the full calendar →
          </Link>
        </p>
      ) : (
        <>
          <ol className="relative space-y-4 pl-14 before:absolute before:bottom-3 before:left-[22px] before:top-3 before:w-px before:bg-gradient-to-b before:from-amber-300/50 before:via-white/15 before:to-transparent">
            {list.map((event) => {
              const category = categoryById.get(event.category)!;
              const start = parseDate(event.start);
              return (
                <li key={event.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-14 top-1/2 z-10 grid w-11 -translate-y-1/2 place-items-center rounded-xl bg-[#181410] py-1.5 ring-1 ring-amber-300/25"
                  >
                    <span className="text-sm font-bold leading-none text-amber-200">
                      {start.getDate()}
                    </span>
                    <span className="mt-0.5 text-[9px] uppercase text-amber-200/60">
                      {MONTHS[start.getMonth()].slice(0, 3)}
                    </span>
                  </span>
                  <Link
                    href={`/events/${event.id}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:ring-amber-300/40"
                  >
                    <span className="text-sm font-semibold text-white">
                      {event.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${category.chip}`}
                    >
                      {category.label}
                    </span>
                    {event.travel && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                        Outside Kochi
                      </span>
                    )}
                    <span className="w-full text-xs text-white/50 sm:w-auto">
                      {formatDateRange(event)} · {formatTimeRange(event)} ·{" "}
                      {event.venue}, {event.city}
                    </span>
                    <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/60 sm:ml-auto">
                      {countdownLabel(event, today)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          {closing.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300/80">
                Closing soon
              </h2>
              <ul className="mt-3 space-y-2">
                {closing.map((opportunity) => (
                  <li key={opportunity.id}>
                    <Link
                      href="/opportunities"
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:ring-amber-300/40"
                    >
                      <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200 ring-1 ring-amber-300/25">
                        {opportunityTypeLabels[opportunity.type]}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {opportunity.title}
                      </span>
                      <span className="text-xs text-white/50">
                        {opportunity.organization} · deadline {opportunity.deadlineAt}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8 rounded-3xl bg-gradient-to-br from-amber-400/[0.08] to-transparent p-5 ring-1 ring-amber-300/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">
                Share this digest
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <CopyButton
                  text={text}
                  label="Copy as text"
                  className="bg-amber-500 hover:bg-amber-400"
                />
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/[0.06] px-5 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white"
                >
                  Send on WhatsApp
                </a>
              </div>
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-black/40 p-4 text-xs leading-relaxed text-amber-100/60">
              {text}
            </pre>
          </section>
        </>
      )}
    </DirectoryShell>
  );
}
