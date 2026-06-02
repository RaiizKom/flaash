"use client";

import { useRef, useState } from "react";
import { createEvent } from "./actions";
import { type EventType, EVENT_TYPE_LABELS } from "@/types";
import { calculatePrice, formatChf } from "@/lib/utils/pricing";

const EVENT_TYPES: EventType[] = [
  "wedding",
  "anniversary",
  "engagement",
  "party",
  "corporate",
  "other",
];

const TITLE_PREFIXES: Record<EventType, string> = {
  wedding:     "Mariage de ",
  anniversary: "Anniversaire de ",
  engagement:  "Fiançailles de ",
  party:       "Soirée ",
  corporate:   "Événement ",
  other:       "",
};

const TITLE_PLACEHOLDERS: Record<EventType, string> = {
  wedding:     "Marie & Jean",
  anniversary: "Pierre — 50 ans",
  engagement:  "Sophie & Thomas",
  party:       "d'été",
  corporate:   "Team Building",
  other:       "Mon événement",
};

/* ── Stepper: − [number input] + ── */
function Stepper({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  // raw lets the user type freely — clamped only on blur, not on every keystroke
  const [raw, setRaw] = useState(String(value));

  function commit(raw: string) {
    const n = parseInt(raw, 10);
    const clamped = clamp(isNaN(n) ? min : n);
    setRaw(String(clamped));
    onChange(clamped);
  }

  function stepBy(delta: number) {
    const next = clamp(value + delta);
    setRaw(String(next));
    onChange(next);
  }

  return (
    <div className="f-input-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <label className="f-label" htmlFor={id}>{label}</label>
        <span style={{ fontSize: 11, color: "var(--fg-3)", fontWeight: 600 }}>
          {min} – {max}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--surface-2)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 12px",
        }}
      >
        {/* − */}
        <button
          type="button"
          onClick={() => stepBy(-step)}
          disabled={value <= min}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "1.5px solid var(--border)",
            background: value <= min ? "transparent" : "var(--flaash-ink)",
            color: value <= min ? "var(--fg-3)" : "var(--flaash-cream)",
            fontSize: 22, fontWeight: 700, lineHeight: 1,
            cursor: value <= min ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "all var(--t-fast)",
            userSelect: "none",
          }}
          aria-label={`Diminuer ${label}`}
        >
          −
        </button>

        {/* editable number — free typing, clamp on blur only */}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => commit(raw)}
          onFocus={(e) => e.target.select()}
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 36,
            border: "none",
            background: "transparent",
            color: "var(--flaash-ink)",
            padding: 0,
            outline: "none",
            WebkitAppearance: "none",
            MozAppearance: "textfield",
          }}
        />

        {/* + */}
        <button
          type="button"
          onClick={() => stepBy(step)}
          disabled={value >= max}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "1.5px solid var(--border)",
            background: value >= max ? "transparent" : "var(--flaash-ink)",
            color: value >= max ? "var(--fg-3)" : "var(--flaash-cream)",
            fontSize: 22, fontWeight: 700, lineHeight: 1,
            cursor: value >= max ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "all var(--t-fast)",
            userSelect: "none",
          }}
          aria-label={`Augmenter ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ── Main form ── */
export default function CreateEventForm({ error }: { error?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [title, setTitle]         = useState(TITLE_PREFIXES.wedding);
  const [maxGuests, setMaxGuests] = useState(75);
  const [photosPerGuest, setPhotosPerGuest] = useState(8);
  const [revealMode, setRevealMode] = useState<"immediate" | "delayed">("immediate");
  const [revealAt, setRevealAt]   = useState("");
  const [isPending, setIsPending] = useState(false);

  const price = calculatePrice(maxGuests, photosPerGuest);

  function handleTypeChange(type: EventType) {
    setEventType(type);
    setTitle(TITLE_PREFIXES[type]);
  }

  // type="button" means the browser NEVER fires a native form submission.
  // We build FormData from state and call the server action directly.
  async function handleSubmit() {
    if (isPending) return;
    setIsPending(true);
    const fd = new FormData();
    fd.set("title",            title);
    fd.set("event_type",       eventType);
    fd.set("max_guests",       String(maxGuests));
    fd.set("photos_per_guest", String(photosPerGuest));
    fd.set("reveal_mode",      revealMode);
    if (revealMode === "delayed" && revealAt) fd.set("reveal_at", revealAt);
    const checkbox = formRef.current?.querySelector<HTMLInputElement>(
      "input[name=allow_library_upload]"
    );
    if (checkbox?.checked) fd.set("allow_library_upload", "on");
    await createEvent(fd); // redirects on success; throws on error (handled by Next.js)
    setIsPending(false);   // only reached if createEvent didn't redirect
  }

  return (
    <form ref={formRef} className="flex flex-col gap-7">
      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "var(--flaash-error-soft)",
            border: "1px solid var(--flaash-error)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            fontSize: 14,
            color: "var(--flaash-error)",
            fontWeight: 500,
          }}
        >
          {decodeURIComponent(error)}
        </div>
      )}

      {/* ── Event type ── */}
      <div className="f-input-wrap">
        <label className="f-label">Type d&apos;événement</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {EVENT_TYPES.map((type) => (
            <label key={type} className="f-chip-radio">
              <input
                type="radio"
                name="event_type"
                value={type}
                checked={eventType === type}
                onChange={() => handleTypeChange(type)}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
              />
              {EVENT_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
      </div>

      {/* ── Title ── */}
      <div className="f-input-wrap">
        <label className="f-label" htmlFor="title">
          Titre de l&apos;événement
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          placeholder={TITLE_PLACEHOLDERS[eventType]}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="f-input"
          style={{ fontSize: 20 }}
        />
      </div>

      {/* ── Steppers ── */}
      <Stepper
        id="max_guests"
        label="Nombre d'invités"
        value={maxGuests}
        min={10}
        max={500}
        step={5}
        onChange={setMaxGuests}
      />
      <Stepper
        id="photos_per_guest"
        label="Photos par invité"
        value={photosPerGuest}
        min={1}
        max={20}
        step={1}
        onChange={setPhotosPerGuest}
      />

      {/* ── Galerie révélation ── */}
      <div className="f-input-wrap">
        <label className="f-label">Révélation de la galerie</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {(["immediate", "delayed"] as const).map((mode) => (
            <label key={mode} className="f-reveal-option">
              <input
                type="radio"
                name="reveal_mode"
                value={mode}
                checked={revealMode === mode}
                onChange={() => setRevealMode(mode)}
                style={{ accentColor: "var(--flaash-ink)", width: 18, height: 18, flexShrink: 0 }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {mode === "immediate" ? "Immédiate" : "Différée"}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                  {mode === "immediate"
                    ? "La galerie est visible dès la première photo."
                    : "La galerie se révèle à une date et heure choisies."}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Date/heure (conditional) ── */}
      {revealMode === "delayed" && (
        <div className="f-input-wrap">
          <label className="f-label" htmlFor="reveal_at">
            Date et heure de révélation
          </label>
          <input
            id="reveal_at"
            name="reveal_at"
            type="datetime-local"
            value={revealAt}
            onChange={(e) => setRevealAt(e.target.value)}
            className="f-input-box"
            style={{ marginTop: 4 }}
          />
        </div>
      )}

      {/* ── Photothèque ── */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderRadius: "var(--radius-sm)",
          background: "var(--surface-2)",
          border: "1.5px solid var(--border)",
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            Autoriser les photos de la photothèque
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
            Les invités peuvent importer des photos existantes.
          </div>
        </div>
        <input
          type="checkbox"
          name="allow_library_upload"
          style={{ accentColor: "var(--flaash-ink)", width: 20, height: 20, flexShrink: 0 }}
        />
      </label>

      {/* ── Prix dynamique ── */}
      <div
        style={{
          background: "var(--flaash-ink)",
          borderRadius: "var(--radius-md)",
          padding: "22px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "rgba(250,247,242,0.55)",
              margin: 0,
            }}
          >
            Prix total
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 42,
              color: "var(--flaash-cream)",
              margin: "4px 0 0",
              lineHeight: 1,
            }}
          >
            {formatChf(price)}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 13, color: "rgba(250,247,242,0.55)", margin: 0 }}>
            {maxGuests} invités
          </p>
          <p style={{ fontSize: 13, color: "rgba(250,247,242,0.55)", margin: "3px 0 0" }}>
            × {photosPerGuest} photos
          </p>
        </div>
      </div>

      {/* ── Submit ── */}
      <div style={{ paddingBottom: 8 }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="btn-pill btn-amber"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? "CRÉATION…" : "CRÉER L'ÉVÉNEMENT →"}
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--fg-3)", marginTop: 12 }}>
          Paiement Stripe requis pour activer l&apos;événement.
        </p>
      </div>
    </form>
  );
}
