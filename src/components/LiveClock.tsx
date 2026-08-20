"use client";

import { useSyncExternalStore } from "react";

function istTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function subscribe(onChange: () => void): () => void {
  const timer = setInterval(onChange, 30_000);
  return () => clearInterval(timer);
}

/** Live HH:MM IST readout. Shows a placeholder on the server to avoid hydration drift. */
export default function LiveClock({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, istTime, () => null);

  return (
    <span className={className} suppressHydrationWarning>
      {time ?? "--:--"} IST
    </span>
  );
}
