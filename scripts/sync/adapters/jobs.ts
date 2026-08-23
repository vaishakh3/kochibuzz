import type { JobRecord } from "../schemas";

export const KOCHI_JOB_LOCATION = /\b(kochi|cochin|ernakulam|kakkanad|kalamassery|thrikkakara)\b/i;

const CATEGORY_RULES: Array<[JobRecord["category"], RegExp]> = [
  ["internship", /\bintern(ship)?\b|\btrainee\b/i],
  ["ai-data", /\bdata\b|machine learning|\bml\b|\bai\b|analytics|data scien|\bnlp\b/i],
  ["devops-cloud", /devops|\bsre\b|cloud|kubernetes|infrastructure|platform engineer|\baws\b|azure|site reliab/i],
  ["design", /design|\bux\b|\bui\b(?!path)|graphic/i],
  ["product", /product (manager|owner|analyst)|\bscrum\b|project manager|business analyst/i],
  ["business", /sales|marketing|\bhr\b|human resource|recruit|account|finance|business development|admin|operations/i],
  ["engineering", /engineer|developer|programmer|architect|\bqa\b|test|full.?stack|front.?end|back.?end|software|\bsoc\b|analyst|support|database|migration|\bdba\b|security/i],
];

/** Deterministic keyword classification; manual overrides win downstream. */
export function classifyJob(title: string): JobRecord["category"] {
  for (const [category, pattern] of CATEGORY_RULES) {
    if (pattern.test(title)) return category;
  }
  return "other";
}

export function isKochiJobLocation(value: string): boolean {
  return KOCHI_JOB_LOCATION.test(value);
}

