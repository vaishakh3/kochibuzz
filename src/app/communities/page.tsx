import type { Metadata } from "next";
import Link from "next/link";
import DirectoryShell from "@/components/DirectoryShell";
import { communityDirectory } from "@/data/directory";
import { formatDateRange } from "@/lib/calendar";
import { communityEvents } from "@/lib/communityEvents";
import { monogram, tileStyle } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Communities — kochi.buzz",
  description:
    "The active tech communities of Kochi and Kerala — FOSS, Python, cloud native, AI, JavaScript, DevOps and more. Find your people.",
};

export const revalidate = 3600;

export default function CommunitiesPage() {
  return (
    <DirectoryShell
      current="/communities"
      eyebrow="The crews of Kochi tech"
      accent="violet"
      watermark="CREWS"
      title={
        <>
          Find your <span className="ink-violet">people</span>
        </>
      }
      intro="Events come and go, but communities are where Kochi tech actually lives. These groups meet regularly — show up once and you'll keep coming back."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {communityDirectory.map((community, index) => {
          const next = communityEvents(community).upcoming[0];
          return (
            <li key={community.slug}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.06] hover:ring-violet-400/40">
                <span
                  aria-hidden
                  className="absolute right-4 top-3 text-4xl font-extrabold tracking-tight text-white/[0.06] transition group-hover:text-white/[0.1]"
                >
                  {`${index + 1}`.padStart(2, "0")}
                </span>
                <div className="flex items-center gap-3.5">
                  <Link
                    href={`/communities/${community.slug}`}
                    aria-hidden
                    tabIndex={-1}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white shadow-lg ring-1 ring-white/20"
                    style={tileStyle(community.name)}
                  >
                    {monogram(community.name)}
                  </Link>
                  <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-semibold text-white">
                      <Link
                        href={`/communities/${community.slug}`}
                        className="transition hover:text-violet-300"
                      >
                        {community.name}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-300/70">
                      {community.focus}
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
                  {community.blurb}
                </p>
                {next && (
                  <Link
                    href={`/?e=${next.id}`}
                    className="mt-3 block rounded-2xl bg-violet-500/10 px-3 py-2 text-xs text-violet-200 ring-1 ring-violet-400/20 transition hover:bg-violet-500/20 hover:text-white"
                  >
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-violet-300/70">
                      Next on the calendar
                    </span>
                    <span className="mt-0.5 block font-medium">
                      {next.title} · {formatDateRange(next)}
                    </span>
                  </Link>
                )}
                <div className="mt-4 text-xs">
                  <p className="text-white/40">{community.cadence}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <Link
                      href={`/communities/${community.slug}`}
                      className="font-medium text-white/60 transition hover:text-white"
                    >
                      Details
                    </Link>
                    <a
                      href={community.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-violet-300 transition hover:text-white"
                    >
                      Visit →
                    </a>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DirectoryShell>
  );
}
