import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GlobalFooter from "@/components/GlobalFooter";
import GlobalHeader from "@/components/GlobalHeader";
import { CategoryPattern } from "@/components/signal";
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
    <div className="flex min-h-screen flex-col">
      <GlobalHeader current="/events" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: eventJsonLd(event) }}
      />
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <p className="text-xs text-white/40">
          <Link href="/events" className="transition hover:text-white/80">
            ← All Kochi tech events
          </Link>
        </p>

        {/* The event pass — poster head */}
        <article className="mt-6 overflow-hidden rounded-xl bg-[var(--surface)] ring-1 ring-white/10">
          <div className="relative overflow-hidden border-b border-dashed border-white/15 p-7 sm:p-9">
            <CategoryPattern
              category={event.category}
              className="absolute inset-0 h-full w-full text-white"
            />
            <div className="relative flex items-start justify-between gap-6">
              <div>
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.35em] text-[var(--signal)]">
                  kochi.buzz · event pass
                </p>
                <h1 className="font-display mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  {event.title}
                </h1>
              </div>
              <div className="shrink-0 text-right">
                <span className="font-display block text-6xl font-semibold leading-none text-white sm:text-7xl">
                  {start.getDate()}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] mt-1 block text-xs uppercase tracking-[0.3em] text-white/50">
                  {MONTHS[start.getMonth()].slice(0, 3)} {start.getFullYear()}
                </span>
              </div>
            </div>
            <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-white/55">
              <span>{category.label}</span>
              {event.travel && <span className="text-amber-300/90">Outside Kochi</span>}
              <span className="text-[var(--signal-dim)]">
                {countdownLabel(event, today)}
              </span>
            </div>
          </div>

          {/* Essentials + primary action, before the long read */}
          <div className="p-7 sm:p-9">
            <dl className="space-y-2 font-[family-name:var(--font-geist-mono)] text-[13px]">
              <div className="flex gap-4">
                <dt className="w-16 shrink-0 uppercase tracking-wider text-white/35">
                  Date
                </dt>
                <dd className="text-white/85">{formatDateRange(event)}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-16 shrink-0 uppercase tracking-wider text-white/35">
                  Time
                </dt>
                <dd className="text-white/85">{formatTimeRange(event)}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-16 shrink-0 uppercase tracking-wider text-white/35">
                  Venue
                </dt>
                <dd className="text-white/85">
                  {event.venue}, {event.city}
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-16 shrink-0 uppercase tracking-wider text-white/35">
                  Host
                </dt>
                <dd className="text-white/85">{event.organizer}</dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={event.registerUrl ?? event.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-[var(--signal)] px-7 py-3 text-sm font-semibold text-[var(--signal-ink)] transition hover:opacity-90"
              >
                {event.registerUrl ? "Register" : "Official event page"} ↗
              </a>
              <details className="group relative">
                <summary className="cursor-pointer list-none rounded-md px-4 py-3 text-sm font-semibold text-white/70 ring-1 ring-white/15 transition hover:text-white">
                  Add to calendar ▾
                </summary>
                <div className="absolute left-0 top-full z-10 mt-2 w-44 overflow-hidden rounded-lg bg-[var(--surface-2)] py-1 ring-1 ring-white/15">
                  <a
                    href={googleCalendarUrl(event)}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06]"
                  >
                    Google Calendar
                  </a>
                  <a
                    href={`/e/${event.id}/event.ics`}
                    className="block px-4 py-2 text-sm text-white/80 transition hover:bg-white/[0.06]"
                  >
                    Apple / Outlook (.ics)
                  </a>
                </div>
              </details>
              <a
                href={maps}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition hover:text-white"
              >
                Map
              </a>
              <Link
                href={`/events?e=${event.id}`}
                className="text-sm text-white/50 underline decoration-white/20 underline-offset-4 transition hover:text-white"
              >
                Open in calendar
              </Link>
            </div>

            <p className="mt-8 text-sm leading-relaxed text-white/60">
              {event.blurb}
            </p>

            {event.tags.length > 0 && (
              <p className="mt-4 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-white/35">
                {event.tags.join(" · ")}
              </p>
            )}

            {event.note && (
              <p className="mt-5 rounded-lg bg-amber-400/10 px-4 py-3 text-xs leading-relaxed text-amber-200/90 ring-1 ring-amber-400/20">
                {event.note}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--line)] pt-5 text-xs text-white/35">
              <span>
                Source:{" "}
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/55 underline decoration-white/20 underline-offset-2 transition hover:text-white/80"
                >
                  {new URL(event.url).hostname}
                </a>
              </span>
              <span aria-hidden>·</span>
              <span>Always confirm details on the organizer&apos;s page.</span>
            </div>
          </div>
        </article>
      </main>
      <GlobalFooter />
    </div>
  );
}
