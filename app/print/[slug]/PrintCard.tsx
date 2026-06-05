"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";

const CARD_W = 1260;
const CARD_H = 1785;
const BG    = "#F5F0E8";

// Embedded SVG — drawn directly to canvas without fetch/CORS
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 350">
  <g transform="translate(155 6)">
    <path d="M86 8 L24 92 L66 92 L52 152 L132 60 L86 60 Z"
      fill="#E07B2E" stroke="#1A1A1A" stroke-width="8" stroke-linejoin="round"/>
  </g>
  <text x="235" y="335" text-anchor="middle"
    font-family="'Playfair Display', Georgia, serif"
    font-weight="900" font-size="150" letter-spacing="-6" fill="#1A1A1A">
    Fl<tspan font-style="italic" font-weight="800">aa</tspan>sh
  </text>
</svg>`;

interface Props { title: string; eventUrl: string; slug: string; }

function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Wraps text in a canvas context. Returns the y of the last line. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, cx: number, y: number, maxW: number, lineH: number
): number {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, cx, curY);
      line = word;
      curY += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, cx, curY);
  return curY;
}

export default function PrintCard({ title, eventUrl, slug }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const displayUrl = eventUrl.replace(/^https?:\/\//, "");

  async function loadQrImage(): Promise<HTMLImageElement> {
    const dataUrl = await QRCode.toDataURL(eventUrl, {
      width: 640,
      margin: 1,
      color: { dark: "#1A1A1A", light: "#ffffff" },
    });
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = dataUrl;
    });
  }

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas || isGenerating) return;
    setIsGenerating(true);

    try {
      // Wait for Google Fonts (loaded via print/layout.tsx <link> tags)
      await document.fonts.ready;
      // Extra wait to ensure font rendering is settled
      await new Promise(r => setTimeout(r, 200));

      const [logoImg, qrImg] = await Promise.all([
        loadSvgImage(LOGO_SVG),
        loadQrImage(),
      ]);
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, CARD_W, CARD_H);

      // ── Background ──────────────────────────────────────────────────────
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, CARD_W, CARD_H);

      // ── Inner border ─────────────────────────────────────────────────────
      ctx.strokeStyle = "rgba(0,0,0,0.07)";
      ctx.lineWidth = 2;
      roundRect(ctx, 20, 20, CARD_W - 40, CARD_H - 40, 24);
      ctx.stroke();

      // ── Logo (SVG, viewBox 470×350) ───────────────────────────────────────
      const logoH = 190;
      const logoW = (470 / 350) * logoH;
      ctx.drawImage(logoImg, (CARD_W - logoW) / 2, 80, logoW, logoH);

      // ── Eyebrow ──────────────────────────────────────────────────────────
      ctx.font      = '600 26px "Inter", system-ui, sans-serif';
      ctx.fillStyle = "#9A8F82";
      ctx.textAlign = "center";
      ctx.fillText("GALERIE PARTAGÉE DE LA SOIRÉE", CARD_W / 2, 340);

      // ── QR card ───────────────────────────────────────────────────────────
      const qrSize    = 640;
      const qrPad     = 44;
      const qrCardW   = qrSize + qrPad * 2;
      const qrCardH   = qrSize + qrPad * 2;
      const qrCardX   = (CARD_W - qrCardW) / 2;
      const qrCardY   = 410;

      ctx.shadowColor  = "rgba(0,0,0,0.08)";
      ctx.shadowBlur   = 36;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 36);
      ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      ctx.drawImage(qrImg, qrCardX + qrPad, qrCardY + qrPad, qrSize, qrSize);

      // ── Title ─────────────────────────────────────────────────────────────
      ctx.font      = '800 66px "Playfair Display", Georgia, serif';
      ctx.fillStyle = "#1A1A1A";
      ctx.textAlign = "center";
      const titleStartY  = qrCardY + qrCardH + 80;
      const lastTitleY   = wrapText(ctx, title, CARD_W / 2, titleStartY, CARD_W - 140, 82);

      // ── Subtitle ──────────────────────────────────────────────────────────
      ctx.font      = 'italic 600 50px "Caveat", cursive';
      ctx.fillStyle = "#7A7060";
      ctx.fillText("Scannez & capturez l'instant.", CARD_W / 2, lastTitleY + 94);

      // ── URL ───────────────────────────────────────────────────────────────
      ctx.font      = '400 26px "Inter", system-ui, sans-serif';
      ctx.fillStyle = "#9A8F82";
      ctx.fillText(displayUrl, CARD_W / 2, lastTitleY + 190);

      // ── Brand "—— FLAASH ——" ──────────────────────────────────────────────
      const brandY = CARD_H - 100;
      ctx.font      = '700 22px "Inter", system-ui, sans-serif';
      ctx.fillStyle = "#B5ADA3";
      ctx.fillText("FLAASH", CARD_W / 2, brandY);
      const brandW  = ctx.measureText("FLAASH").width;
      const lineGap = 22;
      const lineLen = 68;
      ctx.strokeStyle = "#C8C0B6";
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(CARD_W / 2 - brandW / 2 - lineGap - lineLen, brandY - 7);
      ctx.lineTo(CARD_W / 2 - brandW / 2 - lineGap, brandY - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(CARD_W / 2 + brandW / 2 + lineGap, brandY - 7);
      ctx.lineTo(CARD_W / 2 + brandW / 2 + lineGap + lineLen, brandY - 7);
      ctx.stroke();

      // ── Download ─────────────────────────────────────────────────────────
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a   = document.createElement("a");
        a.href     = url;
        a.download = `flaash-${slug}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");

    } catch (err) {
      console.error("[PrintCard] Canvas error:", err);
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

      {/* Hidden draw canvas */}
      <canvas ref={canvasRef} width={CARD_W} height={CARD_H} style={{ display: "none" }} />

      {/* Screen button */}
      <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", padding: "14px 20px" }}>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          style={{
            background: "#1A1A1A", color: "#FAF7F2", border: "none",
            borderRadius: 999, padding: "10px 22px", fontSize: 13,
            fontWeight: 700, letterSpacing: "0.06em",
            cursor: isGenerating ? "default" : "pointer",
            opacity: isGenerating ? 0.7 : 1,
            display: "inline-flex", alignItems: "center", gap: 7,
          }}
        >
          {isGenerating ? "⏳ Génération…" : "⬇ Télécharger la carte"}
        </button>
      </div>

      {/* Visual preview — design unchanged */}
      <div
        id="flaash-print-card"
        style={{
          width: 420, minHeight: 595, margin: "0 auto",
          background: BG,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.07)",
          borderRadius: 20, padding: "28px 24px 32px",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 20, textAlign: "center",
          position: "relative",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 350" width={97} height={72} style={{ display: "block" }}>
            <g transform="translate(155 6)">
              <path d="M86 8 L24 92 L66 92 L52 152 L132 60 L86 60 Z" fill="#E07B2E" stroke="#1A1A1A" strokeWidth={8} strokeLinejoin="round" />
            </g>
            <text x="235" y="335" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontWeight={900} fontSize={150} letterSpacing={-6} fill="#1A1A1A">
              Fl<tspan fontStyle="italic" fontWeight={800}>aa</tspan>sh
            </text>
          </svg>
          <p style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A8F82", margin: 0 }}>
            Galerie partagée de la soirée
          </p>
        </div>

        {/* QR preview (SVG — display only) */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", display: "inline-flex" }}>
          <QRCodeSVG value={eventUrl} size={240} bgColor="#ffffff" fgColor="#1A1A1A" level="M" />
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 800, color: "#1A1A1A", lineHeight: 1.2, margin: 0 }}>
          {title}
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: "'Caveat', cursive", fontStyle: "italic", fontSize: 17, color: "#7A7060", margin: "-8px 0 0" }}>
          Scannez &amp; capturez l&apos;instant.
        </p>

        {/* Footer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", marginTop: "auto" }}>
          <p style={{ fontSize: 10.5, color: "#9A8F82", margin: 0, wordBreak: "break-all" }}>{displayUrl}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#B5ADA3" }}>
            <span style={{ width: 24, height: 1, background: "#C8C0B6", display: "inline-block" }} />
            Flaash
            <span style={{ width: 24, height: 1, background: "#C8C0B6", display: "inline-block" }} />
          </div>
        </div>

        {/* Watermark */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width={120} height={120} aria-hidden="true"
          style={{ position: "absolute", bottom: -16, right: -10, opacity: 0.04, transform: "rotate(-12deg)", pointerEvents: "none" }}>
          <path d="M86 8 L24 92 L66 92 L52 152 L132 60 L86 60 Z" fill="#E07B2E" stroke="#1A1A1A" strokeWidth={8} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
}
