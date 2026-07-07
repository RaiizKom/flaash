export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { type Event, EVENT_TYPE_LABELS } from "@/types";
import GuestCamera from "./GuestCamera";

interface Props {
  params: { slug: string };
}

export default async function EventGuestPage({ params }: Props) {
  const { slug } = params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, title, slug, status, photos_per_guest, allow_library_upload, max_guests, event_type, reveal_at, cover_url"
    )
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  let effectiveEvent = event;
  if (isTimedRevealDue(event.status, event.reveal_at)) {
    const { data: revealedEvent } = await supabase
      .from("events")
      .update({ status: "revealed" })
      .eq("id", event.id)
      .eq("status", "active")
      .select(
        "id, title, slug, status, photos_per_guest, allow_library_upload, max_guests, event_type, reveal_at, cover_url"
      )
      .single();

    effectiveEvent = revealedEvent ?? { ...event, status: "revealed" };
  }

  let photoCount = 0;
  if (effectiveEvent.status === "active") {
    const { count } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("event_id", effectiveEvent.id)
      .eq("is_deleted", false);
    photoCount = count ?? 0;
  }

  if (effectiveEvent.status === "draft") {
    return (
      <div className="guest-shell">
        <main className="guest-page-center">
          <p className="guest-label">Flaash</p>
          <h1 className="guest-title">
            Vous êtes au bon événement.
          </h1>
          <p className="guest-copy">
            {effectiveEvent.title}
          </p>
          <p className="guest-status-pill" style={{ marginTop: 24 }}>
            Cet événement n&apos;est pas encore ouvert.
          </p>
        </main>
      </div>
    );
  }

  if (effectiveEvent.status === "closed") {
    return (
      <div className="guest-shell">
        <main className="guest-page-center">
          <p className="guest-label">Flaash</p>
          <h1 className="guest-title">
            L&apos;événement est terminé.
          </h1>
          <p className="guest-copy">
            {effectiveEvent.title}
          </p>
        </main>
      </div>
    );
  }

  if (effectiveEvent.status === "revealed") {
    return (
      <div className="guest-shell">
        <main className="guest-page-center guest-page-ink">
          {effectiveEvent.cover_url && (
            <div style={{ width: "100%", maxWidth: 360, marginBottom: 28 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={effectiveEvent.cover_url}
                alt=""
                className="guest-cover"
              />
            </div>
          )}

          <p className="guest-label">Reveal</p>
          <h1 className="guest-title">
            La soirée revient.
          </h1>
          <p className="guest-copy" style={{ marginBottom: 34 }}>
            {effectiveEvent.title}
          </p>

          <Link
            href={`/e/${slug}/gallery`}
            className="flaash-btn flaash-btn-primary"
            style={{ width: "min(100%, 280px)" }}
          >
            Voir la galerie
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="guest-shell">
      <GuestCamera event={effectiveEvent as Event} photoCount={photoCount} />
    </div>
  );
}

function isTimedRevealDue(status: string, revealAt: string | null) {
  return status === "active" && !!revealAt && new Date(revealAt).getTime() <= Date.now();
}
