import { expect, type Page } from "@playwright/test";

const ATTENDANCE_API = "https://sqmlbrvheevtapvszrfe.supabase.co/functions/v1/event-attendance";

type MockAttendee = {
  attendeeId: string;
  displayName: string;
  avatarId: string;
  createdAt: string;
};

export async function mockAttendance(page: Page) {
  let attendee: MockAttendee | undefined;

  await page.route(`${ATTENDANCE_API}**`, async (route) => {
    const request = route.request();
    const origin = request.headers().origin ?? "http://127.0.0.1:3000";
    const headers = {
      "access-control-allow-origin": origin,
      "access-control-allow-headers": "content-type, x-attendee-id",
      "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    };

    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }

    if (request.method() === "POST") {
      const body = request.postDataJSON() as Record<string, string>;
      attendee = {
        attendeeId: body.attendee_id,
        displayName: body.display_name,
        avatarId: body.avatar_id,
        createdAt: "2026-08-23T10:00:00.000Z",
      };
    } else if (request.method() === "DELETE") {
      attendee = undefined;
    }

    const viewerId = request.headers()["x-attendee-id"];
    const attendees = attendee
      ? [{
          id: "1",
          display_name: attendee.displayName,
          avatar_id: attendee.avatarId,
          created_at: attendee.createdAt,
          is_you: viewerId === attendee.attendeeId || request.method() === "POST",
        }]
      : [];
    await route.fulfill({
      status: request.method() === "POST" ? 201 : 200,
      headers,
      body: JSON.stringify({ attendees, count: attendees.length }),
    });
  });
}

export function captureBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

export async function expectNoClippedControls(page: Page) {
  const clipped = await page.locator("button, summary").evaluateAll((controls) =>
    controls.flatMap((control) => {
      if (control.closest("details:not([open])") && control.tagName !== "SUMMARY") return [];
      const style = window.getComputedStyle(control);
      const bounds = control.getBoundingClientRect();
      if (
        style.display === "none"
        || style.visibility === "hidden"
        || bounds.width < 1
        || bounds.height < 1
        || control.scrollWidth <= control.clientWidth + 1
      ) return [];
      return [{
        label: control.getAttribute("aria-label")
          ?? control.textContent?.trim().replace(/\s+/g, " ")
          ?? control.tagName,
        clientWidth: control.clientWidth,
        scrollWidth: control.scrollWidth,
      }];
    }),
  );
  expect(clipped).toEqual([]);
}
