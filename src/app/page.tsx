import type { Metadata } from "next";
import CalendarApp from "@/components/CalendarApp";
import { eventById, events } from "@/data/events";
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
    return { openGraph: { images: ["/og"] }, twitter: { images: ["/og"] } };
  }
  const title = `${event.title} — kochi.buzz`;
  const description = `${formatDateRange(event)} · ${event.venue}, ${event.city}. ${event.blurb}`;
  const image = `/og?e=${event.id}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { e } = await searchParams;
  const event = e ? eventById.get(e) : undefined;
  const jsonLd = event ? eventJsonLd(event) : eventListJsonLd(events);
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="aurora aurora-one" aria-hidden />
      <div className="aurora aurora-two" aria-hidden />
      <div className="aurora aurora-three" aria-hidden />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <div className="relative z-10 w-full">
        <CalendarApp />
      </div>
    </main>
  );
}
