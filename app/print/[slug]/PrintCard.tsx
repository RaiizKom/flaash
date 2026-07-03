"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";

const CARD_W = 1260;
const CARD_H = 1785;
const BG = "#FAF7F2";
const INK = "#1A1A1A";
const PAPER = "#FFFFFF";
const WARM = "#EFE8DA";
const MUTED = "#756F68";
const RED = "#FF332D";
const FOREST = "#1E3D2F";

interface Props { title: string; eventUrl: string; slug: string; }

function loadDataUrlImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = async () => {
      try {
        await img.decode?.();
      } catch {
        // onload already confirmed the image is usable; decode is an extra Safari guard.
      }
      res(img);
    };
    img.onerror = rej;
    img.src = dataUrl;
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

function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawWrappedLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  cx: number,
  y: number,
  lineH: number
) {
  lines.forEach((line, index) => {
    ctx.fillText(line, cx, y + index * lineH);
  });
  return y + Math.max(lines.length - 1, 0) * lineH;
}

function drawLogoText(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const segments = [
    { text: "Fl", font: '900 82px "Playfair Display", Georgia, serif' },
    { text: "aa", font: 'italic 800 82px "Playfair Display", Georgia, serif' },
    { text: "sh", font: '900 82px "Playfair Display", Georgia, serif' },
  ].map((segment) => {
    ctx.font = segment.font;
    const metrics = ctx.measureText(segment.text);
    return {
      ...segment,
      advance: metrics.width,
      left: metrics.actualBoundingBoxLeft ?? 0,
      right: metrics.actualBoundingBoxRight ?? metrics.width,
    };
  });

  const safetyPadding = 8;
  let advanceX = 0;
  let visualLeft = Number.POSITIVE_INFINITY;
  let visualRight = Number.NEGATIVE_INFINITY;

  for (const segment of segments) {
    visualLeft = Math.min(visualLeft, advanceX - segment.left);
    visualRight = Math.max(visualRight, advanceX + segment.right);
    advanceX += segment.advance;
  }

  const visualWidth = visualRight - visualLeft + safetyPadding * 2;
  let curX = x - visualWidth / 2 - visualLeft + safetyPadding;
  ctx.fillStyle = INK;

  for (const segment of segments) {
    ctx.font = segment.font;
    ctx.fillText(segment.text, curX, y);
    curX += segment.advance;
  }

  ctx.textAlign = "center";
}

function drawFlaashLogo(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  const scale = h / 350;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = RED;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(241, 14);
  ctx.lineTo(179, 98);
  ctx.lineTo(221, 98);
  ctx.lineTo(207, 158);
  ctx.lineTo(287, 66);
  ctx.lineTo(241, 66);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawLogoText(ctx, 235, 335);
  ctx.restore();
}

export default function PrintCard({ title, eventUrl, slug }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const displayUrl = eventUrl.replace(/^https?:\/\//, "");

  async function loadQrImage(): Promise<HTMLImageElement> {
    const dataUrl = await QRCode.toDataURL(eventUrl, {
      width: 640,
      margin: 1,
      color: { dark: INK, light: PAPER },
    });
    return loadDataUrlImage(dataUrl);
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

      const qrImg = await loadQrImage();
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, CARD_W, CARD_H);

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, CARD_W, CARD_H);

      ctx.strokeStyle = "rgba(26, 26, 26, 0.12)";
      ctx.lineWidth = 3;
      roundRect(ctx, 44, 44, CARD_W - 88, CARD_H - 88, 34);
      ctx.stroke();

      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(118, 118, 14, 0, Math.PI * 2);
      ctx.fill();

      const logoH = 150;
      const logoW = (470 / 350) * logoH;
      drawFlaashLogo(ctx, (CARD_W - logoW) / 2, 76, logoH);

      ctx.font = '800 28px "Archivo", system-ui, sans-serif';
      ctx.fillStyle = MUTED;
      ctx.textAlign = "center";
      ctx.fillText("CARTE QR DE LA SOIRÉE", CARD_W / 2, 294);

      const qrSize = 670;
      const qrPad = 58;
      const qrCardW = qrSize + qrPad * 2;
      const qrCardH = qrSize + qrPad * 2;
      const qrCardX = (CARD_W - qrCardW) / 2;
      const qrCardY = 360;

      ctx.shadowColor = "rgba(26, 26, 26, 0.10)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = PAPER;
      roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 38);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.drawImage(qrImg, qrCardX + qrPad, qrCardY + qrPad, qrSize, qrSize);

      const headlineY = qrCardY + qrCardH + 104;
      ctx.font = '900 58px "Archivo", system-ui, sans-serif';
      ctx.fillStyle = INK;
      ctx.textAlign = "center";
      wrapText(ctx, "Scannez. Capturez. Revenez à la soirée.", CARD_W / 2, headlineY, CARD_W - 210, 64);

      ctx.font = '650 35px "Archivo", system-ui, sans-serif';
      ctx.fillStyle = MUTED;
      ctx.fillText("Les souvenirs reviendront au reveal.", CARD_W / 2, headlineY + 168);

      ctx.fillStyle = FOREST;
      const badgeY = headlineY + 224;
      roundRect(ctx, CARD_W / 2 - 158, badgeY, 316, 48, 24);
      ctx.fill();
      ctx.font = '800 20px "Archivo", system-ui, sans-serif';
      ctx.fillStyle = BG;
      ctx.fillText("Aucune app à installer", CARD_W / 2, badgeY + 31);

      const titleMaxW = CARD_W - 170;
      ctx.font = '800 50px "Playfair Display", Georgia, serif';
      let titleLines = getWrappedLines(ctx, title, titleMaxW);
      let titleLineH = 57;

      if (titleLines.length > 2) {
        ctx.font = '800 38px "Playfair Display", Georgia, serif';
        titleLineH = 43;
        titleLines = getWrappedLines(ctx, title, titleMaxW);
      }

      ctx.fillStyle = INK;
      const titleY = badgeY + 94;
      const lastTitleY = drawWrappedLines(ctx, titleLines.slice(0, 3), CARD_W / 2, titleY, titleLineH);

      ctx.font = '600 24px "Archivo", system-ui, sans-serif';
      ctx.fillStyle = MUTED;
      ctx.fillText(displayUrl, CARD_W / 2, lastTitleY + 42);

      const brandY = CARD_H - 74;
      ctx.font = '850 22px "Archivo", system-ui, sans-serif';
      ctx.fillStyle = "rgba(26, 26, 26, 0.42)";
      ctx.fillText("FLAASH", CARD_W / 2, brandY);
      const brandW = ctx.measureText("FLAASH").width;
      const lineGap = 22;
      const lineLen = 72;
      ctx.strokeStyle = "rgba(26, 26, 26, 0.18)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(CARD_W / 2 - brandW / 2 - lineGap - lineLen, brandY - 7);
      ctx.lineTo(CARD_W / 2 - brandW / 2 - lineGap, brandY - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(CARD_W / 2 + brandW / 2 + lineGap, brandY - 7);
      ctx.lineTo(CARD_W / 2 + brandW / 2 + lineGap + lineLen, brandY - 7);
      ctx.stroke();

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `flaash-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (err) {
      console.error("[PrintCard] Canvas error:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <style>{`
        @page { size: A6 portrait; margin: 10mm; }
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: ${BG}; }

        .print-qr-page {
          min-height: 100dvh;
          padding: 28px 22px 72px;
          background:
            linear-gradient(180deg, rgb(239 232 218 / 0.62), transparent 460px),
            ${BG};
          color: ${INK};
          font-family: "Archivo", system-ui, sans-serif;
        }

        .print-qr-shell {
          width: min(100%, 1120px);
          margin-inline: auto;
        }

        .print-qr-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
          gap: clamp(28px, 5vw, 64px);
          align-items: start;
        }

        .print-qr-copy {
          padding-top: 30px;
        }

        .print-qr-label,
        .print-card-kicker {
          margin: 0;
          color: ${MUTED};
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .print-qr-copy h1 {
          max-width: 680px;
          margin: 12px 0 18px;
          color: ${INK};
          font-family: "Archivo", system-ui, sans-serif;
          font-size: clamp(44px, 6vw, 76px);
          font-weight: 900;
          letter-spacing: 0;
          line-height: 0.94;
        }

        .print-qr-copy > p:not(.print-qr-label) {
          max-width: 620px;
          margin: 0;
          color: ${MUTED};
          font-size: 17px;
          font-weight: 550;
          line-height: 1.58;
        }

        .print-qr-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .print-qr-primary,
        .print-qr-secondary {
          min-height: 54px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 15px 22px;
          border-radius: 999px;
          cursor: pointer;
          font-family: "Archivo", system-ui, sans-serif;
          font-size: 14px;
          font-weight: 850;
          letter-spacing: 0;
          line-height: 1.1;
          transition: transform 120ms cubic-bezier(0.22, 0.61, 0.36, 1),
                      opacity 120ms cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        .print-qr-primary {
          border: 1.5px solid ${INK};
          background: ${INK};
          color: ${BG};
        }

        .print-qr-secondary {
          border: 1.5px solid rgb(26 26 26 / 0.18);
          background: transparent;
          color: ${INK};
        }

        .print-qr-primary:hover,
        .print-qr-secondary:hover {
          transform: translateY(-1px);
        }

        .print-qr-primary:disabled {
          cursor: not-allowed;
          opacity: 0.62;
          transform: none;
        }

        .print-qr-print-note {
          max-width: 470px;
          margin: 12px 0 0;
          color: ${MUTED};
          font-size: 12px;
          font-weight: 650;
          line-height: 1.45;
        }

        .print-qr-tips {
          display: grid;
          gap: 10px;
          max-width: 520px;
          margin-top: 34px;
          padding: 0;
          list-style: none;
        }

        .print-qr-tips li {
          display: flex;
          gap: 10px;
          align-items: center;
          color: ${INK};
          font-size: 14px;
          font-weight: 700;
        }

        .print-qr-tips li::before {
          content: "";
          width: 7px;
          height: 7px;
          flex: 0 0 auto;
          border-radius: 999px;
          background: ${RED};
        }

        .print-qr-preview-wrap {
          display: flex;
          justify-content: center;
        }

        .print-card {
          width: min(100%, 420px);
          min-height: 595px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          position: relative;
          padding: 28px 24px 30px;
          overflow: hidden;
          border: 1px solid rgb(26 26 26 / 0.12);
          border-radius: 24px;
          background: ${BG};
          box-shadow: 0 24px 60px rgb(26 26 26 / 0.12);
          text-align: center;
        }

        .print-card::before {
          content: "";
          position: absolute;
          top: 24px;
          left: 24px;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: ${RED};
        }

        .print-card-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .print-card-qr {
          display: inline-flex;
          padding: 22px;
          border: 1px solid rgb(26 26 26 / 0.07);
          border-radius: 18px;
          background: ${PAPER};
          box-shadow: 0 8px 24px rgb(26 26 26 / 0.10);
        }

        .print-card-qr svg {
          display: block;
        }

        .print-card-main {
          max-width: 330px;
          margin: 0;
          color: ${INK};
          font-size: 25px;
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1.04;
        }

        .print-card-sub {
          margin: -7px 0 0;
          color: ${MUTED};
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
        }

        .print-card-app {
          margin: -4px 0 0;
          padding: 7px 12px;
          border-radius: 999px;
          background: ${FOREST};
          color: ${BG};
          font-size: 10px;
          font-weight: 850;
          line-height: 1;
        }

        .print-card-footer {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-top: auto;
        }

        .print-card-title {
          max-width: 330px;
          margin: 0;
          color: ${INK};
          font-family: "Playfair Display", Georgia, serif;
          font-size: 23px;
          font-weight: 800;
          line-height: 1.12;
        }

        .print-card-url {
          max-width: 100%;
          margin: 0;
          color: ${MUTED};
          font-size: 10px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .print-card-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgb(26 26 26 / 0.42);
          font-size: 8.5px;
          font-weight: 850;
          letter-spacing: 0.26em;
          text-transform: uppercase;
        }

        .print-card-brand span {
          width: 24px;
          height: 1px;
          background: rgb(26 26 26 / 0.20);
        }

        @media print {
          .no-print { display: none !important; }
          .print-qr-page {
            min-height: auto;
            padding: 0;
            background: ${BG};
          }
          .print-qr-shell,
          .print-qr-hero,
          .print-qr-preview-wrap {
            display: block;
            width: auto;
            margin: 0;
          }
          .print-card {
            width: auto;
            min-height: calc(148mm - 20mm);
            margin: 0;
            border: 0;
            border-radius: 0;
            box-shadow: none;
          }
        }

        @media (max-width: 860px) {
          .print-qr-hero {
            grid-template-columns: 1fr;
          }
          .print-qr-copy {
            padding-top: 0;
          }
          .print-qr-actions {
            flex-direction: column;
          }
          .print-qr-primary,
          .print-qr-secondary {
            width: 100%;
          }
        }

        @media (max-width: 420px) {
          .print-qr-page {
            padding: 22px 14px 56px;
          }
          .print-card {
            min-height: 560px;
            padding: 24px 18px 26px;
          }
          .print-card-qr {
            padding: 18px;
          }
          .print-card-qr svg {
            width: 218px;
            height: 218px;
          }
          .print-card-main {
            font-size: 23px;
          }
        }
      `}</style>

      <canvas
        ref={canvasRef}
        width={CARD_W}
        height={CARD_H}
        style={{ position: "fixed", left: -9999, top: 0, width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />

      <main className="print-qr-page">
        <div className="print-qr-shell">
          <section className="print-qr-hero" aria-labelledby="print-qr-title">
            <div className="print-qr-copy no-print">
              <p className="print-qr-label">Carte QR</p>
              <h1 id="print-qr-title">Préparer la carte de la soirée</h1>
              <p>
                Imprimez-la, posez-la à l&apos;entrée ou sur une table. Les invités scannent,
                capturent, puis reviennent au moment.
              </p>

              <div className="print-qr-actions">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="print-qr-primary"
                >
                  {isGenerating ? "Génération..." : "Télécharger la carte"}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="print-qr-secondary"
                >
                  Imprimer depuis le navigateur
                </button>
              </div>

              <p className="print-qr-print-note">
                Dans les options d&apos;impression, désactivez les en-têtes et pieds de page.
              </p>

              <ul className="print-qr-tips" aria-label="Conseils pour poser la carte QR">
                <li>Posez la carte à l&apos;entrée.</li>
                <li>Gardez le QR bien visible.</li>
                <li>Aucune app à installer.</li>
              </ul>
            </div>

            <div className="print-qr-preview-wrap">
              <div id="flaash-print-card" className="print-card">
                <div className="print-card-logo">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 350" width={88} height={66} style={{ display: "block" }}>
                    <g transform="translate(155 6)">
                      <path d="M86 8 L24 92 L66 92 L52 152 L132 60 L86 60 Z" fill={RED} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
                    </g>
                    <text x="235" y="335" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontWeight={900} fontSize={150} letterSpacing={-6} fill={INK}>
                      Fl<tspan fontStyle="italic" fontWeight={800}>aa</tspan>sh
                    </text>
                  </svg>
                  <p className="print-card-kicker">Carte QR de la soirée</p>
                </div>

                <div className="print-card-qr">
                  <QRCodeSVG value={eventUrl} size={240} bgColor={PAPER} fgColor={INK} level="M" />
                </div>

                <p className="print-card-main">Scannez. Capturez. Revenez à la soirée.</p>
                <p className="print-card-sub">Les souvenirs reviendront au reveal.</p>
                <p className="print-card-app">Aucune app à installer</p>

                <div className="print-card-footer">
                  <h2 className="print-card-title">{title}</h2>
                  <p className="print-card-url">{displayUrl}</p>
                  <div className="print-card-brand" aria-hidden="true">
                    <span />
                    Flaash
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
