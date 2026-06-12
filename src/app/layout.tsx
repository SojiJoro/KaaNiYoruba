import type { Metadata, Viewport } from "next";
import { PwaSetup } from "@/components/PwaSetup";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kàá — Yoruba Number & Calculator",
  description:
    "A calculator that teaches Yoruba counting logic. Every number shown in proper Yoruba with diacritics, alongside Arabic numerals.",
  applicationName: "Kàá",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Kàá — Yorùbá Number & Calculator",
    description:
      "Count, calculate, and learn in real Yorùbá. Traditional vigesimal and modern counting, with the Yorùbá words as the primary display.",
    type: "website",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F5132",
};

// Applies the persisted (or system) theme before first paint to avoid a flash.
const themeInit = `(function(){try{var t=localStorage.getItem("kaa-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="yo" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-background font-sans text-text-dark antialiased">
        <PwaSetup />
        {children}
      </body>
    </html>
  );
}
