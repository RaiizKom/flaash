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

    // Read plan from DB (Option B architecture — plan stored at event creation)
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

    // Double enforcement: test plan limits
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
