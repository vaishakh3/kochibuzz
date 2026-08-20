"use client";

import { useMemo, useState } from "react";
import { jobCategoryLabels } from "@/data/dataset";
import type { Job, JobCategory } from "@/data/types";

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

const PAGE = 40;

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
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
  const [category, setCategory] = useState<JobCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const job of jobs) map.set(job.category, (map.get(job.category) ?? 0) + 1);
    return map;
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (category !== "all" && job.category !== category) return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        (job.location ?? "").toLowerCase().includes(q)
      );
    });
  }, [jobs, category, query]);

  const isNew = (job: Job) => {
    if (!job.firstSeenAt) return false;
    const [fy, fm, fd] = job.firstSeenAt.split("-").map(Number);
    const [ty, tm, td] = todayIso.split("-").map(Number);
    const age = Math.round(
      (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000,
    );
    return age >= 0 && age <= newDays;
  };

  const hasFilters = category !== "all" || query.trim() !== "";

  return (
    <div>
      {/* Category rail */}
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {filterOrder.map((id) => {
          const count = id === "all" ? jobs.length : (counts.get(id) ?? 0);
          if (count === 0 && id !== "all") return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setCategory(id);
                setShown(PAGE);
              }}
              className={[
                "shrink-0 border-b-2 px-3 py-2 text-left transition",
                category === id
                  ? "border-[var(--signal)]"
                  : "border-transparent hover:border-white/20",
              ].join(" ")}
            >
              <span
                className={[
                  "block text-xs font-semibold",
                  category === id ? "text-white" : "text-white/60",
                ].join(" ")}
              >
                {id === "all" ? "All" : jobCategoryLabels[id]}
              </span>
              <span className="block font-[family-name:var(--font-geist-mono)] text-[10px] text-white/70">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setShown(PAGE);
        }}
        placeholder="Search title, company, category or location…"
        className="mt-4 w-full rounded-md bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/65 ring-1 ring-white/10 focus:outline-none focus:ring-[var(--signal-dim)]"
        aria-label="Search jobs"
      />

      <div className="mt-3 flex items-baseline justify-between">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-white/70">
          {filtered.length} {filtered.length === 1 ? "role" : "roles"}
          {hasFilters ? " match" : ""}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setQuery("");
              setShown(PAGE);
            }}
            className="text-xs font-semibold text-[var(--signal)] transition hover:opacity-80"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 border-t border-white/10 pt-6 text-sm text-white/50">
          No openings match these filters.
        </p>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-white/[0.06]">
            {filtered.slice(0, shown).map((job) => (
              <li key={job.id}>
                <a
                  href={job.detailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-3"
                >
                  <span className="text-sm font-semibold text-white group-hover:text-[var(--signal)]">
                    {job.title}
                  </span>
                  {isNew(job) && (
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-wider text-[var(--signal)]">
                      New
                    </span>
                  )}
                  <span className="text-xs text-white/50">{job.company}</span>
                  <span className="ml-auto flex shrink-0 items-baseline gap-3 text-[11px] text-white/70">
                    <span>{jobCategoryLabels[job.category]}</span>
                    {job.deadlineAt && (
                      <span>apply by {formatDate(job.deadlineAt)}</span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {filtered.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
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
