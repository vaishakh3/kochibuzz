import Link from "next/link";
import { submitEventUrl } from "@/data/directory";

const tabs = [
  { href: "/", label: "Calendar" },
  { href: "/communities", label: "Communities" },
  { href: "/spaces", label: "Spaces" },
];

type Props = {
  current: string;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  children: React.ReactNode;
};

export default function DirectoryShell({
  current,
  eyebrow,
  title,
  intro,
  children,
}: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8">
      <div className="aurora aurora-one" aria-hidden />
      <div className="aurora aurora-two" aria-hidden />
      <div className="aurora aurora-three" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-[1100px] rounded-[36px] bg-black/90 p-8 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.85)] ring-1 ring-white/10 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300/70">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
              {intro}
            </p>
          </div>
          <nav className="flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  tab.href === current
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-white/60 hover:text-white",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="mt-8">{children}</div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white/[0.04] px-5 py-4 ring-1 ring-white/10">
          <p className="text-sm text-white/60">
            Know something that belongs here? Tell us and we&apos;ll add it.
          </p>
          <a
            href={submitEventUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Submit an event →
          </a>
        </footer>
      </div>
    </main>
  );
}
