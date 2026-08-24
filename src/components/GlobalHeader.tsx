"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import GlobalSearch from "@/components/GlobalSearch";
import { BrandLockup } from "@/components/signal";
import { getMyBuzzSnapshot, getServerMyBuzzSnapshot, parseMyBuzz, subscribeMyBuzz } from "@/lib/myBuzz";

const primary = [
  { href: "/", label: "Calendar" },
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
  const savedSnapshot = useSyncExternalStore(subscribeMyBuzz, getMyBuzzSnapshot, getServerMyBuzzSnapshot);
  const savedCount = parseMyBuzz(savedSnapshot).length;
  const portalRoot = typeof document === "undefined" ? null : document.body;
  const exploreRef = useRef<HTMLDivElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

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

  function openMyBuzz(event: React.MouseEvent<HTMLAnchorElement>) {
    if (current !== "/") return;
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("kochibuzz:open-saved"));
  }

  useEffect(() => {
    if (!exploreOpen) return;
    function onDown(e: MouseEvent) {
      if (!exploreRef.current?.contains(e.target as Node)) setExploreOpen(false);
    }
    function onExploreKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setExploreOpen(false);
      exploreButtonRef.current?.focus();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onExploreKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onExploreKey);
    };
  }, [exploreOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();
    function onMenuKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = menuPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onMenuKey);
    return () => {
      document.removeEventListener("keydown", onMenuKey);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [menuOpen]);

  const linkClass = (href: string) =>
    [
      "relative px-3 py-4 text-[13px] font-semibold transition",
      href === current
        ? "text-white after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-[var(--signal)]"
        : "text-white/58 hover:text-white",
    ].join(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[#0b0b12]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-5 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-[17px] text-white">
          <BrandLockup pulse={current === "/"} />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {primary.map((item) => (
            <Link key={item.href} href={item.href} aria-current={item.href === current ? "page" : undefined} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
          <div ref={exploreRef} className="relative">
            <button
              ref={exploreButtonRef}
              onClick={() => setExploreOpen((v) => !v)}
              aria-expanded={exploreOpen}
              aria-haspopup="menu"
              className={[
                "relative flex items-center gap-1 px-3 py-4 text-[13px] font-semibold transition",
                exploreActive
                  ? "text-white after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-[var(--signal)]"
                  : "text-white/58 hover:text-white",
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
                    aria-current={item.href === current ? "page" : undefined}
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
          <Link
            href="/?mybuzz=1"
            onClick={openMyBuzz}
            className="header-my-buzz"
            aria-label={`Open My Buzz, ${savedCount} saved ${savedCount === 1 ? "signal" : "signals"}`}
          >
            <span className="hidden xl:inline">My Buzz</span>
            <span aria-hidden>◎</span>
            <b className={savedCount > 0 ? "has-saved" : ""}>{savedCount}</b>
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-white/48 transition hover:bg-white/[0.05] hover:text-white"
            aria-label="Search"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5">
              <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5 L14 14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded-full bg-white/10 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] text-white/70 sm:inline">
              /
            </kbd>
          </button>

          <nav aria-label="Utility" className="hidden items-center gap-2 lg:flex">
            {utility.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.href === current ? "page" : undefined}
                className={[
                  "rounded-lg px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-wider transition",
                  item.href === current
                    ? "bg-white/10 text-[var(--signal)]"
                    : item.href === "/submit"
                      ? "bg-[var(--coral)] text-black hover:brightness-110"
                      : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-white/70 transition hover:bg-white/[0.05] hover:text-white md:hidden"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 text-white/80">
              <path d="M2 4.5h12M2 8h12M2 11.5h8" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {portalRoot && menuOpen && createPortal((
        <div ref={menuPanelRef} role="dialog" aria-modal="true" aria-label="Site menu" className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg)] md:hidden">
          <div className="relative flex h-14 items-center justify-between border-b border-white/10 px-4">
            <Link href="/" className="text-[17px] text-white" onClick={() => setMenuOpen(false)}>
              <BrandLockup />
            </Link>
            <button
              ref={menuCloseRef}
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-lg text-white/70 transition hover:bg-white/[0.05] hover:text-white"
            >
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 text-white/80">
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="relative px-6 pb-10 pt-8">
            <p className="mb-4 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--signal)]">What Kochi has next</p>
            <ul className="space-y-1">
              {primary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={item.href === current ? "page" : undefined}
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
            <p className="mt-8 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.26em] text-white/65">
              Explore
            </p>
            <ul className="mt-2 space-y-1">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={item.href === current ? "page" : undefined}
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
              <Link
                href="/?mybuzz=1"
                onClick={(event) => {
                  setMenuOpen(false);
                  openMyBuzz(event);
                }}
                className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-wider text-[var(--signal)]"
              >
                My Buzz · {savedCount}
              </Link>
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
      ), portalRoot)}

      {portalRoot && createPortal(
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />,
        portalRoot,
      )}
    </header>
  );
}
