"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlug } from "@/lib/utils/slug";
import { getPlan } from "@/lib/utils/pricing";
import { sendOrganizerEventReadyEmail } from "@/lib/email/transactional";
import { type EventType } from "@/types";

type CreateEventResult =
  | { eventId: string; requiresPayment: false }
  | { eventId: string; requiresPayment: true }
  | { error: string };

function readPositiveInteger(value: FormDataEntryValue | null) {
  return typeof value === "string" && /^[1-9][0-9]*$/.test(value)
    ? Number(value)
    : NaN;
}

export async function createEvent(formData: FormData): Promise<CreateEventResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (!title) return { error: "Le titre est requis." };
  const event_type      = formData.get("event_type") as EventType;
  const plan_id         = formData.get("plan_id") as string;
  const reveal_mode     = formData.get("reveal_mode") as "fixed" | "manual" | null;
  const reveal_at_raw   = formData.get("reveal_at") as string | null;
  const allow_library   = formData.get("allow_library_upload") === "on";

  const plan = getPlan(plan_id);
  if (!plan) return { error: "Plan invalide." };

  const requestedGuests = readPositiveInteger(formData.get("max_guests"));
  const requestedPhotos = readPositiveInteger(formData.get("photos_per_guest"));
  const maxPhotos = plan.photosPerGuest ?? 20;
  if (!Number.isSafeInteger(requestedGuests) || requestedGuests > plan.maxGuests) {
    return { error: `Ce plan accepte de 1 à ${plan.maxGuests} invités.` };
  }
  if (!Number.isSafeInteger(requestedPhotos) || requestedPhotos > maxPhotos) {
    return { error: `Choisissez entre 1 et ${maxPhotos} poses par invité.` };
  }

  const isTest = plan.id === "test";
  let reveal_at: string | null = null;
  if (reveal_mode === "fixed") {
    if (!reveal_at_raw) return { error: "Choisissez une date de révélation." };
    const parsedRevealAt = new Date(reveal_at_raw);
    if (Number.isNaN(parsedRevealAt.getTime())) {
      return { error: "Date de révélation invalide." };
    }
    reveal_at = parsedRevealAt.toISOString();
  }
  const admin = createAdminClient();
  let slug = generateSlug(title);
  const { data: existing, error: lookupError } = await admin
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupError) return { error: "Impossible de créer la soirée." };
  if (existing) slug = generateSlug(title);

  const { data: event, error } = await admin
    .from("events")
    .insert({
      owner_id: user.id,
      title,
      event_type,
      slug,
      status: isTest ? "active" : "draft",
      max_guests: isTest ? plan.maxGuests : requestedGuests,
      photos_per_guest: isTest ? maxPhotos : requestedPhotos,
      reveal_at,
      allow_library_upload: allow_library,
      price_chf: plan.price,
      plan_id: plan.id,
    })
    .select("id, title, slug")
    .single();

  if (error || !event) return { error: "Impossible de créer la soirée." };

  if (isTest) {
    await sendOrganizerEventReadyEmail({
      to: user.email,
      title: event.title,
      slug: event.slug,
      eventId: event.id,
    });
  }

  return {
    eventId: event.id,
    requiresPayment: !isTest,
  };
}
