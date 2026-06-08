import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrganizerEventReadyEmail } from "@/lib/email/transactional";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  // ── Step 1: read raw body (must be text, not JSON) ────────────────────────
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  console.log("[webhook] Received request, body length:", body.length);
  console.log("[webhook] stripe-signature header present:", !!sig);
  console.log("[webhook] STRIPE_WEBHOOK_SECRET set:", !!process.env.STRIPE_WEBHOOK_SECRET);

  if (!sig) {
    console.error("[webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set — set it in Vercel env vars");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  // ── Step 2: verify signature ──────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("[webhook] Signature verified. Event type:", event.type);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // ── Step 3: handle checkout.session.completed ─────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("[webhook] Session ID:", session.id, "— metadata:", session.metadata);

    const eventId = session.metadata?.event_id;
    if (!eventId) {
      console.error("[webhook] Missing event_id in session metadata");
      return NextResponse.json({ error: "Missing event_id." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Read plan from DB
    const { data: flaashEvent, error: fetchError } = await supabase
      .from("events")
      .select("id, title, slug, owner_id, plan_id, status")
      .eq("id", eventId)
      .single();

    console.log("[webhook] DB fetch result:", { flaashEvent, fetchError });

    if (fetchError || !flaashEvent) {
      console.error("[webhook] Event not found:", eventId, fetchError);
      return NextResponse.json({ error: "Event not found." }, { status: 500 });
    }

    if (flaashEvent.status === "active") {
      console.log("[webhook] Event already active, skipping update:", eventId);
      return NextResponse.json({ received: true });
    }

    const updateData: Record<string, unknown> = {
      status: "active",
      stripe_payment_id: session.id,
    };

    if (flaashEvent.plan_id === "test") {
      updateData.max_guests = 3;
      updateData.photos_per_guest = 20;
    }

    console.log("[webhook] Updating event:", eventId, "with:", updateData);

    const { error: updateError } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId);

    if (updateError) {
      console.error("[webhook] DB update failed:", eventId, updateError);
      return NextResponse.json({ error: "DB update failed." }, { status: 500 });
    }

    console.log("[webhook] ✅ Event activated:", eventId, "plan:", flaashEvent.plan_id);

    const { data: owner, error: ownerError } = await supabase.auth.admin.getUserById(
      flaashEvent.owner_id
    );

    if (ownerError || !owner.user.email) {
      console.warn("[webhook] Organizer email unavailable, skipping ready email:", eventId);
    } else {
      await sendOrganizerEventReadyEmail({
        to: owner.user.email,
        title: flaashEvent.title,
        slug: flaashEvent.slug,
        eventId: flaashEvent.id,
      });
    }
  } else {
    console.log("[webhook] Unhandled event type:", event.type, "— ignoring");
  }

  return NextResponse.json({ received: true });
}
