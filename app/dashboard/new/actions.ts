"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils/slug";
import { getPlan } from "@/lib/utils/pricing";
import { sendOrganizerEventReadyEmail } from "@/lib/email/transactional";
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

  if (plan_id === "test") {
    await sendOrganizerEventReadyEmail({
      to: user.email,
      title: event.title,
      slug: event.slug,
      eventId: event.id,
    });
  }

  return {
    eventId: event.id,
    requiresPayment: plan_id !== "test",
  };
}
