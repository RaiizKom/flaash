import Link from "next/link";

export default function NotFound() {
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

        <p
          style={{
            margin: "0 auto 16px",
            color: "var(--flaash-ink)",
            fontFamily: "var(--font-impact)",
            fontSize: "clamp(72px, 20vw, 128px)",
            fontWeight: 900,
            letterSpacing: 0,
            lineHeight: 1,
          }}
          aria-label="Erreur 404"
        >
          404
        </p>

        <h1
          style={{
            maxWidth: 430,
            margin: "0 auto 14px",
            color: "var(--flaash-ink)",
            fontFamily: "var(--font-impact)",
            fontSize: "clamp(32px, 7vw, 54px)",
            fontWeight: 900,
            letterSpacing: 0,
            lineHeight: 0.98,
          }}
        >
          Cette page n&apos;est plus dans la pellicule.
        </h1>

        <p
          style={{
            maxWidth: 360,
            margin: "0 auto 30px",
            color: "var(--fg-2)",
            fontSize: 16,
            fontWeight: 550,
            lineHeight: 1.62,
          }}
        >
          Le lien est peut-être expiré ou l&apos;adresse incorrecte.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Link
            href="/dashboard"
            className="flaash-btn flaash-btn-primary"
            style={{ width: "min(100%, 280px)" }}
          >
            Revenir à vos soirées
          </Link>
          <Link href="/" className="flaash-btn flaash-btn-ghost">
            Accueil public
          </Link>
        </div>
      </section>
    </main>
  );
}
