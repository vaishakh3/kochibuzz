import { events } from "@/data/events";
import { formatDateRange, formatTimeRange } from "@/lib/calendar";

export const revalidate = 3600;

const SITE = "https://kochi.buzz";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET(): Response {
  const sorted = [...events].sort((a, b) => b.start.localeCompare(a.start));
  const items = sorted
    .map((event) => {
      const link = `${SITE}/events/${event.id}`;
      const description = `${formatDateRange(event)} · ${formatTimeRange(event)} · ${event.venue}, ${event.city}. ${event.blurb}`;
      const [y, m, d] = event.start.split("-").map(Number);
      const pubDate = new Date(Date.UTC(y, m - 1, d)).toUTCString();
      return [
        "    <item>",
        `      <title>${escapeXml(event.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>kochi.buzz — Kochi tech events</title>",
    `    <link>${SITE}</link>`,
    "    <description>Events in and around Kochi's tech ecosystem.</description>",
    "    <language>en-in</language>",
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
