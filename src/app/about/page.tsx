import type { Metadata } from "next";
import Link from "next/link";
import DirectoryShell from "@/components/DirectoryShell";
import registry from "../../../data/sources/registry.json";

export const metadata: Metadata = {
  title: "About & data sources — kochi.buzz",
  description:
    "What kochi.buzz is, where its data comes from, and how the automated pipeline works.",
  alternates: { canonical: "/about" },
};

type RegistrySource = {
  id: string;
  name: string;
  kind: string;
  url: string;
  enabled: boolean;
  trustLevel: number;
  notes?: string;
};

const sources = registry as RegistrySource[];

const feeds = [
  { label: "Calendar feed (.ics)", href: "/calendar.ics" },
  { label: "RSS feed", href: "/feed.xml" },
  { label: "Events JSON", href: "/api/v1/events.json" },
  { label: "Jobs JSON", href: "/api/v1/jobs.json" },
  { label: "Opportunities JSON", href: "/api/v1/opportunities.json" },
];

export default function AboutPage() {
  return (
    <DirectoryShell
      current="/about"
      eyebrow="How this works"
      accent="violet"
      watermark="ABOUT"
      title={
        <>
          The <span className="ink-violet">live layer</span> for Kochi tech
        </>
      }
      intro="kochi.buzz tracks what's happening in Kochi's technology, startup, maker and creative-tech ecosystem — events, opportunities, jobs, communities and things being built."
    >
      <section className="space-y-4 text-sm leading-relaxed text-white/60">
        <p>
          Everything on this site is either manually curated from official
          organizer pages or automatically synced from registered public
          sources. Nothing is fabricated: no fake popularity, no invented
          attendance, no scraped personal data.
        </p>
        <p>
          The automated pipeline runs every few hours via GitHub Actions. It
          fetches registered sources with a transparent user agent
          (<code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs">KochiBuzzBot/1.0</code>),
          validates every record, removes duplicates and expired listings, and
          only commits when the data meaningfully changes. Manual corrections
          always win over automated data.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300/80">
          Registered sources
        </h2>
        <ul className="mt-4 space-y-2">
          {sources.map((source) => (
            <li
              key={source.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/10"
            >
              <span className="text-sm font-semibold text-white">
                {source.name}
              </span>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                {source.kind}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  source.enabled
                    ? "bg-teal-400/10 text-teal-200 ring-1 ring-teal-300/25"
                    : "bg-white/[0.05] text-white/35 ring-1 ring-white/10"
                }`}
              >
                {source.enabled ? "Active" : "Planned"}
              </span>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full break-all text-xs text-white/40 underline decoration-white/15 underline-offset-2 transition hover:text-white/70 sm:w-auto"
              >
                {source.url}
              </a>
              {source.notes && (
                <span className="w-full text-xs text-white/35">{source.notes}</span>
              )}
            </li>
          ))}
          <li className="rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-white/50 ring-1 ring-white/10">
            <span className="font-semibold text-white">Manual curation</span>
            <span className="ml-3 text-xs">
              Events, opportunities, projects and communities researched from
              official organizer pages, each with its source linked.
            </span>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300/80">
          Machine-readable feeds
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {feeds.map((feed) => (
            <li key={feed.href}>
              <a
                href={feed.href}
                className="block rounded-full bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:text-white"
              >
                {feed.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 text-sm leading-relaxed text-white/50">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-violet-300/80">
          Corrections
        </h2>
        <p className="mt-3">
          Spotted something wrong or out of date?{" "}
          <Link href="/submit" className="text-violet-300 hover:text-white">
            Tell us
          </Link>{" "}
          — corrections are applied as manual overrides so the pipeline never
          reintroduces the mistake.
        </p>
      </section>
    </DirectoryShell>
  );
}
