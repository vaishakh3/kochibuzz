# kochi.buzz

What's buzzing in Kochi tech — a calendar of hackathons, AI meetups, open source
conferences and startup summits in and around Kochi, Kerala. Month / week / day views,
category filters, event search, an event detail card with registration / calendar / map
links, and a lightweight "who's going" RSVP with name + avatar. Opens on the current
month (IST). Live at [kochi.buzz](https://kochi.buzz).

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS. Event data is static; attendee lists
are served by `/api/attendees`, backed by Upstash Redis when
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are set (add the Upstash for
Redis integration on Vercel) and an in-memory map otherwise — fine locally, resets on
redeploy.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Adding an event

Everything lives in [`src/data/events.ts`](src/data/events.ts). Add an entry to `events`:

```ts
{
  id: "my-event-2026",
  title: "My Event 2026",
  start: "2026-10-04",           // inclusive, YYYY-MM-DD in IST
  end: "2026-10-05",             // same as start for single-day events
  startTime: "09:30",            // omit both times when the schedule is not public
  endTime: "17:00",
  category: "ai",                // see `categories` in the same file
  venue: "Lulu Cyber Tower, Infopark",
  city: "Kochi",
  organizer: "Some community",
  blurb: "One or two sentences on what actually happens there.",
  tags: ["Workshop", "Free"],
  url: "https://example.com/event",
  registerUrl: "https://example.com/register", // only when different from `url`
  note: "Optional caveat shown on the detail card",
  travel: true,                  // set when it is outside Kochi
}
```

Conventions worth keeping:

- Only list dates confirmed by the organiser's own page or announcement; use `note` for
  anything still tentative.
- Events without a published schedule are rendered as all-day rather than given a guessed
  time.
- Recurring communities with no announced date go in `communities`, not `events`.
