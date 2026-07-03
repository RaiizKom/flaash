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

function getRevealContext(event: Event) {
  if (event.status === "revealed") {
    return {
      label: "Galerie ouverte",
      detail: "Les souvenirs peuvent déjà être découverts.",
    };
  }

  if (event.reveal_at) {
    return {
      label: "Reveal planifié",
      detail: "Les souvenirs reviendront au moment choisi.",
    };
  }

  return {
    label: "Reveal manuel",
    detail: "Vous choisirez quand ouvrir la galerie.",
  };
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
  const revealContext = getRevealContext(event);

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
    <form onSubmit={handleSubmit} className="dashboard-settings-layout">
      <aside className="dashboard-settings-context" aria-label="Contexte de l'événement">
        <div>
          <p className="dashboard-section-label">État</p>
          <strong>{STATUS_LABELS[event.status]}</strong>
          <span>Statut actuel de l&apos;événement.</span>
        </div>
        <div>
          <p className="dashboard-section-label">Rythme</p>
          <strong>{maxPhotosTaken}</strong>
          <span>Pose(s) déjà prises par l&apos;invité le plus actif.</span>
        </div>
        <div>
          <p className="dashboard-section-label">Reveal</p>
          <strong>{revealContext.label}</strong>
          <span>{revealContext.detail}</span>
        </div>
        {isRevealed && (
          <div className="dashboard-settings-lock">
            <strong>Cadre déjà révélé.</strong>
            <span>Les réglages qui touchent au retour des souvenirs sont figés.</span>
          </div>
        )}
      </aside>

      <div className="dashboard-settings-form">
        {isRevealed && (
          <div className="dashboard-settings-notice">
            L&apos;événement est déjà révélé. Certains réglages sont figés.
          </div>
        )}

        <section className="dashboard-settings-card">
          <div className="dashboard-settings-section-head">
            <p className="dashboard-section-label">Identité de l&apos;événement</p>
            <p>Gardez un nom clair pour la soirée et sa galerie.</p>
          </div>
          <div className="f-input-wrap">
            <label className="f-label" htmlFor="title">Titre</label>
            <input
              id="title"
              name="title"
              className="f-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              required
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

        <section className="dashboard-settings-card">
          <div className="dashboard-settings-section-head">
            <p className="dashboard-section-label">Rythme de capture</p>
            <p>Définissez le nombre de poses et la place laissée aux regards déjà présents.</p>
          </div>
          <div className="f-input-wrap">
            <div className="dashboard-settings-field-head">
              <label className="f-label" htmlFor="photosPerGuest">Poses max / invité</label>
              <span>1 - 20</span>
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
            <p className="dashboard-settings-help">
              Gardez une limite cohérente avec les poses déjà prises.
              {maxPhotosTaken > 0 ? ` Actuellement : ${maxPhotosTaken}.` : ""}
            </p>
          </div>

          <label className="dashboard-settings-check">
            <input
              name="allow_library_upload"
              type="checkbox"
              checked={allowLibraryUpload}
              onChange={(e) => setAllowLibraryUpload(e.target.checked)}
            />
            <span>
              <strong>Autoriser les photos depuis la galerie du téléphone</strong>
              <small>Utile si vos invités veulent ajouter un souvenir capturé juste avant.</small>
            </span>
          </label>
        </section>

        <section className="dashboard-settings-card">
          <div className="dashboard-settings-section-row">
            <div className="dashboard-settings-section-head">
              <p className="dashboard-section-label">Moment du reveal</p>
              <p>Choisissez quand les souvenirs reviennent dans la galerie.</p>
            </div>
            <span>
              {STATUS_LABELS[event.status]}
            </span>
          </div>

          <div className="dashboard-settings-radio-group">
            <label className="dashboard-settings-radio">
              <input
                type="radio"
                name="reveal_mode"
                value="manual"
                checked={revealMode === "manual"}
                onChange={() => setRevealMode("manual")}
                disabled={isRevealed}
              />
              <span>
                <strong>Reveal manuel</strong>
                <small>Vous ouvrez la galerie quand le moment est juste.</small>
              </span>
            </label>
            <label className="dashboard-settings-radio">
              <input
                type="radio"
                name="reveal_mode"
                value="scheduled"
                checked={revealMode === "scheduled"}
                onChange={() => setRevealMode("scheduled")}
                disabled={isRevealed}
              />
              <span>
                <strong>Date fixée</strong>
                <small>Les souvenirs reviennent automatiquement à l&apos;heure prévue.</small>
              </span>
            </label>
          </div>

          {revealMode === "scheduled" && (
            <div className="f-input-wrap dashboard-settings-date">
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
                <p className="dashboard-settings-warning">
                  Si cette date est déjà passée, l&apos;événement se révélera automatiquement au prochain chargement.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="dashboard-settings-card dashboard-settings-safety">
          <div className="dashboard-settings-section-head">
            <p className="dashboard-section-label">Cadre et sécurité</p>
            <p>
              Le QR et le lien invité restent les mêmes. La photo de couverture se modifie depuis
              la page principale de l&apos;événement.
            </p>
          </div>
        </section>

        {error && (
          <p className="dashboard-settings-error">
            {error}
          </p>
        )}
        {success && (
          <p className="dashboard-settings-success">
            Changements enregistrés.
          </p>
        )}

        <div className="dashboard-settings-actions">
          <button type="submit" className="btn-pill btn-ink" disabled={isPending || !title.trim()}>
            {isPending ? "Enregistrement…" : "Enregistrer les changements"}
          </button>

          <Link
            href={`/dashboard/${event.id}`}
            className="dashboard-settings-return"
          >
            Retour à l&apos;événement
          </Link>
        </div>
      </div>
    </form>
  );
}
