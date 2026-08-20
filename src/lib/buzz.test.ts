import { describe, expect, it } from "vitest";
import { daysBetween, isNew, weekendRange } from "./buzz";

describe("daysBetween", () => {
  it("computes calendar-day differences", () => {
    expect(daysBetween("2026-08-18", "2026-08-21")).toBe(3);
    expect(daysBetween("2026-08-31", "2026-09-01")).toBe(1);
    expect(daysBetween("2026-08-18", "2026-08-17")).toBe(-1);
  });
});

describe("isNew", () => {
  it("is true within the window, false outside or in the future", () => {
    expect(isNew("2026-08-17", "2026-08-18")).toBe(true);
    expect(isNew("2026-08-10", "2026-08-18")).toBe(false);
    expect(isNew("2026-08-20", "2026-08-18")).toBe(false);
    expect(isNew(undefined, "2026-08-18")).toBe(false);
  });
});

describe("weekendRange", () => {
  it("finds the upcoming Saturday from a weekday", () => {
    // 2026-08-18 is a Tuesday
    const range = weekendRange(new Date(2026, 7, 18));
    expect(range).toEqual({ start: "2026-08-22", end: "2026-08-23" });
  });
  it("uses the current weekend on Sunday", () => {
    // 2026-08-23 is a Sunday
    const range = weekendRange(new Date(2026, 7, 23));
    expect(range).toEqual({ start: "2026-08-22", end: "2026-08-23" });
  });
});
