"use client";

import { useEffect, useRef, useState } from "react";
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

function placeCursorAtEnd(input: HTMLInputElement) {
  requestAnimationFrame(() => {
    const end = input.value.length;
    input.setSelectionRange(end, end);
  });
}

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
    <div className="f-input-wrap create-event-stepper">
      <div className="create-event-field-head">
        <label className="f-label" htmlFor={id}>{label}</label>
        <span>{min} – {max}</span>
      </div>
      <div className="create-event-stepper-control">
        <button type="button" onClick={() => stepBy(-step)} disabled={value <= min} aria-label={`Diminuer ${label}`}
          className="create-event-stepper-button">−</button>
        <input id={id} type="number" inputMode="numeric" value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={() => commit(raw)}
          onFocus={(e) => e.target.select()}
          className="create-event-stepper-input" />
        <button type="button" onClick={() => stepBy(step)} disabled={value >= max} aria-label={`Augmenter ${label}`}
          className="create-event-stepper-button">+</button>
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
      className={`create-event-plan-card${selected ? " create-event-plan-card-selected" : ""}${isRecommended ? " create-event-plan-card-recommended" : ""}`}
    >
      {isRecommended && (
        <span className="create-event-plan-badge">
          Pour ce cadre
        </span>
      )}
      <div className="create-event-plan-head">
        <span>{plan.label}</span>
        <strong>
          {plan.price === 0 ? "Gratuit" : `${plan.price} CHF`}
        </strong>
      </div>
      <p>{plan.description}</p>
      {!compatible && incompatibleMsg && (
        <p className="create-event-plan-warning">
          {incompatibleMsg}
        </p>
      )}
    </button>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function CreateEventForm({ error }: { error?: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverPreviewUrlRef = useRef<string | null>(null);

  // Step 1 state
  const [eventType, setEventType]   = useState<EventType>("wedding");
  const [title, setTitle]           = useState(TITLE_PREFIXES.wedding);
  const [maxGuests, setMaxGuests]   = useState(75);
  const [photosPerGuest, setPhotosPerGuest] = useState(8);
  const [revealMode, setRevealMode] = useState<"fixed" | "manual">("fixed");
  const [revealAt, setRevealAt]     = useState("");
  const [allowLibrary, setAllowLibrary] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2 state
  const [selectedPlanId, setSelectedPlanId] = useState<string>("classic");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending]   = useState(false);

  useEffect(() => {
    return () => {
      if (coverPreviewUrlRef.current) {
        URL.revokeObjectURL(coverPreviewUrlRef.current);
      }
    };
  }, []);

  function handleTypeChange(type: EventType) {
    setEventType(type);
    setTitle(TITLE_PREFIXES[type]);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setCoverError(null);

    if (!file) return;

    if (file.size > 8_000_000) {
      setCoverFile(null);
      if (coverPreviewUrlRef.current) {
        URL.revokeObjectURL(coverPreviewUrlRef.current);
        coverPreviewUrlRef.current = null;
      }
      setCoverPreviewUrl(null);
      setCoverError("L'image est trop lourde. Choisis une image de moins de 8 MB.");
      return;
    }

    if (coverPreviewUrlRef.current) {
      URL.revokeObjectURL(coverPreviewUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    coverPreviewUrlRef.current = nextPreviewUrl;
    setCoverFile(file);
    setCoverPreviewUrl(nextPreviewUrl);
  }

  function removeCover() {
    if (coverPreviewUrlRef.current) {
      URL.revokeObjectURL(coverPreviewUrlRef.current);
      coverPreviewUrlRef.current = null;
    }
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setCoverError(null);
  }

  async function uploadCover(eventId: string) {
    if (!coverFile) return;

    try {
      const formData = new FormData();
      formData.append("file", coverFile);

      const res = await fetch(`/api/events/${eventId}/cover`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setSubmitError("La photo de couverture n'a pas pu être ajoutée. Tu pourras l'ajouter depuis le dashboard.");
      }
    } catch {
      setSubmitError("La photo de couverture n'a pas pu être ajoutée. Tu pourras l'ajouter depuis le dashboard.");
    }
  }

  function handleContinue() {
    setStep1Error(null);
    if (revealMode === "fixed" && !revealAt) {
      setStep1Error("Choisissez une date de révélation ou passez en révélation manuelle.");
      return;
    }
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
    fd.set("reveal_mode",      revealMode);
    if (revealMode === "fixed") {
      if (!revealAt) {
        setSubmitError("Choisissez une date de révélation ou passez en révélation manuelle.");
        setIsPending(false);
        return;
      }
      fd.set("reveal_at", new Date(revealAt).toISOString());
    }
    if (allowLibrary) fd.set("allow_library_upload", "on");

    const result = await createEvent(fd);

    if ("error" in result) {
      setSubmitError(result.error);
      setIsPending(false);
      return;
    }

    await uploadCover(result.eventId);

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
      <form className="create-event-form">
        {error && (
          <div className="create-event-error">
            {decodeURIComponent(error)}
          </div>
        )}

        <div className="create-event-step-head">
          <p className="dashboard-section-label">Cadre de la soirée</p>
          <h2>Préparer ce que vos invités vont vivre</h2>
        </div>

        <section className="create-event-section">
          <div className="create-event-section-head">
            <p>Identité</p>
            <span>Le nom et le ton de la soirée.</span>
          </div>

          <div className="f-input-wrap">
            <label className="f-label">Type de soirée</label>
            <div className="create-event-chip-group">
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

          <div className="f-input-wrap">
            <label className="f-label" htmlFor="title">Nom de la soirée</label>
            <input id="title" name="title" type="text" required value={title}
              placeholder={TITLE_PLACEHOLDERS[eventType]}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => placeCursorAtEnd(e.currentTarget)}
              className="f-input create-event-title-input" />
          </div>
        </section>

        <section className="create-event-section">
          <div className="create-event-section-head">
            <p>Participation</p>
            <span>Combien d&apos;invités participent, et combien de poses chacun peut garder.</span>
          </div>

          <div className="create-event-two-col">
            <Stepper id="max_guests" label="Invités" value={maxGuests} min={1} max={500} step={5} onChange={setMaxGuests} />
            <Stepper id="photos_per_guest" label="Poses par invité" value={photosPerGuest} min={1} max={20} step={1} onChange={setPhotosPerGuest} />
          </div>

          <label className="create-event-toggle">
            <div>
              <strong>Autoriser la photothèque</strong>
              <span>Les invités peuvent ajouter des souvenirs déjà présents sur leur téléphone.</span>
            </div>
            <input type="checkbox" name="allow_library_upload"
              checked={allowLibrary}
              onChange={(e) => setAllowLibrary(e.target.checked)} />
          </label>
        </section>

        <section className="create-event-section">
          <div className="create-event-section-head">
            <p>Moment du reveal</p>
            <span>Choisissez quand la galerie reviendra aux invités.</span>
          </div>

          <div className="f-input-wrap">
            <label className="f-label">Reveal de la galerie</label>
            <div className="create-event-radio-stack">
              {(["fixed", "manual"] as const).map((mode) => (
                <label key={mode} className={`create-event-choice${revealMode === mode ? " create-event-choice-selected" : ""}`}>
                  <input type="radio" checked={revealMode === mode} onChange={() => setRevealMode(mode)} />
                  <div>
                    <strong>{mode === "fixed" ? "Date fixée" : "Reveal manuel"}</strong>
                    <span>
                      {mode === "fixed" ? "La galerie reviendra automatiquement au moment choisi." : "Vous révélerez la galerie depuis votre espace organisateur."}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {revealMode === "fixed" && (
              <input id="reveal_at" name="reveal_at" type="datetime-local" value={revealAt}
                onChange={(e) => setRevealAt(e.target.value)} required className="f-input-box create-event-date" />
            )}
          </div>
        </section>

        <section className="create-event-section create-event-cover-section">
          <div className="create-event-section-head">
            <p>Couverture</p>
            <span>Une image pour reconnaître la soirée avant le reveal.</span>
          </div>

          <div className="create-event-cover-card">
            <div className="create-event-cover-head">
              <p>Image de couverture</p>
              <span>Optionnel</span>
            </div>
            <p>
              Choisissez une image horizontale. Les bords peuvent être légèrement recadrés selon l&apos;écran.
            </p>

            {coverPreviewUrl && (
              <div className="create-event-cover-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreviewUrl}
                  alt="Aperçu de la photo de couverture"
                />
              </div>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              style={{ display: "none" }}
            />

            <div className="create-event-cover-actions">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverFile ? "Remplacer l'image" : "Choisir une image"}
              </button>
              {coverFile && (
                <button
                  type="button"
                  onClick={removeCover}
                >
                  Retirer
                </button>
              )}
            </div>

            {coverError && (
              <p className="create-event-error-text">
                {coverError}
              </p>
            )}
          </div>
        </section>

        {step1Error && (
          <p className="create-event-error-text">{step1Error}</p>
        )}

        <div className="create-event-actions">
          <button type="button" onClick={handleContinue} className="create-event-primary">
            Choisir l&apos;offre
          </button>
        </div>
      </form>
    );
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────
  return (
    <div className="create-event-form create-event-offer-step">
      <div className="create-event-step-head">
        <p className="dashboard-section-label">Choisir l&apos;offre</p>
        <h2>Finaliser le cadre Flaash</h2>
      </div>

      <section className="create-event-recap">
        <div className="create-event-section-head">
          <p>Cadre choisi</p>
          <span>La soirée, les invités et le moment du reveal.</span>
        </div>
        <div className="create-event-recap-list">
          {[
            [EVENT_TYPE_LABELS[eventType], title],
            ["Invités", `${maxGuests}`],
            ["Poses par invité", `${photosPerGuest}`],
            [
              "Reveal",
              revealMode === "fixed" && revealAt
                ? `Prévue le ${new Date(revealAt).toLocaleString("fr-CH")}`
                : "Manuelle",
            ],
          ].map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      </section>

      {revealMode === "fixed" && revealAt && (
        <div className="create-event-note">
          Votre reveal est daté. La soirée peut être préparée maintenant.
        </div>
      )}

      {maxGuests > 250 ? (
        <div className="create-event-quote">
          <p>Plus de 250 invités ?</p>
          <span>Écrivons le cadre ensemble pour une grande soirée.</span>
          <a href="mailto:hello@flaash.ch" className="create-event-secondary">
            Demander un devis
          </a>
        </div>
      ) : (
        <>
          <section className="create-event-section create-event-plans">
            <div className="create-event-section-head">
              <p>Offre Flaash</p>
              <span>Choisissez selon la taille de votre soirée.</span>
            </div>
            <div className="create-event-plan-list">
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
          </section>

          {selectedPlanId === "test" && (
            <div className="create-event-note">
              Le plan Test est limité à 3 appareils et 20 photos — idéal pour tester l&apos;expérience avant votre événement.
            </div>
          )}

          {!canSubmit && (
            <p className="create-event-error-text">
              Le plan sélectionné ne couvre pas {maxGuests} invités. Choisissez {suggestedPlan?.label ?? "un plan supérieur"}.
            </p>
          )}

          {submitError && (
            <p className="create-event-error-text">{submitError}</p>
          )}

          <div className="create-event-actions">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !canSubmit}
              className="create-event-primary"
            >
              {isPending
                ? "Création…"
                : selectedPlan.price === 0
                  ? "Créer la soirée"
                  : "Continuer vers le paiement"}
            </button>
          </div>
        </>
      )}

      <button type="button" onClick={handleBack} className="create-event-back">
        ← Revenir au cadre
      </button>
    </div>
  );
}
