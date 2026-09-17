import { expect, test } from "@playwright/test";
import { captureBrowserErrors, expectNoClippedControls, expectNoHorizontalOverflow } from "./helpers";

test("a sponsorship draft requires consent and does not send or charge anything", async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.goto("/sponsor");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByLabel("Business name", { exact: true }).fill("Example Business");
  await page.getByLabel("Business website", { exact: true }).fill("https://example.com");
  await page.getByLabel("Public business contact page", { exact: true }).fill("https://example.com/contact");
  await page.getByLabel("What would you like to promote?", { exact: true }).fill("Our coworking space in Kochi.");

  await page.getByRole("button", { name: /Prepare sponsorship request/ }).click();
  await expect(page.getByRole("link", { name: /Review and submit on GitHub/ })).toHaveCount(0);

  await page.getByLabel(/I understand that this request will be public/).check();
  await page.getByRole("button", { name: /Prepare sponsorship request/ }).click();
  await expect(page.getByRole("status")).toContainText("Nothing has been sent, reserved or charged");
  const draftLink = page.getByRole("link", { name: /Review and submit on GitHub/ });
  const url = new URL((await draftLink.getAttribute("href"))!);
  expect(url.hostname).toBe("github.com");
  expect(url.searchParams.get("body")).toContain("Our coworking space in Kochi.");
  expect(url.searchParams.get("body")).toContain("₹1,499");
  await expectNoHorizontalOverflow(page);
  await expectNoClippedControls(page);

  await page.getByLabel("Business name", { exact: true }).fill("Different Business");
  await expect(draftLink).toHaveCount(0);
  expect(browserErrors).toEqual([]);
});

test("invalid business links are rejected without losing the inquiry", async ({ page }) => {
  await page.goto("/sponsor");
  await page.getByLabel("Business name", { exact: true }).fill("Example Business");
  await page.getByLabel("Business website", { exact: true }).fill("javascript:alert(1)");
  await page.getByLabel("Public business contact page", { exact: true }).fill("https://example.com/contact");
  await page.getByLabel("What would you like to promote?", { exact: true }).fill("Our workshop in Kochi.");
  await page.getByLabel(/I understand that this request will be public/).check();
  await page.getByRole("button", { name: /Prepare sponsorship request/ }).click();
  await expect(page.getByRole("alert")).toContainText("HTTP or HTTPS");
  await expect(page.getByLabel("Business name", { exact: true })).toHaveValue("Example Business");
  await expect(page.getByRole("link", { name: /Review and submit on GitHub/ })).toHaveCount(0);
});

for (const path of ["/jobs", "/digest"]) {
  test(`${path} links to the offer without pretending there is a paid sponsor`, async ({ page }) => {
    await page.goto(path);
    const placement = page.getByRole("complementary", { name: "Sponsor Kochi Buzz", exact: true });
    await expect(placement.getByRole("link", { name: /Sponsor this desk/ })).toHaveAttribute("href", "/sponsor");
    await expect(page.getByRole("complementary", { name: "Paid sponsorship" })).toHaveCount(0);
    await placement.getByRole("link", { name: /Sponsor this desk/ }).click();
    await expect(page).toHaveURL(/\/sponsor$/);
    await expectNoHorizontalOverflow(page);
  });
}
