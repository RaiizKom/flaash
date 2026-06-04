# Flaash — Pricing 4 plans + Stripe — Design Spec
Date: 2026-06-04

## Section 1 — Données et migration

### Plans fixes (remplacent la formule dynamique)

```ts
// lib/utils/pricing.ts
export const PLANS = [
  { id: "test",      label: "Test",      price: 0,   maxGuests: 3,   photosPerGuest: 20, description: "3 appareils, 20 photos, watermark, 7 jours" },
  { id: "essential", label: "Essential", price: 59,  maxGuests: 50,  description: "Jusqu'à 50 invités, export ZIP" },
  { id: "classic",   label: "Classic",   price: 99,  maxGuests: 120, description: "Jusqu'à 120 invités, support prioritaire", recommended: true },
  { id: "premium",   label: "Premium",   price: 149, maxGuests: 250, description: "Jusqu'à 250 invités, personnalisation" },
]
```

### `getPlanForGuests(n)` — tolérance +10%

Retourne le plan minimum compatible avec `n` invités. Tolérance : un plan couvre jusqu'à `maxGuests × 1.1` avant de passer au suivant.

- Test : ≤ 3.3 → 3
- Essential : ≤ 55 (50 × 1.1)
- Classic : ≤ 132 (120 × 1.1)
- Premium : ≤ 275 (250 × 1.1)
- > 275 → aucun plan compatible, bloquer

### Migration DB

Fichier : `supabase/migrations/20260604_add_plan_id.sql`
```sql
alter table public.events add column plan_id text;
```
Appliquer via `supabase db push`. Pas de changement RLS.

### Type Event

Ajouter `plan_id: string | null` dans `types/index.ts`.

---

## Section 2 — Stepper 2 étapes (CreateEventForm.tsx)

### Étape 1 — Configuration

Champs inchangés : `eventType`, `title`, `maxGuests`, `photosPerGuest`, `revealAt`, `allowLibraryUpload`.

Bouton : **"Continuer →"** (remplace "CRÉER L'ÉVÉNEMENT →").

Validation avant transition : si `maxGuests > 275`, bloquer avec message "Le plan Premium couvre jusqu'à 275 invités maximum."

### Étape 2 — Récap + plan

**Récap :** bandeau compact — type, titre, nb invités, date reveal (ou "Révélation manuelle"), photothèque.

**Urgence douce :** si `revealAt` renseigné → bandeau amber : "Votre événement est dans X jours — sécurisez-le maintenant." (calculé côté client).

**Sélecteur de plans :** ordre d'affichage `["premium", "classic", "essential", "test"]`.

Chaque carte :
- Nom + prix ("Gratuit" pour Test)
- Description courte
- Classic : badge "Recommandé" + bordure ambrée

**Pré-sélection :** `getPlanForGuests(maxGuests)` au passage à l'étape 2. Si retour à l'étape 1 via "← Modifier" puis changement de `maxGuests`, `selectedPlanId` se recalcule à la transition vers l'étape 2 (pas de mémoire du choix précédent).

**Validation de compatibilité :** si `maxGuests > selectedPlan.maxGuests × 1.1`, la carte affiche en rouge "Votre liste dépasse ce plan — [X] vous convient mieux" et le bouton submit est désactivé.

**Bouton submit :**
- Test → "Créer gratuitement →"
- Payant → "Payer [prix] CHF →"

---

## Section 3 — Flow de soumission

### `createEvent(formData)` — server action

Reçoit `plan_id` dans le FormData.

**Plan Test :**
```
INSERT events (status: "active", plan_id: "test", max_guests: 3, photos_per_guest: 20, price_chf: 0)
→ return { eventId }   // CreateEventForm redirige vers /dashboard/${eventId}
```

**Plans payants :**
```
INSERT events (status: "draft", plan_id, max_guests, photos_per_guest, price_chf: plan.price)
→ return { eventId, requiresPayment: true }
// CreateEventForm appelle fetch('/api/checkout/${eventId}') → reçoit { url } → window.location.href = url
```

Contraintes Test enforced **côté serveur** : si `plan_id === "test"`, `max_guests` forcé à 3 et `photos_per_guest` forcé à 20, quelle que soit la valeur envoyée.

### `POST /api/checkout/[id]`

- Auth : vérifie `user.id === event.owner_id` via Supabase session
- Lit `plan_id` depuis DB, récupère `plan.price` depuis `PLANS`
- Crée Stripe Checkout Session :
  ```ts
  {
    line_items: [{ price_data: {
      currency: "chf",
      unit_amount: plan.price * 100,
      product_data: { name: `Flaash ${plan.label} — ${event.title}` }
    }, quantity: 1 }],
    mode: "payment",
    success_url: `${APP_URL}/dashboard/${id}?payment=success`,
    cancel_url:  `${APP_URL}/dashboard/${id}`,
    metadata:    { event_id: id }
  }
  ```
- Retourne `{ url: session.url }`

### `POST /api/webhooks/stripe`

- Vérifie signature avec `STRIPE_WEBHOOK_SECRET` → 400 si invalide
- Sur `checkout.session.completed` :
  1. Lit `event_id` depuis `session.metadata`
  2. Récupère `plan_id` depuis DB
  3. `UPDATE events SET status='active', stripe_payment_id=session.id WHERE id=event_id`
  4. Si `plan_id === 'test'` : `UPDATE max_guests=3, photos_per_guest=20` (double enforcement)
  5. Si UPDATE réussi → `200 { received: true }`
  6. Si erreur DB → `500` (Stripe retentera), logger l'erreur
- Autres événements → `200` ignoré

---

## Section 4 — Dashboard & détails

### Bandeau "payment=success" avec retry webhook

Si `?payment=success` dans l'URL :

- `status === "active"` → bandeau vert : "Paiement reçu — votre événement est actif !" (disparaît après 5s)
- `status === "draft"` → bandeau amber : "Paiement reçu — activation en cours…" + rafraîchissement automatique toutes les 3s, max 3 tentatives
  - Après 3 tentatives sans succès → "Si votre événement n'est pas encore actif dans quelques minutes, contactez-nous."

Implémenté via un client component `PaymentBanner.tsx` qui lit `useSearchParams()` et `useRouter().refresh()`.

### Autres changements dashboard

- Badge `plan_id` affiché dans la ligne de statuts sur `/dashboard/[id]`
- Bouton "⚡ ACTIVER L'ÉVÉNEMENT →" conservé uniquement si `NODE_ENV === "development"`

### Hors scope

- Watermark visuel (dérivé du `plan_id` au runtime, UI reportée)
- Email de confirmation (Resend disponible, hors scope)
- Remboursements Stripe

---

## Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `supabase/migrations/20260604_add_plan_id.sql` | Créer |
| `lib/utils/pricing.ts` | Réécrire |
| `types/index.ts` | Modifier (`plan_id`) |
| `app/dashboard/new/CreateEventForm.tsx` | Réécrire (stepper) |
| `app/dashboard/new/actions.ts` | Modifier (plan_id, Test enforcement) |
| `app/api/checkout/[id]/route.ts` | Créer |
| `app/api/webhooks/stripe/route.ts` | Créer |
| `app/dashboard/[id]/page.tsx` | Modifier (badge plan, dev bypass guard) |
| `app/dashboard/[id]/PaymentBanner.tsx` | Créer |
