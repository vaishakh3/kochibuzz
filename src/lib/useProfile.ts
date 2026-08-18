"use client";

import { useState } from "react";
import { AVATAR_EMOJI, normalizeName } from "@/lib/attendees";

export type Profile = {
  name: string;
  emoji: string;
};

const PROFILE_KEY = "kochi.buzz/profile";
const GOING_KEY = "kochi.buzz/going";

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function useProfile() {
  const [profile, setProfileState] = useState<Profile | null>(() => {
    const saved = readJSON<Profile>(PROFILE_KEY);
    return saved?.name && AVATAR_EMOJI.includes(saved.emoji) ? saved : null;
  });
  const [going, setGoingState] = useState<string[]>(
    () => readJSON<string[]>(GOING_KEY) ?? [],
  );

  function setProfile(name: string, emoji: string) {
    const next = { name: normalizeName(name), emoji };
    setProfileState(next);
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  }

  function setGoing(eventId: string, isGoing: boolean) {
    setGoingState((prev) => {
      const next = isGoing
        ? [...new Set([...prev, eventId])]
        : prev.filter((id) => id !== eventId);
      window.localStorage.setItem(GOING_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { profile, setProfile, going, setGoing };
}
