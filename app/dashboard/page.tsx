export const dynamic = 'force-dynamic';

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Event, STATUS_LABELS, EVENT_TYPE_LABELS } from "@/types";

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  draft:    { bg: "var(--flaash-cream-line)", fg: "var(--fg-3)" },
  active:   { bg: "var(--flaash-amber-soft)", fg: "var(--flaash-amber-deep)" },
  revealed: { bg: "var(--flaash-forest-soft)", fg: "var(--flaash-forest)" },
  closed:   { bg: "var(--flaash-cream-line)", fg: "var(--fg-3)" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const eventsData = (events ?? []) as Event[];

  return (
    <div className="flex flex-col flex-1 px-5" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p className="f-eyebrow" style={{ marginBottom: 6 }}>
          01 — MES ÉVÉNEMENTS
        </p>
        <h1 className="f-h1">
          {eventsData.length === 0 ? "Aucun événement" : `${eventsData.length} événement${eventsData.length > 1 ? "s" : ""}`}
        </h1>
      </div>

      {/* Empty state */}
      {eventsData.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 16,
            paddingBottom: 60,
          }}
        >
          <div
            style={{
              width: 80, height: 80,
              borderRadius: "50%",
              background: "var(--flaash-amber-soft)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36,
            }}
          >
            📷
          </div>
          <p style={{ color: "var(--fg-2)", fontSize: 15, maxWidth: 260, lineHeight: 1.5 }}>
            Aucun événement pour l'instant — créez le premier.
          </p>
          <p className="f-script" style={{ color: "var(--flaash-forest)" }}>
            vos souvenirs se développent…
          </p>
          <Link
            href="/dashboard/new"
            className="btn-pill btn-ink"
            style={{ marginTop: 8, maxWidth: 280 }}
          >
            CRÉER UN ÉVÉNEMENT
          </Link>
        </div>
      )}

      {/* Event list */}
      {eventsData.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {eventsData.map((event) => {
            const colors = STATUS_COLORS[event.status] ?? STATUS_COLORS.draft;
            return (
              <Link
                key={event.id}
                href={`/dashboard/${event.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="f-card"
                  style={{
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "box-shadow var(--t-base)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        className="f-eyebrow"
                        style={{ marginBottom: 3 }}
                      >
                        {EVENT_TYPE_LABELS[event.event_type]}
                      </p>
                      <h2
                        className="f-h3"
                        style={{
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.title}
                      </h2>
                    </div>
                    <span
                      className="status-badge"
                      style={{ background: colors.bg, color: colors.fg, flexShrink: 0 }}
                    >
                      {STATUS_LABELS[event.status]}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      fontSize: 13,
                      color: "var(--fg-3)",
                    }}
                  >
                    <span>{event.max_guests} invités max</span>
                    <span>·</span>
                    <span>{event.photos_per_guest} photos/invité</span>
                    <span>·</span>
                    <span style={{ fontWeight: 600, color: "var(--fg-2)" }}>
                      CHF {event.price_chf}
                    </span>
                  </div>

                  {event.status === "draft" && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--flaash-amber-deep)",
                        fontWeight: 600,
                      }}
                    >
                      Paiement requis pour activer →
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
