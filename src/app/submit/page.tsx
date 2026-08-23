import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import SubmissionForm from "@/components/SubmissionForm";

export const metadata: Metadata = {
  title: "Submit — kochi.buzz",
  description:
    "Add an event, opportunity, project, community or data source to kochi.buzz. Everything is reviewed before it goes live.",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <DirectoryShell
      current="/submit"
      eyebrow="Feed the signal"
      accent="violet"
      title={<>Add to the buzz</>}
      intro="Tell us what the city should know. One short form turns your source-backed information into a public review ticket for the Kochi Buzz team."
      showSubmitCta={false}
      headerArt={(
        <div aria-hidden className="pointer-events-none absolute right-5 top-5 hidden h-36 w-64 sm:block">
          <span className="absolute right-0 top-0 h-28 w-28 rounded-full border-[1.6rem] border-[var(--signal)]/75" />
          <span className="absolute right-20 top-12 h-16 w-40 -rotate-6 rounded-full border border-white/15 bg-white/[0.035]" />
          <span className="absolute right-8 top-14 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">Input → review → live</span>
        </div>
      )}
    >
      <SubmissionForm />
    </DirectoryShell>
  );
}
