"use client";

import { useState } from "react";
import { createEvent } from "./actions";
import { type EventType, EVENT_TYPE_LABELS } from "@/types";
import { PLANS, getPlanForGuests, getPlan, type Plan } from "@/lib/utils/pricing";

const EVENT_TYPES: EventType[] = [
  "wedding", "anniversary", "engagement", "party", "corporate", "other",
];

const TITLE_PREFIXES: Record<EventType, string> = {
  wedding: "Mariage de ", anniversary: "Anniversaire de ",
  engagement: "Fiançailles de ", party: "Soirée ",
  corporate: "Événement ", other: "",
};

const TITLE_PLACEHOLDERS: Record<EventType, string> = {
  wedding: "Marie & Jean", anniversary: "Pierre — 50 ans",
  engagement: "Sophie & Thomas", party: "d'été",
  corporate: "Team Building", other: "Mon événement",
};

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({
  id, label, value, min, max, step = 1, onChange,
}: {
  id: string; label: string; value: number;
  min: number; max: number; step?: number;
  onChange: (n: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
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
        <span style={{ fontSize: 11, color: "var(--fg-3)", fontWeight: 600 }}>{min} – {max}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
        <button type="button" onClick={() => stepBy(-step)} disabled={value <= min} aria-label={`Diminuer ${label}`}
          style={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", border: "1.5px solid var(--border)", background: value <= min ? "transparent" : "var(--flaash-ink)", color: value <= min ? "var(--fg-3)" : "var(--flaash-cream)", fontSize: 20, fontWeight: 700, lineHeight: 1, cursor: value <= min ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all var(--t-fast)", userSelect: "none" }}>−</button>
        <input id={id} type="number" inputMode="numeric" value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => commit(raw)}
          onFocus={(e) => e.target.select()}
          style={{ flex: 1, minWidth: 0, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, border: "none", background: "transparent", color: "var(--flaash-ink)", padding: "0 8px", outline: "none", WebkitAppearance: "none", MozAppearance: "textfield" }} />
        <button type="button" onClick={() => stepBy(step)} disabled={value >= max} aria-label={`Augmenter ${label}`}
          style={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", border: "1.5px solid var(--border)", background: value >= max ? "transparent" : "var(--flaash-ink)", color: value >= max ? "var(--fg-3)" : "var(--flaash-cream)", fontSize: 20, fontWeight: 700, lineHeight: 1, cursor: value >= max ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all var(--t-fast)", userSelect: "none" }}>+</button>
      </div>
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({
  plan, selected, isRecommended, compatible, incompatibleMsg, onSelect,
}: {
  plan: Plan; selected: boolean; isRecommended: boolean; compatible: boolean;
  incompatibleMsg?: string; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: "100%", textAlign: "left", padding: "16px",
        borderRadius: "var(--radius-sm)",
        border: `2px solid ${isRecommended ? "var(--flaash-amber)" : selected ? "var(--flaash-ink)" : "var(--border)"}`,
        background: selected ? (isRecommended ? "rgba(245,166,35,0.06)" : "var(--flaash-cream-deep)") : "transparent",
        cursor: "pointer", position: "relative", transition: "all var(--t-fast)",
      }}
    >
      {isRecommended && (
        <span style={{ position: "absolute", top: -11, left: 12, background: "var(--flaash-amber)", color: "var(--flaash-ink)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 100 }}>
          RECOMMANDÉ
        </span>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{plan.label}</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>
          {plan.price === 0 ? "Gratuit" : `${plan.price} CHF`}
        </span>
      </div>
      <p style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 4 }}>{plan.description}</p>
      {!compatible && incompatibleMsg && (
        <p style={{ fontSize: 11, color: "#dc2626", marginTop: 6, fontWeight: 600 }}>
          {incompatibleMsg}
        </p>
      )}
    </button>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function CreateEventForm({ error }: { error?: string }) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [eventType, setEventType]   = useState<EventType>("wedding");
  const [title, setTitle]           = useState(TITLE_PREFIXES.wedding);
  const [maxGuests, setMaxGuests]   = useState(75);
  const [photosPerGuest, setPhotosPerGuest] = useState(8);
  const [revealMode, setRevealMode] = useState<"fixed" | "manual">("fixed");
  const [revealAt, setRevealAt]     = useState("");
  const [allowLibrary, setAllowLibrary] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2 state
  const [selectedPlanId, setSelectedPlanId] = useState<string>("classic");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending]   = useState(false);

  function handleTypeChange(type: EventType) {
    setEventType(type);
    setTitle(TITLE_PREFIXES[type]);
  }

  function handleContinue() {
    setStep1Error(null);
    const plan = getPlanForGuests(maxGuests);
    // pre-select plan (or premium if >250 → shown as quote page)
    setSelectedPlanId(plan?.id ?? "premium");
    setStep(2);
  }

  function handleBack() {
    setStep(1);
  }

  // Plan compatibility — strict, no tolerance
  const selectedPlan = getPlan(selectedPlanId)!;
  const autoSelectedPlan = getPlanForGuests(maxGuests); // for recommended badge
  const canSubmit = selectedPlanId === "test" || maxGuests <= selectedPlan.maxGuests;
  const suggestedPlan = canSubmit ? null : getPlanForGuests(maxGuests);

  const DISPLAY_ORDER = ["premium", "classic", "essential", "test"];
  const displayedPlans = DISPLAY_ORDER.map((id) => PLANS.find((p) => p.id === id)!);

  async function handleSubmit() {
    if (isPending || !canSubmit) return;
    setIsPending(true);
    setSubmitError(null);

    const fd = new FormData();
    fd.set("title",            title);
    fd.set("event_type",       eventType);
    fd.set("max_guests",       String(maxGuests));
    fd.set("photos_per_guest", String(photosPerGuest));
    fd.set("plan_id",          selectedPlanId);
    if (revealMode === "fixed" && revealAt) fd.set("reveal_at", revealAt);
    if (allowLibrary) fd.set("allow_library_upload", "on");

    const result = await createEvent(fd);

    if ("error" in result) {
      setSubmitError(result.error);
      setIsPending(false);
      return;
    }

    if (!result.requiresPayment) {
      window.location.href = `/dashboard/${result.eventId}`;
      return;
    }

    // Paid plan → get Stripe URL
    try {
      const res = await fetch(`/api/checkout/${result.eventId}`, { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSubmitError(data.error ?? "Erreur lors du paiement.");
        setIsPending(false);
      }
    } catch {
      setSubmitError("Erreur réseau. Réessaie.");
      setIsPending(false);
    }
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <form className="flex flex-col gap-7">
        {error && (
          <div style={{ background: "var(--flaash-error-soft)", border: "1px solid var(--flaash-error)", borderRadius: "var(--radius-sm)", padding: "12px 14px", fontSize: 14, color: "var(--flaash-error)", fontWeight: 500 }}>
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Event type */}
        <div className="f-input-wrap">
          <label className="f-label">Type d&apos;événement</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {EVENT_TYPES.map((type) => (
              <label key={type} className="f-chip-radio">
                <input type="radio" name="event_type" value={type} checked={eventType === type}
                  onChange={() => handleTypeChange(type)}
                  style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                {EVENT_TYPE_LABELS[type]}
              </label>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="f-input-wrap">
          <label className="f-label" htmlFor="title">Titre de l&apos;événement</label>
          <input id="title" name="title" type="text" required value={title}
            placeholder={TITLE_PLACEHOLDERS[eventType]}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="f-input" style={{ fontSize: 20 }} />
        </div>

        {/* Steppers */}
        <Stepper id="max_guests" label="Nombre d'invités" value={maxGuests} min={1} max={250} step={5} onChange={setMaxGuests} />
        <Stepper id="photos_per_guest" label="Photos par invité" value={photosPerGuest} min={1} max={20} step={1} onChange={setPhotosPerGuest} />

        {/* Reveal mode */}
        <div className="f-input-wrap">
          <label className="f-label">Révélation de la galerie</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
            {(["fixed", "manual"] as const).map((mode) => (
              <label key={mode} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: "var(--radius-sm)", border: `1.5px solid ${revealMode === mode ? "var(--flaash-ink)" : "var(--border)"}`, background: revealMode === mode ? "var(--flaash-cream-deep)" : "transparent", cursor: "pointer", transition: "all var(--t-fast)" }}>
                <input type="radio" checked={revealMode === mode} onChange={() => setRevealMode(mode)} style={{ marginTop: 2, accentColor: "var(--flaash-ink)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{mode === "fixed" ? "Date fixée" : "Révélation manuelle"}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>
                    {mode === "fixed" ? "La galerie se révèle automatiquement à la date choisie." : "Vous révélez la galerie manuellement depuis votre dashboard."}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {revealMode === "fixed" && (
            <input id="reveal_at" name="reveal_at" type="datetime-local" value={revealAt}
              onChange={(e) => setRevealAt(e.target.value)} className="f-input-box" style={{ marginTop: 10 }} />
          )}
        </div>

        {/* Library upload */}
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", border: "1.5px solid var(--border)", cursor: "pointer" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Autoriser les photos de la photothèque</div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>Les invités peuvent importer des photos existantes.</div>
          </div>
          <input type="checkbox" name="allow_library_upload"
            checked={allowLibrary}
            onChange={(e) => setAllowLibrary(e.target.checked)}
            style={{ accentColor: "var(--flaash-ink)", width: 20, height: 20, flexShrink: 0 }} />
        </label>

        {/* Validation error */}
        {step1Error && (
          <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{step1Error}</p>
        )}

        {/* Continue button */}
        <div style={{ paddingBottom: 8 }}>
          <button type="button" onClick={handleContinue} className="btn-pill btn-amber">
            CONTINUER →
          </button>
        </div>
      </form>
    );
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Recap */}
      <div className="f-card" style={{ padding: "16px 20px" }}>
        <p className="f-eyebrow" style={{ marginBottom: 10 }}>Récapitulatif</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            [EVENT_TYPE_LABELS[eventType], title],
            ["Invités", `${maxGuests}`],
            ["Photos / invité", `${photosPerGuest}`],
            ["Révélation", revealAt ? new Date(revealAt).toLocaleString("fr-CH") : "Manuelle"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--fg-3)" }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency — simple, no day count */}
      {revealMode === "fixed" && revealAt && (
        <div style={{ background: "var(--flaash-amber-soft)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13, color: "var(--flaash-amber-deep)", fontWeight: 600 }}>
          Sécurisez votre événement maintenant.
        </div>
      )}

      {/* +250 → devis */}
      {maxGuests > 250 ? (
        <div style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", padding: "20px", textAlign: "center" }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Vous avez plus de 250 invités ?</p>
          <p style={{ fontSize: 14, color: "var(--fg-3)", marginBottom: 16 }}>Contactez-nous pour un devis sur mesure.</p>
          <a href="mailto:hello@flaash.ch" className="btn-pill btn-ink" style={{ fontSize: 13 }}>
            Demander un devis →
          </a>
        </div>
      ) : (
        <>
          {/* Plan selector */}
          <div className="f-input-wrap">
            <label className="f-label" style={{ marginBottom: 12 }}>Choisissez votre plan</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {displayedPlans.map((plan) => {
                const isTest = plan.id === "test";
                // strict compatibility (no tolerance)
                const compatible = isTest ? true : maxGuests <= plan.maxGuests;
                const isRecommended = plan.id === autoSelectedPlan?.id;
                let incompatibleMsg: string | undefined;
                if (isTest && maxGuests > 3) {
                  incompatibleMsg = "Le plan Test ne couvre que 3 appareils — vos paramètres seront ajustés automatiquement.";
                } else if (!compatible && suggestedPlan) {
                  incompatibleMsg = `Votre liste dépasse ce plan — ${suggestedPlan.label} vous convient mieux`;
                }
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    selected={selectedPlanId === plan.id}
                    isRecommended={isRecommended}
                    compatible={compatible || selectedPlanId !== plan.id}
                    incompatibleMsg={incompatibleMsg}
                    onSelect={() => setSelectedPlanId(plan.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Test plan note */}
          {selectedPlanId === "test" && (
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13, color: "var(--fg-3)" }}>
              Le plan Test est limité à 3 appareils et 20 photos — idéal pour tester l&apos;expérience avant votre événement.
            </div>
          )}

          {/* Compatibility error */}
          {!canSubmit && (
            <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
              Le plan sélectionné ne couvre pas {maxGuests} invités. Choisissez {suggestedPlan?.label ?? "un plan supérieur"}.
            </p>
          )}

          {/* Submit error */}
          {submitError && (
            <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>{submitError}</p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !canSubmit}
              className="btn-pill btn-amber"
              style={{ opacity: (isPending || !canSubmit) ? 0.6 : 1 }}
            >
              {isPending
                ? "CRÉATION…"
                : selectedPlan.price === 0
                  ? "CRÉER GRATUITEMENT →"
                  : `PAYER ${selectedPlan.price} CHF →`}
            </button>
          </div>
        </>
      )}

      <button type="button" onClick={handleBack} style={{ background: "none", border: "none", fontSize: 13, color: "var(--fg-3)", cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
        ← Modifier
      </button>
    </div>
  );
}
