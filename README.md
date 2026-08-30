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
npm run discover:events # cost-capped public-web event discovery (skips until due)
npm run discover:events:dry # forced live discovery without writing data
npm run sync:data:dry  # fetch sources, report, write nothing
npm run sync:data      # regenerate data/generated + public/api/v1
```

## Data architecture

```txt
data/
  discovered/  source-verified web discoveries + leads awaiting review
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

### Public-web discovery

`scripts/discovery/events.ts` uses the OpenAI Responses API with `gpt-5.6-luna`
as a scout for public event pages that are not in the source registry yet. Search
results never publish on model output alone: every accepted event must be in the
next 120 days, pass greater-Kochi locality checks, resolve to a safe public URL,
and have its title, date and location independently confirmed by the fetched page
or Schema.org Event data. Known calendar events are suppressed with same-date
title similarity, and unclear social/news leads stay in
`data/discovered/review.json`.

Discovery runs at most every 12 hours and stops after four measured web-search
actions. At current standard pricing, that caps the search-tool portion at about
$2.40/month; the measured Luna token volume adds roughly another $0.40/month at
that schedule. The model, interval, call ceiling and candidate ceiling are configurable
through the variables documented in `.env.example`. An OpenAI outage is non-fatal
to the hourly deterministic sync, so existing feeds continue to refresh.

`.github/workflows/quality.yml` runs lint, unit tests, a production build, and the
desktop/mobile Playwright suite on every push and pull request to `main`.

## Public submissions

`/submit` contains a first-party form for events, opportunities, projects,
communities, and public data sources. `POST /api/submissions` validates and formats
the contribution before it reaches the public GitHub review queue.

For direct, account-free issue creation, set `GITHUB_SUBMISSIONS_TOKEN` in the
deployment environment. Use a fine-grained token restricted to this repository
with only **Issues: read and write** permission. The token is read only by the
server route and must never use a broad personal `repo` token. If the variable is
absent or GitHub is temporarily unavailable, the form retains the entered data
and hands the user a prepared GitHub issue instead.

`.github/workflows/review-submissions.yml` reviews new `submission` issues with
Luna using strict structured output and no web-search tool. The submitted text and
source page are explicitly treated as untrusted data. Events, opportunities,
projects and communities are auto-added only when the official page is reachable,
deterministic evidence checks pass, every model check passes, and confidence is at
least 0.90. Ambiguous items remain open with `review:needed`; obvious spam is
labelled but left available for a human decision. New scraper/source definitions
always require manual security review.

The automation needs a repository Actions secret named `OPENAI_API_KEY`. Keep the
same variable in an ignored `.env.local` only for local discovery/testing; never
use a `NEXT_PUBLIC_` name.

## Contributing data

- Quick one-off: use the forms at [kochi.buzz/submit](https://kochi.buzz/submit)
  (structured GitHub issue templates).
- Manual records: edit `data/manual/*.json` and run `npm run sync:data`.
- Fix a wrong field on an ingested record: add a partial record keyed by id in
  `data/overrides/`.
- New automated source: add it to `data/sources/registry.json` (public pages only —
  prefer ICS/RSS/JSON-LD over HTML scraping) and, if it needs one, a parser under
  `scripts/sync/adapters/` with fixture tests.
