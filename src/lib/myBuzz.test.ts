import { describe, expect, it } from "vitest";
import { parseMyBuzz, type MyBuzzItem } from "@/lib/myBuzz";

const valid: MyBuzzItem = {
  id: "event:test",
  kind: "event",
  eyebrow: "Today · Meetup",
  title: "A real event",
  detail: "Event detail",
  meta: "21 August · Kochi",
  href: "/events/test",
  trackLabel: "Go outside",
};

describe("My Buzz storage", () => {
  it("returns an empty list for missing, invalid, or non-array data", () => {
    expect(parseMyBuzz(null)).toEqual([]);
    expect(parseMyBuzz("not json")).toEqual([]);
    expect(parseMyBuzz('{"id":"event:test"}')).toEqual([]);
  });

  it("keeps valid saved signals and drops incomplete records", () => {
    expect(parseMyBuzz(JSON.stringify([valid, { id: "broken", title: "No route" }]))).toEqual([valid]);
  });
});
