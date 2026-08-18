import type { Metadata } from "next";
import CalendarApp from "@/components/CalendarApp";
import { eventById } from "@/data/events";
import { formatDateRange } from "@/lib/calendar";

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

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="aurora aurora-one" aria-hidden />
      <div className="aurora aurora-two" aria-hidden />
      <div className="aurora aurora-three" aria-hidden />
      <div className="relative z-10 w-full">
        <CalendarApp />
      </div>
    </main>
  );
}
