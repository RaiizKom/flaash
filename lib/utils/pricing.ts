/**
 * Flaash pricing formula:
 *   max(49, ((guests × photosPerGuest) - 150) × 0.12 + 49)
 *   Rounded up to nearest franc.
 *
 * Examples:
 *   75 guests × 8  = 99 CHF
 *   150 guests × 10 = 149 CHF
 *   300 guests × 10 = 269 CHF
 */
export function calculatePrice(guests: number, photosPerGuest: number): number {
  const total = guests * photosPerGuest;
  const raw = Math.max(49, (total - 150) * 0.12 + 49);
  return Math.ceil(raw);
}

export function formatChf(chf: number): string {
  return `CHF ${chf}.–`;
}
