import { notFound } from "next/navigation";
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
      "id, title, slug, status, photos_per_guest, allow_library_upload, max_guests, event_type, reveal_at"
    )
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  if (event.status === "draft") {
    return (
      <div className="flaash-shell" style={shellCenter}>
        <p className="f-script" style={{ color: "var(--flaash-amber)", marginBottom: 12 }}>
          bientôt —
        </p>
        <h1 className="f-h2" style={{ textAlign: "center" }}>
          {event.title}
        </h1>
        <p style={{ color: "var(--fg-3)", marginTop: 16, fontSize: 14, textAlign: "center" }}>
          Cet événement n&apos;est pas encore ouvert.
        </p>
      </div>
    );
  }

  if (event.status === "closed") {
    return (
      <div className="flaash-shell" style={shellCenter}>
        <p className="f-script" style={{ color: "var(--fg-3)", marginBottom: 12 }}>
          terminé —
        </p>
        <h1 className="f-h2" style={{ textAlign: "center" }}>
          {event.title}
        </h1>
        <p style={{ color: "var(--fg-3)", marginTop: 16, fontSize: 14, textAlign: "center" }}>
          Cet événement est maintenant fermé.
        </p>
      </div>
    );
  }

  if (event.status === "revealed") {
    return (
      <div className="flaash-shell" style={shellCenter}>
        <p
          className="f-script"
          style={{ color: "var(--flaash-forest)", marginBottom: 12, fontSize: 32 }}
        >
          la galerie est révélée.
        </p>
        <h1 className="f-h2" style={{ textAlign: "center", marginBottom: 20 }}>
          {event.title}
        </h1>
        <p style={{ color: "var(--fg-3)", fontSize: 14, textAlign: "center" }}>
          La galerie photo de cet événement est disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="flaash-shell">
      <GuestCamera event={event as Event} />
    </div>
  );
}

const shellCenter: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 24px",
  minHeight: "100dvh",
};
