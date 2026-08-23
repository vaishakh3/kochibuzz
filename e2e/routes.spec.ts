import { expect, test } from "@playwright/test";
import { captureBrowserErrors, expectNoHorizontalOverflow } from "./helpers";

const routes = [
  "/jobs",
  "/opportunities",
  "/communities",
  "/built",
  "/places",
  "/digest",
  "/submit",
  "/about",
] as const;

for (const path of routes) {
  test(`${path} renders without browser errors`, async ({ page }) => {
    const browserErrors = captureBrowserErrors(page);
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(browserErrors).toEqual([]);
  });
}

test("public calendar, feed, and JSON endpoints stay consumable", async ({ request }) => {
  const calendar = await request.get("/calendar.ics");
  expect(calendar.status()).toBe(200);
  expect(calendar.headers()["content-type"]).toContain("text/calendar");
  expect(await calendar.text()).toContain("BEGIN:VCALENDAR");

  const eventCalendar = await request.get("/e/dothack-26/event.ics");
  expect(eventCalendar.status()).toBe(200);
  expect(await eventCalendar.text()).toContain("BEGIN:VEVENT");

  const feed = await request.get("/feed.xml");
  expect(feed.status()).toBe(200);
  expect(feed.headers()["content-type"]).toContain("xml");

  for (const entity of ["events", "jobs", "opportunities"]) {
    const response = await request.get(`/api/v1/${entity}.json`);
    expect(response.status()).toBe(200);
    const body = await response.json() as Record<string, unknown>;
    expect(body.schemaVersion).toBe(1);
    expect(Array.isArray(body[entity])).toBe(true);
  }
});
