import type { MetadataRoute } from "next";
import { communityDirectory } from "@/data/directory";
import { events } from "@/data/events";

const base = "https://kochi.buzz";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/opportunities`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/built`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/communities`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/places`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/digest`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/submit`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...communityDirectory.map((community) => ({
      url: `${base}/communities/${community.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `${base}/events/${event.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
