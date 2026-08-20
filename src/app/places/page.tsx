import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import { MapPinIcon } from "@/components/icons";
import { spaces } from "@/data/directory";

export const metadata: Metadata = {
  title: "Places — kochi.buzz",
  description:
    "Where Kochi's tech ecosystem works and hangs out — open tech labs, startup incubators, coworking spaces and IT parks.",
  alternates: { canonical: "/places" },
};

export default function PlacesPage() {
  return (
    <DirectoryShell
      current="/places"
      eyebrow="Coordinates of the ecosystem"
      accent="teal"
      watermark="PLACES"
      title={
        <>
          Places to <span className="ink-teal">build</span>
        </>
      }
      intro="The labs, incubators and coworking spots where the ecosystem actually happens — from a free 24/7 hacker space to the state's startup HQ."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {spaces.map((space, index) => (
          <li key={space.name}>
            <a
              href={space.url}
              target="_blank"
              rel="noreferrer"
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.06] hover:ring-teal-300/40"
            >
              <span
                aria-hidden
                className="absolute right-4 top-3 text-4xl font-extrabold tracking-tight text-white/[0.06] transition group-hover:text-white/[0.1]"
              >
                {`${index + 1}`.padStart(2, "0")}
              </span>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-200 ring-1 ring-teal-300/25">
                <MapPinIcon className="h-3 w-3" />
                {space.area}
              </span>
              <h2 className="mt-3 text-[17px] font-semibold text-white">
                {space.name}
              </h2>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-200/60">
                {space.kind}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
                {space.blurb}
              </p>
              <span className="mt-4 text-xs font-medium text-teal-300 transition group-hover:text-white">
                Visit →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </DirectoryShell>
  );
}
