import type { Metadata } from "next";
import Link from "next/link";
import DirectoryShell from "@/components/DirectoryShell";
import { identityColors } from "@/components/signal";
import { communityDirectory } from "@/data/directory";
import { formatDateRange } from "@/lib/calendar";
import { communityEvents } from "@/lib/communityEvents";
import { monogram } from "@/lib/identity";

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
      title={<>Find your people</>}
      intro="Events come and go, but communities are where Kochi tech actually lives. These groups meet regularly — show up once and you'll keep coming back."
      submitLabel="Suggest a community"
    >
      <ul>
        {communityDirectory.map((community) => {
          const next = communityEvents(community).upcoming[0];
          const colors = identityColors(community.name);
          return (
            <li key={community.slug} className="border-t border-white/10">
              <div className="group flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:gap-6">
                <Link
                  href={`/communities/${community.slug}`}
                  aria-hidden
                  tabIndex={-1}
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-lg text-base font-bold ring-1 ring-white/10"
                  style={{ background: colors.bg, color: colors.fg }}
                >
                  {monogram(community.name)}
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <h2 className="text-[17px] font-semibold text-white">
                      <Link
                        href={`/communities/${community.slug}`}
                        className="transition hover:text-[var(--signal)]"
                      >
                        {community.name}
                      </Link>
                    </h2>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/70">
                      {community.focus}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-white/65">
                      {community.cadence}
                    </span>
                  </div>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/55">
                    {community.blurb}
                  </p>
                  {next && (
                    <Link
                      href={`/events/${next.id}`}
                      className="mt-2.5 inline-flex flex-wrap items-baseline gap-x-2 text-xs transition hover:opacity-80"
                    >
                      <span className="font-[family-name:var(--font-geist-mono)] uppercase tracking-wider text-[var(--signal)]">
                        Next meet
                      </span>
                      <span className="text-white/70">
                        {next.title} · {formatDateRange(next)}
                      </span>
                    </Link>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs font-medium sm:pt-1">
                  <Link
                    href={`/communities/${community.slug}`}
                    className="text-white/55 transition hover:text-white"
                  >
                    Details
                  </Link>
                  <a
                    href={community.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--signal)] transition hover:opacity-80"
                  >
                    Visit →
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </DirectoryShell>
  );
}
