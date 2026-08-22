# Kochi Buzz — Product thesis

## North-star goal

Build Kochi Buzz into the city’s memorable, daily discovery layer: a beautiful,
source-backed product that helps a person decide what to do, where to go, who to
meet, what to build and where to work in Kochi. The experience should feel
specific to Kochi, useful within the first minute, playful without becoming a
toy, and trustworthy enough to form a habit. Technology and the maker economy
are the first strong editorial lens, not the product’s permanent boundary.

Success is not a longer homepage. Success is a visitor taking a real action:
opening an event, saving a signal, adding it to a calendar, joining a community,
visiting a place, applying for a role, or returning to a personal queue.

## The 2026 calendar direction

The receiver proved that intent-first discovery is useful. User testing then
made the stronger daily habit clear: Kochi Buzz should open directly into the
city's calendar. The design study explored four product metaphors:

1. **Kochi On Air** — a time-aware city broadcast with stations, programmes,
   a live tracklist and a device-local listening queue.
2. **City Rooms** — a spatial set of community, event and work rooms that a
   visitor could wander through.
3. **Field Notes** — an editorial collage of sourced city dispatches and
   interconnected blocks.
4. **City Datebook** — a responsive calendar as the complete opening surface.

City Datebook was selected after user feedback because it combines the clearest
daily ritual with the fastest path to action. Field Notes contributes its
editorial texture, Kochi On Air contributes identity and tempo, and City Rooms
remains a future direction for a neighbourhood layer.

The homepage now behaves like a city operating surface rather than a feed:

- The full first screen is a working calendar, with no promotional preamble.
- Desktop defaults to month; compact screens default to the city schedule.
- Month, week, day and schedule views share one date, search and event-layer state.
- A two-week ticker keeps today and the next useful dates close at hand.
- Events retain source, organizer, venue, map, share, subscribe and save actions.
- Jobs, opportunities and communities remain visible as connected city desks.
- Returning visitors keep their preferred view and My Buzz queue locally.

The broadcast is explicitly labelled as visual. There is no fake audio stream,
listener count, fabricated presenter or invented testimonial.

## What the research changed

The best discovery products reduce a noisy city to a small number of timely,
actionable choices:

- [Luma](https://help.luma.com/p/discovering-events) uses city/category
  subscriptions and a weekly roundup to turn discovery into a recurring loop.
- [DICE](https://dicefm.zendesk.com/hc/en-gb/articles/22365220986897-How-to-find-events-you-ll-love-on-DICE)
  starts with intent such as Tonight or This Week, then adds saving, reminders,
  map discovery and taste signals.
- [The Nudge](https://www.nudgetext.com/the-nudge-app) deliberately curates a
  short set of plans and lets people save or mark them done instead of relying
  on an undifferentiated infinite feed.
- [DoStuff](https://dostuffmedia.com/dostuff-day-one) frames its job as answering
  “what are you doing tonight?” through local editorial knowledge.
- [Visit London](https://www.visitlondon.com/london-app) turns saved favourites
  into a personal map and itinerary, including an offline city view.

The resulting principle for Kochi Buzz is: **do not make people browse the city
before they can use it**. Ask what they need, give them a few honest choices,
and preserve the useful ones.

The broadcast revision added four more references:

- [NTS](https://www.nts.live/about) demonstrates the strength of a live-now
  layer, named channels, deep archives and human curation. Its
  [Infinite Mixtapes](https://www.nts.live/infinite-mixtapes) also show how a
  handful of clear moods can make a large archive approachable.
- [Monocle Radio](https://monocle.com/radio/schedule/) uses a visible daily
  schedule and named recurring shows to make many editorial subjects feel like
  one coherent service.
- [Are.na channels](https://help.are.na/docs/getting-started/channels) show how
  flexible, provenance-aware collections can invite exploration without an
  algorithmic infinite feed.
- [The Pudding](https://pudding.cool/resources/) treats interaction as part of
  the story rather than decoration around it.

The synthesis is intentionally not a literal radio clone. Kochi Buzz borrows
radio's rhythm—now, next, stations, shows and tracklists—but every transmission
ends in a real civic action.

## Signature interaction: the city datebook

The first screen is an operable datebook. Selecting any date updates the ticker,
mini month, contextual day card and active calendar view. Category layers can be
combined without destroying context. Event details open in place as a keyboard-
accessible sheet; the URL becomes shareable, while the event can be registered,
saved, mapped or exported. The preferred view and saved queue live only in local
storage, providing continuity without an account or undeclared cloud profile.

## Habit loop

```text
Fresh public dates → scan today / next → act or save → calendar / My Buzz
        ↑                                                   ↓
        └────────── source refresh + remembered view ───────┘
```

The interactive calendar, digest, RSS and ICS feed are the durable return
channels. Jobs, opportunities, communities, places and built-in-Kochi projects
remain deeper discovery surfaces.

## Product guardrails

- Never claim popularity, hype, scarcity or personalization that the data
  cannot support.
- No dead controls, fake counters, placeholder imagery or invented social proof.
- Show short recommendations rather than an addictive infinite feed.
- Store device-local preferences transparently and make them easy to clear.
- Every animated behavior must retain a keyboard path and respect reduced
  motion.
- Visuals should prove local specificity or project identity, not merely fill a
  rectangle.
- New retention features must create a useful return reason: a saved-plan
  reminder, a meaningful change since last visit, a weekly city edition, or a
  friend-ready plan.

## Next product layer

The strongest future additions are a real neighbourhood/map mode, opt-in weekly
edition, “what changed since your last visit,” shareable two-person plans and
community follow/reminder controls. They should be added only when the data and
delivery channel are real; the current account-free core remains the fallback.
