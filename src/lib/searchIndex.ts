import { events } from "@/data/events";
import { jobs, opportunities, projects } from "@/data/dataset";
import { communityDirectory, spaces } from "@/data/directory";

export type SearchGroup =
  | "Events"
  | "Jobs"
  | "Opportunities"
  | "Communities"
  | "Built in Kochi"
  | "Places";

export type SearchItem = {
  group: SearchGroup;
  title: string;
  meta: string;
  href: string;
  external?: boolean;
  haystack: string;
};

let index: SearchItem[] | null = null;

/** Flat local index across every entity — built once, searched client-side. */
export function buildIndex(): SearchItem[] {
  if (index) return index;
  index = [
    ...events.map((e): SearchItem => ({
      group: "Events",
      title: e.title,
      meta: `${e.start} · ${e.venue}, ${e.city}`,
      href: `/events/${e.id}`,
      haystack: `${e.title} ${e.organizer} ${e.venue} ${e.city} ${e.tags.join(" ")}`.toLowerCase(),
    })),
    ...jobs.map((j): SearchItem => ({
      group: "Jobs",
      title: j.title,
      meta: j.company,
      href: j.detailUrl,
      external: true,
      haystack: `${j.title} ${j.company} ${j.category} ${j.location ?? ""}`.toLowerCase(),
    })),
    ...opportunities.map((o): SearchItem => ({
      group: "Opportunities",
      title: o.title,
      meta: o.organization,
      href: "/opportunities",
      haystack: `${o.title} ${o.organization} ${o.type} ${o.tags.join(" ")}`.toLowerCase(),
    })),
    ...communityDirectory.map((c): SearchItem => ({
      group: "Communities",
      title: c.name,
      meta: c.focus,
      href: `/communities/${c.slug}`,
      haystack: `${c.name} ${c.focus} ${c.blurb}`.toLowerCase(),
    })),
    ...projects.map((p): SearchItem => ({
      group: "Built in Kochi",
      title: p.name,
      meta: p.tagline,
      href: `/built#${p.id}`,
      haystack: `${p.name} ${p.tagline} ${p.categories.join(" ")}`.toLowerCase(),
    })),
    ...spaces.map((s): SearchItem => ({
      group: "Places",
      title: s.name,
      meta: `${s.kind} · ${s.area}`,
      href: "/places",
      haystack: `${s.name} ${s.kind} ${s.area} ${s.blurb}`.toLowerCase(),
    })),
  ];
  return index;
}

const GROUP_ORDER: SearchGroup[] = [
  "Events",
  "Jobs",
  "Opportunities",
  "Communities",
  "Built in Kochi",
  "Places",
];

export function searchAll(
  query: string,
  perGroup = 5,
): { group: SearchGroup; items: SearchItem[] }[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const all = buildIndex().filter((item) =>
    terms.every((t) => item.haystack.includes(t)),
  );
  return GROUP_ORDER.map((group) => ({
    group,
    items: all.filter((i) => i.group === group).slice(0, perGroup),
  })).filter((g) => g.items.length > 0);
}
