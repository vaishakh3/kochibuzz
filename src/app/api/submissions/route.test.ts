import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const originalToken = process.env.GITHUB_SUBMISSIONS_TOKEN;

function validPayload() {
  return {
    kind: "event",
    fields: {
      name: "Kochi Builders Night",
      category: "AI & Agents",
      start: "2026-09-10",
      end: "",
      time: "18:00–20:00",
      venue: "TinkerSpace",
      organizer: "Kochi Builders",
      register: "https://example.com/register",
      source: "https://example.com/event",
      notes: "Bring a laptop.",
    },
    contact: "Maya",
    consent: true,
    website: "",
  };
}

function request(payload: unknown, origin = "https://kochi.buzz") {
  return new Request("https://kochi.buzz/api/submissions", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(payload),
  });
}

afterEach(() => {
  if (originalToken === undefined) delete process.env.GITHUB_SUBMISSIONS_TOKEN;
  else process.env.GITHUB_SUBMISSIONS_TOKEN = originalToken;
  vi.unstubAllGlobals();
});

describe("POST /api/submissions", () => {
  it("returns a prepared GitHub handoff when direct submission is not configured", async () => {
    delete process.env.GITHUB_SUBMISSIONS_TOKEN;
    const result = await POST(request(validPayload()));
    const body = await result.json();
    expect(result.status).toBe(200);
    expect(body.mode).toBe("github");
    expect(body.fallbackUrl).toContain("github.com/vaishakh3/kochibuzz/issues/new");
  });

  it("creates a labelled issue without exposing the server token", async () => {
    process.env.GITHUB_SUBMISSIONS_TOKEN = "fine-grained-secret";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      html_url: "https://github.com/vaishakh3/kochibuzz/issues/42",
      number: 42,
    }), { status: 201, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await POST(request(validPayload()));
    const body = await result.json();
    expect(result.status).toBe(201);
    expect(body).toMatchObject({ mode: "direct", issueNumber: 42 });
    expect(JSON.stringify(body)).not.toContain("fine-grained-secret");
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toMatchObject({
      title: "Event: Kochi Builders Night",
      labels: ["submission", "event"],
    });
  });

  it("rejects cross-site and invalid submissions", async () => {
    expect((await POST(request(validPayload(), "https://example.com"))).status).toBe(403);
    const invalid = validPayload();
    invalid.fields.source = "";
    const result = await POST(request(invalid));
    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({ field: "source" });
  });
});
