import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";

export const metadata: Metadata = {
  title: "Submit — kochi.buzz",
  description:
    "Add an event, opportunity, project, community or data source to kochi.buzz. Everything is reviewed before it goes live.",
  alternates: { canonical: "/submit" },
};

const REPO = "https://github.com/vaishakh3/kochibuzz/issues/new";

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
      title={<>Add to the buzz</>}
      intro="Submit an event, project, opportunity, community or public data source. Submissions are reviewed through the public kochi.buzz GitHub repository."
    >
      <ul>
        {forms.map((form) => (
          <li key={form.template} className="border-t border-white/10">
            <a
              href={`${REPO}?template=${form.template}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-5 transition hover:bg-white/[0.02]"
            >
              <h2 className="text-[17px] font-semibold text-white transition group-hover:text-[var(--signal)]">
                {form.label}
              </h2>
              <p className="w-full max-w-xl text-sm leading-relaxed text-white/55 sm:w-auto sm:flex-1">
                {form.description}
              </p>
              <span className="ml-auto shrink-0 text-xs font-medium text-[var(--signal)] transition group-hover:opacity-80">
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
