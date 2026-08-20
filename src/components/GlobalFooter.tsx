import Link from "next/link";
import { BrandLockup } from "@/components/signal";

const columns = [
  {
    heading: "Explore",
    links: [
      { href: "/events", label: "Events" },
      { href: "/jobs", label: "Jobs" },
      { href: "/opportunities", label: "Opportunities" },
      { href: "/built", label: "Built in Kochi" },
    ],
  },
  {
    heading: "Ecosystem",
    links: [
      { href: "/communities", label: "Communities" },
      { href: "/places", label: "Places" },
      { href: "/digest", label: "Digest" },
    ],
  },
  {
    heading: "Project",
    links: [
      { href: "/submit", label: "Submit" },
      { href: "/about", label: "About" },
      { href: "/feed.xml", label: "RSS" },
      {
        href: "https://github.com/vaishakh3/kochitechevents",
        label: "GitHub",
        external: true,
      },
    ],
  },
];

export default function GlobalFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)]">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-6">
        <div>
          <BrandLockup className="text-lg text-white" />
          <p className="mt-2 max-w-[220px] text-sm text-white/45">
            The live layer for Kochi tech.
          </p>
          <p className="mt-6 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em] text-white/30">
            Tracked from public sources
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h3 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em] text-white/35">
              {column.heading}
            </h3>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) =>
                "external" in link && link.external ? (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/60 transition hover:text-white"
                    >
                      {link.label} ↗
                    </a>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
