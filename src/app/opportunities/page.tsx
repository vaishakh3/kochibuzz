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
      title={<>Opportunities worth a shot</>}
      intro="Hackathons, grants, fellowships, accelerator intakes and programs relevant to Kochi's ecosystem — each with its deadline and original source."
      submitLabel="Submit an opportunity"
    >
      {open.length === 0 ? (
        <p className="border-t border-white/10 pt-6 text-sm text-white/50">
          Nothing open right now.
        </p>
      ) : (
        <ul>
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
                  className="group flex h-full gap-5 border-t border-white/10 py-6 transition hover:bg-white/[0.02]"
                >
                  {/* Deadline is the signal */}
                  <div className="w-20 shrink-0 text-center">
                    {opportunity.ongoing || !opportunity.deadlineAt ? (
                      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/72">
                        {opportunity.ongoing ? "Rolling" : "TBA"}
                      </span>
                    ) : (
                      <>
                        <span
                          className={[
                            "font-display block text-4xl font-semibold leading-none",
                            days === 0
                              ? "text-[var(--ember)]"
                              : closingSoon
                                ? "text-amber-300"
                                : "text-[var(--signal)]",
                          ].join(" ")}
                        >
                          {days}
                        </span>
                        <span className="font-[family-name:var(--font-geist-mono)] mt-1 block text-[10px] uppercase tracking-wider text-white/72">
                          {days === 0 ? "closes today" : days === 1 ? "day left" : "days left"}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/70">
                      {opportunityTypeLabels[opportunity.type]}
                    </p>
                    <h2 className="mt-1 text-[17px] font-semibold text-white group-hover:text-[var(--signal)]">
                      {opportunity.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-white/50">
                      {opportunity.organization}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                      {opportunity.summary}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/72">
                      {opportunity.deadlineAt && !opportunity.ongoing && (
                        <span>Deadline: {formatDeadline(opportunity.deadlineAt)}</span>
                      )}
                      {opportunity.benefit && <span>{opportunity.benefit}</span>}
                      <span className="font-medium text-white/60 transition group-hover:text-[var(--signal)]">
                        {opportunity.applicationUrl ? "Apply" : "Details"} →
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {closed.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/65">
            Recently closed
          </h2>
          <ul className="mt-3 space-y-1.5">
            {closed.map((opportunity) => (
              <li
                key={opportunity.id}
                className="flex flex-wrap items-baseline gap-x-3 border-t border-white/[0.06] py-2.5 text-sm text-white/70"
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
