"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  url: string;
  title: string;
  slug: string; // kept for caller compatibility
}

export default function QRCodeCard({ url, title }: Props) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Lien copié !");
      }
    } catch {
      // clipboard.writeText fails on HTTP (non-localhost) — fall back to prompt
      prompt("Copie ce lien :", url);
    }
  }

  return (
    <div className="qr-card" style={{ width: "100%", maxWidth: 300, margin: "0 auto" }}>
      {/* QR code */}
      <div style={{ position: "relative" }}>
        <QRCodeSVG
          value={url}
          size={220}
          bgColor="#FAF7F2"
          fgColor="#1A1A1A"
          level="M"
        />
      </div>

      {/* Event name + full URL (BUG 4 fix — show actual URL from prop) */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 18,
            color: "var(--flaash-ink)",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: 11, color: "var(--fg-3)", margin: "4px 0 0", wordBreak: "break-all" }}>
          {url.replace(/^https?:\/\//, "")}
        </p>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="btn-pill btn-ink"
        style={{ fontSize: 13 }}
      >
        PARTAGER LE LIEN
      </button>
    </div>
  );
}
