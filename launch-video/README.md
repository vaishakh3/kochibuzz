# Kochi Buzz launch film

A 40-second, 1920×1080 Remotion film built around the Kochi Buzz **City
Frequency** identity. The edit combines original Kochi editorial imagery with
real captures of the production calendar, attendance panel, jobs, communities,
projects and contribution flow.

## Delivery

- 30 fps, H.264 High Profile, `yuv420p`, AAC stereo at 48 kHz.
- Original 108 BPM score in D minor; no licensed samples.
- Web delivery: `public/media/kochibuzz-launch.mp4`.
- Poster: `public/media/kochibuzz-launch-poster.png`.
- Timeline and intent: [`STORYBOARD.md`](./STORYBOARD.md).
- Image-generation provenance: [`ASSET-PROMPTS.md`](./ASSET-PROMPTS.md).

## Work locally

```bash
cd launch-video
npm install
npm run capture
npm run music
npm run studio
npm run check
npm run render
npm run render:poster
```

The project is pinned to Remotion `4.0.515`. `capture` takes source-backed UI
screenshots from `https://www.kochi.buzz`; set `KOCHIBUZZ_BASE_URL` to capture a
preview or local deployment instead.

## Design constraints

The film intentionally uses one vocabulary throughout: harbour ink and warm
paper, chartreuse for live/current state, coral for human contribution, lagoon
for community, lavender for work in progress, Fraunces for editorial headlines,
Geist for interface copy, and Geist Mono for evidence labels. Generated images
are atmospheric brand plates only and never presented as evidence for a specific
event or person.

