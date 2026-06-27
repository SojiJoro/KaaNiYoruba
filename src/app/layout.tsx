import type { Metadata, Viewport } from "next";
import {
  Gentium_Book_Plus,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import { PwaSetup } from "@/components/PwaSetup";
import "./globals.css";

// Gentium renders Yorùbá tone marks beautifully — it is the display face for
// every Yorùbá word. IBM Plex Sans carries the UI; Plex Mono the numerals.
const gentium = Gentium_Book_Plus({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-gentium",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-plex-mono",
  display: "swap",
});

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
  themeColor: "#25307A",
};

// Applies the persisted theme, palette, and pattern intensity before first
// paint to avoid a flash. Falls back to the legacy kaa-theme key, then the
// system color scheme.
const themeInit = `(function(){try{var s={};try{s=JSON.parse(localStorage.getItem("kaa-settings-v2"))||{}}catch(e){}var d=s.dark;if(d===undefined){var t=localStorage.getItem("kaa-theme");d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches}var r=document.documentElement;r.dataset.theme=d?"dark":"light";r.dataset.palette=s.palette||"adire";var p=typeof s.pattern==="number"?s.pattern:40;r.style.setProperty("--pattern-opacity",String((p/100)*(d?0.6:1)))}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="yo"
      suppressHydrationWarning
      className={`${gentium.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="antialiased">
        <PwaSetup />
        {children}
      </body>
    </html>
  );
}
