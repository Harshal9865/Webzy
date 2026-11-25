import type { Metadata } from 'next';
import { Fraunces, Noto_Sans_Devanagari, Plus_Jakarta_Sans } from 'next/font/google';
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
  title: 'Webzy Admin (Internal)',
  description: 'Protected internal operations console for Webzy.',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${notoSansDevanagari.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-[#FAF8F6] text-webzy-ink antialiased">
        {children}
      </body>
    </html>
  );
}
