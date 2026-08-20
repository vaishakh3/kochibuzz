import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import ProjectVisual from "@/components/ProjectVisual";
import { projects } from "@/data/dataset";
import type { Project } from "@/data/types";

export const metadata: Metadata = {
  title: "Built in Kochi — kochi.buzz",
  description:
    "Products, open source projects and experiments being built from Kochi — curated, source-backed, no fake hype.",
  alternates: { canonical: "/built" },
};

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--signal)] transition hover:opacity-80"
      >
        Visit →
      </a>
      {project.repositoryUrl && (
        <a
          href={project.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 transition hover:text-white"
        >
          Code →
        </a>
      )}
    </div>
  );
}

export default function BuiltPage() {
  const ordered = [...projects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );
  const [lead, ...rest] = ordered;

  return (
    <DirectoryShell
      current="/built"
      eyebrow="Shipped from this city"
      accent="violet"
      title={<>Built in Kochi</>}
      intro="Products, open source projects and experiments with a real Kochi connection — curated from public sources and community submissions. No fake likes, no leaderboards."
      submitLabel="Submit a project"
    >
      {!lead ? (
        <p className="border-t border-white/10 pt-6 text-sm text-white/50">
          Nothing listed yet — building something from Kochi? Submit it below.
        </p>
      ) : (
        <>
          {/* Lead project — editorial feature */}
          <div
            id={lead.id}
            className="group grid gap-0 overflow-hidden rounded-xl ring-1 ring-white/10 transition hover:ring-white/25 sm:grid-cols-[1.1fr_1.4fr]"
          >
            <ProjectVisual
              projectId={lead.id}
              name={lead.name}
              priority
              className="min-h-64 w-full sm:h-full"
            />
            <div className="p-6 sm:p-8">
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-white/70">
                {lead.categories.join(" · ")}
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-white">
                {lead.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-white/65">{lead.tagline}</p>
              {lead.description && (
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {lead.description}
                </p>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-white/70">
                Kochi connection: {lead.kochiConnection}
              </p>
              <ProjectLinks project={lead} />
            </div>
          </div>

          {rest.length > 0 && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((project) => (
                <li key={project.id} id={project.id}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-lg ring-1 ring-white/10 transition hover:ring-white/25">
                    <ProjectVisual projectId={project.id} name={project.name} className="h-44 w-full" />
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-white/70">
                        {project.categories.join(" · ")}
                      </p>
                      <h2 className="mt-1.5 text-[16px] font-semibold text-white">
                        {project.name}
                      </h2>
                      <p className="mt-1 text-sm text-white/60">{project.tagline}</p>
                      {project.description && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">
                          {project.description}
                        </p>
                      )}
                      <p className="mt-3 text-[11px] leading-relaxed text-white/70">
                        Kochi connection: {project.kochiConnection}
                      </p>
                      <ProjectLinks project={project} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </DirectoryShell>
  );
}
