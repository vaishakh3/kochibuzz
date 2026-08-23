# kochi.buzz

The city, by date.

The live discovery layer for the people who make, meet, learn and build in Kochi —
starting with technology, startups, makers and creative tech. Discover events,
opportunities, jobs, communities, places and things being built around the city.
Live at [kochi.buzz](https://kochi.buzz).

The product and visual principles are documented in [BRAND.md](./BRAND.md).

## Surfaces

| Route | What it is |
| --- | --- |
| `/` | The Kochi Calendar — month / week / day / schedule, search, layers, My Buzz and `.ics` |
| `/events` | Calendar-compatible route retained for direct links and discovery |
| `/events/<id>` | Canonical event page (JSON-LD, OG card, add-to-calendar) |
| `/opportunities` | Hackathons, grants, fellowships, accelerators — with deadlines |
| `/jobs` | Kochi-area openings from Infopark plus direct company ATS feeds |
| `/built` | Curated products and projects built in/around Kochi |
| `/communities` | Active tech communities, each with its own page |
| `/places` | Where to build, work and meet (maker spaces, hubs, coworking) |
| `/digest` | Next 30 days as one shareable list (WhatsApp-friendly) |
| `/submit` | Structured submission flows (GitHub issue forms) |
| `/about` | Where the data comes from, source registry, feeds |

Machine-readable: [`/calendar.ics`](https://kochi.buzz/calendar.ics) ·
[`/feed.xml`](https://kochi.buzz/feed.xml) · `/api/v1/events.json` ·
`/api/v1/jobs.json` · `/api/v1/opportunities.json` (all `schemaVersion: 1`).

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · vitest · Playwright · zod ·
Supabase. Calendar-view preferences, saved signals, and the private attendance
identity remain device-local; public event attendance is stored without accounts.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build
npm run lint
npm test               # sync pipeline + adapter + buzz tests
npm run test:e2e        # production build + desktop/mobile Chromium journeys
npm run test:all        # lint + unit + build + desktop/mobile E2E
npm run sync:data:dry  # fetch sources, report, write nothing
npm run sync:data      # regenerate data/generated + public/api/v1
```

## Data architecture

```txt
data/
  manual/      hand-curated records (events, opportunities, projects, announcements)
  overrides/   per-id corrections that always win over ingested data
  sources/     registry.json — every automated source, its kind and trust level
  state/       source-state.json — firstSeen dates and last-known counts
  generated/   canonical output consumed by the site (never edit by hand)
```

`scripts/sync/index.ts` fetches every enabled source (polite: transparent
`KochiBuzzBot/1.0` user agent, 15s timeout, one retry, small concurrency), validates
each record individually with zod, filters non-Kochi events, removes expired automated
records, dedupes events and cross-posted jobs, applies overrides,
and atomically writes `data/generated/` + `public/api/v1/`. A source failure or suspicious
zero result never wipes its previously valid data.

Luma pages linked by curated events are fetched directly. Live title, date, time,
venue, and host changes update the stable Kochi Buzz record, while its curated summary,
tags, and attendance identity stay intact.

Enabled feeds currently include Infopark, direct Lever and Workable company job feeds,
GDG Cochin, GDG Cloud Kochi, Luma calendars, and Kerala Startup Mission's official
events, careers, and open-tenders endpoints. Global calendars are accepted only when
the event itself contains Kochi-area evidence.

`.github/workflows/sync-data.yml` runs the sync hourly and commits only when
generated data actually changed (`data: refresh Kochi.buzz sources`); Vercel deploys
the change. A rebase-safe push prevents scheduled refreshes from overwriting code
changes, and one automatically managed GitHub issue exposes hard source/test failures
until the pipeline recovers.

`.github/workflows/quality.yml` runs lint, unit tests, a production build, and the
desktop/mobile Playwright suite on every push and pull request to `main`.

## Contributing data

- Quick one-off: use the forms at [kochi.buzz/submit](https://kochi.buzz/submit)
  (structured GitHub issue templates).
- Manual records: edit `data/manual/*.json` and run `npm run sync:data`.
- Fix a wrong field on an ingested record: add a partial record keyed by id in
  `data/overrides/`.
- New automated source: add it to `data/sources/registry.json` (public pages only —
  prefer ICS/RSS/JSON-LD over HTML scraping) and, if it needs one, a parser under
  `scripts/sync/adapters/` with fixture tests.
