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
      title={<>The live layer for Kochi tech</>}
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

      {/* Data flow */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/70">
          How the data flows
        </h2>
        <div
          role="img"
          aria-label="Data pipeline: public sources are fetched and parsed, validated, deduplicated with manual overrides, then published to kochi.buzz as web pages, an ICS feed and JSON."
          className="mt-4 flex flex-col items-start gap-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider"
        >
          {[
            "Public sources",
            "Fetch + parse",
            "Validate",
            "Dedupe + overrides",
          ].map((stage) => (
            <div key={stage} className="flex flex-col items-start">
              <span className="rounded-md bg-white/[0.05] px-4 py-2 text-white/75 ring-1 ring-white/10">
                {stage}
              </span>
              <span aria-hidden className="ml-6 h-5 w-px bg-[var(--signal-dim)]" />
            </div>
          ))}
          <span className="rounded-md bg-[var(--signal)] px-4 py-2 font-semibold text-[var(--signal-ink)]">
            kochi.buzz
          </span>
          <div aria-hidden className="ml-2 mt-3 flex gap-3 text-white/50">
            <span className="rounded-md px-3 py-1.5 ring-1 ring-white/10">Web</span>
            <span className="rounded-md px-3 py-1.5 ring-1 ring-white/10">ICS</span>
            <span className="rounded-md px-3 py-1.5 ring-1 ring-white/10">JSON</span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/70">
          Registered sources
        </h2>
        <ul className="mt-4">
          {sources.map((source) => (
            <li
              key={source.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-white/[0.08] py-3.5"
            >
              <span className="text-sm font-semibold text-white">
                {source.name}
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/70">
                {source.kind}
              </span>
              <span
                className={`font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider ${
                  source.enabled ? "text-[var(--signal)]" : "text-white/65"
                }`}
              >
                {source.enabled ? "Active" : "Planned"}
              </span>
              {source.notes && (
                <span className="w-full text-xs text-white/70">{source.notes}</span>
              )}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto shrink-0 text-xs font-medium text-white/50 transition hover:text-white"
              >
                View source →
              </a>
            </li>
          ))}
          <li className="border-t border-white/[0.08] py-3.5 text-sm text-white/50">
            <span className="font-semibold text-white">Manual curation</span>
            <span className="ml-3 text-xs">
              Events, opportunities, projects and communities researched from
              official organizer pages, each with its source linked.
            </span>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/70">
          Machine-readable feeds
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {feeds.map((feed) => (
            <li key={feed.href}>
              <a
                href={feed.href}
                className="block rounded-md bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:text-white"
              >
                {feed.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 text-sm leading-relaxed text-white/50">
        <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/70">
          Corrections
        </h2>
        <p className="mt-3">
          Spotted something wrong or out of date?{" "}
          <Link href="/submit" className="text-[var(--signal)] hover:opacity-80">
            Tell us
          </Link>{" "}
          — corrections are applied as manual overrides so the pipeline never
          reintroduces the mistake.
        </p>
      </section>
    </DirectoryShell>
  );
}
