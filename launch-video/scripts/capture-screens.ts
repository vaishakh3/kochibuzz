import {chromium, type Page} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";

const baseUrl = process.env.KOCHIBUZZ_BASE_URL ?? "https://www.kochi.buzz";
const output = resolve(process.cwd(), "public/screens");

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.addStyleTag({
    content: `
      * { caret-color: transparent !important; }
      html { scrollbar-width: none !important; }
      ::-webkit-scrollbar { display: none !important; }
    `,
  });
  await page.waitForTimeout(250);
}

async function open(page: Page, path: string) {
  const response = await page.goto(`${baseUrl}${path}`, {waitUntil: "networkidle"});
  if (!response?.ok()) throw new Error(`Could not capture ${path}: ${response?.status()}`);
  await settle(page);
}

async function captureViewport(page: Page, name: string) {
  await page.screenshot({path: resolve(output, name), animations: "disabled"});
}

async function main() {
  await mkdir(output, {recursive: true});
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({
    viewport: {width: 1920, height: 1080},
    deviceScaleFactor: 1,
    colorScheme: "dark",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  await open(page, "/");
  await captureViewport(page, "calendar-desktop.png");

  await open(page, "/events?e=dothack-26");
  const going = page.getByRole("heading", {name: "Who’s going?"});
  await going.waitFor({state: "visible"});
  await captureViewport(page, "event-going.png");

  await open(page, "/jobs");
  await page.locator('[aria-labelledby="job-filters-title"]').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy({top: -110}));
  await captureViewport(page, "jobs-filters.png");

  await open(page, "/communities");
  await page.locator("main").evaluate((main) => {
    window.scrollTo({top: Math.min(620, main.scrollHeight - window.innerHeight)});
  });
  await captureViewport(page, "communities.png");

  await open(page, "/built");
  await page.locator("main").evaluate((main) => {
    window.scrollTo({top: Math.min(660, main.scrollHeight - window.innerHeight)});
  });
  await captureViewport(page, "built-in-kochi.png");

  await open(page, "/submit?type=event");
  const form = page.locator("form").first();
  if (await form.count()) {
    await form.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy({top: -120}));
  }
  await captureViewport(page, "submit-event.png");

  await context.close();

  const mobile = await browser.newContext({
    viewport: {width: 430, height: 932},
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    reducedMotion: "reduce",
  });
  const mobilePage = await mobile.newPage();
  await open(mobilePage, "/");
  await captureViewport(mobilePage, "calendar-mobile.png");
  await mobile.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
