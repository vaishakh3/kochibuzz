export type DirectoryCommunity = {
  name: string;
  focus: string;
  cadence: string;
  blurb: string;
  url: string;
  /** Organizer strings used in the events data that belong to this community. */
  eventOrganizers?: string[];
};

/** Active tech communities in and around Kochi. */
export const communityDirectory: DirectoryCommunity[] = [
  {
    name: "Kochi FOSS",
    focus: "Open source",
    cadence: "Monthly, Saturdays",
    blurb:
      "A freewheeling community of Free/Libre and open source enthusiasts meeting in person almost every month since May 2023, usually around Infopark.",
    url: "https://kochifoss.org/",
  },
  {
    name: "GDG Cochin",
    focus: "Google tech",
    cadence: "Meetups & DevFest",
    blurb:
      "Google Developer Group running workshops, talks and the annual DevFest — Android, Flutter, Cloud, Firebase and more, active since 2013.",
    url: "https://gdg.community.dev/gdg-cochin/",
  },
  {
    name: "Kochi Python",
    focus: "Python",
    cadence: "Monthly meetups",
    blurb:
      "People who love to read, write and speak Python — long-running monthly meetups hosted at spaces like TinkerSpace and company offices.",
    url: "https://www.meetup.com/kochipython/",
  },
  {
    name: "Cloud Native Kochi (CNCF)",
    focus: "Cloud native",
    cadence: "Meetups + annual KCD",
    blurb:
      "The CNCF community group for Kubernetes, containers and microservices — also organises Kubernetes Community Days Kochi.",
    url: "https://cncfkochi.in/",
    eventOrganizers: [
      "Cloud Native Community Group Kochi",
      "Cloud Native Kerala community",
    ],
  },
  {
    name: "AWS User Group Kochi",
    focus: "AWS / cloud",
    cadence: "Meetups & community days",
    blurb:
      "Cloud practitioners sharing AWS architectures, serverless patterns and certification prep at regular in-person meetups.",
    url: "https://awsugkochi.in/",
  },
  {
    name: "Kochi AI User Group",
    focus: "AI / ML",
    cadence: "Monthly, Infopark",
    blurb:
      "Practitioner-led sessions on LLMs, agents and applied machine learning — one of the fastest-growing groups in the city.",
    url: "https://www.meetup.com/kochi-ai-user-group/",
  },
  {
    name: "Codex Kochi",
    focus: "AI builders",
    cadence: "Meetups & build nights",
    blurb:
      "The OpenAI Codex community in Kochi — founder-focused meetups and hands-on build nights around AI coding tools.",
    url: "https://luma.com/w0ip6oxb",
    eventOrganizers: ["Codex Kochi community"],
  },
  {
    name: "DevOps Malayalam",
    focus: "DevOps / SRE",
    cadence: "Online + in-person",
    blurb:
      "Malayalam-speaking DevOps, SRE and DevSecOps practitioners — knowledge-sharing talks, workshops and a very active online community.",
    url: "https://devopsmalayalam.io/",
    eventOrganizers: ["DevOps Malayalam"],
  },
  {
    name: "MalabarJS",
    focus: "JavaScript",
    cadence: "Meetups across Kerala",
    blurb:
      "A home for Kerala's JavaScript developers — founded in 2025 to reach devs beyond the usual big-city meetup circuit.",
    url: "https://www.malabarjs.org/",
    eventOrganizers: ["MalabarJS"],
  },
  {
    name: "TinkerHub",
    focus: "Students / makers",
    cadence: "Campus chapters + TinkerSpace",
    blurb:
      "A non-profit community of tinkerers and student makers across Kerala, running campus chapters and the 24/7 TinkerSpace open tech lab in Kochi.",
    url: "https://tinkerhub.org/",
  },
];

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
export const submitEventUrl = `https://github.com/vaishakh3/kochitechevents/issues/new?${new URLSearchParams(
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
