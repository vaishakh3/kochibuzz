import {
  GITHUB_REPOSITORY_URL,
  prepareSubmission,
  SubmissionValidationError,
} from "@/lib/submissions";

export const runtime = "nodejs";

const GITHUB_ISSUES_ENDPOINT = "https://api.github.com/repos/vaishakh3/kochibuzz/issues";
const API_VERSION = "2026-03-10";
const MAX_BODY_BYTES = 24_000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 4;

type RateEntry = { count: number; resetAt: number };
type RateStore = Map<string, RateEntry>;

const globalRateStore = globalThis as typeof globalThis & {
  kochiBuzzSubmissionRateStore?: RateStore;
};
const rateStore = globalRateStore.kochiBuzzSubmissionRateStore ?? new Map<string, RateEntry>();
globalRateStore.kochiBuzzSubmissionRateStore = rateStore;

function response(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function allowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const deploymentHost = process.env.VERCEL_URL?.toLowerCase();
    return url.origin === "https://kochi.buzz"
      || url.origin === "https://www.kochi.buzz"
      || url.origin === "http://localhost:3000"
      || url.origin === "http://127.0.0.1:3000"
      || Boolean(deploymentHost && url.protocol === "https:" && url.hostname.toLowerCase() === deploymentHost);
  } catch {
    return false;
  }
}

function requestIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateStore.get(ip);
  if (!current || current.resetAt <= now) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  rateStore.set(ip, current);
  return current.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  if (!allowedOrigin(request.headers.get("origin"))) {
    return response({ error: "This form can only be submitted from Kochi Buzz." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return response({ error: "That submission is too large." }, 413);
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return response({ error: "The submission could not be read. Please try again." }, 400);
  }

  if (input && typeof input === "object" && "website" in input && (input as { website?: unknown }).website) {
    return response({ mode: "accepted" }, 202);
  }

  let submission;
  try {
    submission = prepareSubmission(input);
  } catch (error) {
    if (error instanceof SubmissionValidationError) {
      return response({ error: error.message, field: error.field }, 400);
    }
    return response({ error: "Check the form and try again." }, 400);
  }

  const token = process.env.GITHUB_SUBMISSIONS_TOKEN?.trim();
  if (!token) {
    return response({
      mode: "github",
      fallbackUrl: submission.fallbackUrl,
    });
  }

  if (rateLimited(requestIp(request))) {
    return response({
      error: "Too many submissions from this connection. Try again in an hour.",
      fallbackUrl: submission.fallbackUrl,
    }, 429);
  }

  let githubResponse: Response;
  try {
    githubResponse = await fetch(GITHUB_ISSUES_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "KochiBuzzSubmissions/1.0",
        "X-GitHub-Api-Version": API_VERSION,
      },
      body: JSON.stringify({
        title: submission.title,
        body: submission.body,
        labels: submission.labels,
      }),
      cache: "no-store",
    });
  } catch {
    return response({
      error: "GitHub could not be reached. You can still submit the prepared issue there.",
      fallbackUrl: submission.fallbackUrl,
    }, 502);
  }

  if (githubResponse.status !== 201) {
    console.error("submission issue creation failed", {
      status: githubResponse.status,
      requestId: githubResponse.headers.get("x-github-request-id"),
    });
    return response({
      error: githubResponse.status === 422
        ? "GitHub is receiving submissions too quickly. Please try again shortly."
        : "The submission could not be sent automatically. You can still send the prepared issue on GitHub.",
      fallbackUrl: submission.fallbackUrl,
    }, githubResponse.status === 422 ? 429 : 502);
  }

  const issue = await githubResponse.json() as { html_url?: unknown; number?: unknown };
  if (typeof issue.html_url !== "string" || typeof issue.number !== "number") {
    return response({
      error: "GitHub accepted the submission, but its confirmation was incomplete.",
      fallbackUrl: `${GITHUB_REPOSITORY_URL}/issues`,
    }, 502);
  }

  return response({
    mode: "direct",
    issueUrl: issue.html_url,
    issueNumber: issue.number,
  }, 201);
}
