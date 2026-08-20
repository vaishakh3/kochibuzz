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
        job.company.toLowerCase().includes(q)
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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
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
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                category === id
                  ? "bg-teal-300 text-slate-950"
                  : "bg-white/[0.05] text-white/60 ring-1 ring-white/10 hover:text-white",
              ].join(" ")}
            >
              {id === "all" ? "All" : jobCategoryLabels[id]}
              <span className="ml-1.5 opacity-60">{count}</span>
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
        placeholder="Search title or company…"
        className="mt-4 w-full rounded-2xl bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder:text-white/30 ring-1 ring-white/10 focus:outline-none focus:ring-teal-300/50"
        aria-label="Search jobs"
      />

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-white/[0.03] px-5 py-6 text-sm text-white/50 ring-1 ring-white/10">
          No openings match. Try a different filter or search.
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
                  <span className="text-sm font-semibold text-white group-hover:text-teal-200">
                    {job.title}
                  </span>
                  {isNew(job) && (
                    <span className="rounded-full bg-teal-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-200 ring-1 ring-teal-300/25">
                      New
                    </span>
                  )}
                  <span className="text-xs text-white/50">{job.company}</span>
                  <span className="ml-auto flex shrink-0 items-baseline gap-3 text-[11px] text-white/35">
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
              className="mt-5 w-full rounded-2xl bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-white/[0.08] hover:text-white"
            >
              Show more ({filtered.length - shown} remaining)
            </button>
          )}
        </>
      )}
    </div>
  );
}
