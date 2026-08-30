import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import SaveToBuzzButton from "@/components/SaveToBuzzButton";
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

function getSupportLine(opportunity: (typeof opportunities)[number]): string {
  return opportunity.benefit ?? opportunity.summary;
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
      density="compact"
      title={<>Opportunities worth a shot</>}
      intro={`${open.length} open programs, grants, fellowships and hackathons — ordered by deadline.`}
      submitLabel="Submit an opportunity"
    >
      {open.length === 0 ? (
        <p className="border-t border-white/10 pt-6 text-sm text-white/50">
          Nothing open right now.
        </p>
      ) : (
        <ul className="border-b border-white/10">
          {open.map((opportunity) => {
            const days =
              opportunity.deadlineAt && !opportunity.ongoing
                ? daysBetween(todayIso, opportunity.deadlineAt)
                : undefined;
            const closingSoon = days !== undefined && days <= CLOSING_SOON_DAYS;
            const deadlineTone =
              days === 0
                ? "border-[var(--ember)]/35 bg-[var(--ember)]/10 text-[var(--ember)]"
                : closingSoon
                  ? "border-amber-300/25 bg-amber-300/[0.07] text-amber-200"
                  : opportunity.ongoing || !opportunity.deadlineAt
                    ? "border-[var(--signal)]/20 bg-[var(--signal)]/[0.06] text-[var(--signal)]"
                    : "border-white/10 bg-white/[0.025] text-white/82";
            return (
              <li
                key={opportunity.id}
                id={opportunity.id}
                className="flex items-start gap-2 border-t border-white/10 transition-colors hover:bg-white/[0.018] sm:gap-4"
              >
                <a
                  href={opportunity.applicationUrl ?? opportunity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-w-0 flex-1 gap-3 py-4 pl-1 sm:gap-5 sm:py-5 sm:pl-2"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border text-center sm:h-14 sm:w-14 ${deadlineTone}`}
                  >
                    {opportunity.ongoing || !opportunity.deadlineAt ? (
                      <>
                        <span className="text-sm font-bold leading-none">
                          {opportunity.ongoing ? "Open" : "TBA"}
                        </span>
                        <span className="mt-1 font-[family-name:var(--font-geist-mono)] text-[8px] font-semibold uppercase tracking-[0.12em] opacity-70">
                          {opportunity.ongoing ? "rolling" : "date"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="block text-lg font-bold leading-none tabular-nums sm:text-xl"
                        >
                          {days}
                        </span>
                        <span className="mt-1 block font-[family-name:var(--font-geist-mono)] text-[8px] font-semibold uppercase tracking-[0.1em] opacity-70">
                          {days === 0 ? "today" : days === 1 ? "day left" : "days left"}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.18em] text-amber-200/75 sm:text-[10px]">
                      {opportunityTypeLabels[opportunity.type]}
                    </p>
                    <h2 className="mt-1 text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-[var(--signal)] sm:text-base">
                      {opportunity.title}
                    </h2>
                    <p className="mt-1 truncate text-xs font-medium text-white/48">
                      {opportunity.organization}
                    </p>
                    <p className="mt-2 line-clamp-1 text-[13px] leading-relaxed text-white/62 sm:text-sm">
                      {getSupportLine(opportunity)}
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[9px] font-medium uppercase tracking-[0.08em] text-white/42 sm:text-[10px]">
                      {opportunity.deadlineAt && !opportunity.ongoing
                        ? `Closes ${formatDeadline(opportunity.deadlineAt)}`
                        : opportunity.ongoing
                          ? "Applications accepted on a rolling basis"
                          : "Deadline to be announced"}
                    </p>
                  </div>
                </a>
                <SaveToBuzzButton
                  compact
                  className="mt-4 h-10 min-h-10 w-[4.5rem] shrink-0 self-start rounded-full px-3 py-1 text-[11px] sm:mt-5"
                  item={{
                    id: `opportunity:${opportunity.id}`,
                    kind: "opportunity",
                    eyebrow: `${opportunityTypeLabels[opportunity.type]} · ${opportunity.ongoing || !opportunity.deadlineAt ? "Rolling" : `${days} days left`}`,
                    title: opportunity.title,
                    detail: opportunity.summary,
                    meta: opportunity.organization,
                    href: opportunity.applicationUrl ?? opportunity.url,
                    external: true,
                    trackLabel: "Move your work",
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}

      {closed.length > 0 && (
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-white/48">
            Recently closed
          </h2>
          <ul className="mt-3 border-b border-white/[0.06]">
            {closed.map((opportunity) => (
              <li
                key={opportunity.id}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-white/[0.06] py-3 text-sm text-white/52"
              >
                <span className="font-medium">{opportunity.title}</span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.08em] text-white/35">
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
