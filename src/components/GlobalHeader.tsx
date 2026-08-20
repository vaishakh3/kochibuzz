"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GlobalSearch from "@/components/GlobalSearch";
import { BrandLockup } from "@/components/signal";

const primary = [
  { href: "/", label: "Buzz" },
  { href: "/events", label: "Events" },
  { href: "/jobs", label: "Jobs" },
  { href: "/opportunities", label: "Opportunities" },
];

const explore = [
  { href: "/built", label: "Built in Kochi" },
  { href: "/communities", label: "Communities" },
  { href: "/places", label: "Places" },
  { href: "/digest", label: "Digest" },
];

const utility = [
  { href: "/submit", label: "Submit" },
  { href: "/about", label: "About" },
];

export default function GlobalHeader({ current }: { current: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  const exploreActive = explore.some((item) => item.href === current);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!exploreOpen) return;
    function onDown(e: MouseEvent) {
      if (!exploreRef.current?.contains(e.target as Node)) setExploreOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [exploreOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const linkClass = (href: string) =>
    [
      "rounded-full px-3 py-2 text-[13px] font-semibold transition",
      href === current
        ? "bg-[var(--signal)] text-[var(--signal-ink)]"
        : "text-white/58 hover:bg-white/[0.06] hover:text-white",
    ].join(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#0b0b12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-5 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-[17px] text-white">
          <BrandLockup pulse={current === "/"} />
        </Link>
        <span className="hidden border-l border-white/[0.12] pl-4 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase leading-relaxed tracking-[0.22em] text-white/30 xl:block">
          The city<br />tuned in
        </span>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {primary.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
          <div ref={exploreRef} className="relative">
            <button
              onClick={() => setExploreOpen((v) => !v)}
              aria-expanded={exploreOpen}
              aria-haspopup="menu"
              className={[
                "flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold transition",
                exploreActive
                  ? "bg-[var(--signal)] text-[var(--signal-ink)]"
                  : "text-white/58 hover:bg-white/[0.06] hover:text-white",
              ].join(" ")}
            >
              Explore
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className={`h-3 w-3 transition-transform ${exploreOpen ? "rotate-180" : ""}`}
              >
                <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            {exploreOpen && (
              <div
                role="menu"
                className="animate-card-pop absolute left-0 top-full mt-2 w-52 overflow-hidden rounded-2xl bg-[var(--surface-2)] p-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/15"
              >
                {explore.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setExploreOpen(false)}
                    className={[
                      "block rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/[0.06]",
                      item.href === current
                        ? "font-semibold text-[var(--signal)]"
                        : "text-white/75",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-white/[0.055] px-3 text-sm text-white/50 ring-1 ring-white/10 transition hover:bg-white/[0.09] hover:text-white"
            aria-label="Search"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5 L14 14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded-full bg-white/10 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[9px] text-white/45 sm:inline">
              /
            </kbd>
          </button>

          <nav aria-label="Utility" className="hidden items-center gap-2 lg:flex">
            {utility.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-wider transition",
                  item.href === current
                    ? "bg-white/10 text-[var(--signal)]"
                    : item.href === "/submit"
                      ? "bg-[var(--coral)] text-black hover:brightness-110"
                      : "text-white/40 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] ring-1 ring-white/10 md:hidden"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 text-white/80">
              <path d="M2 4.5h12M2 8h12M2 11.5h8" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg)] md:hidden">
          <div aria-hidden className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full border-[3rem] border-[#ff6542]/20" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full border-[4rem] border-[#d7f24b]/10" />
          <div className="relative flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link href="/" className="text-[17px] text-white" onClick={() => setMenuOpen(false)}>
              <BrandLockup />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] ring-1 ring-white/10"
            >
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 text-white/80">
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="relative px-6 pb-10 pt-8">
            <p className="mb-4 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--signal)]">Kochi, live right now</p>
            <ul className="space-y-1">
              {primary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      "font-display block py-2 text-4xl font-semibold tracking-[-0.035em]",
                      item.href === current ? "text-[var(--signal)]" : "text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-white/35">
              Explore
            </p>
            <ul className="mt-2 space-y-1">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      "block py-1.5 text-lg",
                      item.href === current ? "text-[var(--signal)]" : "text-white/75",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-6">
              {utility.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-wider text-white/50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
