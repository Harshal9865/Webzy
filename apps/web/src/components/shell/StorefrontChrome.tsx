'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import type { WebzyPublicConfig } from '@webzy/core';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { WhatsAppHelpButton } from './WhatsAppHelpButton';

interface StorefrontChromeProps {
  config: WebzyPublicConfig;
  children: React.ReactNode;
}

export function StorefrontChrome({ config, children }: StorefrontChromeProps) {
  const pathname = usePathname();
  const isReceiverView = pathname?.startsWith('/s/');

  if (isReceiverView) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <SiteHeader config={config} />
      <main className="flex-1">{children}</main>
      <SiteFooter config={config} />
      <WhatsAppHelpButton whatsappPhone={config.business.supportWhatsapp} />
    </>
  );
}
