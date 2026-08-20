import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";

export const metadata: Metadata = {
  title: "Submit — kochi.buzz",
  description:
    "Add an event, opportunity, project, community or data source to kochi.buzz. Everything is reviewed before it goes live.",
  alternates: { canonical: "/submit" },
};

const REPO = "https://github.com/vaishakh3/kochitechevents/issues/new";

const forms = [
  {
    label: "Event",
    description:
      "A meetup, hackathon, conference or workshop happening in or around Kochi.",
    template: "submit-event.yml",
  },
  {
    label: "Opportunity",
    description:
      "A hackathon registration, grant, fellowship, accelerator intake, CFP or program with a deadline.",
    template: "submit-opportunity.yml",
  },
  {
    label: "Project — Built in Kochi",
    description:
      "A product, open source project or experiment being built from Kochi.",
    template: "submit-project.yml",
  },
  {
    label: "Community",
    description: "An active tech community in Kochi that we should list.",
    template: "submit-community.yml",
  },
  {
    label: "Data source",
    description:
      "A public calendar, RSS feed or page kochi.buzz should monitor automatically.",
    template: "suggest-source.yml",
  },
];

export default function SubmitPage() {
  return (
    <DirectoryShell
      current="/submit"
      eyebrow="Feed the signal"
      accent="violet"
      watermark="SUBMIT"
      title={
        <>
          Add to the <span className="ink-violet">buzz</span>
        </>
      }
      intro="Know something the city should know? Submissions open a structured GitHub form — no account gymnastics, and everything is reviewed before it goes live."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {forms.map((form) => (
          <li key={form.template}>
            <a
              href={`${REPO}?template=${form.template}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.06] hover:ring-violet-400/40"
            >
              <h2 className="text-[17px] font-semibold text-white group-hover:text-violet-200">
                {form.label}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
                {form.description}
              </p>
              <span className="mt-4 text-xs font-medium text-violet-300 transition group-hover:text-white">
                Open the form →
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-[11px] leading-relaxed text-white/30">
        Submissions become GitHub issues on the public kochi.buzz repository.
        Only factual, source-backed entries are added — no promotion-only
        listings.
      </p>
    </DirectoryShell>
  );
}
