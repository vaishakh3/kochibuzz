import Link from "next/link";
import type { CSSProperties } from "react";
import GlobalFooter from "@/components/GlobalFooter";
import GlobalHeader from "@/components/GlobalHeader";

export type Accent = "violet" | "teal" | "amber";

const accents: Record<Accent, { eyebrow: string; dot: string; glow: string }> = {
  violet: {
    eyebrow: "text-violet-200/85",
    dot: "bg-[var(--lavender)]",
    glow: "rgba(199, 180, 238, 0.24)",
  },
  teal: {
    eyebrow: "text-teal-200/85",
    dot: "bg-[var(--lagoon)]",
    glow: "rgba(114, 220, 199, 0.24)",
  },
  amber: {
    eyebrow: "text-amber-200/85",
    dot: "bg-[var(--coral)]",
    glow: "rgba(255, 101, 66, 0.24)",
  },
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
  /** Hide the generic contribution banner on the contribution page itself. */
  showSubmitCta?: boolean;
  /** A tighter, task-first header for utility pages such as Jobs. */
  density?: "editorial" | "compact";
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
  showSubmitCta = true,
  density = "editorial",
  children,
}: Props) {
  const theme = accents[accent];
  const sectionName = current === "/" ? "BUZZ" : current.split("/").filter(Boolean).at(-1)?.toUpperCase();
  const compact = density === "compact";

  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader current={current} />
      <main id="main-content" className="mx-auto w-full max-w-[1280px] flex-1 px-4 sm:px-6">
        <header
          className={[
            "directory-hero relative",
            compact
              ? "mt-4 px-5 py-6 sm:mt-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8"
              : "mt-6 px-6 py-10 sm:mt-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16",
          ].join(" ")}
          style={{ "--directory-glow": theme.glow } as CSSProperties}
        >
          {headerArt}
          {!compact && <span className="directory-index" aria-hidden>{sectionName}</span>}
          <p
            className={`relative flex items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.25em] ${theme.eyebrow}`}
          >
            <span className={`h-2 w-2 rounded-full ${theme.dot}`} aria-hidden />
            {eyebrow}
          </p>
          <h1 className={[
            "font-display relative max-w-4xl font-semibold tracking-[-0.045em] text-white",
            compact
              ? "mt-3 text-3xl leading-[0.96] sm:text-5xl"
              : "mt-5 text-5xl leading-[0.92] sm:text-7xl",
          ].join(" ")}>
            {title}
          </h1>
          <p className={[
            "relative max-w-2xl text-sm leading-relaxed text-white/58",
            compact ? "mt-3" : "mt-5 sm:text-base",
          ].join(" ")}>
            {intro}
          </p>
        </header>

        <div className={compact ? "py-4 sm:py-7" : "py-10 sm:py-14"}>{children}</div>

        {showSubmitCta && (
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Feed the frequency</p>
              <p className="font-display mt-2 text-2xl font-semibold text-white">Know something we&apos;re missing?</p>
            </div>
            <Link
              href={submitHref}
              className="buzz-button buzz-button--primary"
            >
              {submitLabel} →
            </Link>
          </div>
        )}
      </main>
      <GlobalFooter />
    </div>
  );
}
