import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlan } from "@/lib/utils/pricing";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check — must be the event owner
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("id, title, plan_id, owner_id, status")
    .eq("id", id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }
  if (event.owner_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }
  if (event.status !== "draft") {
    return NextResponse.json({ error: "Événement déjà actif." }, { status: 400 });
  }

  const plan = getPlan(event.plan_id ?? "classic");
  if (!plan) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://flaash.app";
  const appUrl = rawUrl.replace(/^NEXT_PUBLIC_APP_URL=/, "").replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "chf",
          unit_amount: plan.price * 100,
          product_data: {
            name: `Flaash ${plan.label} — ${event.title}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard/${id}?payment=success`,
    cancel_url: `${appUrl}/dashboard/${id}`,
    metadata: { event_id: id },
  });

  return NextResponse.json({ url: session.url });
}
