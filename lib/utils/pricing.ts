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
  },
  {
    id: "premium",
    label: "Premium",
    price: 149,
    maxGuests: 250,
    description: "Jusqu'à 250 invités, personnalisation",
  },
];

/** Returns the cheapest plan that fits n guests (strict threshold, no tolerance). */
export function getPlanForGuests(n: number): Plan | undefined {
  return PLANS.find((p) => n <= p.maxGuests);
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
