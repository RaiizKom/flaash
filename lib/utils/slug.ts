const ADJECTIVES = [
  "grand", "beau", "joyeux", "doux", "vif", "rare", "pur", "fort",
  "libre", "clair", "chaud", "frais", "lent", "fou", "sage",
];

const NOUNS = [
  "soleil", "lune", "fete", "soir", "nuit", "fleur", "vent", "mer",
  "ciel", "feu", "eau", "bois", "reve", "jardin", "valse",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generates a human-readable slug like "grand-soleil-4f2a" */
export function generateSlug(title?: string): string {
  const adj  = randomItem(ADJECTIVES);
  const noun = randomItem(NOUNS);
  const suffix = Math.random().toString(36).slice(2, 6);

  if (title) {
    const sanitized = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 32);
    return `${sanitized}-${suffix}`;
  }

  return `${adj}-${noun}-${suffix}`;
}

/** Sanitizes a user-supplied slug fragment */
export function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
