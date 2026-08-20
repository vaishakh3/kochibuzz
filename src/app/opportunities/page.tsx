import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import { opportunities, opportunityTypeLabels } from "@/data/dataset";
import { daysBetween, CLOSING_SOON_DAYS } from "@/lib/buzz";
import { toISODate, todayInIST } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Opportunities — kochi.buzz",
  description:
    "Hackathons, grants, fellowships, accelerators and programs open to Kochi's tech ecosystem — with real deadlines and sources.",
  alternates: { canonical: "/opportunities" },
};

export const revalidate = 3600;

function formatDeadline(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OpportunitiesPage() {
  const todayIso = toISODate(todayInIST());
  const open = opportunities
    .filter((o) => o.ongoing || !o.deadlineAt || o.deadlineAt >= todayIso)
    .sort((a, b) => {
      if (a.deadlineAt && b.deadlineAt) return a.deadlineAt.localeCompare(b.deadlineAt);
      if (a.deadlineAt) return -1;
      if (b.deadlineAt) return 1;
      return a.title.localeCompare(b.title);
    });
  const closed = opportunities.filter(
    (o) => !o.ongoing && o.deadlineAt && o.deadlineAt < todayIso,
  );

  return (
    <DirectoryShell
      current="/opportunities"
      eyebrow="Doors currently open"
      accent="amber"
      watermark="OPEN"
      title={
        <>
          <span className="ink-amber">Opportunities</span> worth a shot
        </>
      }
      intro="Hackathons, grants, fellowships, accelerator intakes and programs relevant to Kochi's ecosystem — each with its deadline and original source."
    >
      {open.length === 0 ? (
        <p className="rounded-3xl bg-white/[0.03] px-5 py-6 text-sm text-white/50 ring-1 ring-white/10">
          Nothing open right now. Know something we&apos;re missing? Submit it
          from the footer below.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {open.map((opportunity) => {
            const days =
              opportunity.deadlineAt && !opportunity.ongoing
                ? daysBetween(todayIso, opportunity.deadlineAt)
                : undefined;
            const closingSoon = days !== undefined && days <= CLOSING_SOON_DAYS;
            return (
              <li key={opportunity.id} id={opportunity.id}>
                <a
                  href={opportunity.applicationUrl ?? opportunity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.06] hover:ring-amber-300/40"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-200 ring-1 ring-amber-300/25">
                      {opportunityTypeLabels[opportunity.type]}
                    </span>
                    {closingSoon && (
                      <span className="rounded-full bg-red-400/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-red-300 ring-1 ring-red-400/25">
                        {days === 0 ? "Closes today" : "Closing soon"}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-[17px] font-semibold text-white group-hover:text-amber-100">
                    {opportunity.title}
                  </h2>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-200/60">
                    {opportunity.organization}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
                    {opportunity.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
                    <span>
                      {opportunity.ongoing
                        ? "Rolling / ongoing"
                        : opportunity.deadlineAt
                          ? `Deadline: ${formatDeadline(opportunity.deadlineAt)}`
                          : "Deadline not announced"}
                    </span>
                    {opportunity.benefit && <span>· {opportunity.benefit}</span>}
                  </div>
                  <span className="mt-3 text-xs font-medium text-amber-300 transition group-hover:text-white">
                    {opportunity.applicationUrl ? "Apply" : "Details"} →
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {closed.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/30">
            Recently closed
          </h2>
          <ul className="mt-3 space-y-1.5">
            {closed.map((opportunity) => (
              <li
                key={opportunity.id}
                className="flex flex-wrap items-baseline gap-x-3 rounded-xl bg-white/[0.02] px-4 py-2.5 text-sm text-white/35 ring-1 ring-white/[0.06]"
              >
                <span>{opportunity.title}</span>
                <span className="text-xs">
                  closed {formatDeadline(opportunity.deadlineAt!)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </DirectoryShell>
  );
}
