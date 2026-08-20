import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import LiveClock from "@/components/LiveClock";
import { ProjectCover, identityColors } from "@/components/signal";
import { categoryById, events } from "@/data/events";
import { communityDirectory, spaces } from "@/data/directory";
import { jobs, opportunityTypeLabels } from "@/data/dataset";
import {
  MONTHS,
  WEEKDAYS_LONG,
  countdownLabel,
  formatDateRange,
  formatTimeRange,
  parseDate,
  toISODate,
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
import { monogram } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Kochi Buzz — The city, tuned in",
  description:
    "Your live guide to events, jobs, opportunities, communities and things being built across Kochi.",
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
  const dateLabel = `${WEEKDAYS_LONG[today.getDay()]}, ${today.getDate()} ${MONTHS[today.getMonth()]}`;
  const buzz = buildBuzz(today, 7);
  const happeningToday = eventsToday(today);
  const week = eventsThisWeek(today).filter((event) => !happeningToday.includes(event));
  const nextUp =
    happeningToday[0] ??
    events
      .filter((event) => event.start > todayIso)
      .sort((a, b) => a.start.localeCompare(b.start))[0];
  const closing = closingSoon(today);
  const open = openOpportunities(today);
  const freshJobs = newJobs(today).slice(0, 5);
  const built = featuredProjects().slice(0, 4);

  const metrics = [
    {
      kicker: "On the radar",
      value: happeningToday.length + week.length,
      label: "events this week",
      href: "/events",
      tone: "lime",
    },
    {
      kicker: "Work here",
      value: jobs.length,
      label: "open roles",
      href: "/jobs",
      tone: "coral",
    },
    {
      kicker: "Doors open",
      value: open.length,
      label: "opportunities",
      href: "/opportunities",
      tone: "cyan",
    },
    {
      kicker: "City network",
      value: communityDirectory.length,
      label: "active communities",
      href: "/communities",
      tone: "violet",
    },
  ];

  return (
    <SiteShell current="/" fullBleed>
      <section className="buzz-hero overflow-hidden">
        <div className="buzz-orbit buzz-orbit--one" aria-hidden />
        <div className="buzz-orbit buzz-orbit--two" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-[1280px] gap-10 px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-12 lg:pb-20 lg:pt-16">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.24em] text-white/55">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5">
                <span className="signal-dot signal-dot--pulse" aria-hidden />
                Kochi, live
              </span>
              <span>{dateLabel}</span>
              <LiveClock />
            </div>

            <h1 className="font-display mt-8 max-w-[720px] text-[clamp(4rem,9vw,7.5rem)] font-semibold leading-[0.82] tracking-[-0.065em] text-white">
              The city,
              <br />
              <span className="relative inline-block text-[var(--signal)]">
                tuned in.
                <span className="buzz-scribble" aria-hidden />
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/68 sm:text-lg">
              Kochi Buzz catches the useful signals before they pass you by—what’s
              on, who’s hiring, doors that are opening, and the people building the
              city’s next chapter.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events" className="buzz-button buzz-button--primary">
                See what&apos;s on
                <span aria-hidden>↗</span>
              </Link>
              <Link href="/digest" className="buzz-button buzz-button--ghost">
                Get the 30-day view
                <span aria-hidden>→</span>
              </Link>
            </div>

            <nav aria-label="Quick city links" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {[
                ["Events", "/events"],
                ["Jobs", "/jobs"],
                ["Communities", "/communities"],
                ["Built here", "/built"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="group inline-flex items-center gap-2 text-xs font-semibold text-white/55 transition hover:text-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--coral)] transition-transform group-hover:scale-150" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="relative min-h-[440px] sm:min-h-[590px] lg:min-h-[660px]">
            <div className="buzz-art-frame absolute inset-0 overflow-hidden">
              <Image
                src="/images/kochi-city-frequency.webp"
                alt="Editorial illustration of Kochi’s ferries, metro, port, communities and creative work connected by a flowing city frequency"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-[61%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b12]/45 via-transparent to-transparent" />
            </div>
            <div className="absolute -left-2 top-8 rotate-[-5deg] rounded-full bg-[var(--paper)] px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--paper-ink)] shadow-xl sm:left-2">
              City frequency 09.93°N
            </div>
            <div className="absolute bottom-6 right-2 max-w-[220px] rounded-2xl border border-white/15 bg-[#0b0b12]/80 p-4 shadow-2xl backdrop-blur-md sm:bottom-8 sm:right-5">
              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.24em] text-[var(--signal)]">
                The daily promise
              </p>
              <p className="mt-2 text-sm leading-snug text-white/80">
                No fake hype. Just the most useful things moving through Kochi.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Kochi Buzz at a glance" className="relative z-10 -mt-1 border-y border-black/10 bg-[var(--paper)] text-[var(--paper-ink)]">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Link
              key={metric.kicker}
              href={metric.href}
              className={`buzz-metric buzz-metric--${metric.tone} group border-black/10 px-1 py-6 sm:px-5 sm:py-8`}
            >
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.2em] opacity-55">
                {metric.kicker}
              </span>
              <span className="mt-3 flex items-end gap-2">
                <strong className="font-display text-4xl leading-none sm:text-5xl">{metric.value}</strong>
                <span className="mb-1 max-w-[90px] text-[11px] font-semibold leading-tight opacity-60 sm:text-xs">
                  {metric.label}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {nextUp && (
        <section className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionLead
            eyebrow="Start here"
            title="Your next good reason to step out."
            href="/events"
            linkLabel="Open the calendar"
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
            <Link
              href={`/events/${nextUp.id}`}
              className="event-spotlight group relative min-h-[390px] overflow-hidden rounded-[2rem] p-6 sm:min-h-[460px] sm:p-10"
            >
              <div className="event-spotlight__rings" aria-hidden />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <span className="rounded-full bg-[var(--paper-ink)] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--paper)]">
                    {happeningToday.includes(nextUp) ? "Happening today" : "Next signal"}
                  </span>
                  <span className="text-right font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                    {categoryById.get(nextUp.category)?.label}
                    <br />
                    {countdownLabel(nextUp, today)}
                  </span>
                </div>

                <div className="mt-20">
                  <div className="flex items-end gap-3">
                    <span className="font-display text-[6.5rem] font-semibold leading-[0.7] tracking-[-0.06em] sm:text-[9rem]">
                      {parseDate(nextUp.start).getDate()}
                    </span>
                    <span className="mb-1 font-[family-name:var(--font-geist-mono)] text-xs font-bold uppercase tracking-[0.3em] text-black/55">
                      {MONTHS[parseDate(nextUp.start).getMonth()].slice(0, 3)}
                    </span>
                  </div>
                  <h2 className="font-display mt-7 max-w-3xl text-3xl font-semibold leading-[0.95] tracking-[-0.035em] transition-transform duration-300 group-hover:translate-x-1 sm:text-5xl lg:text-6xl">
                    {nextUp.title}
                  </h2>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/20 pt-4 text-xs font-semibold text-black/60">
                    <span>{formatTimeRange(nextUp)} · {nextUp.venue}, {nextUp.city}</span>
                    <span className="text-base transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  number: happeningToday.length,
                  label: "happening today",
                  note: "See what still fits into your day.",
                  href: "/events",
                  color: "var(--lagoon)",
                },
                {
                  number: jobs.length,
                  label: "roles on the board",
                  note: "A cleaner route into Kochi tech work.",
                  href: "/jobs",
                  color: "var(--lavender)",
                },
                {
                  number: "30",
                  label: "days in one digest",
                  note: "Forward the useful bits to your people.",
                  href: "/digest",
                  color: "var(--coral)",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-[1.5rem] border border-white/10 p-5 transition hover:-translate-y-1 hover:border-white/25"
                  style={{ background: item.color, color: "#121212" }}
                >
                  <span className="font-display text-4xl font-semibold leading-none">{item.number}</span>
                  <h3 className="mt-3 text-sm font-bold">{item.label}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-black/60">{item.note}</p>
                  <span className="mt-4 inline-block text-sm transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {buzz.length > 0 && (
        <section className="bg-[var(--paper)] py-16 text-[var(--paper-ink)] sm:py-24">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
            <SectionLead
              dark
              eyebrow="Freshly picked up"
              title="The city wire"
              note="Built from public sources, never manufactured hype."
            />
            <ol className="mt-8 border-t border-black/15">
              {buzz.map((item, index) => {
                const row =
                  item.type === "job_new"
                    ? {
                        href: "/jobs",
                        status: item.label,
                        text:
                          item.jobs.length === 1
                            ? `${item.jobs[0].company} posted ${item.jobs[0].title}`
                            : `${item.jobs.length} new roles landed on the board`,
                        meta: "Jobs",
                        external: false,
                      }
                    : item.type === "opportunity_closing"
                      ? {
                          href: "/opportunities",
                          status: item.label,
                          text: `${item.opportunity.title} — ${item.opportunity.organization}`,
                          meta: "Opportunity",
                          external: false,
                        }
                      : item.type === "announcement"
                        ? {
                            href: item.announcement.url,
                            status: item.label,
                            text: item.announcement.title,
                            meta: "Announcement",
                            external: true,
                          }
                        : {
                            href: `/events/${item.event.id}`,
                            status: item.label,
                            text: item.event.title,
                            meta: `${formatDateRange(item.event)} · ${item.event.city}`,
                            external: false,
                          };
                const content = (
                  <>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.2em] text-black/45 sm:w-28">
                      {String(index + 1).padStart(2, "0")} · {row.status}
                    </span>
                    <span className="min-w-0 flex-1 text-base font-semibold leading-snug sm:text-lg">
                      {row.text}
                    </span>
                    <span className="text-xs text-black/45 sm:text-right">{row.meta}</span>
                    <span className="text-base transition-transform group-hover:translate-x-1" aria-hidden>↗</span>
                  </>
                );

                return (
                  <li key={`${row.href}-${index}`} className="border-b border-black/15">
                    {row.external ? (
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group grid gap-2 py-5 transition hover:bg-black/[0.035] sm:grid-cols-[7rem_1fr_14rem_1rem] sm:items-center sm:px-3"
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        href={row.href}
                        className="group grid gap-2 py-5 transition hover:bg-black/[0.035] sm:grid-cols-[7rem_1fr_14rem_1rem] sm:items-center sm:px-3"
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {week.length > 0 && (
        <section className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionLead
            eyebrow="Make a plan"
            title="This week in Kochi"
            href="/events"
            linkLabel="Full calendar"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {week.slice(0, 3).map((event, index) => {
              const start = parseDate(event.start);
              const tones = ["var(--lagoon)", "var(--lavender)", "var(--paper)"];
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="week-card group flex min-h-[310px] flex-col rounded-[1.7rem] p-6 text-[var(--paper-ink)] transition hover:-translate-y-1"
                  style={{ background: tones[index % tones.length] }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.2em] text-black/50">
                      {WEEKDAYS_LONG[start.getDay()]} · {categoryById.get(event.category)?.label}
                    </span>
                    <span className="rounded-full border border-black/20 px-2.5 py-1 text-[10px] font-bold">
                      {countdownLabel(event, today)}
                    </span>
                  </div>
                  <div className="mt-auto">
                    <div className="font-display text-6xl font-semibold leading-none">{start.getDate()}</div>
                    <div className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.25em] text-black/50">
                      {MONTHS[start.getMonth()]}
                    </div>
                    <h3 className="font-display mt-6 text-2xl font-semibold leading-tight tracking-tight">
                      {event.title}
                    </h3>
                    <p className="mt-3 border-t border-black/15 pt-3 text-xs leading-relaxed text-black/55">
                      {formatTimeRange(event)} · {event.venue}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="border-y border-white/10 bg-[var(--surface)] py-16 sm:py-24">
        <div className="mx-auto grid w-full max-w-[1280px] gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionLead
              eyebrow={closing.length > 0 ? "Time-sensitive" : "Doors open"}
              title={closing.length > 0 ? "Before the window closes" : "Worth a closer look"}
              href="/opportunities"
              linkLabel="All opportunities"
            />
            <div className="mt-7 grid gap-3">
              {(closing.length > 0 ? closing : open.slice(0, 4)).slice(0, 4).map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href="/opportunities"
                  className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[var(--signal)]/50 hover:bg-white/[0.06]"
                >
                  <div className="text-center">
                    {opportunity.ongoing || !opportunity.deadlineAt ? (
                      <span className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-wider text-[var(--signal)]">Rolling</span>
                    ) : (
                      <>
                        <span className="font-display block text-3xl font-semibold text-[var(--signal)]">
                          {Math.max(0, daysBetween(todayIso, opportunity.deadlineAt))}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40">days left</span>
                      </>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.18em] text-white/35">
                      {opportunityTypeLabels[opportunity.type]}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-white transition group-hover:text-[var(--signal)]">
                      {opportunity.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/40">{opportunity.organization}</p>
                  </div>
                  <span className="text-white/35 transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <SectionLead
              eyebrow="Work here"
              title="Kochi is hiring"
              href="/jobs"
              linkLabel={`See all ${jobs.length} roles`}
            />
            <ol className="mt-7 border-t border-white/10">
              {(freshJobs.length > 0 ? freshJobs : jobs.slice(0, 5)).map((job, index) => (
                <li key={job.id} className="border-b border-white/10">
                  <a
                    href={job.detailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-4"
                  >
                    <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-white/30">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white transition group-hover:text-[var(--signal)]">
                        {job.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-white/40">{job.company}</span>
                    </span>
                    {isNew(job.firstSeenAt, todayIso) ? (
                      <span className="rounded-full bg-[var(--coral)] px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-wider text-black">New</span>
                    ) : (
                      <span className="text-white/30" aria-hidden>↗</span>
                    )}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {built.length > 0 && (
        <section className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
          <SectionLead
            eyebrow="Made nearby"
            title="Built in Kochi"
            href="/built"
            linkLabel="Meet the makers"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {built.map((project, index) => (
              <Link
                key={project.id}
                href={`/built#${project.id}`}
                className={`built-card group overflow-hidden rounded-[1.6rem] border border-white/10 ${index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <ProjectCover name={project.name} className="h-36 w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="p-5">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.2em] text-white/35">Built here · {String(index + 1).padStart(2, "0")}</p>
                  <h3 className="font-display mt-3 text-2xl font-semibold text-white transition group-hover:text-[var(--signal)]">{project.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/48">{project.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto grid w-full max-w-[1280px] gap-5 px-4 pb-16 sm:px-6 sm:pb-24 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-[var(--lagoon)] p-6 text-[var(--paper-ink)] sm:p-8">
          <SectionLead dark eyebrow="Find your people" title="The crews" href="/communities" linkLabel="All communities" />
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {communityDirectory.slice(0, 6).map((community) => {
              const colors = identityColors(community.name);
              return (
                <li key={community.slug}>
                  <Link href={`/communities/${community.slug}`} className="group flex items-center gap-3 rounded-xl bg-black/[0.06] p-3 transition hover:bg-black/[0.1]">
                    <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[10px] font-bold" style={{ background: colors.bg, color: colors.fg }}>
                      {monogram(community.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{community.name}</span>
                      <span className="block text-[10px] text-black/50">{community.focus}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-[2rem] bg-[var(--lavender)] p-6 text-[var(--paper-ink)] sm:p-8">
          <SectionLead dark eyebrow="Go somewhere" title="Places to build" href="/places" linkLabel="All places" />
          <ul className="mt-7">
            {spaces.slice(0, 6).map((space, index) => (
              <li key={space.name} className="border-t border-black/15 first:border-0">
                <Link href="/places" className="group flex items-center gap-3 py-3.5">
                  <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-black/35">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-bold">{space.name}</span>
                  <span className="ml-auto text-[10px] text-black/45">{space.area}</span>
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 sm:pb-12">
        <div className="digest-poster relative mx-auto flex min-h-[430px] w-full max-w-[1280px] flex-col justify-between overflow-hidden rounded-[2.2rem] p-6 text-[var(--paper-ink)] sm:p-10 lg:flex-row lg:items-end">
          <div className="digest-poster__type" aria-hidden>BUZZ</div>
          <div className="relative z-10 max-w-xl">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.25em] text-black/55">Make it a ritual</p>
            <h2 className="font-display mt-4 text-5xl font-semibold leading-[0.9] tracking-[-0.05em] sm:text-7xl">One clean list.<br />Every useful signal.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-black/60 sm:text-base">The next 7 or 30 days, ready to scan, save, or drop straight into your WhatsApp and Slack groups.</p>
          </div>
          <div className="relative z-10 mt-10 flex flex-wrap gap-3 lg:mt-0 lg:justify-end">
            <Link href="/digest" className="buzz-button buzz-button--dark">Open the digest <span aria-hidden>→</span></Link>
            <a href="/calendar.ics" className="buzz-button buzz-button--paper">Add the calendar <span aria-hidden>↓</span></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function SectionLead({
  eyebrow,
  title,
  href,
  linkLabel,
  note,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
  note?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className={`font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.25em] ${dark ? "text-black/45" : "text-[var(--signal)]"}`}>
          {eyebrow}
        </p>
        <h2 className={`font-display mt-3 text-3xl font-semibold leading-none tracking-[-0.035em] sm:text-5xl ${dark ? "text-[var(--paper-ink)]" : "text-white"}`}>
          {title}
        </h2>
        {note && <p className={`mt-3 text-xs ${dark ? "text-black/45" : "text-white/40"}`}>{note}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className={`group inline-flex items-center gap-2 text-xs font-bold ${dark ? "text-black/55 hover:text-black" : "text-white/50 hover:text-white"}`}>
          {linkLabel}
          <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
