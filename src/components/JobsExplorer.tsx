"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import SaveToBuzzButton from "@/components/SaveToBuzzButton";
import { jobCategoryLabels } from "@/data/dataset";
import type { Job, JobCategory } from "@/data/types";
import {
  defaultJobFilters,
  filterJobs,
  hasActiveJobFilters,
  isJobNew,
  jobDeadlineLabels,
  jobSourceGroup,
  jobSourceLabels,
  type JobDeadlineFilter,
  type JobFilters,
  type JobSourceFilter,
} from "@/lib/jobFilters";

const filterOrder: (JobCategory | "all")[] = [
  "all",
  "engineering",
  "ai-data",
  "devops-cloud",
  "design",
  "product",
  "business",
  "internship",
  "other",
];

const sourceOrder: JobSourceFilter[] = ["all", "infopark", "lever", "workable", "ksum", "other"];
const deadlineOrder: JobDeadlineFilter[] = ["all", "week", "month", "listed", "undated"];
const PAGE = 40;

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

const jobFilterUrlEvent = "kochibuzz:job-filters";

function filtersFromSearch(search: string): JobFilters {
  const params = new URLSearchParams(search);
  const categoryParam = params.get("category");
  const sourceParam = params.get("source");
  const deadlineParam = params.get("deadline");

  return {
    category: filterOrder.includes(categoryParam as JobCategory | "all")
      ? categoryParam as JobCategory | "all"
      : "all",
    query: (params.get("q") ?? "").slice(0, 120),
    company: (params.get("company") ?? "all").slice(0, 160),
    source: sourceOrder.includes(sourceParam as JobSourceFilter)
      ? sourceParam as JobSourceFilter
      : "all",
    deadline: deadlineOrder.includes(deadlineParam as JobDeadlineFilter)
      ? deadlineParam as JobDeadlineFilter
      : "all",
    newOnly: params.get("new") === "1",
  };
}

function updateUrl(filters: JobFilters) {
  const url = new URL(window.location.href);
  const values: Record<string, string> = {
    q: filters.query.trim(),
    category: filters.category === "all" ? "" : filters.category,
    company: filters.company === "all" ? "" : filters.company,
    source: filters.source === "all" ? "" : filters.source,
    deadline: filters.deadline === "all" ? "" : filters.deadline,
    new: filters.newOnly ? "1" : "",
  };

  for (const [key, value] of Object.entries(values)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }

  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  window.dispatchEvent(new Event(jobFilterUrlEvent));
}

function subscribeToFilterUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(jobFilterUrlEvent, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(jobFilterUrlEvent, onChange);
  };
}

function getFilterUrlSnapshot() {
  return window.location.search;
}

function getServerFilterUrlSnapshot() {
  return "";
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="block min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.18em] text-white/55"
      >
        {label}
      </label>
      <span className="relative block">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full appearance-none rounded-lg border border-white/10 bg-[#171720] py-2 pl-3 pr-9 text-sm font-medium text-white outline-none transition hover:border-white/20 focus:border-[var(--signal-dim)]"
        >
          {children}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45"
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

export default function JobsExplorer({
  jobs,
  todayIso,
  newDays,
}: {
  jobs: Job[];
  todayIso: string;
  newDays: number;
}) {
  const [shown, setShown] = useState(PAGE);
  const filterUrl = useSyncExternalStore(
    subscribeToFilterUrl,
    getFilterUrlSnapshot,
    getServerFilterUrlSnapshot,
  );
  const filters = useMemo(() => filtersFromSearch(filterUrl), [filterUrl]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const job of jobs) map.set(job.category, (map.get(job.category) ?? 0) + 1);
    return map;
  }, [jobs]);

  const sourceCounts = useMemo(() => {
    const map = new Map<JobSourceFilter, number>();
    for (const job of jobs) {
      const source = jobSourceGroup(job.sourceId);
      map.set(source, (map.get(source) ?? 0) + 1);
    }
    return map;
  }, [jobs]);

  const companies = useMemo(
    () => [...new Set(jobs.map((job) => job.company))].sort((a, b) => a.localeCompare(b)),
    [jobs],
  );

  const filtered = useMemo(
    () => filterJobs(jobs, filters, todayIso, newDays),
    [jobs, filters, todayIso, newDays],
  );

  const hasFilters = hasActiveJobFilters(filters);

  function setFilter<Key extends keyof JobFilters>(key: Key, value: JobFilters[Key]) {
    updateUrl({ ...filters, [key]: value });
    setShown(PAGE);
  }

  function clearFilters() {
    updateUrl(defaultJobFilters);
    setShown(PAGE);
  }

  return (
    <div>
      <section
        aria-labelledby="job-filters-title"
        className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-3 sm:p-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3 px-1 pb-3">
          <div>
            <p
              id="job-filters-title"
              className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--lagoon)]"
            >
              Filter roles
            </p>
            <p className="mt-1 text-xs text-white/55">
              Get from {jobs.length} openings to the ones that fit.
            </p>
          </div>
          <p aria-live="polite" className="text-xs font-semibold text-white/70">
            <span className="text-[var(--signal)]">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "role" : "roles"}
          </p>
        </div>

        <div className="grid gap-3 border-y border-white/[0.08] py-4 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div className="block min-w-0 sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="job-search"
              className="mb-1.5 block font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.18em] text-white/55"
            >
              Search
            </label>
            <span className="relative block">
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                fill="none"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
              >
                <circle cx="8.5" cy="8.5" r="4.75" stroke="currentColor" strokeWidth="1.5" />
                <path d="m12 12 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="job-search"
                type="search"
                value={filters.query}
                onChange={(event) => setFilter("query", event.target.value)}
                placeholder="Role, skill, company…"
                className="min-h-11 w-full rounded-lg border border-white/10 bg-[#171720] py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/38 outline-none transition hover:border-white/20 focus:border-[var(--signal-dim)]"
              />
            </span>
          </div>

          <FilterSelect
            id="job-company-filter"
            label="Company"
            value={filters.company}
            onChange={(value) => setFilter("company", value)}
          >
            <option value="all">All companies</option>
            {companies.map((company) => <option key={company} value={company}>{company}</option>)}
          </FilterSelect>

          <FilterSelect
            id="job-source-filter"
            label="Source"
            value={filters.source}
            onChange={(value) => setFilter("source", value as JobSourceFilter)}
          >
            {sourceOrder.map((source) => {
              const count = source === "all" ? jobs.length : (sourceCounts.get(source) ?? 0);
              if (source !== "all" && count === 0) return null;
              return <option key={source} value={source}>{jobSourceLabels[source]} · {count}</option>;
            })}
          </FilterSelect>

          <FilterSelect
            id="job-deadline-filter"
            label="Apply by"
            value={filters.deadline}
            onChange={(value) => setFilter("deadline", value as JobDeadlineFilter)}
          >
            {deadlineOrder.map((deadline) => (
              <option key={deadline} value={deadline}>{jobDeadlineLabels[deadline]}</option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-3">
          <button
            type="button"
            aria-pressed={filters.newOnly}
            onClick={() => setFilter("newOnly", !filters.newOnly)}
            className={[
              "inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold ring-1 transition",
              filters.newOnly
                ? "bg-[var(--signal)] text-[var(--signal-ink)] ring-[var(--signal)]"
                : "bg-white/[0.04] text-white/65 ring-white/10 hover:bg-white/[0.08] hover:text-white",
            ].join(" ")}
          >
            <span
              aria-hidden
              className={[
                "h-2 w-2 rounded-full",
                filters.newOnly ? "bg-[var(--signal-ink)]" : "bg-[var(--signal)]",
              ].join(" ")}
            />
            Just added
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-9 text-xs font-semibold text-[var(--signal)] transition hover:opacity-80"
            >
              Clear all filters
            </button>
          )}
        </div>
      </section>

      <div className="-mx-1 mt-5 flex gap-1 overflow-x-auto pb-1" aria-label="Filter by role category">
        {filterOrder.map((id) => {
          const count = id === "all" ? jobs.length : (categoryCounts.get(id) ?? 0);
          if (count === 0 && id !== "all") return null;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={filters.category === id}
              onClick={() => setFilter("category", id)}
              className={[
                "shrink-0 border-b-2 px-3 py-2 text-left transition",
                filters.category === id
                  ? "border-[var(--signal)]"
                  : "border-transparent hover:border-white/20",
              ].join(" ")}
            >
              <span
                className={[
                  "block text-xs font-semibold",
                  filters.category === id ? "text-white" : "text-white/60",
                ].join(" ")}
              >
                {id === "all" ? "All roles" : jobCategoryLabels[id]}
              </span>
              <span className="block font-[family-name:var(--font-geist-mono)] text-[10px] text-white/70">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/15 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-white">No roles match that combination.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-xs font-semibold text-[var(--signal)]"
          >
            Reset the filters
          </button>
        </div>
      ) : (
        <>
          <ul data-jobs-list className="mt-5 divide-y divide-white/[0.06]">
            {filtered.slice(0, shown).map((job) => {
              const newRole = isJobNew(job, todayIso, newDays);
              return (
                <li
                  key={job.id}
                  className="jobs-list-item"
                  data-job-company={job.company}
                  data-job-source={jobSourceGroup(job.sourceId)}
                  data-job-deadline={job.deadlineAt ?? ""}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pr-px">
                    <a
                      href={job.detailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group grid min-w-0 gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                    >
                      <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="min-w-0 break-words text-sm font-semibold text-white group-hover:text-[var(--signal)]">
                          {job.title}
                        </span>
                        {newRole && (
                          <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-[var(--signal)]">
                            New
                          </span>
                        )}
                        <span className="min-w-0 break-words text-xs text-white/50">{job.company}</span>
                      </span>
                      <span className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[11px] text-white/70">
                        <span>{jobCategoryLabels[job.category]}</span>
                        {job.deadlineAt && <span>apply by {formatDate(job.deadlineAt)}</span>}
                      </span>
                    </a>
                    <SaveToBuzzButton
                      compact
                      className="mr-px min-h-8 min-w-[5.25rem] shrink-0 px-2.5 py-1 text-[11px]"
                      item={{
                        id: `job:${job.id}`,
                        kind: "job",
                        eyebrow: `${jobCategoryLabels[job.category]} · ${newRole ? "New role" : "Open role"}`,
                        title: job.title,
                        detail: `${job.company} is hiring${job.location ? ` in ${job.location}` : " in the Kochi tech ecosystem"}.`,
                        meta: `${job.company}${job.location ? ` · ${job.location}` : ""}`,
                        href: job.detailUrl,
                        external: true,
                        trackLabel: "Move your work",
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          {filtered.length > shown && (
            <button
              type="button"
              onClick={() => setShown((count) => count + PAGE)}
              className="mt-5 w-full rounded-md bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:text-white"
            >
              Show more ({filtered.length - shown} remaining)
            </button>
          )}
        </>
      )}
    </div>
  );
}
