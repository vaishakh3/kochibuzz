"use client";

import { useState } from "react";
import { CheckIcon, ShareIcon } from "@/components/icons";

type Props = {
  text: string;
  label: string;
};

export default function CopyButton({ text, label }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <ShareIcon className="h-4 w-4" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
