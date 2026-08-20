export type JobCategory =
  | "engineering"
  | "ai-data"
  | "devops-cloud"
  | "design"
  | "product"
  | "business"
  | "internship"
  | "other";

export type Job = {
  id: string;
  title: string;
  company: string;
  postedAt?: string;
  deadlineAt?: string;
  location?: string;
  category: JobCategory;
  detailUrl: string;
  sourceUrl: string;
  sourceId: string;
  firstSeenAt?: string;
};

export type OpportunityType =
  | "hackathon"
  | "grant"
  | "fellowship"
  | "accelerator"
  | "competition"
  | "cfp"
  | "volunteer"
  | "scholarship"
  | "bounty"
  | "program"
  | "other";

export type Opportunity = {
  id: string;
  title: string;
  type: OpportunityType;
  organization: string;
  summary: string;
  opensAt?: string;
  deadlineAt?: string;
  ongoing?: boolean;
  eligibility?: string[];
  locationScope: "kochi" | "kerala" | "india" | "remote" | "other";
  benefit?: string;
  applicationUrl?: string;
  url: string;
  sourceUrls?: string[];
  tags: string[];
  featured?: boolean;
};

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  url: string;
  repositoryUrl?: string;
  makerNames?: string[];
  categories: string[];
  location?: string;
  kochiConnection: string;
  sourceUrl?: string;
  featured?: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  expiresAt?: string;
};
