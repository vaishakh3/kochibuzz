import type { Metadata } from "next";
import Link from "next/link";
import DirectoryShell from "@/components/DirectoryShell";
import SponsorshipForm from "@/components/SponsorshipForm";
import { SPONSORSHIP_DAYS, SPONSORSHIP_PRICE } from "@/lib/sponsorship";

export const metadata: Metadata = {
  title: "Sponsor Kochi Buzz — a place for your next launch",
  description: "A seven-day sponsorship pilot on Kochi Buzz's Jobs and Digest pages. See the offer, placement details and public inquiry process.",
  alternates: { canonical: "/sponsor" },
};

export default function SponsorPage() {
  return (
    <DirectoryShell
      current="/sponsor"
      eyebrow="Support the city calendar"
      accent="teal"
      title={<>Your next customer could be building here.</>}
      intro="Kochi Buzz helps people find local tech events, jobs and opportunities. Put a relevant business, opening or launch alongside that discovery."
      showSubmitCta={false}
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section aria-labelledby="pilot-heading" className="rounded-3xl border border-[var(--lagoon)]/25 bg-white/[0.035] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--lagoon)]">Pilot offer</p>
          <h2 id="pilot-heading" className="font-display mt-4 text-4xl font-semibold text-white">One week. Two desks.</h2>
          <p className="mt-6 text-4xl font-semibold text-white">{SPONSORSHIP_PRICE}<span className="ml-2 text-sm font-normal text-white/65">/ {SPONSORSHIP_DAYS} days</span></p>
          <p className="mt-2 text-xs leading-relaxed text-white/60">Proposed pilot fee. Final total, including any applicable taxes, confirmed before payment. No subscription.</p>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-white/80">
            <li>A text placement above the listings on <Link href="/jobs" className="underline underline-offset-4">Jobs</Link> and the bulletin on <Link href="/digest" className="underline underline-offset-4">Digest</Link>.</li>
            <li>Your business name, headline, a short description and one link to your website.</li>
            <li>One sponsor at a time, labelled “Sponsored”. Seven consecutive calendar days in India Standard Time; updates can take up to an hour.</li>
            <li>Creative and dates agreed before payment. No payment is collected through this form.</li>
          </ul>
          <div className="mt-7 border-t border-white/15 pt-5 text-sm leading-relaxed text-white/65">
            <p>This pilot has no verified audience figures to quote. It buys a placement, with no guarantee of views, clicks, applications or sales.</p>
            <p className="mt-3">It does not include a newsletter send, social post, placement in copied digest text or access to attendee details.</p>
          </div>
        </section>

        <section id="inquire" aria-labelledby="inquiry-heading" className="rounded-3xl border border-white/15 p-6 sm:p-8">
          <h2 id="inquiry-heading" className="font-display text-3xl font-semibold text-white">Start with a fit check.</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">Tell us what you are promoting. Prepare a draft below, then submit it on GitHub. A GitHub account is required; the inquiry and replies are public.</p>
          <SponsorshipForm />
        </section>
      </div>

      <section aria-labelledby="sponsor-terms" className="mt-10 max-w-3xl space-y-5 text-sm leading-relaxed text-white/70">
        <h2 id="sponsor-terms" className="font-display text-3xl font-semibold text-white">A useful fit for Kochi.</h2>
        <p>Local employers, coworking spaces, developer tools and relevant workshops are welcome to inquire. Every campaign needs a working business website and a clear connection to people building in Kochi. Misleading offers and unverifiable claims will be declined.</p>
        <p>Requests do not reserve dates or create an order. Availability, final copy, the total fee, payment method and cancellation terms must be confirmed before any payment. Keep payment and billing information out of public issues.</p>
        <p>Ordinary events, jobs and community listings remain free. Sponsorship does not change their order or editorial treatment. <Link href="/submit" className="text-white underline underline-offset-4">Submit a community listing →</Link></p>
      </section>
    </DirectoryShell>
  );
}
