import type { Metadata } from 'next';
import {
  Bebas_Neue,
  Bricolage_Grotesque,
  Caveat,
  Cormorant_Garamond,
  Fraunces,
  Fredoka,
  Instrument_Serif,
  Newsreader,
  Noto_Sans_Devanagari,
  Noto_Serif_Gujarati,
  Pinyon_Script,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Silkscreen,
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
  preload: false,
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
});

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pinyon',
  display: 'swap',
  preload: false,
});

const notoSerifGujarati = Noto_Serif_Gujarati({
  subsets: ['gujarati'],
  variable: '--font-gujarati',
  display: 'swap',
  preload: false,
});

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  preload: false,
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
  preload: false,
});

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  display: 'swap',
  preload: false,
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
  preload: false,
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
  preload: false,
});

const silkscreen = Silkscreen({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pixel',
  display: 'swap',
  preload: false,
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false,
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
  preload: false,
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
  if (process.env.NODE_ENV !== 'production') {
    ensureWeddingArtSynced();
  }
  const config = getWebzyPublicConfig();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${notoSansDevanagari.variable} ${cormorantGaramond.variable} ${pinyonScript.variable} ${notoSerifGujarati.variable} ${bricolageGrotesque.variable} ${caveat.variable} ${fredoka.variable} ${instrumentSerif.variable} ${newsreader.variable} ${silkscreen.variable} ${playfairDisplay.variable} ${bebasNeue.variable}`}
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
