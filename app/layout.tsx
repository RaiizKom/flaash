import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flaash — L'appareil photo jetable de votre événement",
  description:
    "Vos invités scannent un QR code, prennent leurs photos depuis leur navigateur, et découvrent les souvenirs dans une galerie privée. Zéro app à installer.",
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
