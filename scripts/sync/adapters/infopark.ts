import * as cheerio from "cheerio";
import { JobRecord, SourceDefinition } from "../schemas";
import { politeFetch } from "../fetch";
import { classifyJob } from "./jobs";

const MAX_PAGES = 30;

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

/** "20-08-2026" → "2026-08-20". */
export function parsePostedDate(text: string): string | undefined {
  const match = text.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return undefined;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** "21 Aug 2026" → "2026-08-21". */
export function parseDeadlineDate(text: string): string | undefined {
  const match = text.trim().match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (!match) return undefined;
  const month = MONTHS[match[2].slice(0, 3).toLowerCase()];
  if (!month) return undefined;
  return `${match[3]}-${month}-${match[1].padStart(2, "0")}`;
}

export { classifyJob } from "./jobs";

export function extractInfoparkJobs(
  html: string,
  source: SourceDefinition,
): JobRecord[] {
  const $ = cheerio.load(html);
  const jobs: JobRecord[] = [];
  $("#job-list table tbody tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 5) return;
    const postedAt = parsePostedDate($(cells[0]).text());
    const title = $(cells[1]).text().trim();
    const company = $(cells[2]).text().trim().replace(/\.$/, "");
    const deadlineAt = parseDeadlineDate($(cells[3]).text());
    const detailUrl = $(cells[4]).find("a").attr("href")?.trim();
    if (!title || !company || !detailUrl) return;
    const idMatch = detailUrl.match(/details\/(\d+)\/(\d+)/);
    if (!idMatch) return;
    jobs.push({
      id: `infopark-${idMatch[1]}-${idMatch[2]}`,
      title,
      company,
      postedAt,
      deadlineAt,
      location: "Infopark, Kochi",
      category: classifyJob(title),
      detailUrl,
      sourceUrl: source.url,
      sourceId: source.id,
    });
  });
  return jobs;
}

/** Fetch paginated official listings, sequentially and politely. */
export async function fetchInfoparkJobs(
  source: SourceDefinition,
): Promise<JobRecord[]> {
  const all: JobRecord[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = page === 1 ? source.url : `${source.url}?page=${page}`;
    const html = await politeFetch(url);
    const jobs = extractInfoparkJobs(html, source);
    const fresh = jobs.filter((job) => !seen.has(job.id));
    if (fresh.length === 0) break;
    for (const job of fresh) {
      seen.add(job.id);
      all.push(job);
    }
    if (!/page=\d+/.test(html) || page === MAX_PAGES) break;
  }
  return all;
}
