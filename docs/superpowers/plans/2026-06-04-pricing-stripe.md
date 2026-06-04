# Pricing 4 Plans + Stripe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dynamic pricing formula with 4 fixed plans (Test/Essential/Classic/Premium), add a 2-step form with plan selection, and wire Stripe Checkout + webhook to activate events on payment.

**Architecture:** `createEvent` server action returns data instead of redirecting; client calls `/api/checkout/[id]` to get a Stripe URL then does `window.location.href`. Webhook reads `plan_id` from DB and activates the event. PaymentBanner polls for activation with `router.refresh()`.

**Tech Stack:** Next.js 14 App Router, Supabase, Stripe Node SDK v22, TypeScript, React hooks

---

### Task 1: Migration — add `plan_id` column

**Files:**
- Create: `supabase/migrations/20260604_add_plan_id.sql`

- [ ] **Create the migration file**

```sql
-- supabase/migrations/20260604_add_plan_id.sql
alter table public.events add column plan_id text;
```

- [ ] **Apply the migration**

```bash
npx supabase db push
```

Expected: `Applying migration 20260604_add_plan_id.sql... done`

If `supabase` CLI isn't linked, apply directly in the Supabase dashboard SQL editor.

- [ ] **Commit**

```bash
git add supabase/migrations/20260604_add_plan_id.sql
git commit -m "db: add plan_id column to events"
```

---

### Task 2: Rewrite `lib/utils/pricing.ts`

**Files:**
- Modify: `lib/utils/pricing.ts`

- [ ] **Replace the file content**

```ts
export interface Plan {
  id: string;
  label: string;
  price: number;
  maxGuests: number;
  photosPerGuest?: number;
  description: string;
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "test",
    label: "Test",
    price: 0,
    maxGuests: 3,
    photosPerGuest: 20,
    description: "3 appareils, 20 photos, watermark, 7 jours",
  },
  {
    id: "essential",
    label: "Essential",
    price: 59,
    maxGuests: 50,
    description: "Jusqu'à 50 invités, export ZIP",
  },
  {
    id: "classic",
    label: "Classic",
    price: 99,
    maxGuests: 120,
    description: "Jusqu'à 120 invités, support prioritaire",
    recommended: true,
  },
  {
    id: "premium",
    label: "Premium",
    price: 149,
    maxGuests: 250,
    description: "Jusqu'à 250 invités, personnalisation",
  },
];

/** Returns the cheapest plan that fits n guests (with +10% tolerance). */
export function getPlanForGuests(n: number): Plan | undefined {
  return PLANS.find((p) => n <= p.maxGuests * 1.1);
}

/** Returns a plan by id. */
export function getPlan(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function formatChf(chf: number): string {
  return chf === 0 ? "Gratuit" : `CHF ${chf}.–`;
}

/** @deprecated Use PLANS directly. Kept for backward compat. */
export function calculatePrice(guests: number, _photosPerGuest: number): number {
  return getPlanForGuests(guests)?.price ?? 149;
}
```

- [ ] **Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "pricing"
```

Expected: no output (no errors in this file)

- [ ] **Commit**

```bash
git add lib/utils/pricing.ts
git commit -m "feat: replace dynamic pricing with 4 fixed plans"
```

---

### Task 3: Update `types/index.ts` — add `plan_id`

**Files:**
- Modify: `types/index.ts`

- [ ] **Add `plan_id` to the Event interface**

Find the `Event` interface and add the field after `stripe_payment_id`:

```ts
export interface Event {
  id: string;
  owner_id: string;
  title: string;
  event_type: EventType;
  slug: string;
  status: EventStatus;
  max_guests: number;
  photos_per_guest: number;
  reveal_at: string | null;
  allow_library_upload: boolean;
  price_chf: number;
  stripe_payment_id: string | null;
  plan_id: string | null;          // ← add this line
  created_at: string;
  expires_at: string | null;
}
```

- [ ] **Verify no type errors**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: only pre-existing `sharp`/`@aws-sdk` module warnings (not errors from our changes)

- [ ] **Commit**

```bash
git add types/index.ts
git commit -m "feat: add plan_id to Event type"
```

---

### Task 4: Update `app/dashboard/new/actions.ts`

**Files:**
- Modify: `app/dashboard/new/actions.ts`

The action must **return data** instead of `redirect()` so the client can receive `eventId` and decide whether to go to Stripe.

- [ ] **Replace the file content**

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils/slug";
import { getPlan } from "@/lib/utils/pricing";
import { type EventType } from "@/types";

type CreateEventResult =
  | { eventId: string; requiresPayment: false }
  | { eventId: string; requiresPayment: true }
  | { error: string };

export async function createEvent(formData: FormData): Promise<CreateEventResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const title           = (formData.get("title") as string).trim();
  const event_type      = formData.get("event_type") as EventType;
  const plan_id         = formData.get("plan_id") as string;
  const reveal_at_raw   = formData.get("reveal_at") as string | null;
  const allow_library   = formData.get("allow_library_upload") === "on";

  const plan = getPlan(plan_id);
  if (!plan) return { error: "Plan invalide." };

  // Server-side enforcement for Test plan
  const max_guests      = plan_id === "test"
    ? 3
    : parseInt(formData.get("max_guests") as string, 10);
  const photos_per_guest = plan_id === "test"
    ? 20
    : parseInt(formData.get("photos_per_guest") as string, 10);

  const price_chf  = plan.price;
  const reveal_at  = reveal_at_raw || null;
  const status     = plan_id === "test" ? "active" : "draft";

  let slug = generateSlug(title);
  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = generateSlug(title);

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      owner_id: user.id,
      title,
      event_type,
      slug,
      status,
      max_guests,
      photos_per_guest,
      reveal_at,
      allow_library_upload: allow_library,
      price_chf,
      plan_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return {
    eventId: event.id,
    requiresPayment: plan_id !== "test",
  };
}
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "actions"
```

Expected: no output

- [ ] **Commit**

```bash
git add app/dashboard/new/actions.ts
git commit -m "feat: createEvent returns data instead of redirect, enforces plan limits"
```

---

### Task 5: Rewrite `app/dashboard/new/CreateEventForm.tsx`

**Files:**
- Modify: `app/dashboard/new/CreateEventForm.tsx`

This is the largest change. The component gains a `step: 1 | 2` state and a plan selector.

- [ ] **Replace the file content completely**

```tsx
"use client";

import { useRef, useState } from "react";
import { createEvent } from "./actions";
import { type EventType, EVENT_TYPE_LABELS } from "@/types";
import { PLANS, getPlanForGuests, getPlan, formatChf, type Plan } from "@/lib/utils/pricing";

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
  plan, selected, compatible, incompatibleMsg, onSelect,
}: {
  plan: Plan; selected: boolean; compatible: boolean;
  incompatibleMsg?: string; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: "100%", textAlign: "left", padding: "16px",
        borderRadius: "var(--radius-sm)",
        border: `2px solid ${plan.recommended ? "var(--flaash-amber)" : selected ? "var(--flaash-ink)" : "var(--border)"}`,
        background: selected ? (plan.recommended ? "rgba(var(--flaash-amber-rgb, 245,166,35),0.06)" : "var(--flaash-cream-deep)") : "transparent",
        cursor: "pointer", position: "relative", transition: "all var(--t-fast)",
      }}
    >
      {plan.recommended && (
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
        <p style={{ fontSize: 11, color: "var(--flaash-error, #dc2626)", marginTop: 6, fontWeight: 600 }}>
          {incompatibleMsg}
        </p>
      )}
    </button>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function CreateEventForm({ error }: { error?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [eventType, setEventType]   = useState<EventType>("wedding");
  const [title, setTitle]           = useState(TITLE_PREFIXES.wedding);
  const [maxGuests, setMaxGuests]   = useState(75);
  const [photosPerGuest, setPhotosPerGuest] = useState(8);
  const [revealAt, setRevealAt]     = useState("");
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
    if (maxGuests > 275) {
      setStep1Error("Le plan Premium couvre jusqu'à 275 invités maximum.");
      return;
    }
    setStep1Error(null);
    const plan = getPlanForGuests(maxGuests);
    setSelectedPlanId(plan?.id ?? "premium");
    setStep(2);
  }

  function handleBack() {
    setStep(1);
  }

  // Plan compatibility check
  const selectedPlan = getPlan(selectedPlanId)!;
  const isCompatible = maxGuests <= selectedPlan.maxGuests * 1.1;
  const suggestedPlan = isCompatible ? null : getPlanForGuests(maxGuests);

  // Days until reveal (client-side)
  const daysUntilReveal = revealAt
    ? Math.ceil((new Date(revealAt).getTime() - Date.now()) / 86400000)
    : null;

  const DISPLAY_ORDER = ["premium", "classic", "essential", "test"];
  const displayedPlans = DISPLAY_ORDER.map((id) => PLANS.find((p) => p.id === id)!);

  async function handleSubmit() {
    if (isPending || !isCompatible) return;
    setIsPending(true);
    setSubmitError(null);

    const fd = new FormData();
    fd.set("title",            title);
    fd.set("event_type",       eventType);
    fd.set("max_guests",       String(maxGuests));
    fd.set("photos_per_guest", String(photosPerGuest));
    fd.set("plan_id",          selectedPlanId);
    if (revealAt) fd.set("reveal_at", revealAt);
    const checkbox = formRef.current?.querySelector<HTMLInputElement>("input[name=allow_library_upload]");
    if (checkbox?.checked) fd.set("allow_library_upload", "on");

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
      <form ref={formRef} className="flex flex-col gap-7">
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

        {/* Reveal date */}
        <div className="f-input-wrap">
          <label className="f-label" htmlFor="reveal_at">Date de révélation</label>
          <p style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 8 }}>
            Optionnelle — révèle automatiquement la galerie, ou révélez manuellement depuis le dashboard.
          </p>
          <input id="reveal_at" name="reveal_at" type="datetime-local" value={revealAt}
            onChange={(e) => setRevealAt(e.target.value)} className="f-input-box" />
        </div>

        {/* Library upload */}
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "var(--radius-sm)", background: "var(--surface-2)", border: "1.5px solid var(--border)", cursor: "pointer" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Autoriser les photos de la photothèque</div>
            <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>Les invités peuvent importer des photos existantes.</div>
          </div>
          <input type="checkbox" name="allow_library_upload"
            style={{ accentColor: "var(--flaash-ink)", width: 20, height: 20, flexShrink: 0 }} />
        </label>

        {/* Validation error */}
        {step1Error && (
          <p style={{ fontSize: 13, color: "var(--flaash-error, #dc2626)", fontWeight: 600 }}>{step1Error}</p>
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

      {/* Urgency banner */}
      {daysUntilReveal !== null && daysUntilReveal > 0 && (
        <div style={{ background: "var(--flaash-amber-soft)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13, color: "var(--flaash-amber-deep)", fontWeight: 600 }}>
          Votre événement est dans {daysUntilReveal} jour{daysUntilReveal > 1 ? "s" : ""} — sécurisez-le maintenant.
        </div>
      )}

      {/* Plan selector */}
      <div className="f-input-wrap">
        <label className="f-label" style={{ marginBottom: 12 }}>Choisissez votre plan</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {displayedPlans.map((plan) => {
            const compatible = maxGuests <= plan.maxGuests * 1.1;
            const incompatibleMsg = !compatible && suggestedPlan
              ? `Votre liste dépasse ce plan — ${suggestedPlan.label} vous convient mieux`
              : undefined;
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={selectedPlanId === plan.id}
                compatible={compatible || selectedPlanId !== plan.id}
                incompatibleMsg={incompatibleMsg}
                onSelect={() => setSelectedPlanId(plan.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Compatibility error */}
      {!isCompatible && (
        <p style={{ fontSize: 13, color: "var(--flaash-error, #dc2626)", fontWeight: 600 }}>
          Le plan sélectionné ne couvre pas {maxGuests} invités. Choisissez {suggestedPlan?.label ?? "un plan supérieur"}.
        </p>
      )}

      {/* Submit error */}
      {submitError && (
        <p style={{ fontSize: 13, color: "var(--flaash-error, #dc2626)", fontWeight: 600 }}>{submitError}</p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !isCompatible}
          className="btn-pill btn-amber"
          style={{ opacity: (isPending || !isCompatible) ? 0.6 : 1 }}
        >
          {isPending
            ? "CRÉATION…"
            : selectedPlan.price === 0
              ? "CRÉER GRATUITEMENT →"
              : `PAYER ${selectedPlan.price} CHF →`}
        </button>
        <button type="button" onClick={handleBack} style={{ background: "none", border: "none", fontSize: 13, color: "var(--fg-3)", cursor: "pointer", fontWeight: 600 }}>
          ← Modifier
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Check TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -i "CreateEventForm\|pricing"
```

Expected: no errors

- [ ] **Commit**

```bash
git add app/dashboard/new/CreateEventForm.tsx
git commit -m "feat: 2-step form with plan selector and Stripe redirect"
```

---

### Task 6: Create `app/api/checkout/[id]/route.ts`

**Files:**
- Create: `app/api/checkout/[id]/route.ts`

- [ ] **Create the directory and file**

```bash
mkdir -p "app/api/checkout/[id]"
```

- [ ] **Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlan } from "@/lib/utils/pricing";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check — must be the event owner
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("id, title, plan_id, owner_id, status")
    .eq("id", id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }
  if (event.owner_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }
  if (event.status !== "draft") {
    return NextResponse.json({ error: "Événement déjà actif." }, { status: 400 });
  }

  const plan = getPlan(event.plan_id ?? "classic");
  if (!plan) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.app").replace(/=$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "chf",
          unit_amount: plan.price * 100,
          product_data: {
            name: `Flaash ${plan.label} — ${event.title}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard/${id}?payment=success`,
    cancel_url: `${appUrl}/dashboard/${id}`,
    metadata: { event_id: id },
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "checkout"
```

Expected: no output

- [ ] **Commit**

```bash
git add "app/api/checkout/[id]/route.ts"
git commit -m "feat: POST /api/checkout/[id] — create Stripe Checkout Session"
```

---

### Task 7: Create `app/api/webhooks/stripe/route.ts`

**Files:**
- Create: `app/api/webhooks/stripe/route.ts`

- [ ] **Create the directory and file**

```bash
mkdir -p app/api/webhooks/stripe
```

- [ ] **Write the webhook handler**

```ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const eventId = session.metadata?.event_id;

    if (!eventId) {
      console.error("[webhook] Missing event_id in session metadata", session.id);
      return NextResponse.json({ error: "Missing event_id." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Read plan from DB (Option B architecture)
    const { data: flaashEvent, error: fetchError } = await supabase
      .from("events")
      .select("plan_id")
      .eq("id", eventId)
      .single();

    if (fetchError || !flaashEvent) {
      console.error("[webhook] Event not found:", eventId, fetchError);
      return NextResponse.json({ error: "Event not found." }, { status: 500 });
    }

    const updateData: Record<string, unknown> = {
      status: "active",
      stripe_payment_id: session.id,
    };

    // Double enforcement: test plan limits (should never reach here for test, but safety net)
    if (flaashEvent.plan_id === "test") {
      updateData.max_guests = 3;
      updateData.photos_per_guest = 20;
    }

    const { error: updateError } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId);

    if (updateError) {
      console.error("[webhook] DB update failed for event:", eventId, updateError);
      return NextResponse.json({ error: "DB update failed." }, { status: 500 });
    }

    console.log("[webhook] Event activated:", eventId, "plan:", flaashEvent.plan_id);
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "webhook"
```

Expected: no output

- [ ] **Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat: POST /api/webhooks/stripe — activate event on checkout.session.completed"
```

---

### Task 8: Create `app/dashboard/[id]/PaymentBanner.tsx`

**Files:**
- Create: `app/dashboard/[id]/PaymentBanner.tsx`

- [ ] **Write the client component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Props {
  status: string;
}

export default function PaymentBanner({ status }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const isSuccess    = searchParams.get("payment") === "success";

  const [attempts,  setAttempts]  = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isSuccess || dismissed) return;

    if (status === "active") {
      // Event is active — auto-dismiss after 5s
      const t = setTimeout(() => setDismissed(true), 5000);
      return () => clearTimeout(t);
    }

    // Event still draft — webhook hasn't fired yet
    if (attempts >= 3) return; // give up after 3 retries

    const t = setTimeout(() => {
      setAttempts((a) => a + 1);
      router.refresh();
    }, 3000);

    return () => clearTimeout(t);
  }, [isSuccess, status, attempts, dismissed, router]);

  if (!isSuccess || dismissed) return null;

  if (status === "active") {
    return (
      <div
        style={{
          background: "var(--flaash-forest-soft)",
          border: "1px solid var(--flaash-forest)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          marginBottom: 20,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--flaash-forest)",
        }}
      >
        ✓ Paiement reçu — votre événement est actif !
      </div>
    );
  }

  if (attempts >= 3) {
    return (
      <div
        style={{
          background: "var(--flaash-amber-soft)",
          border: "1px solid var(--flaash-amber-deep)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          marginBottom: 20,
          fontSize: 13,
          color: "var(--flaash-amber-deep)",
        }}
      >
        Si votre événement n&apos;est pas encore actif dans quelques minutes, contactez-nous.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--flaash-amber-soft)",
        border: "1px solid var(--flaash-amber-deep)",
        borderRadius: "var(--radius-sm)",
        padding: "12px 16px",
        marginBottom: 20,
        fontSize: 14,
        fontWeight: 600,
        color: "var(--flaash-amber-deep)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid var(--flaash-amber-deep)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      Paiement reçu — activation en cours…
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add "app/dashboard/[id]/PaymentBanner.tsx"
git commit -m "feat: PaymentBanner — polling with router.refresh() for webhook delay"
```

---

### Task 9: Update `app/dashboard/[id]/page.tsx`

**Files:**
- Modify: `app/dashboard/[id]/page.tsx`

Three changes: (1) add `Suspense` + `PaymentBanner`, (2) add plan badge in header, (3) guard dev bypass button.

- [ ] **Add imports at the top of the file**

After the existing imports, add:

```ts
import { Suspense } from "react";
import PaymentBanner from "./PaymentBanner";
import { getPlan } from "@/lib/utils/pricing";
```

- [ ] **Add `PaymentBanner` wrapped in `Suspense` at the top of the JSX return**

Inside the returned `<div>`, before the Back link:

```tsx
{/* Payment success banner — must be in Suspense (useSearchParams) */}
<Suspense fallback={null}>
  <PaymentBanner status={ev.status} />
</Suspense>
```

- [ ] **Add plan badge in the header row**

Find the header section with `STATUS_LABELS[ev.status]` and add the plan badge after the status badge:

```tsx
{ev.plan_id && (
  <span
    style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      padding: "3px 8px",
      borderRadius: 100,
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      color: "var(--fg-3)",
    }}
  >
    {getPlan(ev.plan_id)?.label ?? ev.plan_id}
  </span>
)}
```

- [ ] **Guard the dev bypass button with `NODE_ENV`**

Find the draft block with `activateEvent` form and ensure it's wrapped:

```tsx
{process.env.NODE_ENV === "development" && (
  <form action={activateEvent.bind(null, ev.id)} style={{ marginTop: 10 }}>
    <button type="submit" style={{ fontSize: 12, fontWeight: 600, color: "var(--flaash-amber-deep)", background: "none", border: "1.5px dashed var(--flaash-amber-deep)", borderRadius: "var(--radius-pill)", padding: "8px 16px", cursor: "pointer", letterSpacing: "0.06em" }}>
      ⚡ ACTIVER SANS PAIEMENT (dev)
    </button>
  </form>
)}
```

- [ ] **Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -i "page\|banner" | head -10
```

Expected: no errors from our changed files

- [ ] **Commit**

```bash
git add "app/dashboard/[id]/page.tsx" "app/dashboard/[id]/PaymentBanner.tsx"
git commit -m "feat: dashboard shows plan badge, payment banner, dev-only bypass"
```

---

### Task 10: Final integration — build check + deploy

- [ ] **Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep -v "sharp\|@aws-sdk"
```

Expected: no output (only pre-existing module warnings filtered out)

- [ ] **Local build check**

```bash
npx next build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully`, all routes listed

- [ ] **Push and deploy**

```bash
git push origin main
npx vercel --prod
```

Expected: `Build Completed`, `✓ Aliased https://flaash-seven.vercel.app`

- [ ] **Verify Stripe webhook endpoint in Stripe dashboard**

In [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → Webhooks:
- Add endpoint: `https://flaash-seven.vercel.app/api/webhooks/stripe`
- Events to listen: `checkout.session.completed`
- Copy the signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel env vars if different from `.env.local`

- [ ] **Add env vars to Vercel if not already set**

```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

(Skip if already set in Vercel dashboard)
