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
  countdownLabel,
  formatDateRange,
  formatTimeRange,
  todayInIST,
} from "@/lib/calendar";
import { eventJsonLd } from "@/lib/schema";

type Params = Promise<{ id: string }>;

export const revalidate = 3600;

export function generateStaticParams() {
  return events.map((event) => ({ id: event.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const event = eventById.get(id);
  if (!event) return {};
  const title = `${event.title} — kochi.buzz`;
  const description = `${formatDateRange(event)} · ${event.venue}, ${event.city}. ${event.blurb}`;
  const image = `/og?e=${event.id}`;
  return {
    title,
    description,
    alternates: { canonical: `/e/${event.id}` },
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function EventPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = eventById.get(id);
  if (!event) notFound();

  const category = categoryById.get(event.category)!;
  const today = todayInIST();
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
      <article className="relative z-10 w-full max-w-2xl rounded-[2rem] bg-[#101014]/90 p-7 ring-1 ring-white/10 backdrop-blur sm:p-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-violet-300/80">
          kochi.buzz
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
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
            href={`/?e=${event.id}`}
            className="rounded-full bg-white/[0.06] px-6 py-2.5 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white"
          >
            Open in calendar
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/35">
          <Link href="/" className="transition hover:text-white/70">
            ← All Kochi tech events
          </Link>
        </p>
      </article>
    </main>
  );
}
