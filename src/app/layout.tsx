import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kàá — Yoruba Number & Calculator",
  description:
    "A calculator that teaches Yoruba counting logic. Every number shown in proper Yoruba with diacritics, alongside Arabic numerals.",
  applicationName: "Kàá",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F5132",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="yo" suppressHydrationWarning>
      <body className="bg-background font-sans text-text-dark antialiased">
        {children}
      </body>
    </html>
  );
}
