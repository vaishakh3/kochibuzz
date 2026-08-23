import type { Job, JobCategory } from "@/data/types";

export type JobSourceFilter =
  | "all"
  | "infopark"
  | "lever"
  | "workable"
  | "ksum"
  | "other";

export type JobDeadlineFilter = "all" | "week" | "month" | "listed" | "undated";

export type JobFilters = {
  category: JobCategory | "all";
  query: string;
  company: string;
  source: JobSourceFilter;
  deadline: JobDeadlineFilter;
  newOnly: boolean;
};

export const defaultJobFilters: JobFilters = {
  category: "all",
  query: "",
  company: "all",
  source: "all",
  deadline: "all",
  newOnly: false,
};

export const jobSourceLabels: Record<JobSourceFilter, string> = {
  all: "All sources",
  infopark: "Infopark",
  lever: "Lever company feeds",
  workable: "Workable company feeds",
  ksum: "Kerala Startup Mission",
  other: "Other sources",
};

export const jobDeadlineLabels: Record<JobDeadlineFilter, string> = {
  all: "Any deadline",
  week: "Due in 7 days",
  month: "Due in 30 days",
  listed: "Deadline listed",
  undated: "No listed deadline",
};

export function jobSourceGroup(sourceId: string): Exclude<JobSourceFilter, "all"> {
  if (sourceId === "infopark-jobs") return "infopark";
  if (sourceId.includes("lever")) return "lever";
  if (sourceId.includes("workable")) return "workable";
  if (sourceId.startsWith("ksum")) return "ksum";
  return "other";
}

function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function isJobNew(job: Job, todayIso: string, newDays: number): boolean {
  if (!job.firstSeenAt) return false;
  const [firstYear, firstMonth, firstDay] = job.firstSeenAt.split("-").map(Number);
  const [todayYear, todayMonth, todayDay] = todayIso.split("-").map(Number);
  const age = Math.round(
    (
      Date.UTC(todayYear, todayMonth - 1, todayDay) -
      Date.UTC(firstYear, firstMonth - 1, firstDay)
    ) / 86_400_000,
  );
  return age >= 0 && age <= newDays;
}

function matchesDeadline(job: Job, filter: JobDeadlineFilter, todayIso: string): boolean {
  if (filter === "all") return true;
  if (filter === "undated") return !job.deadlineAt;
  if (!job.deadlineAt) return false;
  if (filter === "listed") return true;

  const horizon = addDays(todayIso, filter === "week" ? 7 : 30);
  return job.deadlineAt >= todayIso && job.deadlineAt <= horizon;
}

export function filterJobs(
  jobs: Job[],
  filters: JobFilters,
  todayIso: string,
  newDays: number,
): Job[] {
  const query = filters.query.trim().toLowerCase();

  return jobs.filter((job) => {
    if (filters.category !== "all" && job.category !== filters.category) return false;
    if (filters.company !== "all" && job.company !== filters.company) return false;
    if (filters.source !== "all" && jobSourceGroup(job.sourceId) !== filters.source) return false;
    if (!matchesDeadline(job, filters.deadline, todayIso)) return false;
    if (filters.newOnly && !isJobNew(job, todayIso, newDays)) return false;
    if (!query) return true;

    return (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.category.toLowerCase().includes(query) ||
      (job.location ?? "").toLowerCase().includes(query)
    );
  });
}

export function hasActiveJobFilters(filters: JobFilters): boolean {
  return (
    filters.category !== "all" ||
    filters.query.trim() !== "" ||
    filters.company !== "all" ||
    filters.source !== "all" ||
    filters.deadline !== "all" ||
    filters.newOnly
  );
}
