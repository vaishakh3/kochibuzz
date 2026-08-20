import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooter";
import GlobalHeader from "@/components/GlobalHeader";

export type Accent = "violet" | "teal" | "amber";

const accents: Record<Accent, { eyebrow: string; rule: string }> = {
  violet: { eyebrow: "text-violet-300/80", rule: "bg-violet-400/50" },
  teal: { eyebrow: "text-teal-300/80", rule: "bg-teal-300/50" },
  amber: { eyebrow: "text-amber-300/80", rule: "bg-amber-300/50" },
};

type Props = {
  current: string;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  accent?: Accent;
  /** Contextual submit CTA, e.g. "Submit a project". Defaults to a generic one. */
  submitLabel?: string;
  /** Where the CTA points; defaults to /submit. */
  submitHref?: string;
  /** Optional decorative element rendered behind/beside the page header. */
  headerArt?: React.ReactNode;
  children: React.ReactNode;
};

/** Full-width directory page: editorial header, content, contextual submit CTA. */
export default function DirectoryShell({
  current,
  eyebrow,
  title,
  intro,
  accent = "violet",
  submitLabel = "Submit to Kochi.buzz",
  submitHref = "/submit",
  headerArt,
  children,
}: Props) {
  const theme = accents[accent];

  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader current={current} />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 sm:px-6">
        <header className="relative border-b border-[var(--line)] py-10 sm:py-14">
          {headerArt}
          <p
            className={`relative font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] ${theme.eyebrow}`}
          >
            {eyebrow}
          </p>
          <h1 className="font-display relative mt-3 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
            {intro}
          </p>
          <div aria-hidden className={`absolute bottom-0 left-0 h-px w-24 ${theme.rule}`} />
        </header>

        <div className="py-10">{children}</div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] py-8">
          <p className="text-sm text-white/55">Know something we&apos;re missing?</p>
          <Link
            href={submitHref}
            className="text-sm font-semibold text-[var(--signal)] transition hover:opacity-80"
          >
            {submitLabel} →
          </Link>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}
