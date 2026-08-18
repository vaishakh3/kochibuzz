import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DirectoryShell from "@/components/DirectoryShell";
import { communityBySlug, communityDirectory } from "@/data/directory";
import { TechEvent, categoryById } from "@/data/events";
import { countdownLabel, formatDateRange, todayInIST } from "@/lib/calendar";
import { communityEvents } from "@/lib/communityEvents";

type Params = Promise<{ slug: string }>;

export const revalidate = 3600;

export function generateStaticParams() {
  return communityDirectory.map((community) => ({ slug: community.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const community = communityBySlug.get(slug);
  if (!community) return {};
  return {
    title: `${community.name} — kochi.buzz`,
    description: community.blurb,
    alternates: { canonical: `/communities/${community.slug}` },
  };
}

function EventList({
  events,
  today,
  muted,
}: {
  events: TechEvent[];
  today: Date;
  muted?: boolean;
}) {
  return (
    <ul className="space-y-2.5">
      {events.map((event) => {
        const category = categoryById.get(event.category)!;
        return (
          <li key={event.id}>
            <Link
              href={`/?e=${event.id}`}
              className={[
                "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:ring-violet-400/40",
                muted ? "opacity-60 hover:opacity-100" : "",
              ].join(" ")}
            >
              <span className="text-sm font-semibold text-white">
                {event.title}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${category.chip}`}
              >
                {category.label}
              </span>
              <span className="w-full text-xs text-white/50 sm:w-auto">
                {formatDateRange(event)} · {event.venue}, {event.city}
              </span>
              <span className="ml-auto shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/60">
                {countdownLabel(event, today)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function CommunityPage({ params }: { params: Params }) {
  const { slug } = await params;
  const community = communityBySlug.get(slug);
  if (!community) notFound();

  const today = todayInIST();
  const { upcoming, past } = communityEvents(community);

  return (
    <DirectoryShell
      current="/communities"
      eyebrow="Community"
      title={community.name}
      intro={community.blurb}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-[11px] font-semibold text-violet-200 ring-1 ring-violet-400/25">
          {community.focus}
        </span>
        <span className="text-xs text-white/40">{community.cadence}</span>
        <a
          href={community.url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded-full bg-white/[0.06] px-4 py-2 text-sm font-medium text-violet-300 ring-1 ring-white/10 transition hover:bg-white/[0.1] hover:text-white"
        >
          Official page →
        </a>
      </div>

      <section className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Upcoming
        </h2>
        <div className="mt-3">
          {upcoming.length > 0 ? (
            <EventList events={upcoming} today={today} />
          ) : (
            <p className="rounded-2xl bg-white/[0.03] px-4 py-4 text-sm text-white/45 ring-1 ring-white/10">
              No dates announced on kochi.buzz yet — follow their official page,
              and we&apos;ll list the next one here as soon as it&apos;s public.
            </p>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Past editions
          </h2>
          <div className="mt-3">
            <EventList events={past} today={today} muted />
          </div>
        </section>
      )}

      <Link
        href="/communities"
        className="mt-8 inline-block text-sm text-white/50 transition hover:text-white"
      >
        ← All communities
      </Link>
    </DirectoryShell>
  );
}
