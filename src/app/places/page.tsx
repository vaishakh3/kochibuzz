import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import { CoordinateGrid } from "@/components/signal";
import { spaces } from "@/data/directory";

export const metadata: Metadata = {
  title: "Places — kochi.buzz",
  description:
    "Where Kochi's tech ecosystem works and hangs out — open tech labs, startup incubators, coworking spaces and IT parks.",
  alternates: { canonical: "/places" },
};

export default function PlacesPage() {
  const areas = [...new Set(spaces.map((space) => space.area))];

  return (
    <DirectoryShell
      current="/places"
      eyebrow="Coordinates of the ecosystem"
      accent="teal"
      title={<>Places to build</>}
      intro="The labs, incubators and coworking spots where the ecosystem actually happens — from a free 24/7 hacker space to the state's startup HQ."
      submitLabel="Suggest a place"
      headerArt={
        <CoordinateGrid className="absolute inset-y-0 right-0 hidden w-72 text-white/60 lg:block" />
      }
    >
      {areas.map((area) => (
        <section key={area} className="mt-2 first:mt-0">
          <h2 className="flex items-baseline gap-3 border-t border-white/10 pt-5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[var(--signal)]">
            {area}
            <span className="text-white/70">
              {spaces.filter((space) => space.area === area).length}
            </span>
          </h2>
          <ul className="mb-8 mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {spaces
              .filter((space) => space.area === area)
              .map((space) => (
                <li key={space.name}>
                  <h3 className="text-[16px] font-semibold text-white">
                    {space.name}
                  </h3>
                  <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/70">
                    {space.kind}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {space.blurb}
                  </p>
                  <div className="mt-3 flex gap-4 text-xs font-medium">
                    <a
                      href={space.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--signal)] transition hover:opacity-80"
                    >
                      Visit →
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${space.name}, ${space.area}, Kochi`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/50 transition hover:text-white"
                    >
                      Map →
                    </a>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </DirectoryShell>
  );
}
