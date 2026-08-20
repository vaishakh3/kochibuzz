import Link from "next/link";

export const primaryNav = [
  { href: "/", label: "Buzz" },
  { href: "/events", label: "Events" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/jobs", label: "Jobs" },
  { href: "/built", label: "Built Here" },
  { href: "/communities", label: "Communities" },
  { href: "/places", label: "Places" },
];

export const secondaryNav = [
  { href: "/digest", label: "Digest" },
  { href: "/submit", label: "Submit" },
  { href: "/about", label: "About" },
];

export default function SiteNav({
  current,
  activeClass = "bg-orange-300 text-[#1a0c02]",
}: {
  current: string;
  activeClass?: string;
}) {
  return (
    <nav
      aria-label="Primary"
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10"
    >
      {primaryNav.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={[
            "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
            tab.href === current
              ? `${activeClass} shadow-sm`
              : "text-white/60 hover:text-white",
          ].join(" ")}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function SecondaryNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="Secondary"
      className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider"
    >
      {secondaryNav.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={
            tab.href === current
              ? "text-white"
              : "text-white/40 transition hover:text-white"
          }
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
