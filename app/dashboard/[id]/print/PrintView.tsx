"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  title: string;
  eventUrl: string;
}

export default function PrintView({ title, eventUrl }: Props) {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: #fff; }
        }
        @page {
          size: A4;
          margin: 20mm;
        }
      `}</style>

      {/* Print button — hidden when printing */}
      <div
        className="no-print"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 10,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <a
          href=".."
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--fg-3)",
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          ← Retour
        </a>
        <button
          onClick={() => window.print()}
          style={{
            background: "var(--flaash-ink, #1A1A1A)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🖨 Imprimer
        </button>
      </div>

      {/* Print content */}
      <div
        style={{
          minHeight: "100dvh",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            textAlign: "center",
          }}
        >
          {/* Branding */}
          <p
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: 22,
              fontWeight: 400,
              color: "#C8963E",
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            Flaash
          </p>

          {/* QR code */}
          <div
            style={{
              padding: 20,
              background: "#fff",
              border: "2px solid #E8E3DC",
              borderRadius: 16,
              display: "inline-flex",
            }}
          >
            <QRCodeSVG
              value={eventUrl}
              size={300}
              bgColor="#ffffff"
              fgColor="#1A1A1A"
              level="M"
              imageSettings={{
                src: "/favicon.svg",
                height: 52,
                width: 52,
                excavate: true,
              }}
            />
          </div>

          {/* Event title */}
          <div>
            <h1
              style={{
                fontFamily: "Georgia, 'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#1A1A1A",
                margin: "0 0 12px",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 16,
                color: "#555",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Scannez pour participer et prendre des photos !
            </p>
          </div>

          {/* URL */}
          <p
            style={{
              fontSize: 13,
              color: "#888",
              margin: 0,
              wordBreak: "break-all",
              maxWidth: 360,
            }}
          >
            {eventUrl.replace(/^https?:\/\//, "")}
          </p>

          {/* Flaash footer */}
          <p
            style={{
              fontSize: 11,
              color: "#bbb",
              margin: 0,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Propulsé par Flaash · flaash.app
          </p>
        </div>
      </div>
    </>
  );
}
