export type Attendee = {
  name: string;
  emoji: string;
  hue: number;
  joinedAt: number;
};

export const AVATAR_EMOJI = [
  "🦊",
  "🐼",
  "🐸",
  "🦉",
  "🐙",
  "🐯",
  "🦄",
  "🐧",
  "🦁",
  "🐨",
  "🐝",
  "🚀",
];

export function hueFor(name: string): number {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) % 360;
  return hash;
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, 32);
}
