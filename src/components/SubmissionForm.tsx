"use client";

import { useState } from "react";
import {
  GITHUB_REPOSITORY_URL,
  submissionDefinitions,
  type SubmissionField,
  type SubmissionKind,
} from "@/lib/submissions";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; issueUrl?: string; issueNumber?: number }
  | { status: "error"; message: string; fallbackUrl?: string };

const kinds = Object.keys(submissionDefinitions) as SubmissionKind[];
const formHeadings: Record<SubmissionKind, string> = {
  event: "Submit an event",
  opportunity: "Submit an opportunity",
  project: "Submit a project",
  community: "Submit a community",
  source: "Suggest a data source",
};
const inputClass = "mt-2 w-full rounded-[0.85rem] border border-white/12 bg-white/[0.055] px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-white/28 hover:border-white/20 focus:border-[var(--signal)] focus:bg-white/[0.075] focus:ring-4 focus:ring-[rgba(215,242,75,0.08)]";

function Field({ field, kind }: { field: SubmissionField; kind: SubmissionKind }) {
  const id = `submission-${kind}-${field.name}`;
  const describedBy = field.hint ? `${id}-hint` : undefined;
  const shared = {
    id,
    name: field.name,
    required: field.required,
    "aria-describedby": describedBy,
    className: inputClass,
  };
  const maxLength = field.maxLength ?? (field.type === "url" ? 500 : 240);

  return (
    <label className={field.span === "full" ? "md:col-span-2" : ""} htmlFor={id}>
      <span className="flex items-baseline justify-between gap-3 text-[12px] font-semibold text-white/82">
        {field.label}
        {!field.required && <small className="font-[family-name:var(--font-geist-mono)] text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">Optional</small>}
      </span>
      {field.type === "textarea" ? (
        <textarea {...shared} maxLength={maxLength} rows={4} placeholder={field.placeholder} />
      ) : field.type === "select" ? (
        <select {...shared} defaultValue="">
          <option value="" disabled>Select one</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          {...shared}
          type={field.type}
          maxLength={maxLength}
          placeholder={field.placeholder}
          inputMode={field.type === "url" ? "url" : undefined}
        />
      )}
      {field.hint && <span id={describedBy} className="mt-1.5 block text-[11px] leading-relaxed text-white/42">{field.hint}</span>}
    </label>
  );
}

export default function SubmissionForm() {
  const [kind, setKind] = useState<SubmissionKind>("event");
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const definition = submissionDefinitions[kind];

  function chooseKind(next: SubmissionKind) {
    setKind(next);
    setState({ status: "idle" });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "submitting") return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const fields = Object.fromEntries(definition.fields.map((field) => [field.name, String(formData.get(field.name) ?? "")]));
    setState({ status: "submitting" });

    try {
      const result = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          fields,
          contact: String(formData.get("contact") ?? ""),
          consent: formData.get("consent") === "yes",
          website: String(formData.get("website") ?? ""),
        }),
      });
      const body = await result.json() as {
        mode?: "accepted" | "direct" | "github";
        issueUrl?: string;
        issueNumber?: number;
        fallbackUrl?: string;
        error?: string;
        field?: string;
      };

      if (!result.ok) {
        setState({
          status: "error",
          message: body.error ?? "The submission could not be sent. Please try again.",
          fallbackUrl: body.fallbackUrl,
        });
        if (body.field) document.getElementById(`submission-${kind}-${body.field}`)?.focus();
        return;
      }

      if (body.mode === "github" && body.fallbackUrl) {
        window.location.assign(body.fallbackUrl);
        return;
      }

      setState({
        status: "success",
        issueUrl: body.issueUrl,
        issueNumber: body.issueNumber,
      });
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "The connection dropped before we could send this. Your form is still here—please try again.",
      });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#11111a] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <header className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-8">
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--signal)]">What are we missing?</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Submission type">
            {kinds.map((option, index) => {
              const selected = kind === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => chooseKind(option)}
                  className={`group min-h-20 rounded-xl border px-3 py-3 text-left transition ${selected ? "border-[var(--signal)] bg-[var(--signal)] text-[#121217]" : "border-white/10 bg-white/[0.035] text-white hover:border-white/25 hover:bg-white/[0.07]"}`}
                >
                  <span className={`block font-[family-name:var(--font-geist-mono)] text-[9px] font-bold ${selected ? "text-black/50" : "text-white/30"}`}>{String(index + 1).padStart(2, "0")}</span>
                  <strong className="mt-2 block text-[12px] leading-tight">{submissionDefinitions[option].shortLabel}</strong>
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-white">{formHeadings[kind]}</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/48">{definition.description}</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">Public review</span>
          </div>
        </header>

        <form key={kind} onSubmit={submit} className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
            {definition.fields.map((field) => <Field key={field.name} field={field} kind={kind} />)}
            <label className="md:col-span-2" htmlFor={`submission-${kind}-contact`}>
              <span className="flex items-baseline justify-between gap-3 text-[12px] font-semibold text-white/82">
                Your name or public contact
                <small className="font-[family-name:var(--font-geist-mono)] text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">Optional</small>
              </span>
              <input id={`submission-${kind}-contact`} name="contact" maxLength={160} className={inputClass} placeholder="Name, public profile, or email you are happy to publish" />
              <span className="mt-1.5 block text-[11px] leading-relaxed text-white/42">Leave this empty if you prefer. Anything entered here appears on the public issue.</span>
            </label>
          </div>

          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor={`submission-${kind}-website`}>Website</label>
            <input id={`submission-${kind}-website`} name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.09] bg-white/[0.025] p-4 text-[12px] leading-relaxed text-white/58" htmlFor={`submission-${kind}-consent`}>
            <input id={`submission-${kind}-consent`} name="consent" value="yes" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--signal)]" />
            <span>I have used official or public sources, and I understand this submission will be reviewed in the public Kochi Buzz GitHub repository.</span>
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={state.status === "submitting"} className="buzz-button buzz-button--primary min-w-44 justify-center disabled:cursor-wait disabled:opacity-55">
              {state.status === "submitting" ? "Sending…" : "Send for review →"}
            </button>
            <p className="text-[11px] leading-relaxed text-white/38">No account is required when direct submission is available.</p>
          </div>

          <div className="mt-5 min-h-7" aria-live="polite">
            {state.status === "success" && (
              <div role="status" className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.08] px-4 py-3 text-sm text-emerald-100">
                Sent. We&apos;ll verify it before it appears on Kochi Buzz.
                {state.issueUrl && <a className="ml-2 font-semibold underline underline-offset-4" href={state.issueUrl} target="_blank" rel="noreferrer">View issue{state.issueNumber ? ` #${state.issueNumber}` : ""}</a>}
              </div>
            )}
            {state.status === "error" && (
              <div role="alert" className="rounded-xl border border-red-300/20 bg-red-300/[0.08] px-4 py-3 text-sm text-red-100">
                {state.message}
                {state.fallbackUrl && <a className="ml-2 font-semibold underline underline-offset-4" href={state.fallbackUrl}>Continue on GitHub</a>}
              </div>
            )}
          </div>
        </form>
      </section>

      <aside className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6 lg:sticky lg:top-24">
        <p className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--coral)]">After you send</p>
        <ol className="mt-5 space-y-5">
          {[
            ["01", "A public issue is created", "The form becomes a tidy review ticket—no copy-pasting."],
            ["02", "We verify the source", "Dates, links and the Kochi connection are checked."],
            ["03", "It joins the signal", "Approved entries are added to the site or its source monitor."],
          ].map(([number, title, copy]) => (
            <li key={number} className="grid grid-cols-[1.8rem_1fr] gap-3">
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[var(--signal)]">{number}</span>
              <span><strong className="block text-sm text-white">{title}</strong><small className="mt-1 block text-[11px] leading-relaxed text-white/42">{copy}</small></span>
            </li>
          ))}
        </ol>
        <div className="mt-6 border-t border-white/10 pt-5 text-[11px] leading-relaxed text-white/42">
          Prefer GitHub? The original <a href={`${GITHUB_REPOSITORY_URL}/issues/new/choose`} target="_blank" rel="noreferrer" className="text-white underline decoration-white/25 underline-offset-4 hover:decoration-white">issue forms remain available</a>.
        </div>
      </aside>
    </div>
  );
}
