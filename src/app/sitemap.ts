import type { MetadataRoute } from "next";
import { communityDirectory } from "@/data/directory";
import { events } from "@/data/events";

const base = "https://kochi.buzz";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/communities`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/spaces`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/digest`, changeFrequency: "daily", priority: 0.8 },
    ...communityDirectory.map((community) => ({
      url: `${base}/communities/${community.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `${base}/?e=${event.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
