import Link from "next/link";
import schedule from "../../data/manual/sponsorships.json";
import { activeSponsorship } from "@/lib/sponsorship";

export default function SponsorPlacement() {
  const sponsor = activeSponsorship(schedule);

  return (
    <aside aria-label={sponsor ? "Paid sponsorship" : "Sponsor Kochi Buzz"} className="mb-7 rounded-2xl border border-white/15 bg-white/[0.035] p-5">
      {sponsor ? (
        <>
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.15em] text-[var(--lagoon)]">
            Sponsored · {sponsor.business}
          </p>
          <a href={sponsor.url} target="_blank" rel="sponsored noopener noreferrer" className="mt-2 inline-block text-lg font-semibold text-white underline decoration-white/25 underline-offset-4 hover:decoration-white">
            {sponsor.headline} ↗
          </a>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65">{sponsor.description}</p>
          <Link href="/sponsor" className="mt-3 inline-block text-xs text-white/60 underline underline-offset-4">About sponsorships</Link>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-white/70">Hiring, hosting or building in Kochi?</p>
          <Link href="/sponsor" className="text-sm font-semibold text-[var(--signal)] underline underline-offset-4">Sponsor this desk →</Link>
        </div>
      )}
    </aside>
  );
}
