import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import JobsExplorer from "@/components/JobsExplorer";
import { jobs } from "@/data/dataset";
import { NEW_DAYS } from "@/lib/buzz";
import { toISODate, todayInIST } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Jobs — kochi.buzz",
  description:
    "Live Kochi-area openings synced from Infopark and direct company hiring feeds. Filter by engineering, AI, DevOps, design and more.",
  alternates: { canonical: "/jobs" },
};

export const revalidate = 3600;

export default function JobsPage() {
  const todayIso = toISODate(todayInIST());
  return (
    <DirectoryShell
      current="/jobs"
      eyebrow="Kochi tech jobs"
      accent="teal"
      density="compact"
      title={
        <>
          Find your next role<span className="text-[var(--signal)]">.</span>
        </>
      }
      intro={`${jobs.length} live Kochi-area openings, refreshed through the day.`}
      submitLabel="Suggest a job source"
    >
      <JobsExplorer jobs={jobs} todayIso={todayIso} newDays={NEW_DAYS} />
      <p className="mt-7 max-w-3xl text-[11px] leading-relaxed text-white/42">
        Listings come from Infopark and public company feeds. Expired roles are
        removed automatically; applications always happen on the original site.
      </p>
    </DirectoryShell>
  );
}
