"use client";

import Image from "next/image";
import { FormEvent, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import {
  AttendanceAvatarId,
  AttendanceSnapshot,
  attendanceAvatars,
  createAttendanceIdentity,
  fetchAttendance,
  getAttendanceIdentitySnapshot,
  getServerAttendanceIdentitySnapshot,
  parseAttendanceIdentity,
  removeAttendance,
  saveAttendance,
  subscribeAttendanceIdentity,
  writeAttendanceIdentity,
} from "@/lib/attendance";

const EMPTY_SNAPSHOT: AttendanceSnapshot = { attendees: [], count: 0 };

function Avatar({ avatarId, name, size = "md" }: { avatarId: AttendanceAvatarId; name: string; size?: "sm" | "md" | "lg" }) {
  const avatar = attendanceAvatars.find((candidate) => candidate.id === avatarId) ?? attendanceAvatars[0];
  return (
    <span className={`attendance-avatar attendance-avatar--${size}`} title={name}>
      <Image src={avatar.src} alt="" width={96} height={96} sizes="96px" />
      <span className="sr-only">{name}</span>
    </span>
  );
}

export default function AttendancePanel({ eventId }: { eventId: string }) {
  const identitySnapshot = useSyncExternalStore(
    subscribeAttendanceIdentity,
    getAttendanceIdentitySnapshot,
    getServerAttendanceIdentitySnapshot,
  );
  const identity = parseAttendanceIdentity(identitySnapshot);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<AttendanceAvatarId>("ferry");
  const [message, setMessage] = useState("");
  const editorRef = useRef<HTMLFormElement>(null);
  const refresh = useEffectEvent(async (attendeeId: string | undefined, signal?: AbortSignal, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      setSnapshot(await fetchAttendance(eventId, attendeeId, signal));
      if (!quiet) setMessage("");
    } catch (error) {
      if (!signal?.aborted) setMessage(error instanceof Error ? error.message : "Attendance is reconnecting.");
    } finally {
      if (!quiet && !signal?.aborted) setLoading(false);
    }
  });

  useEffect(() => {
    const controller = new AbortController();
    const initial = window.setTimeout(() => refresh(identity?.attendeeId, controller.signal), 0);
    const interval = window.setInterval(() => refresh(identity?.attendeeId, undefined, true), 30_000);
    return () => {
      controller.abort();
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [eventId, identity?.attendeeId]);

  const going = snapshot.attendees.some((attendee) => attendee.isYou);
  const visibleAttendees = snapshot.attendees.slice(0, 8);

  function revealEditor() {
    setEditing(true);
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "nearest",
      });
    });
  }

  function beginJoin() {
    if (identity) {
      void commit(identity.displayName, identity.avatarId);
      return;
    }
    revealEditor();
    setMessage("");
  }

  function editProfile() {
    if (identity) {
      setName(identity.displayName);
      setAvatarId(identity.avatarId);
    }
    revealEditor();
    setMessage("");
  }

  async function commit(nextName: string, nextAvatarId: AttendanceAvatarId) {
    const cleanName = nextName.trim().replace(/\s+/g, " ");
    if (!cleanName) {
      setMessage("Add the name people know you by.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const nextIdentity = identity
        ? { ...identity, displayName: cleanName, avatarId: nextAvatarId }
        : createAttendanceIdentity(cleanName, nextAvatarId);
      const nextSnapshot = await saveAttendance(eventId, nextIdentity);
      writeAttendanceIdentity(nextIdentity);
      setSnapshot(nextSnapshot);
      setName(cleanName);
      setAvatarId(nextAvatarId);
      setEditing(false);
      setMessage("You’re on the going list.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Attendance could not update.");
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await commit(name, avatarId);
  }

  async function leave() {
    if (!identity) return;
    setSaving(true);
    setMessage("");
    try {
      setSnapshot(await removeAttendance(eventId, identity));
      setEditing(false);
      setMessage("You’re off this event’s list. Your local profile is still saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Attendance could not update.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="attendance-panel" aria-labelledby="attendance-title">
      <header>
        <div>
          <p>Social signal · self-declared</p>
          <h4 id="attendance-title" className="font-display">Who’s going?</h4>
        </div>
        <strong aria-label={`${snapshot.count} ${snapshot.count === 1 ? "person" : "people"} going`}>
          {loading ? "·" : snapshot.count}
        </strong>
      </header>

      {visibleAttendees.length > 0 ? (
        <div className="attendance-roster">
          <div className="attendance-avatar-stack" aria-hidden>
            {visibleAttendees.slice(0, 6).map((attendee) => (
              <Avatar key={attendee.id} avatarId={attendee.avatarId} name={attendee.displayName} />
            ))}
            {snapshot.count > 6 && <span>+{snapshot.count - 6}</span>}
          </div>
          <p>
            {visibleAttendees.map((attendee, index) => (
              <span key={attendee.id}>{index > 0 && ", "}<b>{attendee.isYou ? "You" : attendee.displayName}</b></span>
            ))}
            {snapshot.count > visibleAttendees.length && ` and ${snapshot.count - visibleAttendees.length} more`}
            {snapshot.count === 1 ? " is going." : " are going."}
          </p>
        </div>
      ) : (
        <p className="attendance-empty">{loading ? "Checking the city signal…" : "Be the first person to say you’re going."}</p>
      )}

      {!editing && (
        <div className="attendance-actions">
          {going ? (
            <>
              <div className="attendance-you">
                {identity && <Avatar avatarId={identity.avatarId} name={identity.displayName} size="sm" />}
                <span><b>You’re going</b><small>This browser is your key.</small></span>
              </div>
              <button type="button" onClick={editProfile} disabled={saving}>Edit</button>
              <button type="button" className="attendance-leave" onClick={leave} disabled={saving}>Can’t make it</button>
            </>
          ) : (
            <>
              <button type="button" className="attendance-join" onClick={beginJoin} disabled={loading || saving}>
                {saving ? "Joining…" : identity ? `I’m going as ${identity.displayName}` : "I’m going"}
              </button>
              {identity && <button type="button" onClick={editProfile}>Change profile</button>}
            </>
          )}
        </div>
      )}

      {editing && (
        <form ref={editorRef} className="attendance-editor" onSubmit={submit}>
          <label htmlFor={`attendance-name-${eventId}`}>Name people will see</label>
          <input
            id={`attendance-name-${eventId}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={32}
            autoComplete="name"
            placeholder="Your name"
            required
            autoFocus
          />
          <fieldset>
            <legend>Choose your Kochi face</legend>
            <div>
              {attendanceAvatars.map((avatar) => (
                <label key={avatar.id} className={avatarId === avatar.id ? "is-selected" : ""}>
                  <input
                    type="radio"
                    name={`avatar-${eventId}`}
                    value={avatar.id}
                    checked={avatarId === avatar.id}
                    onChange={() => setAvatarId(avatar.id)}
                  />
                  <Avatar avatarId={avatar.id} name={avatar.label} size="lg" />
                  <span>{avatar.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p>Your name and avatar are public. A private random key stays only in this browser—no account needed.</p>
          <div>
            <button type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
            <button type="submit" disabled={saving}>{saving ? "Saving…" : going ? "Update my spot" : "Add me to the list"}</button>
          </div>
        </form>
      )}

      <p className="attendance-message" aria-live="polite">{message}</p>
    </section>
  );
}
