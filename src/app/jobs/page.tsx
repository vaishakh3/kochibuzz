import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import JobsExplorer from "@/components/JobsExplorer";
import { jobs } from "@/data/dataset";
import { NEW_DAYS } from "@/lib/buzz";
import { toISODate, todayInIST } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Jobs — kochi.buzz",
  description:
    "Live tech job openings in Kochi, synced from Infopark's official company job board. Filter by engineering, AI, DevOps, design and more.",
  alternates: { canonical: "/jobs" },
};

export const revalidate = 3600;

export default function JobsPage() {
  const todayIso = toISODate(todayInIST());
  return (
    <DirectoryShell
      current="/jobs"
      eyebrow="Synced from Infopark's official board"
      accent="teal"
      title={
        <>
          <span className="text-[var(--signal)]">{jobs.length} live roles</span>
          <br />
          in Kochi tech
        </>
      }
      intro="Openings at Infopark Kochi companies, pulled from the park's official job board and refreshed automatically. Every listing links to the official posting."
      submitLabel="Suggest a job source"
    >
      <JobsExplorer jobs={jobs} todayIso={todayIso} newDays={NEW_DAYS} />
      <p className="mt-8 text-[11px] leading-relaxed text-white/65">
        Source: infopark.in official job listings (Phases 1 &amp; 2). Listings
        past their apply-by date are removed automatically. Apply on the
        company&apos;s official page — kochi.buzz never handles applications.
      </p>
    </DirectoryShell>
  );
}
