import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kochi Buzz — The city, tuned in",
    short_name: "kochi.buzz",
    description:
      "Your live guide to events, jobs, opportunities, communities and things being built across Kochi.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b12",
    theme_color: "#0b0b12",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
