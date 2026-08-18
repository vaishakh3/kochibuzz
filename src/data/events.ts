export type CategoryId =
  | "hackathon"
  | "ai"
  | "opensource"
  | "startup"
  | "security"
  | "enterprise"
  | "cloud"
  | "webdev";

export type Category = {
  id: CategoryId;
  label: string;
  dot: string;
  chip: string;
  bar: string;
};

export const categories: Category[] = [
  {
    id: "hackathon",
    label: "Hackathons",
    dot: "bg-violet-400",
    chip: "bg-violet-100 text-violet-900 ring-violet-200",
    bar: "bg-violet-400",
  },
  {
    id: "ai",
    label: "AI & Agents",
    dot: "bg-amber-400",
    chip: "bg-amber-100 text-amber-900 ring-amber-200",
    bar: "bg-amber-400",
  },
  {
    id: "opensource",
    label: "Open Source",
    dot: "bg-emerald-400",
    chip: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    bar: "bg-emerald-400",
  },
  {
    id: "startup",
    label: "Startups",
    dot: "bg-sky-400",
    chip: "bg-sky-100 text-sky-900 ring-sky-200",
    bar: "bg-sky-400",
  },
  {
    id: "security",
    label: "Security",
    dot: "bg-rose-400",
    chip: "bg-rose-100 text-rose-900 ring-rose-200",
    bar: "bg-rose-400",
  },
  {
    id: "enterprise",
    label: "Enterprise & IT",
    dot: "bg-slate-400",
    chip: "bg-slate-200 text-slate-900 ring-slate-300",
    bar: "bg-slate-400",
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    dot: "bg-teal-400",
    chip: "bg-teal-100 text-teal-900 ring-teal-200",
    bar: "bg-teal-400",
  },
  {
    id: "webdev",
    label: "Web Dev",
    dot: "bg-orange-400",
    chip: "bg-orange-100 text-orange-900 ring-orange-200",
    bar: "bg-orange-400",
  },
];

export const categoryById = new Map(categories.map((c) => [c.id, c]));

export type TechEvent = {
  id: string;
  title: string;
  /** Inclusive start date, YYYY-MM-DD (IST). */
  start: string;
  /** Inclusive end date, YYYY-MM-DD (IST). Same as start for single-day events. */
  end: string;
  /** 24h local start/end time. Omitted when the schedule is not published yet. */
  startTime?: string;
  endTime?: string;
  category: CategoryId;
  venue: string;
  city: string;
  organizer: string;
  blurb: string;
  tags: string[];
  url: string;
  /** Direct registration link, when different from the event page. */
  registerUrl?: string;
  /** Shown as a caveat on the event card. */
  note?: string;
  /** Outside Kochi, but part of the same circuit — worth the trip. */
  travel?: boolean;
};

export const events: TechEvent[] = [
  {
    id: "cncg-kochi-aug-2026",
    title: "CNCG Kochi August Meetup",
    start: "2026-08-01",
    end: "2026-08-01",
    startTime: "09:00",
    endTime: "13:00",
    category: "cloud",
    venue: "TinkerHub Foundation",
    city: "Kochi",
    organizer: "Cloud Native Community Group Kochi",
    blurb:
      "In-person CNCF community session: running autonomous AI agents on Kubernetes, and Teleport as a modern approach to secure infrastructure access \u2014 plus open discussions on cloud native tooling in production.",
    tags: ["CNCF", "Kubernetes", "Free"],
    url: "https://www.linkedin.com/posts/cloudnativekochi_cncf-cloudnative-kubernetes-activity-7487872658563321856-jbxh",
  },
  {
    id: "devops-malayalam-aug-2026",
    title: "DevOps Malayalam Meetup",
    start: "2026-08-08",
    end: "2026-08-08",
    startTime: "09:00",
    endTime: "13:00",
    category: "cloud",
    venue: "IBS Campus, Infopark Phase 1, Kakkanad",
    city: "Kochi",
    organizer: "DevOps Malayalam",
    blurb:
      "Kerala's DevOps community morning \u2014 technical talks on DevOps, cloud, platform engineering and SRE, with Q&A, quizzes and networking. Hosted by IBS Software and Naviq; registration via MakeMyPass.",
    tags: ["DevOps", "SRE", "Free"],
    url: "https://eventsaroundme.in/event/d16c3f8b-35b0-4285-81fd-4725285bcd73",
  },
  {
    id: "cns-kerala-2026",
    title: "Cloud Native Summit Kerala 2026",
    start: "2026-08-22",
    end: "2026-08-22",
    startTime: "09:00",
    category: "cloud",
    venue: "Le M\u00e9ridien Kochi, Maradu",
    city: "Kochi",
    organizer: "Cloud Native Kerala community",
    blurb:
      "The biggest cloud native conference Kerala has hosted \u2014 800+ engineers, three parallel tracks of keynotes and deep-dives at the venue that ran DevOpsDays Kerala 2024.",
    tags: ["Conference", "3 tracks", "800+ attendees"],
    url: "https://cnskerala.in/",
  },
  {
    id: "malabarjs-aug-2026",
    title: "MalabarJS Meetup \u2014 August",
    start: "2026-08-22",
    end: "2026-08-22",
    startTime: "13:30",
    endTime: "17:30",
    category: "webdev",
    venue: "TinkerSpace, Kalamassery",
    city: "Kochi",
    organizer: "MalabarJS",
    blurb:
      "An afternoon with the JavaScript ecosystem crowd \u2014 lightning talks, longer technical talks, demos and conversations with people building across the JS stack.",
    tags: ["JavaScript", "Lightning talks", "Free"],
    url: "https://luma.com/a9xt40nb",
  },
  {
    id: "umbraco-india-festival-2026",
    title: "Umbraco India Festival 2026",
    start: "2026-08-28",
    end: "2026-08-29",
    category: "webdev",
    venue: "LuLu IT Twin Towers, SmartCity",
    city: "Kochi",
    organizer: "Umbraco India User Group",
    blurb:
      "India's first dedicated Umbraco community event \u2014 a hackathon and networking evening on day one, then a full conference day at LuLu IT Twin Towers with Umbraco HQ, MVPs and speakers from across the region.",
    tags: ["CMS", ".NET", "Hackathon + conference"],
    url: "https://www.umbracofestival.in/",
  },
  {
    id: "dothack-26",
    title: ">.hack(); '26",
    start: "2026-09-04",
    end: "2026-09-06",
    category: "hackathon",
    venue: "Mar Athanasius College of Engineering (MACE)",
    city: "Kothamangalam",
    organizer: "IEEE MACE Student Branch",
    blurb:
      "7th edition of MACE's flagship 36-hour hardware + software hackathon, powered by Devin. Eight tracks from smart cities to resilient communities, judged by industry mentors. Winner of the IEEE Darrel Chong Award and the IEEE Kochi Subsection Best Event Award.",
    tags: ["36-hour", "Devfolio", "8 tracks", "Students"],
    url: "https://hack26.ieeemace.org/",
    registerUrl: "https://dothack26.devfolio.co/overview",
  },
  {
    id: "wikiconference-india-2026",
    title: "WikiConference India 2026",
    start: "2026-09-04",
    end: "2026-09-06",
    category: "opensource",
    venue: "Venue confirmed, address not public yet",
    city: "Kochi",
    organizer: "Wikimedia community India / IIIT Hyderabad",
    blurb:
      "Fourth edition of India's national Wikimedia conference and the first hosted in Kochi — Indic-language projects, open knowledge and South Asia movement strategy.",
    tags: ["Open knowledge", "Wikimedia", "National"],
    url: "https://meta.wikimedia.org/wiki/WikiConference_India_2026",
  },
  {
    id: "openspeaks-kochi",
    title: "OpenSpeaks: Language Documentation & Archiving",
    start: "2026-09-07",
    end: "2026-09-07",
    startTime: "09:00",
    endTime: "18:00",
    category: "opensource",
    venue: "WikiConference India side event",
    city: "Kochi",
    organizer: "OpenSpeaks / FOSS United",
    blurb:
      "In-person capstone of the OpenSpeaks workshop series: recording, archiving and publishing Adivasi and other low-resource languages on Wikimedia Commons, Wikidata and Wikipedia.",
    tags: ["Workshop", "Wikimedia", "Application-based"],
    url: "https://meta.wikimedia.org/wiki/OpenSpeaks/Community_language_documentation_and_archiving_training",
  },
  {
    id: "codex-meetup-kochi-founders",
    title: "OpenAI Codex Community Meetup — Founder's Edition",
    start: "2026-09-10",
    end: "2026-09-10",
    category: "ai",
    venue: "Venue TBA",
    city: "Kochi",
    organizer: "Codex Kochi community",
    blurb:
      "Founder-focused edition of the Kochi Codex meetups: shipping with OpenAI's coding agent, live demos from the community, and a room full of people building AI-native products.",
    tags: ["Founders", "Coding agents", "Demos"],
    url: "https://luma.com/w0ip6oxb",
    note: "Date confirmed by the organisers; venue, agenda and RSVP link not published yet.",
  },
  {
    id: "pivot-2026",
    title: "PIVOT 2026 — Deep Tech Startup Summit",
    start: "2026-09-18",
    end: "2026-09-19",
    category: "startup",
    venue: "LuLu Twin Towers, Infopark SmartCity",
    city: "Kochi",
    organizer: "IIMK LIVE",
    blurb:
      "IIM Kozhikode LIVE's deep-tech summit — two days of prototype-to-company conversations with founders, mentors and investors. \"Proof over pitch.\"",
    tags: ["Deep tech", "Investors", "Two days"],
    url: "https://pivot26.suit.iimklive.org/",
  },
  {
    id: "indiafoss-2026",
    title: "IndiaFOSS 2026",
    start: "2026-09-26",
    end: "2026-09-27",
    startTime: "09:00",
    endTime: "17:00",
    category: "opensource",
    venue: "NIMHANS Convention Centre",
    city: "Bengaluru",
    organizer: "FOSS United",
    blurb:
      "India's largest free and open source software conference: eight community-curated devrooms, a Maintainer Summit on the 25th, and pre-events through the week.",
    tags: ["Conference", "Devrooms", "Tickets"],
    url: "https://fossunited.org/indiafoss/2026",
    travel: true,
    note: "Held in Bengaluru, not Kochi — listed because most of Kochi's FOSS crowd travels for it.",
  },
  {
    id: "iedc-summit-2026",
    title: "IEDC Summit 2026",
    start: "2026-09-28",
    end: "2026-09-28",
    category: "startup",
    venue: "Sahrdaya College of Engineering & Technology",
    city: "Thrissur",
    organizer: "Kerala Startup Mission",
    blurb:
      "11th edition of Kerala's flagship student-innovation summit — IEDC units across the state showcase products, plus keynotes, panels and learning stations.",
    tags: ["Student startups", "KSUM", "State-wide"],
    url: "https://sites.google.com/startupmission.in/iedc/more/iedc-summit",
    travel: true,
    note: "Hosted at Sahrdaya, Thrissur this year — about 2 hours from Kochi.",
  },
  {
    id: "c0c0n-2026",
    title: "c0c0n 2026",
    start: "2026-10-06",
    end: "2026-10-13",
    category: "security",
    venue: "Grand Hyatt, Bolgatty",
    city: "Kochi",
    organizer: "Kerala Police / ISRA",
    blurb:
      "19th edition of India's longest-running security conference. Pre-con training Oct 6–8, the main briefing Oct 9–10, post-con training Oct 11–13 — CTFs, villages and live bug hunting throughout.",
    tags: ["Cybersecurity", "CTF", "Trainings"],
    url: "https://c0c0n.org/2026/",
  },
  {
    id: "huddle-global-2026",
    title: "Huddle Global 2026",
    start: "2026-11-12",
    end: "2026-11-14",
    category: "startup",
    venue: "The Leela Raviz, Kovalam",
    city: "Thiruvananthapuram",
    organizer: "Kerala Startup Mission",
    blurb:
      "Asia's largest beachside startup festival — seventh edition, three days of founders, investors and policymakers on the Kovalam shoreline.",
    tags: ["Startup festival", "Investors", "KSUM"],
    url: "https://huddleglobal.co.in/",
    travel: true,
    note: "Kovalam, Thiruvananthapuram — the state's flagship startup event.",
  },
  {
    id: "gartner-symposium-kochi-2026",
    title: "Gartner IT Symposium/Xpo Kochi",
    start: "2026-11-16",
    end: "2026-11-18",
    startTime: "08:30",
    endTime: "18:30",
    category: "enterprise",
    venue: "Grand Hyatt Kochi Bolgatty",
    city: "Kochi",
    organizer: "Gartner",
    blurb:
      "Gartner's premier India CIO conference lands in Kochi — AI strategy, cybersecurity and enterprise IT leadership tracks.",
    tags: ["CIO", "Enterprise", "Paid"],
    url: "https://www.gartner.com/en/conferences/apac/symposium-india",
  },
];

export type Community = {
  name: string;
  cadence: string;
  url: string;
};

/** Recurring communities whose next dates are not announced yet. */
export const communities: Community[] = [
  {
    name: "Kochi FOSS",
    cadence: "Monthly, Saturdays",
    url: "https://kochifoss.org/",
  },
  {
    name: "Kochi AI User Group",
    cadence: "Monthly, Infopark",
    url: "https://www.meetup.com/kochi-ai-user-group/",
  },
  {
    name: "Codex Kochi",
    cadence: "Meetups & build nights",
    url: "https://luma.com/w0ip6oxb",
  },
  {
    name: "KCD Kochi",
    cadence: "Annual, cloud native",
    url: "https://kcd.cncgkochi.in/",
  },
];
