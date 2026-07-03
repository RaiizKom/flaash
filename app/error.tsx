"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "40px 22px",
        background: "var(--flaash-cream)",
        color: "var(--flaash-ink)",
      }}
    >
      <section
        style={{
          width: "min(100%, 560px)",
          padding: "42px 28px",
          border: "1px solid var(--flaash-cream-line)",
          borderRadius: 24,
          background: "rgba(255, 255, 255, 0.58)",
          boxShadow: "0 24px 70px rgba(26, 26, 26, 0.10)",
          textAlign: "center",
        }}
      >
        <p
          className="flaash-label"
          style={{ marginBottom: 14, color: "var(--fg-3)" }}
        >
          Flaash
        </p>
        <h1
          style={{
            margin: "0 auto 16px",
            maxWidth: 460,
            fontFamily: "var(--font-display)",
            fontSize: "clamp(38px, 8vw, 64px)",
            fontWeight: 900,
            letterSpacing: 0,
            lineHeight: 0.96,
          }}
        >
          Quelque chose a interrompu le moment.
        </h1>
        <p
          style={{
            maxWidth: 390,
            margin: "0 auto 30px",
            color: "var(--fg-2)",
            fontSize: 16,
            fontWeight: 550,
            lineHeight: 1.62,
          }}
        >
          Vous pouvez réessayer ou revenir à vos soirées.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <button
            onClick={reset}
            type="button"
            className="flaash-btn flaash-btn-primary"
          >
            Réessayer
          </button>
          <Link href="/dashboard" className="flaash-btn flaash-btn-ghost">
            Revenir aux soirées
          </Link>
        </div>
      </section>
    </main>
  );
}
