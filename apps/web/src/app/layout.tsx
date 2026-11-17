import type { Metadata } from 'next';
import { Fraunces, Noto_Sans_Devanagari, Plus_Jakarta_Sans } from 'next/font/google';
import { getWebzyPublicConfig } from '@webzy/core';
import { LanguageProvider } from '../components/shell/LanguageProvider';
import { StorefrontChrome } from '../components/shell/StorefrontChrome';
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
  const config = getWebzyPublicConfig();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${notoSansDevanagari.variable}`}
    >
      <body suppressHydrationWarning className="flex min-h-screen flex-col bg-white text-webzy-ink antialiased">
        <LanguageProvider>
          <StorefrontChrome config={config}>{children}</StorefrontChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
