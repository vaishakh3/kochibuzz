import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import { MapPinIcon } from "@/components/icons";
import { spaces } from "@/data/directory";

export const metadata: Metadata = {
  title: "Spaces — kochi.buzz",
  description:
    "Where Kochi's tech ecosystem works and hangs out — open tech labs, startup incubators, coworking spaces and IT parks.",
};

export default function SpacesPage() {
  return (
    <DirectoryShell
      current="/spaces"
      eyebrow="kochi.buzz"
      title={
        <>
          Places to <span className="text-violet-400">build</span>
        </>
      }
      intro="The labs, incubators and coworking spots where the ecosystem actually happens — from a free 24/7 hacker space to the state's startup HQ."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {spaces.map((space) => (
          <li key={space.name}>
            <a
              href={space.url}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.07] hover:ring-violet-400/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[17px] font-semibold text-white">
                  {space.name}
                </h2>
                <span className="shrink-0 rounded-full bg-violet-500/15 px-3 py-1 text-[11px] font-semibold text-violet-200 ring-1 ring-violet-400/25">
                  {space.kind}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
                {space.blurb}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-white/40">
                  <MapPinIcon className="h-3 w-3" /> {space.area}
                </span>
                <span className="font-medium text-violet-300 group-hover:text-white">
                  Visit →
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </DirectoryShell>
  );
}
