import Link from "next/link";
import SiteNav, { SecondaryNav } from "@/components/SiteNav";

type Props = {
  current: string;
  children: React.ReactNode;
};

/** Full-page shell for the Buzz homepage and directory-style pages. */
export default function SiteShell({ current, children }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="aurora aurora-one" aria-hidden />
      <div className="aurora aurora-two" aria-hidden />
      <div className="aurora aurora-three" aria-hidden />

      <div className="grain relative z-10 mx-auto w-full max-w-[1100px] overflow-hidden rounded-[36px] bg-black/90 p-6 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/10 sm:p-10">
        <div
          aria-hidden
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-violet-500/0 via-violet-400/70 to-fuchsia-400/0"
        />
        <header className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            kochi<span className="text-violet-400">.buzz</span>
          </Link>
          <SiteNav current={current} />
        </header>

        <div className="relative z-10 mt-10">{children}</div>

        <footer className="relative z-10 mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
          <SecondaryNav current={current} />
          <p className="text-[11px] text-white/30">
            Tracked from public sources ·{" "}
            <Link href="/about" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">
              how the data works
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
