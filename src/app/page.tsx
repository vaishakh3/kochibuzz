import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import BuzzReceiver, { type BuzzTrack } from "@/components/BuzzReceiver";
import { ArrowUpRightIcon } from "@/components/icons";
import LiveClock from "@/components/LiveClock";
import ProjectVisual from "@/components/ProjectVisual";
import SiteShell from "@/components/SiteShell";
import { identityColors } from "@/components/signal";
import { categoryById, events } from "@/data/events";
import { communityDirectory, spaces } from "@/data/directory";
import { jobCategoryLabels, jobs, opportunityTypeLabels } from "@/data/dataset";
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
  title: "Kochi Buzz — Kochi is on air",
  description:
    "Tune into Kochi: real events, people, jobs, opportunities and things being built across the city.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

type SearchParams = Promise<{ e?: string }>;

function kochiHour() {
  return Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
  );
}

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
  const hour = kochiHour();
  const daypart =
    hour < 6 ? "Kochi after dark" : hour < 12 ? "Good morning, Kochi" : hour < 17 ? "Kochi, between things" : hour < 22 ? "Good evening, Kochi" : "One last city scan";

  const happeningToday = eventsToday(today);
  const week = eventsThisWeek(today).filter((event) => !happeningToday.includes(event));
  const upcomingEvents = events
    .filter((event) => event.end >= todayIso)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 6);
  const nextUp = happeningToday[0] ?? upcomingEvents[0];
  const open = openOpportunities(today);
  const freshJobs = newJobs(today).slice(0, 6);
  const rolePicks = freshJobs.length > 0 ? freshJobs : jobs.slice(0, 6);
  const built = featuredProjects().slice(0, 4);
  const wire = buildBuzz(today, 7).slice(0, 7);
  const communityOffset = today.getDate() % Math.max(communityDirectory.length, 1);
  const featuredCommunities = [
    ...communityDirectory.slice(communityOffset),
    ...communityDirectory.slice(0, communityOffset),
  ].slice(0, 6);

  const goPicks: BuzzTrack["items"] = upcomingEvents.map((event) => ({
    id: `event:${event.id}`,
    kind: "event",
    eyebrow: `${countdownLabel(event, today)} · ${categoryById.get(event.category)?.label ?? "Event"}`,
    title: event.title,
    detail: event.blurb,
    meta: `${formatDateRange(event)} · ${formatTimeRange(event)} · ${event.venue}`,
    href: `/events/${event.id}`,
    calendarHref: `/e/${event.id}/event.ics`,
  }));
  const peoplePicks: BuzzTrack["items"] = [
    ...featuredCommunities.slice(0, 4).map((community) => ({
      id: `community:${community.slug}`,
      kind: "community" as const,
      eyebrow: `${community.focus} · ${community.cadence}`,
      title: community.name,
      detail: community.blurb,
      meta: "Kochi community · Local profile",
      href: `/communities/${community.slug}`,
    })),
    ...spaces.slice(0, 2).map((space) => ({
      id: `place:${space.name}`,
      kind: "place" as const,
      eyebrow: `${space.kind} · ${space.area}`,
      title: space.name,
      detail: space.blurb,
      meta: "Real place · Official website",
      href: space.url,
      external: true,
    })),
  ];
  const careerPicks: BuzzTrack["items"] = [
    ...rolePicks.slice(0, 4).map((job) => ({
      id: `job:${job.id}`,
      kind: "job" as const,
      eyebrow: `${jobCategoryLabels[job.category]} · ${isNew(job.firstSeenAt, todayIso) ? "New role" : "Open role"}`,
      title: job.title,
      detail: `${job.company} is hiring${job.location ? ` in ${job.location}` : " in the Kochi tech ecosystem"}.`,
      meta: `${job.company}${job.location ? ` · ${job.location}` : ""}`,
      href: job.detailUrl,
      external: true,
    })),
    ...open.slice(0, 2).map((opportunity) => ({
      id: `opportunity:${opportunity.id}`,
      kind: "opportunity" as const,
      eyebrow: `${opportunityTypeLabels[opportunity.type]} · ${opportunity.ongoing || !opportunity.deadlineAt ? "Rolling" : `${Math.max(0, daysBetween(todayIso, opportunity.deadlineAt))} days left`}`,
      title: opportunity.title,
      detail: opportunity.summary,
      meta: opportunity.organization,
      href: "/opportunities",
    })),
  ];
  const buildPicks: BuzzTrack["items"] = [
    ...built.map((project) => ({
      id: `project:${project.id}`,
      kind: "project" as const,
      eyebrow: project.categories.join(" · "),
      title: project.name,
      detail: project.description ?? project.tagline,
      meta: project.kochiConnection,
      href: `/built#${project.id}`,
    })),
    ...open
      .filter((opportunity) => ["hackathon", "grant", "accelerator", "bounty", "program"].includes(opportunity.type))
      .slice(0, 2)
      .map((opportunity) => ({
        id: `build-opportunity:${opportunity.id}`,
        kind: "opportunity" as const,
        eyebrow: `${opportunityTypeLabels[opportunity.type]} · Door open`,
        title: opportunity.title,
        detail: opportunity.summary,
        meta: opportunity.organization,
        href: "/opportunities",
      })),
  ];
  const receiverTracks: BuzzTrack[] = [
    { id: "go", label: "Go outside", shortLabel: "Outside", color: "#d7f24b", items: goPicks },
    { id: "people", label: "Find your people", shortLabel: "People", color: "#72dcc7", items: peoplePicks },
    { id: "career", label: "Move your work", shortLabel: "Work", color: "#c7b4ee", items: careerPicks },
    { id: "build", label: "Build something", shortLabel: "Build", color: "#ff6542", items: buildPicks },
  ].filter((track) => track.items.length > 0) as BuzzTrack[];

  const programmes = [
    nextUp && {
      cue: happeningToday.includes(nextUp) ? "Now" : "Next",
      number: "01",
      show: "The Open City",
      title: nextUp.title,
      meta: `${countdownLabel(nextUp, today)} · ${nextUp.venue}`,
      href: `/events/${nextUp.id}`,
      tone: "signal",
    },
    rolePicks[0] && {
      cue: "New work",
      number: "02",
      show: "The Career Frequency",
      title: rolePicks[0].title,
      meta: rolePicks[0].company,
      href: rolePicks[0].detailUrl,
      external: true,
      tone: "lavender",
    },
    open[0] && {
      cue: "Open line",
      number: "03",
      show: "Doors Worth Opening",
      title: open[0].title,
      meta: open[0].organization,
      href: "/opportunities",
      tone: "lagoon",
    },
    featuredCommunities[0] && {
      cue: "Meet",
      number: "04",
      show: "People of Kochi",
      title: featuredCommunities[0].name,
      meta: `${featuredCommunities[0].focus} · ${featuredCommunities[0].cadence}`,
      href: `/communities/${featuredCommunities[0].slug}`,
      tone: "coral",
    },
  ].filter(Boolean) as Array<{
    cue: string;
    number: string;
    show: string;
    title: string;
    meta: string;
    href: string;
    external?: boolean;
    tone: string;
  }>;

  return (
    <SiteShell current="/" fullBleed>
      <BuzzReceiver
        tracks={receiverTracks}
        dateLabel={dateLabel}
        daypart={daypart}
        scanCounts={{ events: happeningToday.length + week.length, jobs: jobs.length, doors: open.length }}
      />

      <section className="broadcast-programme" aria-labelledby="programme-title">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20">
          <div className="broadcast-section-head">
            <div>
              <p className="broadcast-label">Today’s transmission · <LiveClock /></p>
              <h2 id="programme-title" className="font-display">Four ways into the city.</h2>
            </div>
            <p>Short, useful and always connected to a real next step. No endless feed.</p>
          </div>

          <div className="programme-grid">
            {programmes.map((programme) => {
              const content = (
                <>
                  <div className="programme-card__top">
                    <span>{programme.number}</span>
                    <span className="programme-card__cue"><i aria-hidden />{programme.cue}</span>
                  </div>
                  <div className="programme-card__body">
                    <p>{programme.show}</p>
                    <h3 className="font-display">{programme.title}</h3>
                    <span>{programme.meta}</span>
                  </div>
                  <span className="programme-card__arrow" aria-hidden><ArrowUpRightIcon className="ui-arrow-up-right" /></span>
                </>
              );
              const className = `programme-card programme-card--${programme.tone}`;
              return programme.external ? (
                <a key={programme.number} href={programme.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
              ) : (
                <Link key={programme.number} href={programme.href} className={className}>{content}</Link>
              );
            })}
          </div>
        </div>
      </section>

      {wire.length > 0 && (
        <section className="city-tracklist" aria-labelledby="tracklist-title">
          <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="city-tracklist__intro">
              <p className="broadcast-label">The live tracklist</p>
              <h2 id="tracklist-title" className="font-display">What moved through Kochi this week.</h2>
              <p>Every line comes from a public source. Think of this as the city’s liner notes—not a popularity chart.</p>
              <div className="city-tracklist__stats" aria-label="Current Kochi Buzz totals">
                <Link href="/events"><strong>{happeningToday.length + week.length}</strong><span>events this week</span></Link>
                <Link href="/jobs"><strong>{jobs.length}</strong><span>open roles</span></Link>
                <Link href="/opportunities"><strong>{open.length}</strong><span>open doors</span></Link>
              </div>
            </div>

            <ol className="tracklist-lines">
              {wire.map((item, index) => {
                const row =
                  item.type === "job_new"
                    ? { href: "/jobs", status: item.label, text: item.jobs.length === 1 ? `${item.jobs[0].company} posted ${item.jobs[0].title}` : `${item.jobs.length} new roles landed`, meta: "Jobs", external: false }
                    : item.type === "opportunity_closing"
                      ? { href: "/opportunities", status: item.label, text: item.opportunity.title, meta: item.opportunity.organization, external: false }
                      : item.type === "announcement"
                        ? { href: item.announcement.url, status: item.label, text: item.announcement.title, meta: "Announcement", external: true }
                        : { href: `/events/${item.event.id}`, status: item.label, text: item.event.title, meta: `${formatDateRange(item.event)} · ${item.event.city}`, external: false };
                const content = (
                  <>
                    <span className="tracklist-lines__number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="tracklist-lines__signal"><small>{row.status}</small><strong>{row.text}</strong></span>
                    <span className="tracklist-lines__meta">{row.meta}</span>
                    <span className="tracklist-lines__arrow" aria-hidden><ArrowUpRightIcon className="ui-arrow-up-right" /></span>
                  </>
                );
                return (
                  <li key={`${row.href}-${index}`}>
                    {row.external ? <a href={row.href} target="_blank" rel="noopener noreferrer">{content}</a> : <Link href={row.href}>{content}</Link>}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      <section className="people-signal" aria-labelledby="people-title">
        <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
          <div className="broadcast-section-head broadcast-section-head--light">
            <div>
              <p className="broadcast-label">The signal is people</p>
              <h2 id="people-title" className="font-display">Don’t just hear about Kochi. Enter it.</h2>
            </div>
            <Link href="/communities" className="broadcast-text-link">Meet every community <span aria-hidden>→</span></Link>
          </div>
          <div className="people-stage">
            <figure className="people-portrait">
              <Image
                src="/images/broadcast/kochi-community-night.webp"
                alt="Editorial illustration of people meeting over chai, sharing a laptop, sketching ideas and building electronics in Kochi"
                fill
                sizes="(max-width: 1023px) 100vw, 66vw"
                className="people-portrait__image"
              />
              <figcaption className="people-portrait__caption">
                <div>
                  <span>Illustrated city portrait · Community frequency 01</span>
                  <strong className="font-display">Walk in curious.<br />Leave with people.</strong>
                </div>
                <p>Community life, imagined in the Kochi Buzz visual language.</p>
              </figcaption>
            </figure>

            <div className="people-directory" aria-label="Featured Kochi communities">
              <div className="people-directory__head">
                <p>Six doors open now</p>
                <span>Live directory picks</span>
              </div>
              {featuredCommunities.map((community, index) => {
                const colors = identityColors(community.name);
                return (
                  <Link key={community.slug} href={`/communities/${community.slug}`} className="people-card">
                    <span className="people-card__mark" style={{ background: colors.bg, color: colors.fg }}>{monogram(community.name)}</span>
                    <div>
                      <p>{community.focus}</p>
                      <h3 className="font-display">{community.name}</h3>
                      <span>{community.cadence}</span>
                    </div>
                    <span className="people-card__index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="people-card__arrow" aria-hidden><ArrowUpRightIcon className="ui-arrow-up-right" /></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {built.length > 0 && (
        <section className="made-here" aria-labelledby="made-title">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
            <div className="broadcast-section-head">
              <div>
                <p className="broadcast-label">Made on this frequency</p>
                <h2 id="made-title" className="font-display">Kochi builds back.</h2>
              </div>
              <Link href="/built" className="broadcast-text-link">See everything made here <span aria-hidden>→</span></Link>
            </div>
            <div className="made-grid">
              {built.map((project, index) => (
                <Link key={project.id} href={`/built#${project.id}`} className={`made-card ${index === 0 ? "made-card--lead" : ""}`}>
                  <ProjectVisual projectId={project.id} name={project.name} className="made-card__visual" />
                  <div className="made-card__copy">
                    <p>{project.categories.slice(0, 2).join(" · ")}</p>
                    <h3 className="font-display">{project.name}</h3>
                    <span>{project.tagline}</span>
                  </div>
                  <span className="made-card__number">{String(index + 1).padStart(2, "0")}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="ritual-callout">
        <div className="ritual-callout__rings" aria-hidden />
        <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="broadcast-label">Tomorrow has a frequency too</p>
            <h2 className="font-display">Make the city<br />a daily ritual.</h2>
            <p>Seven or thirty useful days, ready to scan, save, put on your calendar or send to your people.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/digest" className="buzz-button buzz-button--dark">Open the digest <span aria-hidden>→</span></Link>
            <a href="/calendar.ics" className="buzz-button buzz-button--paper">Add Kochi to calendar <span aria-hidden>↓</span></a>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
