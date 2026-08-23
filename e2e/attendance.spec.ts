import { expect, test } from "@playwright/test";
import { captureBrowserErrors, expectNoHorizontalOverflow, mockAttendance } from "./helpers";

test("attendance can be joined, edited, persisted, and removed", async ({ page }) => {
  await mockAttendance(page);
  const browserErrors = captureBrowserErrors(page);
  await page.goto("/?e=dothack-26");
  const dialog = page.getByRole("dialog", { name: />\.hack\(\); '26 details/ });

  await dialog.getByRole("button", { name: "I’m going" }).click();
  const editor = dialog.locator("form.attendance-editor");
  await expect(editor).toBeVisible();
  await dialog.getByRole("textbox", { name: "Your name" }).fill("Maya");
  await dialog.locator(".attendance-avatar-option").nth(3).click();
  await expect(dialog.getByRole("radio").nth(3)).toBeChecked();
  await expectNoHorizontalOverflow(page);
  await dialog.getByRole("button", { name: "Confirm I’m going" }).click();

  await expect(dialog.getByText("You are going.", { exact: true })).toBeVisible();
  await expect(dialog.getByText("You’re going", { exact: true })).toBeVisible();
  await expect(dialog.getByText("You is going.", { exact: true })).toHaveCount(0);

  await page.reload();
  const restored = page.getByRole("dialog", { name: />\.hack\(\); '26 details/ });
  await expect(restored.getByText("You are going.", { exact: true })).toBeVisible();
  await restored.getByRole("button", { name: "Edit" }).click();
  await restored.getByRole("textbox", { name: "Your name" }).fill("Maya S");
  await restored.getByRole("button", { name: "Save changes" }).click();
  await expect(restored.getByText("You are going.", { exact: true })).toBeVisible();
  await restored.getByRole("button", { name: "Can’t make it" }).click();
  await expect(restored.getByText("No one yet. Be the first.", { exact: true })).toBeVisible();
  expect(browserErrors).toEqual([]);
});
