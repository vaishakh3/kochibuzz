import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kochi Buzz — The Kochi Calendar",
    short_name: "kochi.buzz",
    description:
      "The source-backed city calendar for Kochi — events, meetups, workshops, jobs and opportunities worth showing up for.",
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
      { name: "Open today in Kochi", short_name: "Today", url: "/" },
      { name: "Open My Buzz", short_name: "My Buzz", url: "/?mybuzz=1" },
      { name: "Find an event", short_name: "Events", url: "/events" },
      { name: "Open the digest", short_name: "Digest", url: "/digest" },
    ],
  };
}
