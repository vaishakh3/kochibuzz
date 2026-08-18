import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "kochi.buzz — Kochi Tech Events",
    short_name: "kochi.buzz",
    description:
      "What's buzzing in Kochi tech — hackathons, AI meetups, open source conferences and startup summits in and around Kochi, Kerala.",
    start_url: "/",
    display: "standalone",
    background_color: "#050506",
    theme_color: "#0d0d10",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
