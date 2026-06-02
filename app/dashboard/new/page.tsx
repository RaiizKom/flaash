export const dynamic = 'force-dynamic';

import Link from "next/link";
import CreateEventForm from "./CreateEventForm";

interface Props {
  searchParams: { error?: string };
}

export default async function NewEventPage({ searchParams }: Props) {
  const { error } = searchParams;

  return (
    <div className="flex flex-col flex-1 px-5" style={{ paddingTop: 28, paddingBottom: 80 }}>
      {/* Back */}
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--fg-3)",
          textDecoration: "none",
          marginBottom: 24,
          letterSpacing: "0.06em",
        }}
      >
        ← Mes événements
      </Link>

      <p className="f-eyebrow" style={{ marginBottom: 6 }}>
        02 — NOUVEAU
      </p>
      <h1 className="f-h1" style={{ marginBottom: 32 }}>
        Créer un événement
      </h1>

      <CreateEventForm error={error} />
    </div>
  );
}
