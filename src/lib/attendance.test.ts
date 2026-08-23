import { describe, expect, it } from "vitest";
import { ATTENDANCE_IDENTITY_KEY, parseAttendanceIdentity } from "@/lib/attendance";

describe("attendance identity", () => {
  it("uses a versioned device-local storage key", () => {
    expect(ATTENDANCE_IDENTITY_KEY).toBe("kochibuzz:attendance-identity:v1");
  });

  it("parses a valid local identity", () => {
    expect(parseAttendanceIdentity(JSON.stringify({
      attendeeId: "e6df7965-a302-4bfa-8607-b09a5ce091da",
      secret: "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG",
      displayName: "Maya",
      avatarId: "artist",
    }))).toEqual({
      attendeeId: "e6df7965-a302-4bfa-8607-b09a5ce091da",
      secret: "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG",
      displayName: "Maya",
      avatarId: "artist",
    });
  });

  it("rejects malformed and unknown-avatar identities", () => {
    expect(parseAttendanceIdentity("not json")).toBeNull();
    expect(parseAttendanceIdentity(JSON.stringify({
      attendeeId: "id",
      secret: "secret",
      displayName: "Maya",
      avatarId: "emoji",
    }))).toBeNull();
  });
});
