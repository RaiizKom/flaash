"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type EventType } from "@/types";

type UpdateEventSettingsResult =
  | { success: true }
  | { error: string };

const EVENT_TYPES: EventType[] = [
  "anniversary",
  "wedding",
  "engagement",
  "party",
  "corporate",
  "other",
];

export async function updateEventSettings(
  eventId: string,
  formData: FormData
): Promise<UpdateEventSettingsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, owner_id, slug, status, photos_per_guest")
    .eq("id", eventId)
    .eq("owner_id", user.id)
    .single();

  if (!event) {
    return { error: "Événement introuvable." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "Le titre est requis." };
  }
  if (title.length > 120) {
    return { error: "Le titre est trop long." };
  }

  const eventType = formData.get("event_type") as EventType | null;
  if (!eventType || !EVENT_TYPES.includes(eventType)) {
    return { error: "Type d'événement invalide." };
  }

  const allowLibraryUpload = formData.get("allow_library_upload") === "on";
  const isRevealed = event.status === "revealed";

  const update: {
    title: string;
    event_type: EventType;
    allow_library_upload: boolean;
    reveal_at?: string | null;
    photos_per_guest?: number;
  } = {
    title,
    event_type: eventType,
    allow_library_upload: allowLibraryUpload,
  };

  if (!isRevealed) {
    const rawPhotosPerGuest = Number(formData.get("photos_per_guest"));
    if (!Number.isInteger(rawPhotosPerGuest) || rawPhotosPerGuest < 1 || rawPhotosPerGuest > 20) {
      return { error: "La limite de photos doit être comprise entre 1 et 20." };
    }

    const { data: guests } = await supabase
      .from("guests")
      .select("photos_taken")
      .eq("event_id", event.id)
      .order("photos_taken", { ascending: false })
      .limit(1);

    const maxPhotosTaken = guests?.[0]?.photos_taken ?? 0;
    if (rawPhotosPerGuest < maxPhotosTaken) {
      return {
        error: `Impossible de fixer cette limite à ${rawPhotosPerGuest} photo(s), car au moins un invité a déjà pris ${maxPhotosTaken} photo(s).`,
      };
    }

    const revealMode = formData.get("reveal_mode");
    if (revealMode === "manual") {
      update.reveal_at = null;
    } else if (revealMode === "scheduled") {
      const rawRevealAt = String(formData.get("reveal_at") ?? "");
      if (!rawRevealAt) {
        return { error: "Choisis une date de révélation ou passe en mode manuel." };
      }

      const revealAt = new Date(rawRevealAt);
      if (Number.isNaN(revealAt.getTime())) {
        return { error: "Date de révélation invalide." };
      }
      update.reveal_at = revealAt.toISOString();
    } else {
      return { error: "Mode de révélation invalide." };
    }

    update.photos_per_guest = rawPhotosPerGuest;
  }

  const { error } = await supabase
    .from("events")
    .update(update)
    .eq("id", event.id)
    .eq("owner_id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer les paramètres." };
  }

  revalidatePath(`/dashboard/${event.id}`);
  revalidatePath(`/dashboard/${event.id}/settings`);
  revalidatePath(`/e/${event.slug}`);

  return { success: true };
}
