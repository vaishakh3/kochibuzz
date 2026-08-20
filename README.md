# kochi.buzz

Kochi is buzzing. Know what's next.

The live discovery layer for Kochi's technology, startup, maker and creative-tech
ecosystem — events, opportunities, jobs, communities, places and things being built
around Kochi. Live at [kochi.buzz](https://kochi.buzz).

## Surfaces

| Route | What it is |
| --- | --- |
| `/` | The Buzz — what's worth knowing right now (today, this week, new, closing soon) |
| `/events` | Full calendar (month / week / day / agenda, search, categories, `.ics`) |
| `/events/<id>` | Canonical event page (JSON-LD, OG card, add-to-calendar) |
| `/opportunities` | Hackathons, grants, fellowships, accelerators — with deadlines |
| `/jobs` | Openings sourced from the official Infopark Kochi job board |
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

Next.js (App Router) · TypeScript · Tailwind CSS · vitest · zod. Attendee lists are
served by `/api/attendees`, backed by Upstash Redis when
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are set and an in-memory map
otherwise.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build
npm run lint
npm test               # sync pipeline + adapter + buzz tests
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
each record individually with zod, filters non-Kochi events, dedupes by
title + start date (manual > higher trust), applies overrides, and atomically writes
`data/generated/` + `public/api/v1/`. A source failing or suspiciously returning zero
records never wipes previously valid data.

`.github/workflows/sync-data.yml` runs the sync every 4 hours and commits only when
generated data actually changed (`data: refresh Kochi.buzz sources`); Vercel deploys
the change.

## Contributing data

- Quick one-off: use the forms at [kochi.buzz/submit](https://kochi.buzz/submit)
  (structured GitHub issue templates).
- Manual records: edit `data/manual/*.json` and run `npm run sync:data`.
- Fix a wrong field on an ingested record: add a partial record keyed by id in
  `data/overrides/`.
- New automated source: add it to `data/sources/registry.json` (public pages only —
  prefer ICS/RSS/JSON-LD over HTML scraping) and, if it needs one, a parser under
  `scripts/sync/adapters/` with fixture tests.
