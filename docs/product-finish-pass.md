# Kochi Buzz product finish pass

## Product promise

Kochi Buzz should feel like tuning into a living city, then leave a person with one
clear thing to do: go somewhere, meet someone, move their work, or build something.
It is not an infinite feed and it does not manufacture popularity. Every actionable
signal must resolve to a public source, a local profile, or a working first-party
route.

## Six-hour finish brief

1. Make the homepage a daily ritual, not a one-time landing page.
2. Let people keep and carry useful signals without requiring an account.
3. Make the current moment legible: what is today, next, new, or closing.
4. Preserve a distinctive editorial-radio identity while reducing ornamental UI.
5. Make every primary action work with keyboard, touch, narrow screens, and reduced
   motion.
6. Ship only after lint, tests, production build, desktop/mobile browser review, and
   live-domain verification pass.

## Research notes

- Strong local products frame a small daily edition rather than presenting an
  undifferentiated directory. City Cast pairs a daily reset with events and local
  recommendations; its useful pattern is cadence plus point of view, not its media
  format.
- Event discovery products such as Luma make the next action obvious and let people
  carry an event into another context. Kochi Buzz already has calendar files; saved
  signals should be similarly portable.
- Radio interfaces make `now`, `next`, station choice, and return state immediately
  visible. Kochi Buzz can borrow that interaction grammar without pretending to
  stream audio.

## Prioritized loops

### P0 — daily scan and portable My Buzz

- Record which of the four real receiver stations a device has tuned today.
- Reset progress by Kochi calendar day and never upload it.
- Show a compact, understandable 1/4 → 4/4 scan state.
- Make My Buzz reachable from the global header on every route.
- Allow individual removal plus copying and sharing the saved list.

Acceptance: daily state survives refresh, resets for a new date, saved state can be
opened from another route, every control has a useful accessible label, and the
empty state does not dead-end.

### P1 — temporal clarity and primary journeys

- Review homepage content hierarchy for duplicate sections and weak next actions.
- Review event, job, opportunity, community, place, project and digest routes from a
  first-time and returning-user perspective.
- Improve missing, empty, stale and outbound-link states where evidence supports it.

### P2 — visual, responsive and performance finish

- Review desktop and 390px layouts after every material UI change.
- Audit focus, overlays, contrast, text size, overflow and reduced motion.
- Inspect large public assets and runtime output; optimize only when it changes a
  user-facing load path.

## Rejected or deferred ideas

- Fake live listener counts, popularity, streak competition, RSVP activity, or
  social proof: not source-backed.
- Decorative audio controls: the product does not currently publish audio.
- A map without reliable coordinates: visually novel but operationally misleading.
- A second intent picker below the receiver: duplicates the four stations.
- Generated documentary photographs: original illustrations are labelled as such;
  factual place and event imagery must come from a valid source.

## Verification log

### Implemented

- Added a date-scoped, device-local four-station city scan. The displayed station
  counts as the first tuned frequency; progress survives refresh and resets when the
  Kochi calendar date changes.
- Promoted My Buzz into the global header and mobile menu. It opens in place on the
  homepage and routes back to the saved drawer from every other surface.
- Expanded saving to event pages and calendar sheets, jobs, opportunities,
  communities, projects and places.
- Added individual removal, event calendar export, whole-list copy/share, clear-all,
  privacy status and a non-dead-end empty state.
- Deduplicated saved-state window listeners behind one external-store subscription,
  versioned/minimized browser data, guarded storage failures, and deferred off-screen
  job-row rendering.
- Added focus traps and focus return for search, My Buzz and the mobile site menu;
  added Escape behavior for Explore and current-page semantics to navigation.
- Completed install metadata: 192px, 512px and Apple touch icons, standalone metadata,
  app shortcuts for Today, My Buzz, Events and Digest, plus the branded app mark.
- Corrected the README's stale attendee-service description.

### Browser evidence

- 12 primary routes reviewed at 390px and 1280px, including an event and community
  detail route: zero horizontal overflow, visible text below 10px, missing image alt
  attributes or unnamed buttons.
- Computed foreground/background audit on all mobile routes and the critical desktop
  routes found no text below WCAG-like 4.5:1 normal / 3:1 large thresholds.
- Verified 1/4 → 4/4 daily scan progression, saved-state updates across routes,
  calendar-sheet saving, header count synchronization, query-string drawer opening,
  individual and clear-all removal, empty-state receiver recovery, search focus
  return, and mobile-menu focus return.
- Reviewed homepage, receiver, My Buzz, event pass, jobs and opportunities visually at
  mobile, tablet, desktop and 1024px widths.
- Manifest, Apple icon, 192px icon and 512px icon all return valid responses locally.

### Automated evidence

- `npm run sync:data:dry`: 1/1 source successful; 427 candidates; 446 accepted
  records; zero warnings, failures, invalid records or data changes.
- `npm test -- --run`: 27 tests passing, including corrupted/incomplete My Buzz data.
- `npm run lint`: passing.
- `npm run build`: passing with 61 generated routes, including the Apple touch icon.

### Future opportunities that require new editorial or product authority

- Add arts, food, civic and neighbourhood frequencies only after stable official
  sources and a clear moderation policy exist.
- Add notifications only when Kochi Buzz can publish a genuinely useful scheduled
  edition; never ask for notification permission on first visit.
- Add account sync only if people ask to carry My Buzz between devices. Device-local
  storage is the simpler and more private default today.
