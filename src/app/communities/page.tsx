import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import { communityDirectory } from "@/data/directory";

export const metadata: Metadata = {
  title: "Communities — kochi.buzz",
  description:
    "The active tech communities of Kochi and Kerala — FOSS, Python, cloud native, AI, JavaScript, DevOps and more. Find your people.",
};

export default function CommunitiesPage() {
  return (
    <DirectoryShell
      current="/communities"
      eyebrow="kochi.buzz"
      title={
        <>
          Find your <span className="text-violet-400">people</span>
        </>
      }
      intro="Events come and go, but communities are where Kochi tech actually lives. These groups meet regularly — show up once and you'll keep coming back."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {communityDirectory.map((community) => (
          <li key={community.name}>
            <a
              href={community.url}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.07] hover:ring-violet-400/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[17px] font-semibold text-white">
                  {community.name}
                </h2>
                <span className="shrink-0 rounded-full bg-violet-500/15 px-3 py-1 text-[11px] font-semibold text-violet-200 ring-1 ring-violet-400/25">
                  {community.focus}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
                {community.blurb}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-white/40">{community.cadence}</span>
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
