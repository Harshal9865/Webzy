import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  Fraunces,
  Noto_Sans_Devanagari,
  Noto_Serif_Gujarati,
  Pinyon_Script,
  Plus_Jakarta_Sans,
} from 'next/font/google';
import { getWebzyPublicConfig } from '@webzy/core';
import { AuthProvider } from '../components/auth/AuthProvider';
import { LanguageProvider } from '../components/shell/LanguageProvider';
import { OrdersCountProvider } from '../components/shell/OrdersCountProvider';
import { StorefrontChrome } from '../components/shell/StorefrontChrome';
import { ensureWeddingArtSynced } from '../lib/syncWeddingArt';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pinyon',
  display: 'swap',
});

const notoSerifGujarati = Noto_Serif_Gujarati({
  subsets: ['gujarati'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-gujarati',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Webzy — Turn your feelings into a shareable link',
  description:
    'Easy as a WhatsApp message, special as a handmade gift. Pick an occasion, preview, and share a link in minutes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  ensureWeddingArtSynced();
  const config = getWebzyPublicConfig();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${notoSansDevanagari.variable} ${cormorantGaramond.variable} ${pinyonScript.variable} ${notoSerifGujarati.variable}`}
    >
      <body suppressHydrationWarning className="flex min-h-screen flex-col bg-white text-webzy-ink antialiased">
        <LanguageProvider>
          <AuthProvider>
            <OrdersCountProvider>
              <StorefrontChrome config={config}>{children}</StorefrontChrome>
            </OrdersCountProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
