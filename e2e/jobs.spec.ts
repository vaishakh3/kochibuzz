import { expect, test } from "@playwright/test";
import { captureBrowserErrors, expectNoHorizontalOverflow } from "./helpers";

test("job filters combine cleanly and remain shareable", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.goto("/jobs");

  const list = page.locator("[data-jobs-list]");
  const source = page.getByLabel("Source", { exact: true });
  const company = page.getByLabel("Company", { exact: true });
  const deadline = page.getByLabel("Apply by", { exact: true });

  await source.selectOption("lever");
  await expect(page).toHaveURL(/source=lever/);
  await expect(list.locator("[data-job-source=lever]").first()).toBeVisible();
  expect(await list.locator(".jobs-list-item").evaluateAll((rows) =>
    rows.every((row) => row.getAttribute("data-job-source") === "lever"),
  )).toBe(true);

  await page.getByRole("button", { name: "Clear all filters" }).click();
  const companyValue = await company.locator("option").nth(1).getAttribute("value");
  expect(companyValue).toBeTruthy();
  await company.selectOption(companyValue!);
  expect(await list.locator(".jobs-list-item").evaluateAll(
    (rows, expected) => rows.every((row) => row.getAttribute("data-job-company") === expected),
    companyValue,
  )).toBe(true);

  await page.getByRole("button", { name: "Clear all filters" }).click();
  await deadline.selectOption("listed");
  expect(await list.locator(".jobs-list-item").evaluateAll((rows) =>
    rows.every((row) => Boolean(row.getAttribute("data-job-deadline"))),
  )).toBe(true);

  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expectNoHorizontalOverflow(page);
  expect(browserErrors).toEqual([]);
});

test("job save controls stay fully inside the list", async ({ page }) => {
  await page.goto("/jobs");
  const listBox = await page.locator("[data-jobs-list]").boundingBox();
  const saveBox = await page.getByRole("button", { name: /^Save .+ to My Buzz$/ }).first().boundingBox();

  expect(listBox).not.toBeNull();
  expect(saveBox).not.toBeNull();
  expect(saveBox!.x + saveBox!.width).toBeLessThanOrEqual(listBox!.x + listBox!.width);
  expect(saveBox!.x).toBeGreaterThanOrEqual(listBox!.x);
  await expectNoHorizontalOverflow(page);
});
