import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { BrandLockup } from "@/components/signal";

const columns = [
  {
    heading: "Catch up",
    links: [
      { href: "/events", label: "Events" },
      { href: "/jobs", label: "Jobs" },
      { href: "/opportunities", label: "Opportunities" },
      { href: "/digest", label: "The digest" },
    ],
  },
  {
    heading: "Meet Kochi",
    links: [
      { href: "/built", label: "Built here" },
      { href: "/communities", label: "Communities" },
      { href: "/places", label: "Places to build" },
      { href: "/calendar.ics", label: "Calendar feed" },
    ],
  },
  {
    heading: "Join in",
    links: [
      { href: "/submit", label: "Submit a signal" },
      { href: "/about", label: "How it works" },
      { href: "/feed.xml", label: "RSS" },
      {
        href: "https://github.com/vaishakh3/kochibuzz",
        label: "GitHub",
        external: true,
      },
    ],
  },
];

export default function GlobalFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-[#08080d]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <BrandLockup className="text-2xl text-white" />
            <h2 className="font-display mt-6 max-w-lg text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl">
              One city. A thousand useful signals.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/68">
              A public-interest discovery layer for the people who make, meet,
              learn and build in Kochi. Starting with tech; always open to the
              rest of the city.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h3 className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--signal)]">
                  {column.heading}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) =>
                    "external" in link && link.external ? (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-white/52 transition hover:text-white"
                        >
                          {link.label}<ArrowUpRightIcon className="ui-arrow-up-right h-3.5 w-3.5" />
                        </a>
                      </li>
                    ) : (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/52 transition hover:text-white"
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
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-white/62">
          <span>Kochi · 9.9312°N 76.2673°E</span>
          <span>Tracked from public sources · refreshed through the day</span>
          <span>Made for the city</span>
        </div>
      </div>
    </footer>
  );
}
