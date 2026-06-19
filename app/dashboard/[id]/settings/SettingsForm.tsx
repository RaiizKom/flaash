"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { type Event, type EventType, EVENT_TYPE_LABELS, STATUS_LABELS } from "@/types";
import { updateEventSettings } from "./actions";

const EVENT_TYPES: EventType[] = [
  "wedding",
  "anniversary",
  "engagement",
  "party",
  "corporate",
  "other",
];

function toDatetimeLocal(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function normalizeNumericInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/^0+/, "") || "0";
}

export default function SettingsForm({
  event,
  maxPhotosTaken,
}: {
  event: Event;
  maxPhotosTaken: number;
}) {
  const router = useRouter();
  const isRevealed = event.status === "revealed";
  const [title, setTitle] = useState(event.title);
  const [eventType, setEventType] = useState<EventType>(event.event_type);
  const [photosPerGuest, setPhotosPerGuest] = useState(String(event.photos_per_guest));
  const [allowLibraryUpload, setAllowLibraryUpload] = useState(event.allow_library_upload);
  const [revealMode, setRevealMode] = useState<"manual" | "scheduled">(
    event.reveal_at ? "scheduled" : "manual"
  );
  const [revealAt, setRevealAt] = useState(toDatetimeLocal(event.reveal_at));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const revealDateIsPast = useMemo(() => {
    if (event.status !== "active" || revealMode !== "scheduled" || !revealAt) return false;
    return new Date(revealAt).getTime() <= Date.now();
  }, [event.status, revealAt, revealMode]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(() => {
      void (async () => {
        const result = await updateEventSettings(event.id, formData);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        setSuccess(true);
        router.refresh();
      })();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {isRevealed && (
        <div style={{ background: "var(--flaash-amber-soft)", borderRadius: "var(--radius-md)", color: "var(--flaash-amber-deep)", fontSize: 13, fontWeight: 700, lineHeight: 1.45, padding: "12px 14px" }}>
          L&apos;événement est déjà révélé. Certains paramètres sont figés.
        </div>
      )}

      <section className="f-card" style={{ padding: "18px 20px" }}>
        <p className="f-eyebrow" style={{ marginBottom: 14 }}>Identité</p>
        <div className="f-input-wrap" style={{ marginBottom: 14 }}>
          <label className="f-label" htmlFor="title">Titre</label>
          <input
            id="title"
            name="title"
            className="f-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            required
            style={{
              background: "var(--surface-2)",
              border: "1.5px solid var(--border)",
            }}
          />
        </div>

        <div className="f-input-wrap">
          <label className="f-label" htmlFor="eventType">Type d&apos;événement</label>
          <select
            id="eventType"
            name="event_type"
            className="f-input"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EVENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="f-card" style={{ padding: "18px 20px" }}>
        <p className="f-eyebrow" style={{ marginBottom: 14 }}>Galerie</p>
        <div className="f-input-wrap" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <label className="f-label" htmlFor="photosPerGuest">Photos max / invité</label>
            <span style={{ color: "var(--fg-3)", fontSize: 11, fontWeight: 700 }}>
              1 - 20
            </span>
          </div>
          <input
            id="photosPerGuest"
            name="photos_per_guest"
            className="f-input"
            inputMode="numeric"
            pattern="[0-9]*"
            value={photosPerGuest}
            onChange={(e) => setPhotosPerGuest(normalizeNumericInput(e.target.value))}
            onFocus={(e) => e.currentTarget.select()}
            disabled={isRevealed}
          />
          <p style={{ color: "var(--fg-3)", fontSize: 12, lineHeight: 1.45, marginTop: 8 }}>
            Tu ne peux pas descendre sous le nombre de photos déjà prises par un invité.
            {maxPhotosTaken > 0 ? ` Actuellement : ${maxPhotosTaken}.` : ""}
          </p>
        </div>

        <label
          style={{
            alignItems: "center",
            color: "var(--fg-2)",
            display: "flex",
            fontSize: 14,
            fontWeight: 700,
            gap: 10,
          }}
        >
          <input
            name="allow_library_upload"
            type="checkbox"
            checked={allowLibraryUpload}
            onChange={(e) => setAllowLibraryUpload(e.target.checked)}
          />
          Autoriser les photos de la photothèque
        </label>
      </section>

      <section className="f-card" style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
          <p className="f-eyebrow">Révélation</p>
          <span style={{ color: "var(--fg-3)", fontSize: 12, fontWeight: 700 }}>
            {STATUS_LABELS[event.status]}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: revealMode === "scheduled" ? 14 : 0 }}>
          <label style={{ alignItems: "center", display: "flex", gap: 10, color: "var(--fg-2)", fontSize: 14, fontWeight: 700 }}>
            <input
              type="radio"
              name="reveal_mode"
              value="manual"
              checked={revealMode === "manual"}
              onChange={() => setRevealMode("manual")}
              disabled={isRevealed}
            />
            Révélation manuelle
          </label>
          <label style={{ alignItems: "center", display: "flex", gap: 10, color: "var(--fg-2)", fontSize: 14, fontWeight: 700 }}>
            <input
              type="radio"
              name="reveal_mode"
              value="scheduled"
              checked={revealMode === "scheduled"}
              onChange={() => setRevealMode("scheduled")}
              disabled={isRevealed}
            />
            Date fixée
          </label>
        </div>

        {revealMode === "scheduled" && (
          <div className="f-input-wrap">
            <label className="f-label" htmlFor="revealAt">Date de révélation</label>
            <input
              id="revealAt"
              name="reveal_at"
              className="f-input"
              type="datetime-local"
              value={revealAt}
              onChange={(e) => setRevealAt(e.target.value)}
              disabled={isRevealed}
            />
            {revealDateIsPast && (
              <p style={{ color: "var(--flaash-amber-deep)", fontSize: 12, fontWeight: 700, lineHeight: 1.45, marginTop: 8 }}>
                Si cette date est déjà passée, l&apos;événement se révélera automatiquement au prochain chargement.
              </p>
            )}
          </div>
        )}
      </section>

      <div className="f-card" style={{ padding: "16px 18px" }}>
        <p style={{ color: "var(--fg-3)", fontSize: 13, lineHeight: 1.45, margin: 0 }}>
          La photo de couverture se modifie depuis le dashboard principal.
        </p>
      </div>

      {error && (
        <p style={{ color: "var(--flaash-error)", fontSize: 13, fontWeight: 700, lineHeight: 1.45 }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ color: "var(--flaash-forest)", fontSize: 13, fontWeight: 700, lineHeight: 1.45 }}>
          Paramètres enregistrés.
        </p>
      )}

      <button type="submit" className="btn-pill btn-forest" disabled={isPending || !title.trim()}>
        {isPending ? "Enregistrement…" : "Enregistrer les paramètres"}
      </button>

      <Link
        href={`/dashboard/${event.id}`}
        style={{
          color: "var(--fg-3)",
          fontSize: 13,
          fontWeight: 700,
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        Retour au dashboard
      </Link>
    </form>
  );
}
