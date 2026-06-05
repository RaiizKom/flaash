"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  title: string;
  eventUrl: string;
  slug: string;
}

export default function PrintCard({ title, eventUrl, slug }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    if (!cardRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
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
  const displayUrl = eventUrl.replace(/^https?:\/\//, "");

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          height: auto;
          overflow: hidden;
          background: #F5F0E8;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-family: 'Inter', system-ui, sans-serif;
        }

        @page {
          size: A6 portrait;
          margin: 10mm;
        }

        @media print {
          .no-print { display: none !important; }
          html, body { overflow: hidden; }
        }

        /* ── Screen bar ── */
        .screen-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 14px 20px;
        }

        .btn-print {
          background: #1A1A1A;
          color: #FAF7F2;
          border: none;
          border-radius: 999px;
          padding: 10px 22px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        /* ── Card ── */
        .print-card {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          background: #F5F0E8;
          border-radius: 20px;
          padding: 28px 24px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* inner border */
        .print-card::before {
          content: '';
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 12px;
          pointer-events: none;
        }

        /* ── Header ── */
        .print-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .print-eyebrow {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9A8F82;
          margin: 0;
        }

        /* ── QR ── */
        .print-qr {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
          position: relative;
          z-index: 1;
          display: inline-flex;
        }

        /* ── Typography ── */
        .print-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 26px;
          font-weight: 800;
          color: #1A1A1A;
          line-height: 1.2;
          margin: 0;
          letter-spacing: -0.01em;
          position: relative;
          z-index: 1;
        }

        .print-subtitle {
          font-family: 'Caveat', cursive, Georgia, serif;
          font-style: italic;
          font-size: 17px;
          color: #7A7060;
          margin: -8px 0 0;
          line-height: 1.4;
          position: relative;
          z-index: 1;
        }

        /* ── Footer ── */
        .print-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .print-url {
          font-size: 10.5px;
          color: #9A8F82;
          margin: 0;
          word-break: break-all;
        }

        .print-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #B5ADA3;
        }

        .print-brand-line {
          width: 24px;
          height: 1px;
          background: #C8C0B6;
          display: inline-block;
          flex-shrink: 0;
        }

        /* ── Watermark ── */
        .print-watermark {
          position: absolute;
          bottom: -16px;
          right: -10px;
          width: 120px;
          height: 120px;
          opacity: 0.04;
          pointer-events: none;
          user-select: none;
          transform: rotate(-12deg);
          z-index: 0;
        }
      `}</style>

      {/* Screen-only download button */}
      <div className="screen-bar no-print">
        <button
          className="btn-print"
          onClick={handleDownload}
          disabled={isGenerating}
          style={{ opacity: isGenerating ? 0.7 : 1 }}
        >
          {isGenerating ? "⏳ Génération en cours…" : "⬇ Télécharger la carte"}
        </button>
      </div>

      {/* Card */}
      <div className="print-card" ref={cardRef}>
        {/* Header */}
        <header className="print-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/flaash-lockup-vertical-ink.svg"
            alt="Flaash"
            width={97}
            height={72}
            style={{ display: "block" }}
          />
          <p className="print-eyebrow">Galerie partagée de la soirée</p>
        </header>

        {/* QR */}
        <div className="print-qr">
          <QRCodeSVG
            value={eventUrl}
            size={240}
            bgColor="#ffffff"
            fgColor="#1A1A1A"
            level="M"
            imageSettings={{
              src: "/flaash-favicon.svg",
              height: 44,
              width: 44,
              excavate: true,
            }}
          />
        </div>

        {/* Title */}
        <h1 className="print-title">{title}</h1>
        <p className="print-subtitle">Scannez &amp; capturez l&apos;instant.</p>

        {/* Footer */}
        <footer className="print-footer">
          <p className="print-url">{displayUrl}</p>
          <div className="print-brand">
            <span className="print-brand-line" />
            Flaash
            <span className="print-brand-line" />
          </div>
        </footer>

        {/* Watermark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/flaash-bolt.svg"
          alt=""
          className="print-watermark"
          aria-hidden="true"
        />
      </div>
    </>
  );
}
