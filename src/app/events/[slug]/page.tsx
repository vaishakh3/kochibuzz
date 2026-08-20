import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  NavigationIcon,
  UsersIcon,
} from "@/components/icons";
import { categoryById, eventById, events } from "@/data/events";
import {
  MONTHS,
  countdownLabel,
  formatDateRange,
  formatTimeRange,
  googleCalendarUrl,
  parseDate,
  todayInIST,
} from "@/lib/calendar";
import { eventJsonLd } from "@/lib/schema";

type Params = Promise<{ slug: string }>;

export const revalidate = 3600;

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = eventById.get(slug);
  if (!event) return {};
  const title = `${event.title} — kochi.buzz`;
  const description = `${formatDateRange(event)} · ${event.venue}, ${event.city}. ${event.blurb}`;
  const image = `/og?e=${event.id}`;
  return {
    title,
    description,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const event = eventById.get(slug);
  if (!event) notFound();

  const category = categoryById.get(event.category)!;
  const today = todayInIST();
  const start = parseDate(event.start);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venue}, ${event.city}`,
  )}`;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="aurora aurora-one" aria-hidden />
      <div className="aurora aurora-two" aria-hidden />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: eventJsonLd(event) }}
      />
      <article className="grain relative z-10 w-full max-w-2xl overflow-hidden rounded-[2rem] bg-[#101014]/90 p-7 ring-1 ring-white/10 backdrop-blur sm:p-9">
        <span
          aria-hidden
          className={`absolute -top-24 right-0 h-48 w-48 rounded-full opacity-25 blur-3xl ${category.bar}`}
        />
        <div className="relative flex items-start justify-between gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-violet-300/80">
            kochi.buzz · event pass
          </p>
          <div className="shrink-0 rounded-2xl bg-white/[0.05] px-3.5 py-2 text-center ring-1 ring-white/15">
            <span className="block text-2xl font-extrabold leading-none tracking-tight text-white">
              {start.getDate()}
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-widest text-white/50">
              {MONTHS[start.getMonth()].slice(0, 3)}
            </span>
          </div>
        </div>
        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${category.chip}`}
          >
            {category.label}
          </span>
          {event.travel && (
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-900">
              Outside Kochi
            </span>
          )}
          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-white/60">
            {countdownLabel(event, today)}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
          {event.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          {event.blurb}
        </p>

        <dl className="mt-6 space-y-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <div className="flex items-start gap-3">
            <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
            <div>
              <dt className="sr-only">Date</dt>
              <dd className="text-sm text-white/80">{formatDateRange(event)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
            <div>
              <dt className="sr-only">Time</dt>
              <dd className="text-sm text-white/80">{formatTimeRange(event)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
            <div>
              <dt className="sr-only">Venue</dt>
              <dd className="text-sm text-white/80">
                {event.venue}, {event.city}{" "}
                <a
                  href={maps}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-violet-300 transition hover:text-white"
                >
                  <NavigationIcon className="h-3 w-3" />
                  Map
                </a>
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
            <div>
              <dt className="sr-only">Organizer</dt>
              <dd className="text-sm text-white/80">{event.organizer}</dd>
            </div>
          </div>
        </dl>

        {event.note && (
          <p className="mt-4 rounded-2xl bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-200/90 ring-1 ring-amber-400/20">
            {event.note}
          </p>
        )}

        <div
          aria-hidden
          className="relative mt-7 h-px border-t border-dashed border-white/20"
        >
          <span className="absolute -left-[38px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#050506] ring-1 ring-white/10 sm:-left-[46px]" />
          <span className="absolute -right-[38px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#050506] ring-1 ring-white/10 sm:-right-[46px]" />
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href={event.registerUrl ?? event.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            {event.registerUrl ? "Register" : "Event page"}
          </a>
          <Link
            href={`/events?e=${event.id}`}
            className="rounded-full bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white"
          >
            Open in calendar
          </Link>
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white"
          >
            Google Calendar
          </a>
          <a
            href={`/e/${event.id}/event.ics`}
            className="rounded-full bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white"
          >
            .ics
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/35">
          <span>
            Source:{" "}
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-white/50 underline decoration-white/20 underline-offset-2 transition hover:text-white/80"
            >
              {new URL(event.url).hostname}
            </a>
          </span>
          <span aria-hidden>·</span>
          <span>Always confirm details on the organizer&apos;s page.</span>
        </div>

        <p className="mt-6 text-xs text-white/35">
          <Link href="/events" className="transition hover:text-white/70">
            ← All Kochi tech events
          </Link>
        </p>
      </article>
    </main>
  );
}
