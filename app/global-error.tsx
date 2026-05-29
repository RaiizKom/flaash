"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "monospace", padding: 32, background: "#1a1a1a", color: "#f5f0e8" }}>
        <h2 style={{ color: "#F5A623", marginBottom: 16 }}>Erreur serveur</h2>
        <p><strong>Message :</strong> {error.message || "(aucun message)"}</p>
        {error.digest && (
          <p><strong>Digest :</strong> {error.digest}</p>
        )}
        <pre style={{
          marginTop: 16,
          padding: 16,
          background: "#111",
          borderRadius: 8,
          fontSize: 12,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          color: "#ff6b6b",
        }}>
          {error.stack ?? "(pas de stack)"}
        </pre>
        <button
          onClick={reset}
          style={{
            marginTop: 24,
            padding: "10px 20px",
            background: "#F5A623",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
