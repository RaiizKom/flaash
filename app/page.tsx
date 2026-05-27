import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flaash-shell flex flex-col min-h-dvh">
      {/* Amber header stripe */}
      <div style={{ height: 6, background: "var(--flaash-amber)" }} />

      {/* Hero — amber wash */}
      <section
        style={{
          background: "var(--flaash-amber)",
          padding: "56px 28px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          flex: "0 0 auto",
        }}
      >
        <p className="f-eyebrow" style={{ color: "var(--flaash-ink)", opacity: 0.7 }}>
          Un appareil jetable pour l'ère QR code
        </p>

        {/* Wordmark */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(72px, 22vw, 100px)",
            lineHeight: 0.88,
            letterSpacing: "-0.04em",
            color: "var(--flaash-ink)",
          }}
        >
          Fl<em>aa</em>sh
        </div>

        <p
          style={{
            fontSize: 17,
            fontWeight: 500,
            color: "var(--flaash-ink)",
            lineHeight: 1.4,
            maxWidth: 300,
          }}
        >
          Une galerie partagée pour les photos de votre soirée. Pas d'application — juste un QR code.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <Link href="/register" className="btn-pill btn-ink">
            CRÉER UN ÉVÉNEMENT
          </Link>
          <Link
            href="/login"
            className="btn-text"
            style={{ textAlign: "center" }}
          >
            J'ai déjà un compte
          </Link>
        </div>
      </section>

      {/* How it works — cream */}
      <section style={{ background: "var(--flaash-cream)", padding: "48px 28px", flex: 1 }}>
        <p className="f-eyebrow" style={{ marginBottom: 24 }}>Comment ça marche</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {[
            {
              n: "01",
              title: "Créez l'événement",
              body: "Choisissez le type, le nombre d'invités, la date de révélation.",
            },
            {
              n: "02",
              title: "Partagez le QR code",
              body: "Vos invités scannent — aucune installation requise.",
            },
            {
              n: "03",
              title: "Capturez l'instant",
              body: "Chaque invité prend ses photos directement depuis son navigateur.",
            },
            {
              n: "04",
              title: "La galerie se révèle",
              body: "À l'heure choisie, tous les souvenirs apparaissent d'un coup.",
            },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 28,
                  color: "var(--flaash-amber)",
                  lineHeight: 1,
                  flexShrink: 0,
                  width: 36,
                }}
              >
                {n}
              </span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px" }}>
                  {title}
                </p>
                <p style={{ fontSize: 14, color: "var(--fg-2)", margin: 0, lineHeight: 1.5 }}>
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing teaser */}
        <div
          style={{
            marginTop: 48,
            background: "var(--flaash-ink)",
            borderRadius: "var(--radius-xl)",
            padding: "28px 24px",
          }}
        >
          <p className="f-eyebrow" style={{ color: "rgba(250,247,242,0.6)", marginBottom: 10 }}>
            Tarif
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 42,
              color: "var(--flaash-cream)",
              margin: "0 0 8px",
              lineHeight: 1,
            }}
          >
            dès CHF 49.–
          </p>
          <p style={{ fontSize: 14, color: "rgba(250,247,242,0.7)", marginBottom: 20, lineHeight: 1.5 }}>
            Un prix unique par événement. Plus d'invités et de photos = prix ajusté.
          </p>
          <Link href="/register" className="btn-pill btn-amber" style={{ fontSize: 14 }}>
            COMMENCER →
          </Link>
        </div>

        <p className="f-script" style={{ color: "var(--flaash-forest)", textAlign: "center", marginTop: 40 }}>
          vos souvenirs se développent…
        </p>
      </section>

      {/* Forest footer */}
      <footer
        style={{
          background: "var(--flaash-forest)",
          padding: "24px 28px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 22,
            fontStyle: "italic",
            color: "var(--flaash-cream)",
            margin: "0 0 8px",
          }}
        >
          Flaash
        </p>
        <p style={{ fontSize: 12, color: "var(--flaash-forest-soft)", margin: 0 }}>
          © 2025 Flaash — Capture l'instant.
        </p>
      </footer>
    </div>
  );
}
