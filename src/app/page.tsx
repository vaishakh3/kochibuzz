import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import LiveClock from "@/components/LiveClock";
import {
  CategoryPattern,
  CoordinateGrid,
  ProjectCover,
  SignalField,
  identityColors,
} from "@/components/signal";
import { categoryById, events } from "@/data/events";
import { jobs, opportunityTypeLabels } from "@/data/dataset";
import {
  MONTHS,
  WEEKDAYS_LONG,
  countdownLabel,
  formatDateRange,
  formatTimeRange,
  parseDate,
  todayInIST,
} from "@/lib/calendar";
import {
  buildBuzz,
  closingSoon,
  daysBetween,
  eventsThisWeek,
  eventsToday,
  featuredProjects,
  isNew,
  newJobs,
  openOpportunities,
} from "@/lib/buzz";
import { toISODate } from "@/lib/calendar";
import { communityDirectory, spaces } from "@/data/directory";
import { monogram } from "@/lib/identity";

export const metadata: Metadata = {
  title: "kochi.buzz — What's happening in Kochi tech",
  description:
    "Events, jobs, opportunities, communities and things being built across Kochi's technology ecosystem.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

type SearchParams = Promise<{ e?: string }>;

export default async function BuzzHome({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { e } = await searchParams;
  if (e) redirect(`/events?e=${encodeURIComponent(e)}`);

  const today = todayInIST();
  const todayIso = toISODate(today);
  const dateLabel = `${today.getDate()} ${MONTHS[today.getMonth()].slice(0, 3).toUpperCase()} ${today.getFullYear()}`;
  const weekdayLabel = WEEKDAYS_LONG[today.getDay()].toUpperCase();

  const buzz = buildBuzz(today, 8);
  const happeningToday = eventsToday(today);
  const week = eventsThisWeek(today).filter((ev) => !happeningToday.includes(ev));
  const nextUp =
    happeningToday[0] ??
    events
      .filter((ev) => ev.start > todayIso)
      .sort((a, b) => a.start.localeCompare(b.start))[0];
  const closing = closingSoon(today);
  const open = openOpportunities(today);
  const freshJobs = newJobs(today).slice(0, 5);
  const built = featuredProjects().slice(0, 4);

  const metrics = [
    { label: "Today", value: happeningToday.length, unit: "events", href: "/events" },
    {
      label: "This week",
      value: happeningToday.length + week.length,
      unit: "events",
      href: "/events",
    },
    { label: "Hiring", value: jobs.length, unit: "openings", href: "/jobs" },
    { label: "Open", value: open.length, unit: "opportunities", href: "/opportunities" },
  ];

  return (
    <SiteShell current="/" fullBleed>
      {/* Hero — the front page of the city's tech signal */}
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <CoordinateGrid className="absolute inset-0" />
        <SignalField className="absolute inset-x-0 bottom-0 hidden h-40 w-full text-white sm:block" />
        <div className="relative mx-auto w-full max-w-[1200px] px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.25em] text-white/45">
            <span>
              {weekdayLabel} · {dateLabel}
            </span>
            <LiveClock />
            <span className="hidden sm:inline">Kochi · 9.9312°N 76.2673°E</span>
          </div>
          <h1 className="font-display mt-6 text-[15vw] font-semibold leading-[0.95] tracking-tight text-white sm:text-8xl">
            Kochi is
            <br />
            buzzing<span className="text-[var(--signal)]">.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-white/60 sm:text-lg">
            Know what&apos;s next — events, jobs, opportunities and the people
            building Kochi&apos;s tech scene, tracked from public sources.
          </p>

          {/* Live metrics — typographic, no dashboard cards */}
          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {metrics.map((metric) => (
              <Link key={metric.label} href={metric.href} className="group">
                <dt className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em] text-white/40">
                  {metric.label}
                </dt>
                <dd className="mt-1 border-t border-[var(--line)] pt-2">
                  <span className="text-3xl font-semibold text-white transition group-hover:text-[var(--signal)]">
                    {metric.value}
                  </span>
                  <span className="ml-2 text-xs text-white/45">{metric.unit}</span>
                </dd>
              </Link>
            ))}
          </dl>
        </div>
      </section>

      {/* NEXT SIGNAL — poster block for the next event */}
      {nextUp && (
        <section className="border-b border-[var(--line)]">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
            <Link
              href={`/events/${nextUp.id}`}
              className="group relative block overflow-hidden py-10 sm:py-14"
            >
              <CategoryPattern
                category={nextUp.category}
                className="absolute inset-0 h-full w-full text-white"
              />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-12">
                <div className="shrink-0">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-[var(--signal)]">
                    {happeningToday.includes(nextUp) ? "Live now" : "Next signal"}
                  </p>
                  <p className="font-display mt-2 text-7xl font-semibold leading-none text-white sm:text-8xl">
                    {parseDate(nextUp.start).getDate()}
                  </p>
                  <p className="font-[family-name:var(--font-geist-mono)] mt-1 text-sm uppercase tracking-[0.3em] text-white/50">
                    {MONTHS[parseDate(nextUp.start).getMonth()].slice(0, 3)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white transition group-hover:text-[var(--signal)] sm:text-5xl">
                    {nextUp.title}
                  </h2>
                  <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-wider text-white/50">
                    {formatTimeRange(nextUp)} · {nextUp.venue}, {nextUp.city}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-wider text-white/35">
                    {categoryById.get(nextUp.category)!.label}
                  </p>
                </div>
                <p className="shrink-0 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.25em] text-white/55">
                  {countdownLabel(nextUp, today)}{" "}
                  <span aria-hidden className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        {/* THE WIRE — chronological live feed */}
        {buzz.length > 0 && (
          <section className="py-12">
            <SectionHeader title="The wire" note="Generated from the data — no fake hype" />
            <ol className="mt-6 border-l border-[var(--line)]">
              {buzz.map((item, index) => {
                const row =
                  item.type === "job_new"
                    ? {
                        href: "/jobs",
                        status: item.label,
                        text:
                          item.jobs.length === 1
                            ? `${item.jobs[0].company} posted ${item.jobs[0].title}`
                            : `${item.jobs.length} new openings at Infopark companies`,
                        meta: "",
                        external: false,
                      }
                    : item.type === "opportunity_closing"
                      ? {
                          href: "/opportunities",
                          status: item.label,
                          text: `${item.opportunity.title} — ${item.opportunity.organization}`,
                          meta: "",
                          external: false,
                        }
                      : item.type === "announcement"
                        ? {
                            href: item.announcement.url,
                            status: item.label,
                            text: item.announcement.title,
                            meta: "",
                            external: true,
                          }
                        : {
                            href: `/events/${item.event.id}`,
                            status: item.label,
                            text: item.event.title,
                            meta: `${formatDateRange(item.event)} · ${item.event.city}`,
                            external: false,
                          };
                const inner = (
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
                    <span className="w-28 shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-[var(--signal-dim)]">
                      {row.status}
                    </span>
                    <span className="min-w-0 text-sm text-white/85 transition group-hover:text-white">
                      {row.text}
                    </span>
                    {row.meta && (
                      <span className="text-xs text-white/40">{row.meta}</span>
                    )}
                  </span>
                );
                return (
                  <li key={index} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[3px] top-3.5 h-[5px] w-[5px] rounded-full bg-white/25"
                    />
                    {row.external ? (
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block py-2.5 pl-6 transition hover:bg-white/[0.03]"
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link
                        href={row.href}
                        className="group block py-2.5 pl-6 transition hover:bg-white/[0.03]"
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* THIS WEEK — agenda */}
        {week.length > 0 && (
          <section className="border-t border-[var(--line)] py-12">
            <SectionHeader title="This week" href="/events" linkLabel="Full calendar" />
            <ul className="mt-6">
              {week.map((event) => {
                const start = parseDate(event.start);
                return (
                  <li key={event.id} className="border-b border-[var(--line)] last:border-0">
                    <Link
                      href={`/events/${event.id}`}
                      className="group flex items-baseline gap-5 py-4"
                    >
                      <span className="w-16 shrink-0 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-wider text-white/45">
                        {WEEKDAYS_LONG[start.getDay()].slice(0, 3)}{" "}
                        {start.getDate()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-medium text-white transition group-hover:text-[var(--signal)]">
                          {event.title}
                        </span>
                        <span className="block text-xs text-white/45">
                          {formatTimeRange(event)} · {event.venue}, {event.city}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="hidden shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-[var(--signal)] sm:block"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* DOORS OPEN — deadline blocks */}
        {(closing.length > 0 || open.length > 0) && (
          <section className="border-t border-[var(--line)] py-12">
            <SectionHeader
              title={closing.length > 0 ? "Closing soon" : "Doors open"}
              href="/opportunities"
              linkLabel="All opportunities"
            />
            <div className="mt-6 grid gap-px overflow-hidden rounded-lg bg-[var(--line)] sm:grid-cols-2">
              {(closing.length > 0 ? closing : open.slice(0, 4)).map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href="/opportunities"
                  className="group flex items-start gap-5 bg-[var(--bg)] p-5 transition hover:bg-[var(--surface)]"
                >
                  <div className="w-16 shrink-0 text-center">
                    {opportunity.ongoing || !opportunity.deadlineAt ? (
                      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/45">
                        Rolling
                      </span>
                    ) : (
                      <>
                        <span className="font-display block text-3xl font-semibold text-[var(--signal)]">
                          {Math.max(0, daysBetween(todayIso, opportunity.deadlineAt))}
                        </span>
                        <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wider text-white/45">
                          days left
                        </span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/40">
                      {opportunityTypeLabels[opportunity.type]}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-white transition group-hover:text-[var(--signal)]">
                      {opportunity.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-white/45">
                      {opportunity.organization}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* HIRING */}
        {jobs.length > 0 && (
          <section className="border-t border-[var(--line)] py-12">
            <SectionHeader
              title="Hiring"
              href="/jobs"
              linkLabel={`All ${jobs.length} openings`}
            />
            <ul className="mt-6">
              {(freshJobs.length > 0 ? freshJobs : jobs.slice(0, 5)).map((job) => (
                <li key={job.id} className="border-b border-[var(--line)] last:border-0">
                  <a
                    href={job.detailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-3.5"
                  >
                    <span className="text-sm font-medium text-white transition group-hover:text-[var(--signal)]">
                      {job.title}
                    </span>
                    <span className="text-xs text-white/45">{job.company}</span>
                    {isNew(job.firstSeenAt, todayIso) && (
                      <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wider text-[var(--signal)]">
                        New
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* BUILT HERE — visual cards */}
        {built.length > 0 && (
          <section className="border-t border-[var(--line)] py-12">
            <SectionHeader title="Built here" href="/built" linkLabel="See all" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {built.map((project) => (
                <Link
                  key={project.id}
                  href={`/built#${project.id}`}
                  className="group overflow-hidden rounded-lg ring-1 ring-white/10 transition hover:ring-white/25"
                >
                  <ProjectCover name={project.name} className="h-24 w-full" />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white transition group-hover:text-[var(--signal)]">
                      {project.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">
                      {project.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* THE CREWS + PLACES */}
        <section className="grid gap-10 border-t border-[var(--line)] py-12 sm:grid-cols-2">
          <div>
            <SectionHeader title="The crews" href="/communities" linkLabel="All communities" />
            <ul className="mt-6 space-y-2.5">
              {communityDirectory.slice(0, 5).map((community) => {
                const colors = identityColors(community.name);
                return (
                  <li key={community.slug}>
                    <Link
                      href={`/communities/${community.slug}`}
                      className="group flex items-center gap-3"
                    >
                      <span
                        aria-hidden
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[10px] font-bold"
                        style={{ background: colors.bg, color: colors.fg }}
                      >
                        {monogram(community.name)}
                      </span>
                      <span className="text-sm text-white/75 transition group-hover:text-white">
                        {community.name}
                      </span>
                      <span className="ml-auto text-xs text-white/35">
                        {community.focus}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <SectionHeader title="Places to build" href="/places" linkLabel="All places" />
            <ul className="mt-6 space-y-2.5">
              {spaces.slice(0, 5).map((space) => (
                <li key={space.name}>
                  <Link href="/places" className="group flex items-baseline gap-3">
                    <span className="text-sm text-white/75 transition group-hover:text-white">
                      {space.name}
                    </span>
                    <span className="ml-auto shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/35">
                      {space.area}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Digest CTA — editorial */}
        <section className="border-t border-[var(--line)] py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/40">
                The digest
              </p>
              <h2 className="font-display mt-2 max-w-md text-3xl font-semibold leading-tight text-white">
                Forward the buzz to your group.
              </h2>
              <p className="mt-2 max-w-md text-sm text-white/50">
                The next 7 or 30 days as one clean list — built to paste
                straight into WhatsApp or Slack.
              </p>
            </div>
            <Link
              href="/digest"
              className="rounded-md bg-[var(--signal)] px-6 py-3 text-sm font-semibold text-[var(--signal-ink)] transition hover:opacity-90"
            >
              Open the digest →
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
  note,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  note?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="flex items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
        <span aria-hidden className="h-px w-6 bg-[var(--signal-dim)]" />
        {title}
      </h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="text-xs font-semibold text-white/45 transition hover:text-[var(--signal)]"
        >
          {linkLabel} →
        </Link>
      )}
      {note && <span className="text-[10px] text-white/25">{note}</span>}
    </div>
  );
}
