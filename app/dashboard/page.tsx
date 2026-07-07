export const dynamic = 'force-dynamic';

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Event, STATUS_LABELS, EVENT_TYPE_LABELS } from "@/types";
import { deleteEvent } from "@/app/dashboard/[id]/actions";

export default async function DashboardPage() {
  let user;
  let events: Event[] = [];
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) console.error("[dashboard/page] getUser error:", userError.message);
    user = userData.user;

    if (user) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      if (error) console.error("[dashboard/page] events query error:", error.message);
      events = (data ?? []) as Event[];
    }
  } catch (err) {
    console.error("[dashboard/page] createClient THREW:", err);
    throw err;
  }

  if (!user) redirect("/login");

  const eventsData = events;
  const totalEvents = eventsData.length;
  const activeEvents = eventsData.filter((event) => event.status === "active").length;
  const revealedEvents = eventsData.filter((event) => event.status === "revealed").length;
  const draftEvents = eventsData.filter((event) => event.status === "draft").length;
  const focusEvent = eventsData[0];
  const secondaryEvents = eventsData.slice(1);
  const overviewStats = [
    { label: "Soirées", value: totalEvents, detail: "au total" },
    { label: "Actives", value: activeEvents, detail: "en cours" },
    { label: "Révélées", value: revealedEvents, detail: "souvenirs revenus" },
    { label: "Brouillons", value: draftEvents, detail: "à préparer" },
  ];

  return (
    <main className="dashboard-overview">
      <section className="dashboard-overview-hero" aria-labelledby="dashboard-overview-title">
        <div className="dashboard-overview-copy">
          <p className="dashboard-overview-label">Vos soirées</p>
          <h1 id="dashboard-overview-title">Retrouver les souvenirs en attente</h1>
          <p>
            Suivez les soirées actives, les reveals à venir et les souvenirs déjà revenus.
          </p>
        </div>
        <Link href="/dashboard/new" className="dashboard-overview-cta">
          Préparer une nouvelle soirée
        </Link>
      </section>

      {/* Empty state */}
      {eventsData.length === 0 && (
        <section className="dashboard-overview-empty">
          <div className="dashboard-overview-empty-mark" aria-hidden="true">
            <span />
          </div>
          <p className="dashboard-overview-empty-label">Le premier scan</p>
          <h2>Votre première soirée Flaash attend son QR.</h2>
          <p>
            Créez un événement, faites circuler le QR, puis laissez les souvenirs arriver.
          </p>
          <Link href="/dashboard/new" className="dashboard-overview-cta">
            Préparer une nouvelle soirée
          </Link>
        </section>
      )}

      {/* Event list */}
      {focusEvent && (
        <section className="dashboard-overview-events" aria-label="Soirées Flaash">
          <article
            className={`dashboard-overview-focus${focusEvent.status === "draft" ? " dashboard-overview-focus-draft" : ""}`}
          >
            <Link href={`/dashboard/${focusEvent.id}`} className="dashboard-overview-focus-link">
              <div className="dashboard-overview-focus-copy">
                <div className="dashboard-overview-focus-kicker">
                  <p>À reprendre</p>
                  <span className={`dashboard-overview-status dashboard-overview-status-${focusEvent.status}`}>
                    {STATUS_LABELS[focusEvent.status]}
                  </span>
                </div>
                <h2>{focusEvent.title}</h2>
                <p className="dashboard-overview-focus-type">
                  {EVENT_TYPE_LABELS[focusEvent.event_type]}
                </p>
              </div>

              <div className="dashboard-overview-focus-details" aria-label="Cadre de la soirée principale">
                <span>
                  <strong>Invités</strong>
                  {focusEvent.max_guests} max
                </span>
                <span>
                  <strong>Souvenirs</strong>
                  {focusEvent.photos_per_guest} poses par invité
                </span>
                {focusEvent.price_chf !== null && focusEvent.price_chf !== undefined && (
                  <span>
                    <strong>Cadre</strong>
                    CHF {focusEvent.price_chf}
                  </span>
                )}
              </div>

              <div className="dashboard-overview-focus-action">
                {focusEvent.status === "draft" && (
                  <span className="dashboard-overview-draft-note">
                    Paiement requis pour activer
                  </span>
                )}
                <span className="dashboard-overview-open">Ouvrir la soirée</span>
              </div>
            </Link>

            {focusEvent.status === "draft" && (
              <form
                action={deleteEvent.bind(null, focusEvent.id)}
                className="dashboard-overview-draft-delete dashboard-overview-focus-delete"
              >
                <button type="submit">
                  Supprimer le brouillon
                </button>
              </form>
            )}
          </article>

          <section className="dashboard-overview-pilot" aria-label="Pilotage des soirées">
            {overviewStats.map((stat) => (
              <div className="dashboard-overview-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.detail}</p>
              </div>
            ))}
          </section>

          {secondaryEvents.length > 0 && (
            <div className="dashboard-overview-events-secondary">
              <div className="dashboard-overview-events-head">
                <div>
                  <p className="dashboard-overview-label">Autres soirées</p>
                  <h2>Les autres soirées à retrouver</h2>
                </div>
                <span>
                  {secondaryEvents.length} soirée{secondaryEvents.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="dashboard-overview-event-list">
              {secondaryEvents.map((event) => {
                const isDraft = event.status === "draft";
                const priceLabel =
                  event.price_chf === null || event.price_chf === undefined
                    ? null
                    : `CHF ${event.price_chf}`;
                return (
                  <article
                    className={`dashboard-overview-event-card${isDraft ? " dashboard-overview-event-card-draft" : ""}`}
                    key={event.id}
                  >
                    <Link href={`/dashboard/${event.id}`} className="dashboard-overview-event-link">
                      <div className="dashboard-overview-event-main">
                        <span
                          className={`dashboard-overview-event-signal dashboard-overview-event-signal-${event.status}`}
                          aria-hidden="true"
                        />
                        <div className="dashboard-overview-event-title">
                          <div className="dashboard-overview-event-kicker">
                            <p>{EVENT_TYPE_LABELS[event.event_type]}</p>
                            <span className={`dashboard-overview-status dashboard-overview-status-${event.status}`}>
                              {STATUS_LABELS[event.status]}
                            </span>
                          </div>
                          <h3>{event.title}</h3>
                        </div>
                      </div>

                      <div className="dashboard-overview-event-meta" aria-label="Cadre de la soirée">
                        <span>
                          <strong>Invités</strong>
                          {event.max_guests} max
                        </span>
                        <span>
                          <strong>Souvenirs</strong>
                          {event.photos_per_guest} poses par invité
                        </span>
                        {priceLabel && (
                          <span>
                            <strong>Cadre</strong>
                            {priceLabel}
                          </span>
                        )}
                      </div>

                      <div className="dashboard-overview-event-action">
                        {isDraft && (
                          <div className="dashboard-overview-draft-note">
                            Paiement requis pour activer
                          </div>
                        )}
                        <span className="dashboard-overview-open">Ouvrir la soirée</span>
                      </div>
                    </Link>

                    {/* BUG 2 — Delete button for draft events */}
                    {isDraft && (
                      <form
                        action={deleteEvent.bind(null, event.id)}
                        className="dashboard-overview-draft-delete"
                      >
                        <button type="submit">
                          Supprimer le brouillon
                        </button>
                      </form>
                    )}
                  </article>
                );
              })}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
