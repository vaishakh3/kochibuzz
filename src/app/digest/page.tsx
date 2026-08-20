import type { Metadata } from "next";
import Link from "next/link";
import DirectoryShell from "@/components/DirectoryShell";
import DigestView, { type DigestRange } from "@/components/DigestView";
import { categoryById } from "@/data/events";
import { opportunityTypeLabels } from "@/data/dataset";
import { closingSoon } from "@/lib/buzz";
import {
  MONTHS,
  addDays,
  countdownLabel,
  formatDateRange,
  formatTimeRange,
  parseDate,
  todayInIST,
} from "@/lib/calendar";
import { DIGEST_DAYS, digestEvents, digestText } from "@/lib/digest";

export const metadata: Metadata = {
  title: "The Buzz — kochi.buzz",
  description:
    "Everything happening in Kochi tech over the next 7 or 30 days, in one shareable bulletin. Copy it straight into your WhatsApp or Slack group.",
  alternates: { canonical: "/digest" },
};

export const revalidate = 3600;

function rangeLabel(days: number): string {
  const today = todayInIST();
  const to = addDays(today, days);
  return `${today.getDate()} ${MONTHS[today.getMonth()].slice(0, 3).toUpperCase()} → ${to.getDate()} ${MONTHS[to.getMonth()].slice(0, 3).toUpperCase()}`;
}

function buildRange(
  days: number,
  closing: { title: string; organization: string; deadlineAt: string }[],
): DigestRange {
  const today = todayInIST();
  const list = digestEvents(days);
  return {
    days,
    rangeLabel: rangeLabel(days),
    entries: list.map((event) => {
      const start = parseDate(event.start);
      return {
        id: event.id,
        title: event.title,
        day: start.getDate(),
        month: MONTHS[start.getMonth()].slice(0, 3),
        dateLabel: formatDateRange(event),
        timeLabel: formatTimeRange(event),
        category: categoryById.get(event.category)!.label,
        venue: event.venue,
        city: event.city,
        travel: Boolean(event.travel),
        countdown: countdownLabel(event, today),
      };
    }),
    text: digestText(list, days, closing),
  };
}

export default function DigestPage() {
  const today = todayInIST();
  const closing = closingSoon(today).map((o) => ({
    title: o.title,
    organization: o.organization,
    deadlineAt: o.deadlineAt!,
  }));

  const week = buildRange(7, closing);
  const month = buildRange(DIGEST_DAYS, closing);

  return (
    <DirectoryShell
      current="/digest"
      eyebrow="One bulletin, forwarded everywhere"
      accent="amber"
      title={<>The Buzz</>}
      intro="Everything on the Kochi tech calendar, as one printed-bulletin timeline — built to be pasted into a community group, not just browsed."
    >
      <DigestView week={week} month={month} />

      {closing.length > 0 && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/40">
            Closing soon
          </h2>
          <ul className="mt-3">
            {closingSoon(today).map((opportunity) => (
              <li key={opportunity.id} className="border-t border-white/[0.08]">
                <Link
                  href="/opportunities"
                  className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 transition hover:bg-white/[0.02]"
                >
                  <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-amber-300/80">
                    {opportunityTypeLabels[opportunity.type]}
                  </span>
                  <span className="text-sm font-semibold text-white transition group-hover:text-[var(--signal)]">
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
    </DirectoryShell>
  );
}
