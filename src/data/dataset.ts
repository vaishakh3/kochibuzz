import jobsJson from "../../data/generated/jobs.json";
import opportunitiesJson from "../../data/generated/opportunities.json";
import projectsJson from "../../data/generated/projects.json";
import announcementsJson from "../../data/generated/announcements.json";
import type { Announcement, Job, Opportunity, Project } from "./types";

export const jobs = jobsJson as Job[];
export const opportunities = opportunitiesJson as Opportunity[];
export const projects = projectsJson as Project[];
export const announcements = announcementsJson as Announcement[];

export const jobCategoryLabels: Record<Job["category"], string> = {
  engineering: "Engineering",
  "ai-data": "AI / Data",
  "devops-cloud": "DevOps / Cloud",
  design: "Design",
  product: "Product",
  business: "Business",
  internship: "Internships",
  other: "Other",
};

export const opportunityTypeLabels: Record<Opportunity["type"], string> = {
  hackathon: "Hackathon",
  grant: "Grant",
  fellowship: "Fellowship",
  accelerator: "Accelerator",
  competition: "Competition",
  cfp: "CFP",
  volunteer: "Volunteer",
  scholarship: "Scholarship",
  bounty: "Bounty",
  program: "Program",
  other: "Opportunity",
};
