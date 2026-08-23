import type { JobRecord, SourceDefinition } from "../schemas";
import { classifyJob, isKochiJobLocation } from "./jobs";

function publicJobUrl(markdownUrl: string): string {
  try {
    const url = new URL(markdownUrl);
    const match = url.pathname.match(/\/jobs\/view\/([A-Z0-9]+)\.md$/i);
    if (match) url.pathname = url.pathname.replace(match[0], `/j/${match[1]}/`);
    return url.toString();
  } catch {
    return markdownUrl;
  }
}

export function extractWorkableJobs(markdown: string, source: SourceDefinition): JobRecord[] {
  const company = source.organization ?? source.name;
  const jobs: JobRecord[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.startsWith("|") || /^\|[-|\s]+\|?$/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 7 || cells[0] === "Title") continue;
    const [title, , location, , , postedAt, details] = cells;
    const detailMatch = details.match(/\[View\]\((https?:\/\/[^)]+)\)/i);
    if (!title || !isKochiJobLocation(location) || !detailMatch) continue;
    const code = detailMatch[1].match(/\/([A-Z0-9]+)\.md(?:\?|$)/i)?.[1];
    if (!code) continue;
    jobs.push({
      id: `${source.id}-${code.toLowerCase()}`,
      title,
      company,
      postedAt: /^\d{4}-\d{2}-\d{2}$/.test(postedAt) ? postedAt : undefined,
      location,
      category: classifyJob(title),
      detailUrl: publicJobUrl(detailMatch[1]),
      sourceUrl: source.url,
      sourceId: source.id,
    });
  }
  return jobs;
}

