import { z } from "zod";
import { GITHUB_REPOSITORY_URL } from "./submissions";

export const SPONSORSHIP_PRICE = "₹1,499";
export const SPONSORSHIP_DAYS = 7;

const businessUrl = z.string().trim().max(300).url().refine((value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}, "Use an HTTP or HTTPS business URL without login details.");

export const sponsorshipRequestSchema = z.object({
  business: z.string().trim().min(1, "Enter your business name.").max(80),
  url: businessUrl,
  contactUrl: businessUrl,
  message: z.string().trim().min(1, "Describe what you want to promote.").max(180),
  consent: z.literal(true, { error: "Confirm that these details can be shared publicly." }),
});

export function sponsorshipInquiryUrl(input: unknown): string {
  const request = sponsorshipRequestSchema.parse(input);
  const safe = (value: string) => value.replaceAll("@", "@\u200b").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const url = new URL(`${GITHUB_REPOSITORY_URL}/issues/new`);
  url.searchParams.set("title", `Sponsorship inquiry: ${request.business.replace(/[\r\n]/g, " ")}`);
  url.searchParams.set("body", [
    "## Sponsorship inquiry",
    `Requested offer: ${SPONSORSHIP_PRICE} pilot / ${SPONSORSHIP_DAYS} days on the Jobs and Digest web pages.`,
    `### Business\n${safe(request.business)}`,
    `### Business URL\n${safe(request.url)}`,
    `### Public business contact page\n${safe(request.contactUrl)}`,
    `### What we would like to promote\n${safe(request.message)}`,
    "I consent to publishing these details in this public issue.",
    "This is an inquiry, not a paid order or a reserved slot. Dates, creative, final total and payment terms must be agreed before payment. Do not post payment information here.",
  ].join("\n\n"));
  return url.toString();
}

const campaignSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  business: z.string().trim().min(1).max(80),
  headline: z.string().trim().min(1).max(90),
  description: z.string().trim().min(1).max(180),
  url: businessUrl,
  startsOn: z.iso.date(),
  endsBefore: z.iso.date(),
}).refine(
  (campaign) => Date.parse(campaign.endsBefore) - Date.parse(campaign.startsOn) === SPONSORSHIP_DAYS * 86_400_000,
  "A pilot campaign must run for exactly seven days; endsBefore is exclusive.",
);

export const sponsorshipScheduleSchema = z.array(campaignSchema).superRefine((campaigns, context) => {
  const ids = new Set<string>();
  const sorted = [...campaigns].sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  for (const [index, campaign] of sorted.entries()) {
    if (ids.has(campaign.id)) {
      context.addIssue({ code: "custom", message: `Duplicate sponsorship ID: ${campaign.id}` });
    }
    if (index > 0 && campaign.startsOn < sorted[index - 1].endsBefore) {
      context.addIssue({ code: "custom", message: "Sponsorship dates must not overlap." });
    }
    ids.add(campaign.id);
  }
});

export type SponsorCampaign = z.infer<typeof campaignSchema>;

export function activeSponsorship(schedule: unknown, now = new Date()): SponsorCampaign | undefined {
  const campaigns = sponsorshipScheduleSchema.parse(schedule);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return campaigns.find((campaign) => campaign.startsOn <= today && today < campaign.endsBefore);
}
