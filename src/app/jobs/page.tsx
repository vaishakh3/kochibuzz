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
      eyebrow="Synced from direct, public hiring sources"
      accent="teal"
      title={
        <>
          <span className="text-[var(--signal)]">{jobs.length} live roles</span>
          <br />
          in Kochi tech
        </>
      }
      intro="Kochi-area openings from Infopark and direct company hiring feeds, refreshed automatically through the day. Every listing links back to the original posting."
      submitLabel="Suggest a job source"
    >
      <JobsExplorer jobs={jobs} todayIso={todayIso} newDays={NEW_DAYS} />
      <p className="mt-8 text-[11px] leading-relaxed text-white/65">
        Sources: Infopark&apos;s official listings plus public Lever and Workable
        company feeds. Location checks run before publication; listings past
        their apply-by date are removed automatically. Apply on the original
        company page — kochi.buzz never handles applications.
      </p>
    </DirectoryShell>
  );
}
