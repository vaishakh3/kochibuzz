import type { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import DirectoryShell from "@/components/DirectoryShell";
import { categoryById } from "@/data/events";
import { countdownLabel, formatDateRange, formatTimeRange, todayInIST } from "@/lib/calendar";
import { DIGEST_DAYS, digestEvents, digestText } from "@/lib/digest";

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
  const text = digestText(list);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <DirectoryShell
      current="/digest"
      eyebrow="kochi.buzz"
      title={
        <>
          The next <span className="text-violet-400">30 days</span>
        </>
      }
      intro={`Everything on the Kochi tech calendar between today and ${DIGEST_DAYS} days from now — built to be pasted into a community group, not just browsed.`}
    >
      {list.length === 0 ? (
        <p className="rounded-3xl bg-white/[0.03] px-5 py-6 text-sm text-white/50 ring-1 ring-white/10">
          Nothing on the calendar for the next {DIGEST_DAYS} days yet.{" "}
          <Link href="/" className="text-violet-300 hover:text-white">
            Browse the full calendar →
          </Link>
        </p>
      ) : (
        <>
          <ol className="space-y-2.5">
            {list.map((event) => {
              const category = categoryById.get(event.category)!;
              return (
                <li key={event.id}>
                  <Link
                    href={`/?e=${event.id}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:ring-violet-400/40"
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

          <section className="mt-8 rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">
                Share this digest
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <CopyButton text={text} label="Copy as text" />
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
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-black/40 p-4 text-xs leading-relaxed text-white/60">
              {text}
            </pre>
          </section>
        </>
      )}
    </DirectoryShell>
  );
}
