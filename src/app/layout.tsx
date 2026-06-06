import type { Metadata, Viewport } from 'next';
import { Crimson_Pro, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

const crimson = Crimson_Pro({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Káà — Yoruba Number & Calculator',
  description:
    'A calculator that teaches Yoruba counting logic. Every number shown in proper Yoruba with diacritics, alongside Arabic numerals.',
  applicationName: 'Káà',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAF7F0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="yo" suppressHydrationWarning>
      <body className={`${inter.variable} ${crimson.variable} font-sans antialiased bg-paper text-cocoa dark:bg-cocoa-dark dark:text-cream transition-colors`}>
        {children}
      </body>
    </html>
  );
}
