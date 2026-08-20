import type { Metadata } from "next";
import DirectoryShell from "@/components/DirectoryShell";
import { projects } from "@/data/dataset";

export const metadata: Metadata = {
  title: "Built in Kochi — kochi.buzz",
  description:
    "Products, open source projects and experiments being built from Kochi — curated, source-backed, no fake hype.",
  alternates: { canonical: "/built" },
};

const submitProjectUrl =
  "https://github.com/vaishakh3/kochitechevents/issues/new?template=submit-project.yml";

export default function BuiltPage() {
  return (
    <DirectoryShell
      current="/built"
      eyebrow="Shipped from this city"
      accent="violet"
      watermark="BUILT"
      title={
        <>
          Built in <span className="ink-violet">Kochi</span>
        </>
      }
      intro="Products, open source projects and experiments with a real Kochi connection — curated from public sources and community submissions. No fake likes, no leaderboards."
    >
      {projects.length === 0 ? (
        <p className="rounded-3xl bg-white/[0.03] px-5 py-6 text-sm text-white/50 ring-1 ring-white/10">
          Nothing listed yet — building something from Kochi?{" "}
          <a href={submitProjectUrl} className="text-violet-300 hover:text-white">
            Submit it →
          </a>
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((project, index) => (
            <li key={project.id} id={project.id}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.06] hover:ring-violet-400/40">
                <span
                  aria-hidden
                  className="absolute right-4 top-3 text-4xl font-extrabold tracking-tight text-white/[0.06] transition group-hover:text-white/[0.1]"
                >
                  {`${index + 1}`.padStart(2, "0")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-violet-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-200 ring-1 ring-violet-400/25"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 text-[17px] font-semibold text-white">
                  {project.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-white/60">
                  {project.tagline}
                </p>
                {project.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                    {project.description}
                  </p>
                )}
                <p className="mt-3 text-[11px] leading-relaxed text-white/35">
                  Kochi connection: {project.kochiConnection}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-300 transition hover:text-white"
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </DirectoryShell>
  );
}
