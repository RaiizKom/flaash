"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  url: string;
  title: string;
  slug: string;
}

export default function QRCodeCard({ url, title, slug }: Props) {
  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Lien copié !");
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
          imageSettings={{
            src: "/favicon.svg",
            height: 40,
            width: 40,
            excavate: true,
          }}
        />
      </div>

      {/* Event name + slug */}
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
        <p style={{ fontSize: 12, color: "var(--fg-3)", margin: "4px 0 0" }}>
          flaash.app/e/{slug}
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
