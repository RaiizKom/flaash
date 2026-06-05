export type EventType =
  | "anniversary"
  | "wedding"
  | "engagement"
  | "party"
  | "corporate"
  | "other";

export type EventStatus = "draft" | "active" | "revealed" | "closed";

export type PhotoSource = "camera" | "library";

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
  plan_id: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface Guest {
  id: string;
  event_id: string;
  first_name: string;
  token: string;
  photos_taken: number;
  is_blocked: boolean;
  joined_at: string;
}

export interface Photo {
  id: string;
  event_id: string;
  guest_id: string;
  storage_url: string;
  thumbnail_url: string;
  is_deleted: boolean;
  taken_at: string;
  source: PhotoSource;
}

export interface EventWithStats extends Event {
  photo_count: number;
  guest_count: number;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  anniversary: "Anniversaire",
  wedding: "Mariage",
  engagement: "Fiançailles",
  party: "Soirée",
  corporate: "Événement corporate",
  other: "Autre",
};

export const EVENT_TYPE_TITLE_TEMPLATES: Record<EventType, string> = {
  anniversary: "Anniversaire de ___",
  wedding: "Mariage de ___ & ___",
  engagement: "Fiançailles de ___ & ___",
  party: "Soirée ___",
  corporate: "Événement ___",
  other: "___",
};

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Brouillon",
  active: "Actif",
  revealed: "Révélé",
  closed: "Terminé",
};
