import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kochi Buzz — The city, tuned in",
    short_name: "kochi.buzz",
    description:
      "Your live guide to events, jobs, opportunities, communities and things being built across Kochi.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b12",
    theme_color: "#0b0b12",
    categories: ["lifestyle", "news", "productivity"],
    icons: [
      { src: "/icons/kochi-buzz-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/kochi-buzz-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Tune today’s city scan", short_name: "Today’s scan", url: "/#tune-your-buzz" },
      { name: "Open My Buzz", short_name: "My Buzz", url: "/?mybuzz=1" },
      { name: "Find an event", short_name: "Events", url: "/events" },
      { name: "Open the digest", short_name: "Digest", url: "/digest" },
    ],
  };
}
