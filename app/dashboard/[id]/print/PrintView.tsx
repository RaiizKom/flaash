"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  title: string;
  eventUrl: string;
}

export default function PrintView({ title, eventUrl }: Props) {
  const displayUrl = eventUrl.replace(/^https?:\/\//, "");

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
          background: #E8E2D9;
          font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* ── Screen layout ── */
        .print-wrap {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 24px 16px 80px;
          gap: 24px;
        }

        /* ── Card ── */
        .print-card {
          width: 100%;
          max-width: 380px;
          background: #F5F0E8;
          border-radius: 24px;
          padding: 28px 24px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* inner border */
        .print-card::before {
          content: '';
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          pointer-events: none;
        }

        /* ── Header ── */
        .print-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          position: relative;
          z-index: 1;
        }

        .print-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-playfair, 'Playfair Display', Georgia, serif);
          font-size: 26px;
          font-weight: 800;
          color: #1A1A1A;
          letter-spacing: -0.02em;
        }

        .print-logo-bolt {
          font-size: 22px;
        }

        .print-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9A8F82;
          margin: 0;
        }

        /* ── QR block ── */
        .print-qr-wrap {
          background: #fff;
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06);
          position: relative;
          z-index: 1;
        }

        /* ── Text ── */
        .print-title {
          font-family: var(--font-playfair, 'Playfair Display', Georgia, serif);
          font-size: 28px;
          font-weight: 800;
          color: #1A1A1A;
          line-height: 1.2;
          margin: 0;
          letter-spacing: -0.01em;
          position: relative;
          z-index: 1;
        }

        .print-subtitle {
          font-family: var(--font-playfair, 'Playfair Display', Georgia, serif);
          font-style: italic;
          font-size: 15px;
          color: #7A7060;
          margin: -12px 0 0;
          line-height: 1.5;
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
        }

        .print-url {
          font-size: 11px;
          color: #9A8F82;
          margin: 0;
          word-break: break-all;
        }

        .print-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #B5ADA3;
        }

        .print-brand-line {
          width: 28px;
          height: 1px;
          background: #C8C0B6;
          display: inline-block;
        }

        /* ── Watermark ── */
        .print-watermark {
          position: absolute;
          bottom: -12px;
          right: -8px;
          font-size: 120px;
          opacity: 0.045;
          pointer-events: none;
          user-select: none;
          line-height: 1;
          z-index: 0;
          transform: rotate(-10deg);
          color: #1A1A1A;
        }

        /* ── Screen-only UI ── */
        .screen-bar {
          width: 100%;
          max-width: 380px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .btn-back {
          font-size: 13px;
          font-weight: 600;
          color: #666;
          text-decoration: none;
          letter-spacing: 0.04em;
        }

        .btn-print {
          background: #1A1A1A;
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 10px 22px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        /* ── Print overrides ── */
        @media print {
          .no-print { display: none !important; }
          html, body { background: #F5F0E8 !important; }
          .print-wrap {
            padding: 0;
            min-height: unset;
            justify-content: center;
            align-items: center;
          }
          .print-card {
            max-width: 100%;
            border-radius: 0;
            box-shadow: none;
          }
          .print-card::before { display: none; }
        }

        @page {
          size: A6;
          margin: 0;
        }
      `}</style>

      <div className="print-wrap">
        {/* Screen-only top bar */}
        <div className="screen-bar no-print">
          <a href=".." className="btn-back">← Retour</a>
          <button className="btn-print" onClick={() => window.print()}>
            🖨 Imprimer
          </button>
        </div>

        {/* The card */}
        <div className="print-card">
          {/* Header */}
          <header className="print-header">
            <div className="print-logo">
              <span className="print-logo-bolt">⚡</span>
              Fl<em>aa</em>sh
            </div>
            <p className="print-eyebrow">Galerie partagée de la soirée</p>
          </header>

          {/* QR code */}
          <div className="print-qr-wrap">
            <QRCodeSVG
              value={eventUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#1A1A1A"
              level="M"
              imageSettings={{
                src: "/favicon.svg",
                height: 44,
                width: 44,
                excavate: true,
              }}
            />
          </div>

          {/* Title + subtitle */}
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
          <div className="print-watermark" aria-hidden="true">⚡</div>
        </div>
      </div>
    </>
  );
}
