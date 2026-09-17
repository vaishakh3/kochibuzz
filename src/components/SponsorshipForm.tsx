"use client";

import { useState } from "react";
import { sponsorshipInquiryUrl, sponsorshipRequestSchema } from "@/lib/sponsorship";

const inputClass = "mt-2 w-full rounded-xl border border-white/20 bg-white/[0.05] px-4 py-3 text-white placeholder:text-white/40 focus:border-[var(--signal)]";

export default function SponsorshipForm() {
  const [inquiryUrl, setInquiryUrl] = useState("");
  const [error, setError] = useState("");

  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = sponsorshipRequestSchema.safeParse({
      business: data.get("business"),
      url: data.get("url"),
      contactUrl: data.get("contactUrl"),
      message: data.get("message"),
      consent: data.get("consent") === "yes",
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    setInquiryUrl(sponsorshipInquiryUrl(result.data));
  }

  return (
    <form onSubmit={prepare} onChange={() => { setInquiryUrl(""); setError(""); }} className="mt-6 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-white/80" htmlFor="sponsor-business">
          Business name
          <input id="sponsor-business" name="business" required maxLength={80} autoComplete="organization" className={inputClass} />
        </label>
        <label className="text-sm text-white/80" htmlFor="sponsor-url">
          Business website
          <input id="sponsor-url" name="url" type="url" required maxLength={300} placeholder="https://…" className={inputClass} />
        </label>
      </div>
      <label className="block text-sm text-white/80" htmlFor="sponsor-contact">
        Public business contact page
        <input id="sponsor-contact" name="contactUrl" type="url" required maxLength={300} placeholder="https://your-business.com/contact" aria-describedby="sponsor-contact-hint" className={inputClass} />
        <span id="sponsor-contact-hint" className="mt-2 block text-xs leading-relaxed text-white/60">Use a contact page or public business profile. Do not enter a private email address or phone number.</span>
      </label>
      <label className="block text-sm text-white/80" htmlFor="sponsor-message">
        What would you like to promote?
        <textarea id="sponsor-message" name="message" required maxLength={180} rows={3} placeholder="Your opening, product, workshop or workspace, and who it is for." className={inputClass} />
      </label>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-white/70" htmlFor="sponsor-consent">
        <input id="sponsor-consent" name="consent" type="checkbox" value="yes" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--signal)]" />
        <span>I understand that this request will be public on GitHub. I will not include private information or payment details.</span>
      </label>
      <button className="buzz-button buzz-button--primary" type="submit">Prepare sponsorship request →</button>
      <div aria-live="polite">
        {error && <p role="alert" className="text-sm text-red-200">{error}</p>}
        {inquiryUrl && (
          <div role="status" className="rounded-xl border border-[var(--signal)]/30 p-5 text-sm leading-relaxed text-white/80">
            <p>Your draft is ready. Nothing has been sent, reserved or charged.</p>
            <a href={inquiryUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-semibold text-[var(--signal)] underline underline-offset-4">Review and submit on GitHub ↗</a>
            <p className="mt-2 text-xs">Sign in to GitHub and submit the issue to send your request. Replies will appear on that issue.</p>
          </div>
        )}
      </div>
    </form>
  );
}
