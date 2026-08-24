import { expect, test } from "@playwright/test";
import { captureBrowserErrors, expectNoHorizontalOverflow, mockAttendance } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockAttendance(page);
});

test("calendar renders a complete, usable responsive view", async ({ page }, testInfo) => {
  const browserErrors = captureBrowserErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("August");

  if (testInfo.project.name.startsWith("desktop")) {
    await expect(page.getByRole("button", { name: /month/i })).toHaveAttribute("aria-pressed", "true");
    const grid = page.getByRole("grid", { name: /August 2026 events calendar/i });
    await expect(grid).toBeVisible();
    await expect(grid.getByRole("gridcell")).toHaveCount(42);
    const bounds = await grid.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
    await expect(page.locator(".city-calendar-rail")).toHaveCount(0);
  } else {
    await expect(page.getByRole("heading", { name: "The city schedule" })).toBeVisible();
    await expect(page.getByRole("button", { name: /open menu/i })).toBeVisible();
    await expect(page.locator(".calendar-filter-menu > summary")).toBeVisible();
    await expect(page.locator(".city-calendar-mobile-layers")).toHaveCount(0);
    await page.getByRole("button", { name: /month/i }).click();
    await expect(page.locator(".city-dayticker")).toBeHidden();
  }

  await expectNoHorizontalOverflow(page);
  expect(browserErrors).toEqual([]);
});

test("month cells stay unambiguous and show the confirmed September Codex dates", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: /month/i }).click();
  await page.getByRole("button", { name: "Next period" }).click();

  const grid = page.getByRole("grid", { name: /September 2026 events calendar/i });
  await expect(grid).toBeVisible();
  await expect(grid.locator(".calendar-month-day__date i")).toHaveCount(0);

  const foundersDay = grid.locator('.calendar-month-day:has([data-calendar-date="2026-09-16"])');
  const calicutDay = grid.locator('.calendar-month-day:has([data-calendar-date="2026-09-19"])');
  if (testInfo.project.name.startsWith("desktop")) {
    await expect(foundersDay.getByText(/Codex Community Meetup/i)).toBeVisible();
    const calicutEvent = calicutDay.locator(".calendar-event-chip").first();
    await expect(calicutEvent.locator(".calendar-event-chip__title"))
      .toHaveText("Codex Community Hackathon - Calicut");
    await calicutEvent.click();
    await expect(page.getByRole("dialog", { name: /Codex Community Hackathon/i })
      .getByRole("link", { name: /Event page|Register/ }))
      .toHaveAttribute("href", "https://luma.com/l5tpblw3");
  } else {
    await expect(foundersDay.locator('[data-calendar-date="2026-09-16"]'))
      .toHaveAttribute("aria-label", /1 event/);
    await expect(calicutDay.locator('[data-calendar-date="2026-09-19"]'))
      .toHaveAttribute("aria-label", /2 events/);
  }
});

test("search opens an event brief and Escape returns to the calendar", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.goto("/");
  const calendarSearch = page.getByRole("textbox", { name: "Search events" });
  if (await calendarSearch.isVisible()) {
    await calendarSearch.fill("Codex");
    await page.getByRole("option", { name: /Codex Community Meetup/i }).click();
  } else {
    await page.getByRole("button", { name: "Search" }).click();
    const globalSearch = page.getByRole("dialog", { name: "Search kochi.buzz" });
    await globalSearch.getByRole("textbox", { name: "Search" }).fill("Codex Community Meetup");
    await globalSearch.locator('a[href="/events/codex-meetup-kochi-founders"]').click();
    await page.waitForURL(/\/events\/codex-meetup-kochi-founders/);
    await page.goto("/?e=codex-meetup-kochi-founders");
  }
  const dialog = page.getByRole("dialog", { name: /Codex Community Meetup/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { level: 3 })).toContainText("Codex");
  await expect(dialog.getByRole("link", { name: /Event page|Register/ }))
    .toHaveAttribute("href", "https://luma.com/k65afwn7");
  await expect(dialog.getByRole("link", { name: "Google Calendar" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Map" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).not.toHaveURL(/\?e=/);
  expect(browserErrors).toEqual([]);
});

test("keyboard event search works with Back and Forward", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Inline event search is desktop-only.");
  await page.goto("/");
  const search = page.getByRole("combobox", { name: "Search events" });
  await search.fill("Founders Edition");
  const result = page.getByRole("option", { name: /Codex Community Meetup.*Founders Edition/i });
  await search.press("Tab");
  await expect(result).toBeFocused();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: /Codex Community Meetup/i });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\?e=codex-meetup-kochi-founders/);

  await page.goBack();
  await expect(dialog).toBeHidden();
  await expect(page).not.toHaveURL(/\?e=/);
  await page.goForward();
  await expect(page.getByRole("dialog", { name: /Codex Community Meetup/i })).toBeVisible();
});

test("mobile menu and search cover the viewport and remain interactive", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile overlay regression.");
  await page.goto("/");
  const viewport = page.viewportSize()!;

  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Site menu" });
  const menuBounds = await menu.boundingBox();
  expect(menuBounds).not.toBeNull();
  expect(menuBounds!.y).toBe(0);
  expect(menuBounds!.height).toBeGreaterThanOrEqual(viewport.height - 1);
  await menu.getByRole("link", { name: "Jobs", exact: true }).click();
  await expect(page).toHaveURL(/\/jobs$/);

  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog", { name: "Site menu" }).getByRole("link", { name: /My Buzz/ }).click();
  await expect(page.getByRole("dialog", { name: "My Buzz" })).toBeVisible();
  await page.getByRole("button", { name: "Close My Buzz" }).click();

  await page.getByRole("button", { name: "Search" }).click();
  const searchDialog = page.getByRole("dialog", { name: "Search kochi.buzz" });
  const searchBounds = await searchDialog.boundingBox();
  expect(searchBounds).not.toBeNull();
  expect(searchBounds!.y).toBe(0);
  expect(searchBounds!.height).toBeGreaterThanOrEqual(viewport.height - 1);
});

test("event cards remain glanceable without internal scrolling", async ({ page }) => {
  await page.goto("/?e=dothack-26");
  const dialog = page.getByRole("dialog", { name: />\.hack\(\); '26 details/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Who’s going?")).toBeVisible();
  const dimensions = await dialog.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.clientHeight + 1);
  await expectNoHorizontalOverflow(page);
});

test("saving an event persists in My Buzz", async ({ page }) => {
  await page.goto("/?e=dothack-26");
  const dialog = page.getByRole("dialog", { name: />\.hack\(\); '26 details/ });
  await dialog.getByRole("button", { name: /Save .* to My Buzz/ }).click();
  await expect(dialog.getByRole("button", { name: /Remove .* from My Buzz/ })).toBeVisible();
  await dialog.getByRole("button", { name: "Close event details" }).click();
  await page.getByRole("link", { name: /Open My Buzz, 1 saved signal/ }).click();
  const saved = page.getByRole("dialog", { name: "My Buzz" });
  await expect(saved.getByText(">.hack(); '26", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: /Open My Buzz, 1 saved signal/ }).click();
  await expect(page.getByRole("dialog", { name: "My Buzz" }).getByText(">.hack(); '26", { exact: true })).toBeVisible();
});
