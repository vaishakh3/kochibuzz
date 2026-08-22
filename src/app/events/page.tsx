import type { Metadata } from "next";
import CalendarApp from "@/components/CalendarApp";
import GlobalHeader from "@/components/GlobalHeader";
import { eventById, events } from "@/data/events";
import { jobs, opportunities } from "@/data/dataset";
import { communityDirectory } from "@/data/directory";
import { formatDateRange } from "@/lib/calendar";
import { eventJsonLd, eventListJsonLd } from "@/lib/schema";

type SearchParams = Promise<{ e?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { e } = await searchParams;
  const event = e ? eventById.get(e) : undefined;
  if (!event) {
    return {
      title: "Events — kochi.buzz",
      description:
        "The full Kochi tech events calendar — hackathons, meetups, conferences and summits in and around Kochi.",
      alternates: { canonical: "/events" },
      openGraph: { images: ["/og.png"] },
      twitter: { images: ["/og.png"] },
    };
  }
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

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { e } = await searchParams;
  const event = e ? eventById.get(e) : undefined;
  const jsonLd = event ? eventJsonLd(event) : eventListJsonLd(events);
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader current="/events" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <main id="main-content" className="flex-1 px-2 py-3 sm:px-4 sm:py-6">
        <CalendarApp cityCounts={{ jobs: jobs.length, opportunities: opportunities.length, communities: communityDirectory.length }} />
      </main>
    </div>
  );
}
