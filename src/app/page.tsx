import type { Metadata } from "next";
import CalendarApp from "@/components/CalendarApp";
import GlobalHeader from "@/components/GlobalHeader";
import { events } from "@/data/events";
import { jobs, opportunities } from "@/data/dataset";
import { communityDirectory } from "@/data/directory";
import { eventListJsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title: "The Kochi Calendar — Kochi Buzz",
  description:
    "The source-backed city calendar for Kochi: meetups, conferences, hackathons, workshops and things worth showing up for.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default function CalendarHome() {
  return (
    <div className="calendar-home flex h-dvh min-h-[600px] flex-col overflow-hidden">
      <GlobalHeader current="/" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: eventListJsonLd(events) }}
      />
      <main id="main-content" className="min-h-0 flex-1 px-2 pb-2 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
        <CalendarApp cityCounts={{ jobs: jobs.length, opportunities: opportunities.length, communities: communityDirectory.length }} />
      </main>
    </div>
  );
}
