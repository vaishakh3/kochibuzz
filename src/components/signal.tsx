import type { CategoryId } from "@/data/events";

/**
 * THE SIGNAL — lightweight, deterministic SVG/CSS graphic primitives.
 * All decorative; every root carries aria-hidden.
 */

/** Brand lockup: kochi.buzz with a live signal dot. */
export function BrandLockup({
  pulse = false,
  className = "",
}: {
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-bold tracking-tight ${className}`}>
      <span>
        kochi<span className="text-[var(--muted)]">.</span>buzz
      </span>
      <span
        aria-hidden
        className={`signal-dot ${pulse ? "signal-dot--pulse" : ""}`}
      />
    </span>
  );
}

/** Sparse frequency-line field for hero zones. Deterministic, no randomness at render. */
export function SignalField({ className = "" }: { className?: string }) {
  const rows = [14, 30, 46, 62, 78];
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      className={`pointer-events-none ${className}`}
    >
      {rows.map((y, i) => (
        <path
          key={y}
          d={`M0 ${y} H${90 + i * 28} l6 -${5 + (i % 3) * 3} l8 ${10 + (i % 2) * 4} l6 -${5 + ((i + 1) % 3) * 3} H400`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity={0.16 - i * 0.02}
        />
      ))}
      <circle cx={96 + 2 * 28} cy={46} r="2.5" fill="var(--signal)" opacity="0.9" />
    </svg>
  );
}

/** Fine coordinate grid, used as faint background texture. */
export function CoordinateGrid({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(80% 80% at 50% 20%, black, transparent)",
        WebkitMaskImage: "radial-gradient(80% 80% at 50% 20%, black, transparent)",
        opacity: 0.5,
      }}
    />
  );
}

const PATTERNS: Record<CategoryId, (id: string) => React.ReactNode> = {
  ai: (id) => (
    <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="1.6" fill="currentColor" />
      <circle cx="34" cy="20" r="1.6" fill="currentColor" />
      <circle cx="16" cy="36" r="1.6" fill="currentColor" />
      <path d="M8 8 L34 20 L16 36" fill="none" stroke="currentColor" strokeWidth="0.5" />
    </pattern>
  ),
  opensource: (id) => (
    <pattern id={id} width="48" height="32" patternUnits="userSpaceOnUse">
      <path d="M6 6 v20 M6 12 q10 0 14 8" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="6" cy="6" r="1.8" fill="currentColor" />
      <circle cx="20" cy="20" r="1.8" fill="currentColor" />
      <text x="32" y="22" fontSize="10" fill="currentColor" fontFamily="monospace">
        {"{}"}
      </text>
    </pattern>
  ),
  cloud: (id) => (
    <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
      <rect x="6" y="6" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <rect x="22" y="20" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M16 11 h6 v9" fill="none" stroke="currentColor" strokeWidth="0.5" />
    </pattern>
  ),
  hackathon: (id) => (
    <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
      <rect x="4" y="4" width="8" height="8" fill="currentColor" opacity="0.6" />
      <rect x="20" y="16" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <rect x="8" y="28" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </pattern>
  ),
  security: (id) => (
    <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
      <circle cx="28" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="28" cy="28" r="16" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="0.35" />
      <circle cx="28" cy="28" r="1.6" fill="currentColor" />
    </pattern>
  ),
  startup: (id) => (
    <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M6 34 L18 18 L26 26 L36 8" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="36" cy="8" r="1.8" fill="currentColor" />
    </pattern>
  ),
  enterprise: (id) => (
    <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M0 16 H32 M16 0 V32" stroke="currentColor" strokeWidth="0.4" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" />
    </pattern>
  ),
  webdev: (id) => (
    <pattern id={id} width="44" height="28" patternUnits="userSpaceOnUse">
      <text x="4" y="18" fontSize="11" fill="currentColor" fontFamily="monospace">
        {"</>"}
      </text>
    </pattern>
  ),
};

/** Faint procedural texture keyed to an event category. */
export function CategoryPattern({
  category,
  className = "",
  opacity = 0.14,
}: {
  category: CategoryId;
  className?: string;
  opacity?: number;
}) {
  const id = `pat-${category}`;
  return (
    <svg aria-hidden className={`pointer-events-none ${className}`} style={{ opacity }}>
      <defs>{PATTERNS[category](id)}</defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Small stable hash for deterministic procedural covers. */
function hashOf(text: string): number {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.codePointAt(0)!) % 997;
  return hash;
}

/** Curated brand palette for procedural identity — no rainbow hashing. */
export const IDENTITY_PALETTE = [
  { bg: "#1d2312", fg: "#d7f24b" },
  { bg: "#231512", fg: "#ff8a5c" },
  { bg: "#12201f", fg: "#7adfcb" },
  { bg: "#1d1622", fg: "#c9a8f0" },
  { bg: "#221d10", fg: "#eace6d" },
] as const;

export function identityColors(name: string) {
  return IDENTITY_PALETTE[hashOf(name) % IDENTITY_PALETTE.length];
}

/** Deterministic procedural cover for projects without supplied imagery. */
export function ProjectCover({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const h = hashOf(name);
  const colors = IDENTITY_PALETTE[h % IDENTITY_PALETTE.length];
  const cols = 3 + (h % 3);
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const on = (h >> i) & 1;
    if (!on) continue;
    const x = (i % cols) * (100 / cols);
    const y = Math.floor(i / cols) * 25;
    cells.push(
      <rect
        key={i}
        x={`${x}%`}
        y={`${y}%`}
        width={`${100 / cols}%`}
        height="25%"
        fill={colors.fg}
        opacity={0.1 + ((h >> i) % 3) * 0.05}
      />,
    );
  }
  return (
    <svg
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{ background: colors.bg }}
    >
      {cells}
      <circle cx="14%" cy="78%" r="3" fill={colors.fg} opacity="0.9" />
    </svg>
  );
}
