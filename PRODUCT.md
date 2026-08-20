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

## Signature interaction: the city receiver

The first screen is an operable receiver with four frequencies:

1. **Go out** — current and upcoming real events.
2. **Meet people** — active communities and physical spaces.
3. **Find work** — fresh roles and open opportunities.
4. **Build here** — Kochi-made projects, hackathons, grants and programmes.

Each frequency immediately resolves to a real record from the existing data
pipeline. A visitor can skip, save, add an event to their calendar or open the
source. The selected frequency and saved queue live only in local storage,
giving returning visitors continuity without requiring an account or creating
an undeclared cloud profile.

## Habit loop

```text
Fresh public signals → choose today’s intent → act or save → calendar / My Buzz
         ↑                                                     ↓
         └──────────── hourly data refresh + next visit ───────┘
```

The receiver complements, rather than replaces, the existing calendar, digest,
RSS and ICS feed. Those are the durable return channels; the receiver is the
fast decision layer.

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
