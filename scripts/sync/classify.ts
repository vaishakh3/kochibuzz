import { EventRecord } from "./schemas";

const EVENT_CATEGORY_RULES: Array<[EventRecord["category"], RegExp]> = [
  ["hackathon", /hackathon|\bhack\b|makeathon|buildathon/i],
  ["security", /security|cyber|ctf|infosec|c0c0n/i],
  ["ai", /\bai\b|machine learning|\bml\b|\bllm\b|agents?\b|gen\s?ai|codex/i],
  ["cloud", /cloud|kubernetes|devops|\bsre\b|cncf|docker|aws|azure|gcp/i],
  ["opensource", /open.?source|foss|linux|wiki(media|pedia)|python|drupal/i],
  ["startup", /startup|founder|invest|pitch|iedc|huddle|incubat/i],
  ["enterprise", /enterprise|cio|gartner|corporate/i],
  ["webdev", /javascript|\bjs\b|web|frontend|react|node|css|typescript/i],
];

/** Deterministic keyword classification for ingested events. */
export function classifyEvent(text: string): EventRecord["category"] {
  for (const [category, pattern] of EVENT_CATEGORY_RULES) {
    if (pattern.test(text)) return category;
  }
  return "webdev";
}

const GREATER_KOCHI = /kochi|ernakulam|kakkanad|kalamassery|maradu|smartcity|smart city|infopark|cochin|thrikkakara|edappally|vyttila|aluva/i;

export type LocalityReason =
  | "kochi"
  | "greater-kochi"
  | "ernakulam-tech-ecosystem"
  | "local-community-online"
  | "manual-override"
  | "not-local";

export interface LocalityDecision {
  relevant: boolean;
  reason: LocalityReason;
}

/** Greater-Kochi relevance for ingested (non-manual) events. */
export function decideLocality(event: EventRecord): LocalityDecision {
  if (event.manual) return { relevant: true, reason: "manual-override" };
  const haystack = `${event.city} ${event.venue}`;
  if (/^kochi$/i.test(event.city.trim())) return { relevant: true, reason: "kochi" };
  if (GREATER_KOCHI.test(haystack)) return { relevant: true, reason: "greater-kochi" };
  return { relevant: false, reason: "not-local" };
}
