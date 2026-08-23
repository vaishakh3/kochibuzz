import { expect, test } from "@playwright/test";
import { captureBrowserErrors, expectNoHorizontalOverflow } from "./helpers";

test("an event can be submitted from the site", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  let submitted: Record<string, unknown> | undefined;
  await page.route("**/api/submissions", async (route) => {
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        mode: "direct",
        issueUrl: "https://github.com/vaishakh3/kochibuzz/issues/42",
        issueNumber: 42,
      }),
    });
  });

  await page.goto("/submit");
  await expect(page.getByRole("heading", { level: 1, name: "Add to the buzz" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Event/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Event name").fill("Kochi Builders Night");
  await page.getByLabel("Category").selectOption("AI & Agents");
  await page.getByLabel("Start date").fill("2026-09-10");
  await page.getByLabel("Time").fill("18:00–20:00");
  await page.getByLabel("Venue / city").fill("TinkerSpace, Kalamassery");
  await page.getByLabel("Organizer").fill("Kochi Builders");
  await page.getByLabel("Official event page").fill("https://example.com/kochi-builders");
  await page.getByLabel(/I have used official or public sources/).check();
  await page.getByRole("button", { name: /Send for review/ }).click();

  await expect(page.getByRole("status")).toContainText("Sent");
  await expect(page.getByRole("link", { name: "View issue #42" })).toHaveAttribute("href", "https://github.com/vaishakh3/kochibuzz/issues/42");
  expect(submitted).toMatchObject({
    kind: "event",
    consent: true,
    fields: {
      name: "Kochi Builders Night",
      category: "AI & Agents",
      start: "2026-09-10",
      source: "https://example.com/kochi-builders",
    },
  });
  await expectNoHorizontalOverflow(page);
  expect(browserErrors).toEqual([]);
});

test("submission types expose the right focused questions", async ({ page }) => {
  await page.goto("/submit");

  await page.getByRole("button", { name: /Project/ }).click();
  await expect(page.getByRole("heading", { name: "Submit a project" })).toBeVisible();
  await expect(page.getByLabel("Connection to Kochi")).toBeVisible();

  await page.getByRole("button", { name: /Community/ }).click();
  await expect(page.getByLabel("Usual cadence")).toBeVisible();

  await page.getByRole("button", { name: /Source/ }).click();
  await expect(page.getByRole("heading", { name: "Suggest a data source" })).toBeVisible();
  await expect(page.getByLabel("What does it list?")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("a GitHub outage keeps a prepared fallback available", async ({ page }) => {
  await page.route("**/api/submissions", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        error: "The submission could not be sent automatically.",
        fallbackUrl: "https://github.com/vaishakh3/kochibuzz/issues/new?title=Event",
      }),
    });
  });
  await page.goto("/submit");
  await page.getByLabel("Event name").fill("Fallback meetup");
  await page.getByLabel("Category").selectOption("Other");
  await page.getByLabel("Start date").fill("2026-09-11");
  await page.getByLabel("Venue / city").fill("Kochi");
  await page.getByLabel("Organizer").fill("Kochi Community");
  await page.getByLabel("Official event page").fill("https://example.com/event");
  await page.getByLabel(/I have used official or public sources/).check();
  await page.getByRole("button", { name: /Send for review/ }).click();

  const alert = page.locator('div[role="alert"]').filter({ hasText: "could not be sent" });
  await expect(alert).toContainText("could not be sent");
  await expect(alert.getByRole("link", { name: "Continue on GitHub" })).toHaveAttribute("href", /github\.com/);
});
