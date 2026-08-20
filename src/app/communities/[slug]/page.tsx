import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DirectoryShell from "@/components/DirectoryShell";
import SaveToBuzzButton from "@/components/SaveToBuzzButton";
import { identityColors } from "@/components/signal";
import { communityBySlug, communityDirectory } from "@/data/directory";
import { TechEvent, categoryById } from "@/data/events";
import { countdownLabel, formatDateRange, todayInIST } from "@/lib/calendar";
import { communityEvents } from "@/lib/communityEvents";
import { monogram } from "@/lib/identity";

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
    <ul>
      {events.map((event) => {
        const category = categoryById.get(event.category)!;
        return (
          <li key={event.id} className="border-t border-white/[0.08]">
            <Link
              href={`/events/${event.id}`}
              className={[
                "group flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3.5 transition hover:bg-white/[0.02]",
                muted ? "opacity-50 hover:opacity-100" : "",
              ].join(" ")}
            >
              <span className="text-sm font-semibold text-white transition group-hover:text-[var(--signal)]">
                {event.title}
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/70">
                {category.label}
              </span>
              <span className="w-full text-xs text-white/50 sm:w-auto">
                {formatDateRange(event)} · {event.venue}, {event.city}
              </span>
              <span className="ml-auto shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/70">
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
  const nextMeet = upcoming[0];
  const colors = identityColors(community.name);

  return (
    <DirectoryShell
      current="/communities"
      eyebrow="Community crew"
      accent="violet"
      title={community.name}
      intro={community.blurb}
      submitLabel="Suggest a community"
      headerArt={
        <span
          aria-hidden
          className="absolute right-0 top-10 hidden h-20 w-20 place-items-center rounded-xl text-2xl font-bold sm:grid"
          style={{ background: colors.bg, color: colors.fg }}
        >
          {monogram(community.name)}
        </span>
      }
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-white/55">
          {community.focus}
        </p>
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-white/70">
          {community.cadence}
        </p>
        <a
          href={community.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-[var(--signal)] transition hover:opacity-80"
        >
          Official page →
        </a>
        <SaveToBuzzButton
          item={{
            id: `community:${community.slug}`,
            kind: "community",
            eyebrow: `${community.focus} · ${community.cadence}`,
            title: community.name,
            detail: community.blurb,
            meta: "Kochi community · Official page",
            href: `/communities/${community.slug}`,
            trackLabel: "Find your people",
          }}
        />
      </div>

      {nextMeet ? (
        <Link
          href={`/events/${nextMeet.id}`}
          className="group mt-8 block overflow-hidden rounded-xl bg-[var(--surface)] p-6 ring-1 ring-white/10 transition hover:ring-white/25 sm:p-8"
        >
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-[var(--signal)]">
            Next meet
          </p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-white transition group-hover:text-[var(--signal)] sm:text-4xl">
            {nextMeet.title}
          </h2>
          <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-wider text-white/50">
            {formatDateRange(nextMeet)} · {nextMeet.venue}, {nextMeet.city} ·{" "}
            {countdownLabel(nextMeet, today)}
          </p>
        </Link>
      ) : (
        <p className="mt-8 border-t border-white/10 pt-5 text-sm text-white/45">
          No dates announced on kochi.buzz yet — follow their official page, and
          we&apos;ll list the next one here as soon as it&apos;s public.
        </p>
      )}

      {upcoming.length > 1 && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/70">
            Also upcoming
          </h2>
          <div className="mt-3">
            <EventList events={upcoming.slice(1)} today={today} />
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/70">
            Past editions
          </h2>
          <div className="mt-3">
            <EventList events={past} today={today} muted />
          </div>
        </section>
      )}

      <Link
        href="/communities"
        className="mt-10 inline-block text-sm text-white/50 transition hover:text-white"
      >
        ← All communities
      </Link>
    </DirectoryShell>
  );
}
