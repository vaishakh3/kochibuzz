import * as cheerio from "cheerio";
import type { EventRecord } from "../schemas";

const EVENT_CATEGORY_RULES: Array<[EventRecord["category"], RegExp]> = [
  ["hackathon", /hackathon|hack day|code.?fest|build.?athon|capture the flag|\bctf\b/i],
  ["ai", /\bai\b|artificial intelligence|machine learning|\bml\b|gemini|data scien|agentic/i],
  ["security", /security|cyber|owasp|privacy|zero trust/i],
  ["cloud", /cloud|devops|kubernetes|docker|aws|azure|google cloud|platform engineering|\bsre\b/i],
  ["opensource", /open.?source|\bfoss\b|linux|wiki|mozilla/i],
  ["startup", /startup|founder|entrepreneur|venture|pitch|incubat|accelerat/i],
  ["enterprise", /enterprise|\.net|java|salesforce|sap|oracle|microsoft 365/i],
  ["webdev", /web|javascript|typescript|python|developer|software|coding|flutter|android/i],
];

export function classifyEventCategory(value: string): EventRecord["category"] {
  for (const [category, pattern] of EVENT_CATEGORY_RULES) {
    if (pattern.test(value)) return category;
  }
  return "webdev";
}

export function stripHtml(value: string): string {
  return cheerio.load(`<main>${value}</main>`)("main").text().replace(/\s+/g, " ").trim();
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function dateTimeParts(value: unknown): { date: string; time?: string } | undefined {
  if (typeof value !== "string") return undefined;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!match) return undefined;
  return { date: match[1], time: match[2] ? `${match[2]}:${match[3]}` : undefined };
}

