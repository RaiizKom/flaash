"use client";

import { useState } from "react";
import { createEvent } from "./actions";
import {
  type EventType,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_TITLE_TEMPLATES,
} from "@/types";
import { calculatePrice, formatChf } from "@/lib/utils/pricing";

const EVENT_TYPES: EventType[] = [
  "wedding",
  "anniversary",
  "engagement",
  "party",
  "corporate",
  "other",
];

export default function CreateEventForm({ error }: { error?: string }) {
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [title, setTitle] = useState(EVENT_TYPE_TITLE_TEMPLATES.wedding);
  const [maxGuests, setMaxGuests] = useState(75);
  const [photosPerGuest, setPhotosPerGuest] = useState(8);
  const [revealMode, setRevealMode] = useState<"immediate" | "delayed">("delayed");
  const [revealAt, setRevealAt] = useState("");
  const [pending, setPending] = useState(false);

  const price = calculatePrice(maxGuests, photosPerGuest);

  function handleTypeChange(type: EventType) {
    setEventType(type);
    setTitle(EVENT_TYPE_TITLE_TEMPLATES[type]);
  }

  // BUG FIX: use onSubmit instead of form action={asyncFn}.
  // In React 19, passing a client async function to <form action> routes all
  // form events through React's transition system, which freezes controlled
  // inputs (sliders, radios, chips) before any submission ever happens.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const formData = new FormData(e.currentTarget);
    // Inject state-driven values that are not native form fields
    formData.set("event_type", eventType);
    formData.set("reveal_mode", revealMode);
    await createEvent(formData);
    // redirect() in createEvent throws — Next.js handles navigation.
    // This line only runs if createEvent somehow returns without redirecting.
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
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

      {/* Event type chips */}
      <div className="f-input-wrap">
        <label className="f-label">Type d&apos;événement</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              style={{
                padding: "10px 16px",
                borderRadius: "var(--radius-pill)",
                border: "1.5px solid",
                borderColor: eventType === type ? "var(--flaash-ink)" : "var(--border)",
                background: eventType === type ? "var(--flaash-ink)" : "transparent",
                color: eventType === type ? "var(--flaash-cream)" : "var(--fg-2)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all var(--t-fast)",
              }}
            >
              {EVENT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Title — BUG FIX: select-all on focus so the template is instantly
          replaceable without having to manually clear "___" on mobile */}
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
          onChange={(e) => setTitle(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="f-input"
          style={{ fontSize: 22 }}
        />
      </div>

      {/* Guests */}
      <div className="f-input-wrap">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <label className="f-label" htmlFor="max_guests">
            Nombre d&apos;invités
          </label>
          <input
            type="number"
            name="max_guests"
            value={maxGuests}
            min={10}
            max={500}
            onChange={(e) => setMaxGuests(Number(e.target.value) || 10)}
            onBlur={(e) => {
              const v = Number(e.target.value);
              setMaxGuests(Math.min(500, Math.max(10, isNaN(v) ? 10 : v)));
            }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              width: 72,
              textAlign: "right",
              border: "none",
              background: "transparent",
              color: "var(--fg)",
              outline: "none",
              MozAppearance: "textfield",
            }}
          />
        </div>
        <input
          id="max_guests"
          type="range"
          min={10}
          max={500}
          step={5}
          value={maxGuests}
          onChange={(e) => setMaxGuests(Number(e.target.value))}
          className="f-slider"
          style={{ marginTop: 10 }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--fg-3)",
            marginTop: 4,
          }}
        >
          <span>10</span>
          <span>500</span>
        </div>
      </div>

      {/* Photos per guest */}
      <div className="f-input-wrap">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <label className="f-label" htmlFor="photos_per_guest">
            Photos par invité
          </label>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            {photosPerGuest}
          </span>
        </div>
        <input
          id="photos_per_guest"
          name="photos_per_guest"
          type="range"
          min={1}
          max={20}
          step={1}
          value={photosPerGuest}
          onChange={(e) => setPhotosPerGuest(Number(e.target.value))}
          className="f-slider"
          style={{ marginTop: 10 }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--fg-3)",
            marginTop: 4,
          }}
        >
          <span>1</span>
          <span>20</span>
        </div>
      </div>

      {/* Reveal mode */}
      <div className="f-input-wrap">
        <label className="f-label">Révélation de la galerie</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {(["immediate", "delayed"] as const).map((mode) => (
            <label
              key={mode}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid",
                borderColor: revealMode === mode ? "var(--flaash-ink)" : "var(--border)",
                background: revealMode === mode ? "var(--flaash-cream-deep)" : "transparent",
                cursor: "pointer",
                transition: "all var(--t-fast)",
              }}
            >
              <input
                type="radio"
                name="reveal_mode"
                value={mode}
                checked={revealMode === mode}
                onChange={() => setRevealMode(mode)}
                style={{ accentColor: "var(--flaash-ink)", width: 18, height: 18 }}
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

      {/* Library upload toggle */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderRadius: "var(--radius-sm)",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
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
          style={{ accentColor: "var(--flaash-ink)", width: 20, height: 20 }}
        />
      </label>

      {/* Price card */}
      <div
        style={{
          background: "var(--flaash-ink)",
          borderRadius: "var(--radius-md)",
          padding: "20px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "rgba(250,247,242,0.6)",
              margin: 0,
            }}
          >
            Prix total
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 38,
              color: "var(--flaash-cream)",
              margin: "4px 0 0",
              lineHeight: 1,
            }}
          >
            {formatChf(price)}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 13, color: "rgba(250,247,242,0.6)", margin: 0 }}>
            {maxGuests} invités
          </p>
          <p style={{ fontSize: 13, color: "rgba(250,247,242,0.6)", margin: "2px 0 0" }}>
            × {photosPerGuest} photos
          </p>
        </div>
      </div>

      {/* Submit */}
      <div style={{ paddingBottom: 8 }}>
        <button
          type="submit"
          disabled={pending}
          className="btn-pill btn-amber"
        >
          {pending ? "CRÉATION…" : "CRÉER L'ÉVÉNEMENT →"}
        </button>
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--fg-3)",
            marginTop: 12,
          }}
        >
          Paiement Stripe requis pour activer l&apos;événement.
        </p>
      </div>
    </form>
  );
}
