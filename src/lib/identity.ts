import type { CSSProperties } from "react";

/** Two-letter monogram, e.g. "Kochi Python" → "KP". */
export function monogram(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function hueOf(name: string): number {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) % 360;
  return hash;
}

/** Deterministic per-name gradient for monogram tiles. */
export function tileStyle(name: string): CSSProperties {
  const h = hueOf(name);
  return {
    background: `linear-gradient(135deg, hsl(${h} 75% 62% / 0.95), hsl(${(h + 50) % 360} 70% 45% / 0.95))`,
  };
}

/** Softer wash of the same hue, for page heroes. */
export function washStyle(name: string): CSSProperties {
  const h = hueOf(name);
  return {
    background: `radial-gradient(120% 120% at 0% 0%, hsl(${h} 75% 55% / 0.28), transparent 60%), radial-gradient(120% 120% at 100% 100%, hsl(${(h + 50) % 360} 70% 45% / 0.18), transparent 60%)`,
  };
}
