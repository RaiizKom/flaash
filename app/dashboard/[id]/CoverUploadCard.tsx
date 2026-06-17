"use client";

import { useRef, useState } from "react";

interface Props {
  eventId: string;
  initialCoverUrl: string | null;
}

export default function CoverUploadCard({ eventId, initialCoverUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isUploading) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/events/${eventId}/cover`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'envoi.");
        return;
      }

      setCoverUrl(data.cover_url);
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="f-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <p className="f-eyebrow">Photo de couverture</p>
        {coverUrl && (
          <span style={{ color: "var(--fg-3)", fontSize: 12, fontWeight: 700 }}>
            Active
          </span>
        )}
      </div>

      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt="Photo de couverture"
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: "var(--radius-md)",
            display: "block",
            marginBottom: 14,
            background: "var(--surface-2)",
          }}
        />
      ) : (
        <p style={{ color: "var(--fg-3)", fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
          Aucune photo de couverture définie.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        style={{
          borderRadius: "var(--radius-pill)",
          border: "1.5px solid var(--border)",
          background: "var(--surface-2)",
          color: "var(--fg-2)",
          cursor: isUploading ? "default" : "pointer",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.06em",
          opacity: isUploading ? 0.65 : 1,
          padding: "11px 16px",
          textTransform: "uppercase",
          width: "100%",
        }}
      >
        {isUploading ? "Envoi en cours…" : coverUrl ? "Remplacer la photo" : "Ajouter une photo"}
      </button>

      {error && (
        <p style={{ color: "var(--flaash-error)", fontSize: 13, fontWeight: 600, marginTop: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
}
