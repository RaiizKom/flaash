export const dynamic = 'force-dynamic';

import Link from "next/link";
import CreateEventForm from "./CreateEventForm";

interface Props {
  searchParams: { error?: string };
}

export default async function NewEventPage({ searchParams }: Props) {
  const { error } = searchParams;

  return (
    <main className="dashboard-new-page">
      <div className="dashboard-new-shell">
        <Link href="/dashboard" className="dashboard-new-back">
          ← Retrouver vos soirées
        </Link>

        <section className="dashboard-new-hero" aria-labelledby="dashboard-new-title">
          <div className="dashboard-new-hero-copy">
            <p className="dashboard-section-label">Nouvelle soirée</p>
            <h1 id="dashboard-new-title">Préparer une expérience Flaash</h1>
            <p>
              Définissez le cadre, le rythme de capture et le moment où les souvenirs reviendront.
            </p>
          </div>
        </section>

        <section className="dashboard-new-ritual" aria-label="Rituel Flaash">
          <p>Vos invités scanneront le QR, captureront la soirée, puis reviendront au reveal.</p>
        </section>

        <CreateEventForm error={error} />
      </div>
    </main>
  );
}
