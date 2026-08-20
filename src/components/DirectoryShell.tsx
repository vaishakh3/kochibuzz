import Link from "next/link";
import SiteNav, { SecondaryNav } from "@/components/SiteNav";
import { submitEventUrl } from "@/data/directory";

export type Accent = "violet" | "teal" | "amber";

const accents: Record<
  Accent,
  {
    eyebrow: string;
    hairline: string;
    activeTab: string;
    button: string;
  }
> = {
  violet: {
    eyebrow: "text-violet-300/80",
    hairline: "from-violet-500/0 via-violet-400/70 to-fuchsia-400/0",
    activeTab: "bg-violet-400 text-slate-950",
    button: "bg-violet-500 hover:bg-violet-400",
  },
  teal: {
    eyebrow: "text-teal-300/80",
    hairline: "from-teal-500/0 via-teal-300/70 to-sky-400/0",
    activeTab: "bg-teal-300 text-slate-950",
    button: "bg-teal-500 hover:bg-teal-400",
  },
  amber: {
    eyebrow: "text-amber-300/80",
    hairline: "from-amber-500/0 via-amber-300/70 to-orange-400/0",
    activeTab: "bg-amber-300 text-slate-950",
    button: "bg-amber-500 hover:bg-amber-400",
  },
};

type Props = {
  current: string;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  accent?: Accent;
  /** Oversized word ghosted behind the header, e.g. "BUZZ". */
  watermark?: string;
  children: React.ReactNode;
};

export default function DirectoryShell({
  current,
  eyebrow,
  title,
  intro,
  accent = "violet",
  watermark,
  children,
}: Props) {
  const theme = accents[accent];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="aurora aurora-one" aria-hidden />
      <div className="aurora aurora-two" aria-hidden />
      <div className="aurora aurora-three" aria-hidden />

      <div className="grain relative z-10 mx-auto w-full max-w-[1100px] overflow-hidden rounded-[36px] bg-black/90 p-8 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/10 sm:p-10">
        <div
          aria-hidden
          className={`absolute inset-x-10 top-0 h-px bg-gradient-to-r ${theme.hairline}`}
        />
        {watermark && (
          <span aria-hidden className="watermark">
            {watermark}
          </span>
        )}
        <header className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.35em] ${theme.eyebrow}`}
            >
              {eyebrow}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50">
              {intro}
            </p>
          </div>
          <SiteNav current={current} activeClass={theme.activeTab} />
        </header>

        <div className="relative z-10 mt-10">{children}</div>

        <footer className="relative z-10 mt-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/[0.04] px-5 py-4 ring-1 ring-white/10">
            <p className="text-sm text-white/60">
              Know something that belongs here? Tell us and we&apos;ll add it.
            </p>
            <a
              href={submitEventUrl}
              target="_blank"
              rel="noreferrer"
              className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition ${theme.button}`}
            >
              Submit an event →
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-4">
            <SecondaryNav current={current} />
            <p className="text-[11px] text-white/30">
              Tracked from public sources ·{" "}
              <Link
                href="/about"
                className="underline decoration-white/20 underline-offset-2 hover:text-white/60"
              >
                how the data works
              </Link>
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
