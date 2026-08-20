export type MyBuzzItem = {
  id: string;
  kind: "event" | "community" | "place" | "job" | "opportunity" | "project";
  eyebrow: string;
  title: string;
  detail: string;
  meta: string;
  href: string;
  external?: boolean;
  calendarHref?: string;
  trackLabel: string;
};

export const MY_BUZZ_KEY = "kochibuzz:saved:v1";
const subscribers = new Set<() => void>();

function notifySubscribers() {
  for (const subscriber of subscribers) subscriber();
}

function onMyBuzzChange() {
  notifySubscribers();
}

export function parseMyBuzz(value: string | null): MyBuzzItem[] {
  try {
    const parsed = JSON.parse(value ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MyBuzzItem =>
        Boolean(item) &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.href === "string" &&
        typeof item.trackLabel === "string",
    );
  } catch {
    return [];
  }
}

export function readMyBuzz(): MyBuzzItem[] {
  if (typeof window === "undefined") return [];
  return parseMyBuzz(getMyBuzzSnapshot());
}

export function getMyBuzzSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  try {
    return window.localStorage.getItem(MY_BUZZ_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export function getServerMyBuzzSnapshot(): string {
  return "[]";
}

export function subscribeMyBuzz(callback: () => void) {
  subscribers.add(callback);
  if (subscribers.size === 1) {
    window.addEventListener("kochibuzz:saved", onMyBuzzChange);
    window.addEventListener("storage", onMyBuzzChange);
  }
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) {
      window.removeEventListener("kochibuzz:saved", onMyBuzzChange);
      window.removeEventListener("storage", onMyBuzzChange);
    }
  };
}

export function writeMyBuzz(items: MyBuzzItem[]): boolean {
  try {
    window.localStorage.setItem(MY_BUZZ_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("kochibuzz:saved", { detail: items.length }));
    return true;
  } catch {
    return false;
  }
}
