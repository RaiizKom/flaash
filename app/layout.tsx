import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flaash — Capture l'instant.",
  description:
    "Une galerie photo partagée pour vos événements. Pas d'application, pas de friction — juste un QR code.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Flaash",
    description: "Capture l'instant.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF7F2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
    >
      <body className="min-h-dvh">
        {children}
      </body>
    </html>
  );
}
