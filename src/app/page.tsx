import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import { categoryById, events } from "@/data/events";
import {
  jobCategoryLabels,
  jobs,
  opportunityTypeLabels,
} from "@/data/dataset";
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

export const metadata: Metadata = {
  title: "kochi.buzz — Kochi is buzzing. Know what's next.",
  description:
    "Events, opportunities, jobs, communities and things being built around Kochi's tech ecosystem — in one live layer.",
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
  const todayLabel = `${WEEKDAYS_LONG[today.getDay()]}, ${today.getDate()} ${MONTHS[today.getMonth()]}`;

  const buzz = buildBuzz(today, 8);
  const happeningToday = eventsToday(today);
  const week = eventsThisWeek(today).filter((ev) => !happeningToday.includes(ev));
  const nextUp = events
    .filter((ev) => ev.start > todayIso)
    .sort((a, b) => a.start.localeCompare(b.start))[0];
  const closing = closingSoon(today);
  const open = openOpportunities(today).slice(0, 4);
  const freshJobs = newJobs(today).slice(0, 5);
  const built = featuredProjects().slice(0, 4);

  return (
    <SiteShell current="/">
      {/* Hero */}
      <section className="relative">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-white/40">
          {todayLabel} · Kochi, Kerala
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
          Kochi is buzzing.
          <br />
          <span className="ink-violet">Know what&apos;s next.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
          Events, opportunities, jobs, communities and things being built around
          Kochi&apos;s tech ecosystem — tracked from public sources, refreshed
          automatically.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/events"
            className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Open the calendar
          </Link>
          <Link
            href="/digest"
            className="rounded-full bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white"
          >
            Get the digest
          </Link>
        </div>
      </section>

      {/* Happening today / next */}
      {(happeningToday.length > 0 || nextUp) && (
        <section className="mt-12">
          <SectionHead
            kicker={happeningToday.length > 0 ? "Happening today" : "Happening next"}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(happeningToday.length > 0 ? happeningToday : nextUp ? [nextUp] : []).map(
              (event) => {
                const category = categoryById.get(event.category)!;
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.07] hover:ring-violet-400/40"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${category.chip}`}
                      >
                        {category.label}
                      </span>
                      <span className="text-[11px] font-semibold text-white/50">
                        {countdownLabel(event, today)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-violet-200">
                      {event.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-white/50">
                      {formatDateRange(event)} · {formatTimeRange(event)}
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {event.venue}, {event.city}
                    </p>
                  </Link>
                );
              },
            )}
          </div>
        </section>
      )}

      {/* The Buzz */}
      {buzz.length > 0 && (
        <section className="mt-12">
          <SectionHead kicker="The buzz" note="Generated from the data — no fake hype" />
          <ol className="mt-4 space-y-2">
            {buzz.map((item, index) => (
              <li key={index}>
                {item.type === "job_new" ? (
                  <Link
                    href="/jobs"
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
                  >
                    <BuzzTag label={item.label} tone="teal" />
                    <span className="text-sm text-white/80">
                      {item.jobs.length === 1
                        ? `${item.jobs[0].company} posted ${item.jobs[0].title}`
                        : `${item.jobs.length} new openings at Infopark companies`}
                    </span>
                  </Link>
                ) : item.type === "opportunity_closing" ? (
                  <Link
                    href="/opportunities"
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
                  >
                    <BuzzTag label={item.label} tone="amber" />
                    <span className="text-sm text-white/80">
                      {item.opportunity.title} — {item.opportunity.organization}
                    </span>
                  </Link>
                ) : item.type === "announcement" ? (
                  <a
                    href={item.announcement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
                  >
                    <BuzzTag label={item.label} tone="violet" />
                    <span className="text-sm text-white/80">
                      {item.announcement.title}
                    </span>
                  </a>
                ) : (
                  <Link
                    href={`/events/${item.event.id}`}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
                  >
                    <BuzzTag
                      label={item.label}
                      tone={item.type === "event_today" ? "amber" : "violet"}
                    />
                    <span className="text-sm text-white/80">{item.event.title}</span>
                    <span className="text-xs text-white/40">
                      {formatDateRange(item.event)} · {item.event.city}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* This week */}
      {week.length > 0 && (
        <section className="mt-12">
          <SectionHead kicker="This week" href="/events" linkLabel="Full calendar" />
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {week.map((event) => {
              const start = parseDate(event.start);
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="group flex items-center gap-4 py-3"
                  >
                    <span className="grid w-11 shrink-0 place-items-center rounded-xl bg-white/[0.05] py-1.5 ring-1 ring-white/10">
                      <span className="text-sm font-bold leading-none text-white">
                        {start.getDate()}
                      </span>
                      <span className="mt-0.5 text-[9px] uppercase text-white/40">
                        {MONTHS[start.getMonth()].slice(0, 3)}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white group-hover:text-violet-200">
                        {event.title}
                      </span>
                      <span className="block text-xs text-white/45">
                        {formatTimeRange(event)} · {event.venue}, {event.city}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Opportunities */}
      {(closing.length > 0 || open.length > 0) && (
        <section className="mt-12">
          <SectionHead
            kicker={closing.length > 0 ? "Closing soon" : "Open opportunities"}
            href="/opportunities"
            linkLabel="All opportunities"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(closing.length > 0 ? closing : open).map((opportunity) => (
              <Link
                key={opportunity.id}
                href="/opportunities"
                className="group rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200 ring-1 ring-amber-300/25">
                    {opportunityTypeLabels[opportunity.type]}
                  </span>
                  {opportunity.deadlineAt && !opportunity.ongoing && (
                    <span className="text-[11px] text-white/45">
                      {deadlineLabel(todayIso, opportunity.deadlineAt)}
                    </span>
                  )}
                  {opportunity.ongoing && (
                    <span className="text-[11px] text-white/45">Rolling</span>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white group-hover:text-amber-100">
                  {opportunity.title}
                </h3>
                <p className="mt-1 text-xs text-white/45">
                  {opportunity.organization}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New jobs */}
      {jobs.length > 0 && (
        <section className="mt-12">
          <SectionHead
            kicker={freshJobs.length > 0 ? "New jobs" : "Hiring in Kochi"}
            href="/jobs"
            linkLabel={`All ${jobs.length} openings`}
          />
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {(freshJobs.length > 0 ? freshJobs : jobs.slice(0, 5)).map((job) => (
              <li key={job.id}>
                <a
                  href={job.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-3"
                >
                  <span className="text-sm font-semibold text-white group-hover:text-teal-200">
                    {job.title}
                  </span>
                  <span className="text-xs text-white/45">{job.company}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-white/35">
                    {jobCategoryLabels[job.category]}
                    {isNew(job.firstSeenAt, todayIso) ? " · New" : ""}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Built in Kochi */}
      {built.length > 0 && (
        <section className="mt-12">
          <SectionHead kicker="Built in Kochi" href="/built" linkLabel="See all" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {built.map((project) => (
              <Link
                key={project.id}
                href={`/built#${project.id}`}
                className="group rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition hover:bg-white/[0.07]"
              >
                <h3 className="text-sm font-semibold text-white group-hover:text-violet-200">
                  {project.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-white/50">
                  {project.tagline}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Communities + places */}
      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        <div>
          <SectionHead kicker="Communities" href="/communities" linkLabel="All crews" />
          <ul className="mt-4 space-y-1.5">
            {communityDirectory.slice(0, 5).map((community) => (
              <li key={community.slug}>
                <Link
                  href={`/communities/${community.slug}`}
                  className="block rounded-xl px-3 py-2 text-sm text-white/70 ring-1 ring-transparent transition hover:bg-white/[0.05] hover:text-white hover:ring-white/10"
                >
                  {community.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHead kicker="Places" href="/places" linkLabel="All places" />
          <ul className="mt-4 space-y-1.5">
            {spaces.slice(0, 5).map((space) => (
              <li key={space.name}>
                <Link
                  href="/places"
                  className="block rounded-xl px-3 py-2 text-sm text-white/70 ring-1 ring-transparent transition hover:bg-white/[0.05] hover:text-white hover:ring-white/10"
                >
                  {space.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Digest CTA */}
      <section className="mt-12 rounded-3xl bg-gradient-to-br from-amber-400/[0.08] to-transparent p-6 ring-1 ring-amber-300/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Forward the buzz
            </h2>
            <p className="mt-1 max-w-md text-sm text-white/50">
              The next 7 and 30 days as one clean list, built to paste straight
              into a WhatsApp or Slack group.
            </p>
          </div>
          <Link
            href="/digest"
            className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
          >
            Open the digest →
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}

function deadlineLabel(todayIso: string, deadlineIso: string): string {
  const days = daysBetween(todayIso, deadlineIso);
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
}

function SectionHead({
  kicker,
  href,
  linkLabel,
  note,
}: {
  kicker: string;
  href?: string;
  linkLabel?: string;
  note?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300/80">
        {kicker}
      </h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="text-xs font-semibold text-white/45 transition hover:text-white"
        >
          {linkLabel} →
        </Link>
      )}
      {note && <span className="text-[10px] text-white/25">{note}</span>}
    </div>
  );
}

function BuzzTag({
  label,
  tone,
}: {
  label: string;
  tone: "violet" | "amber" | "teal";
}) {
  const tones = {
    violet: "bg-violet-400/10 text-violet-200 ring-violet-400/25",
    amber: "bg-amber-400/10 text-amber-200 ring-amber-300/25",
    teal: "bg-teal-400/10 text-teal-200 ring-teal-300/25",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
