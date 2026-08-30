"use client";

import { useSyncExternalStore } from "react";
import {
  getMyBuzzSnapshot,
  getServerMyBuzzSnapshot,
  parseMyBuzz,
  readMyBuzz,
  subscribeMyBuzz,
  writeMyBuzz,
  type MyBuzzItem,
} from "@/lib/myBuzz";

export default function SaveToBuzzButton({
  item,
  tone = "dark",
  compact = false,
  className = "",
}: {
  item: MyBuzzItem;
  tone?: "dark" | "light";
  compact?: boolean;
  className?: string;
}) {
  const snapshot = useSyncExternalStore(subscribeMyBuzz, getMyBuzzSnapshot, getServerMyBuzzSnapshot);
  const saved = parseMyBuzz(snapshot).some((candidate) => candidate.id === item.id);

  function toggle() {
    const current = readMyBuzz();
    const exists = current.some((candidate) => candidate.id === item.id);
    writeMyBuzz(exists ? current.filter((candidate) => candidate.id !== item.id) : [...current, item]);
  }

  const toneClass = tone === "light"
    ? saved
      ? "bg-lime-100 text-lime-900 ring-lime-200 hover:bg-lime-50"
      : "bg-slate-100 text-slate-700 ring-slate-200 hover:bg-white hover:text-slate-950"
    : saved
      ? "bg-[var(--signal)] text-[var(--signal-ink)] ring-[var(--signal)]"
      : "bg-white/[0.04] text-white/75 ring-white/15 hover:bg-white/[0.08] hover:text-white";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={`${saved ? "Remove" : "Save"} ${item.title} ${saved ? "from" : "to"} My Buzz`}
      className={`inline-flex min-h-10 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold ring-1 transition ${toneClass} ${className}`}
    >
      <span aria-hidden>{saved ? "✓" : "+"}</span>
      <span>
        {compact ? (saved ? "Saved" : "Save") : (saved ? "Saved to My Buzz" : "Save to My Buzz")}
      </span>
    </button>
  );
}
