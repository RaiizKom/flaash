"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        <main
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeItems: "center",
            padding: "40px 22px",
            background: "#FAF7F2",
            color: "#1A1A1A",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <section
            style={{
              width: "min(100%, 560px)",
              padding: "42px 28px",
              border: "1px solid rgba(26, 26, 26, 0.12)",
              borderRadius: 24,
              background: "rgba(255, 255, 255, 0.58)",
              boxShadow: "0 24px 70px rgba(26, 26, 26, 0.10)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                color: "#756F68",
                fontSize: 12,
                fontWeight: 850,
                letterSpacing: "0.12em",
                lineHeight: 1.2,
                textTransform: "uppercase",
              }}
            >
              Flaash
            </p>
            <h1
              style={{
                maxWidth: 460,
                margin: "0 auto 16px",
                fontSize: "clamp(36px, 8vw, 58px)",
                fontWeight: 900,
                letterSpacing: 0,
                lineHeight: 0.98,
              }}
            >
              Quelque chose a interrompu le moment.
            </h1>
            <p
              style={{
                maxWidth: 390,
                margin: "0 auto 30px",
                color: "#756F68",
                fontSize: 16,
                fontWeight: 550,
                lineHeight: 1.62,
              }}
            >
              Vous pouvez réessayer ou revenir à l'accueil.
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
                style={{
                  minHeight: 52,
                  padding: "14px 22px",
                  border: "1.5px solid #1A1A1A",
                  borderRadius: 999,
                  background: "#1A1A1A",
                  color: "#FAF7F2",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 850,
                }}
              >
                Réessayer
              </button>
              <a
                href="/"
                style={{
                  minHeight: 52,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 22px",
                  border: "1.5px solid rgba(26, 26, 26, 0.18)",
                  borderRadius: 999,
                  color: "#1A1A1A",
                  fontSize: 14,
                  fontWeight: 850,
                  textDecoration: "none",
                }}
              >
                Revenir à l'accueil
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
