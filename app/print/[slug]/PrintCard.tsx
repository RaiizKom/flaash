"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  title: string;
  eventUrl: string;
  slug: string;
}

// Inlined SVG — no <img src> that html-to-image can't load
function LogoLockup() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 470 350"
      width={97}
      height={72}
      style={{ display: "block", overflow: "visible" }}
      aria-label="Flaash"
    >
      <g transform="translate(155 6)">
        <path
          d="M86 8 L24 92 L66 92 L52 152 L132 60 L86 60 Z"
          fill="#E07B2E"
          stroke="#1A1A1A"
          strokeWidth={8}
          strokeLinejoin="round"
        />
      </g>
      <text
        x="235"
        y="335"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight={900}
        fontSize={150}
        letterSpacing={-6}
        fill="#1A1A1A"
      >
        Fl
        <tspan fontStyle="italic" fontWeight={800}>aa</tspan>
        sh
      </text>
    </svg>
  );
}

const BG = "#F5F0E8";

export default function PrintCard({ title, eventUrl, slug }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const displayUrl = eventUrl.replace(/^https?:\/\//, "");

  async function handleDebug() {
    if (!cardRef.current) return;
    console.log("cardRef:", cardRef.current);
    console.log("innerHTML:", cardRef.current.innerHTML);
    console.log("children count:", cardRef.current.children.length);
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 1, backgroundColor: BG });
    setDebugInfo(dataUrl);
    console.log("debug dataUrl (first 200):", dataUrl.slice(0, 200));
  }

  async function handleDownload() {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      // Warm-up pass: lets html-to-image resolve fonts + images
      await toPng(cardRef.current, { pixelRatio: 1, backgroundColor: BG });
      // Wait for fonts to paint after warm-up
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Final high-res capture
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: BG,
        style: { backgroundColor: BG },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `flaash-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <style>{`
        @media print { .no-print { display: none !important; } }
        @page { size: A6 portrait; margin: 10mm; }
        html, body { margin: 0; padding: 0; background: ${BG}; }
      `}</style>

      {/* Screen-only controls */}
      <div
        className="no-print"
        style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, padding: "14px 20px" }}
      >
        {/* Temporary debug button */}
        <button
          onClick={handleDebug}
          style={{ background: "#6b7280", color: "#fff", border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Debug
        </button>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          style={{
            background: "#1A1A1A", color: "#FAF7F2", border: "none", borderRadius: 999,
            padding: "10px 22px", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
            cursor: isGenerating ? "default" : "pointer", opacity: isGenerating ? 0.7 : 1,
            display: "inline-flex", alignItems: "center", gap: 7,
          }}
        >
          {isGenerating ? "⏳ Génération en cours…" : "⬇ Télécharger la carte"}
        </button>
      </div>

      {/* Debug preview — shows what html-to-image actually captured */}
      {debugInfo && (
        <div className="no-print" style={{ padding: "0 20px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Debug preview (pixelRatio 1×):</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={debugInfo} alt="debug" style={{ maxWidth: 300, border: "1px solid #ccc" }} />
        </div>
      )}

      {/* ─── Card — the capture target ─────────────────────────────────── */}
      <div
        ref={cardRef}
        style={{
          width: 420,
          minHeight: 595,
          margin: "0 auto",
          background: BG,
          // FIX: no overflow:hidden (causes html-to-image stacking context clipping)
          // FIX: inner border via box-shadow inset (no extra <div> that creates stacking context)
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.07), inset 10px 10px 0 -9px rgba(0,0,0,0.07), inset -10px -10px 0 -9px rgba(0,0,0,0.07)",
          borderRadius: 20,
          padding: "28px 24px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          textAlign: "center",
          position: "relative",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <LogoLockup />
          <p style={{
            fontSize: 9.5, fontWeight: 600, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "#9A8F82", margin: 0,
          }}>
            Galerie partagée de la soirée
          </p>
        </div>

        {/* QR */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
          display: "inline-flex",
        }}>
          <QRCodeSVG
            value={eventUrl}
            size={240}
            bgColor="#ffffff"
            fgColor="#1A1A1A"
            level="M"
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 26, fontWeight: 800, color: "#1A1A1A",
          lineHeight: 1.2, margin: 0, letterSpacing: "-0.01em",
        }}>
          {title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Caveat', cursive, Georgia, serif",
          fontStyle: "italic", fontSize: 17, color: "#7A7060",
          margin: "-8px 0 0", lineHeight: 1.4,
        }}>
          Scannez &amp; capturez l&apos;instant.
        </p>

        {/* Footer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", marginTop: "auto" }}>
          <p style={{ fontSize: 10.5, color: "#9A8F82", margin: 0, wordBreak: "break-all" }}>
            {displayUrl}
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 8.5, fontWeight: 700, letterSpacing: "0.28em",
            textTransform: "uppercase", color: "#B5ADA3",
          }}>
            <span style={{ width: 24, height: 1, background: "#C8C0B6", display: "inline-block", flexShrink: 0 }} />
            Flaash
            <span style={{ width: 24, height: 1, background: "#C8C0B6", display: "inline-block", flexShrink: 0 }} />
          </div>
        </div>

        {/* Watermark — inline SVG, absolutely positioned but NO z-index (avoids stacking context) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 160 160"
          width={120}
          height={120}
          aria-hidden="true"
          style={{
            position: "absolute", bottom: -16, right: -10,
            opacity: 0.04, transform: "rotate(-12deg)",
            pointerEvents: "none",
          }}
        >
          <path
            d="M86 8 L24 92 L66 92 L52 152 L132 60 L86 60 Z"
            fill="#E07B2E"
            stroke="#1A1A1A"
            strokeWidth={8}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
