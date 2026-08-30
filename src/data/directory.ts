import communities from "../../data/manual/communities.json";

export type DirectoryCommunity = {
  /** URL segment for /communities/<slug>. */
  slug: string;
  name: string;
  focus: string;
  cadence: string;
  blurb: string;
  url: string;
  /** Organizer strings used in the events data that belong to this community. */
  eventOrganizers?: string[];
};

/** Active tech communities in and around Kochi. */
export const communityDirectory = communities satisfies DirectoryCommunity[];

export const communityBySlug = new Map(
  communityDirectory.map((community) => [community.slug, community]),
);

export type Space = {
  name: string;
  kind: string;
  area: string;
  blurb: string;
  url: string;
};

/** Places where Kochi's tech ecosystem works, learns and hangs out. */
export const spaces: Space[] = [
  {
    name: "TinkerSpace",
    kind: "Open tech lab · free",
    area: "Kalamassery",
    blurb:
      "India's first 24/7 open tech lab — walk in, learn, build. Free GPU access, maker tables, 3D printing and a hacker-space vibe, run by TinkerHub.",
    url: "https://tinkerhub.org/tinkerspace",
  },
  {
    name: "Kerala Startup Mission (KSUM)",
    kind: "Startup incubator",
    area: "Kalamassery",
    blurb:
      "The state's nodal agency for startups — the Integrated Startup Complex hosts incubation, funding programmes and most IEDC activity.",
    url: "https://startupmission.kerala.gov.in/",
  },
  {
    name: "LEAP Coworks",
    kind: "Coworking · subsidised",
    area: "Across Kerala",
    blurb:
      "KSUM's coworking network — incubation centres turned into bookable workspaces with meeting rooms and event spaces; startups with a KSUM UID get subsidies.",
    url: "https://leap.startupmission.in/",
  },
  {
    name: "Infopark Kochi",
    kind: "IT park",
    area: "Kakkanad",
    blurb:
      "Kerala's government-owned IT hub since 2004 and the gravitational centre of Kochi tech — many meetups happen on campus.",
    url: "https://infopark.in/",
  },
  {
    name: "i by Infopark",
    kind: "Coworking",
    area: "Ernakulam South Metro",
    blurb:
      "Plug-and-play coworking from Infopark, right inside Ernakulam South Metro Station — city-centre desks across seven floors.",
    url: "https://ibyinfopark.in/",
  },
];

/** Prefilled GitHub issue for community event submissions. */
export const submitEventUrl = `https://github.com/vaishakh3/kochibuzz/issues/new?${new URLSearchParams(
  {
    title: "Event: ",
    body: [
      "**Event name:**",
      "",
      "**Date(s):**",
      "",
      "**Time:**",
      "",
      "**Venue / city:**",
      "",
      "**Organizer:**",
      "",
      "**Registration / event page link:**",
      "",
      "**Anything else:**",
      "",
    ].join("\n"),
  },
).toString()}`;
