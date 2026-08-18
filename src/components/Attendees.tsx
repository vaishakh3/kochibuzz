"use client";

import { useEffect, useState } from "react";
import { Attendee, AVATAR_EMOJI, normalizeName } from "@/lib/attendees";
import { Profile } from "@/lib/useProfile";

type Props = {
  eventId: string;
  profile: Profile | null;
  going: string[];
  onSaveProfile: (name: string, emoji: string) => void;
  onSetGoing: (eventId: string, isGoing: boolean) => void;
};

function Avatar({ attendee, ring }: { attendee: Attendee; ring?: boolean }) {
  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm ${
        ring ? "ring-2 ring-violet-400" : "ring-1 ring-slate-200"
      }`}
      style={{ backgroundColor: `hsl(${attendee.hue} 80% 92%)` }}
      title={attendee.name}
    >
      {attendee.emoji}
    </span>
  );
}

export default function Attendees({
  eventId,
  profile,
  going,
  onSaveProfile,
  onSetGoing,
}: Props) {
  const [attendees, setAttendees] = useState<Attendee[] | null>(null);
  const [mutuals, setMutuals] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? "");
  const [emoji, setEmoji] = useState(profile?.emoji ?? AVATAR_EMOJI[0]);
  const [saving, setSaving] = useState(false);

  const isGoing = going.includes(eventId);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/attendees?event=${encodeURIComponent(eventId)}`)
      .then((res) => res.json())
      .then((data: { attendees: Attendee[] }) => {
        if (!cancelled) setAttendees(data.attendees);
      })
      .catch(() => {
        if (!cancelled) setAttendees([]);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    const myName = profile?.name.toLowerCase();
    const others = myName
      ? going.filter((id) => id !== eventId).slice(0, 8)
      : [];
    let cancelled = false;
    Promise.all(
      others.map((id) =>
        fetch(`/api/attendees?event=${encodeURIComponent(id)}`)
          .then((res) => res.json())
          .then((data: { attendees: Attendee[] }) => data.attendees)
          .catch(() => [] as Attendee[]),
      ),
    ).then((lists) => {
      if (cancelled) return;
      const names = new Set<string>();
      for (const list of lists) {
        for (const a of list) {
          if (a.name.toLowerCase() !== myName) {
            names.add(a.name.toLowerCase());
          }
        }
      }
      setMutuals(names);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId, going, profile]);

  async function rsvp(nextName: string, nextEmoji: string) {
    const clean = normalizeName(nextName);
    if (!clean) return;
    setSaving(true);
    onSaveProfile(clean, nextEmoji);
    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, name: clean, emoji: nextEmoji }),
      });
      const data = (await res.json()) as { attendees: Attendee[] };
      setAttendees(data.attendees);
      onSetGoing(eventId, true);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function cancelRsvp() {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/attendees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, name: profile.name }),
      });
      const data = (await res.json()) as { attendees: Attendee[] };
      setAttendees(data.attendees);
      onSetGoing(eventId, false);
    } finally {
      setSaving(false);
    }
  }

  const list = attendees ?? [];

  return (
    <div className="mx-5 mt-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Who&apos;s going
          {attendees !== null && (
            <span className="ml-1.5 text-slate-500">{list.length}</span>
          )}
        </p>
        {!editing && !isGoing && (
          <button
            onClick={() =>
              profile ? rsvp(profile.name, profile.emoji) : setEditing(true)
            }
            disabled={saving}
            className="rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            I&apos;m going
          </button>
        )}
        {isGoing && (
          <button
            onClick={cancelRsvp}
            disabled={saving}
            className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:text-slate-800 disabled:opacity-50"
          >
            Going ✓ · undo
          </button>
        )}
      </div>

      {editing && (
        <div className="mt-3 space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={32}
            className="w-full rounded-xl bg-white px-3 py-2 text-[13px] text-slate-800 ring-1 ring-slate-200 outline-none placeholder:text-slate-400 focus:ring-violet-300"
          />
          <div className="flex flex-wrap gap-1">
            {AVATAR_EMOJI.map((option) => (
              <button
                key={option}
                onClick={() => setEmoji(option)}
                className={`grid h-8 w-8 place-items-center rounded-full text-sm transition ${
                  emoji === option
                    ? "bg-violet-100 ring-2 ring-violet-400"
                    : "bg-white ring-1 ring-slate-200 hover:ring-slate-300"
                }`}
                aria-label={`Avatar ${option}`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={() => rsvp(name, emoji)}
            disabled={saving || !normalizeName(name)}
            className="w-full rounded-xl bg-violet-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            Count me in
          </button>
        </div>
      )}

      {list.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {list.map((a) => {
            const isMe =
              profile && a.name.toLowerCase() === profile.name.toLowerCase();
            const isMutual = mutuals.has(a.name.toLowerCase());
            return (
              <span
                key={a.name}
                className="flex items-center gap-1.5 rounded-full bg-white py-0.5 pl-0.5 pr-2.5 text-[11px] text-slate-600 ring-1 ring-slate-200"
              >
                <Avatar attendee={a} ring={Boolean(isMe) || isMutual} />
                {a.name}
                {isMe && <span className="text-violet-500">you</span>}
                {!isMe && isMutual && (
                  <span className="text-violet-500">mutual</span>
                )}
              </span>
            );
          })}
        </div>
      )}
      {attendees !== null && list.length === 0 && !editing && (
        <p className="mt-2 text-[12px] text-slate-400">
          No one yet — be the first.
        </p>
      )}
    </div>
  );
}
