'use client';

import React from 'react';
import { getStorefrontCopy } from '@webzy/core';
import { useLanguage } from './LanguageProvider';

interface WhatsAppHelpButtonProps {
  whatsappPhone: string;
}

export function WhatsAppHelpButton({ whatsappPhone }: WhatsAppHelpButtonProps) {
  const { language } = useLanguage();
  const copy = getStorefrontCopy(language);
  const digits = whatsappPhone.replace(/\D/g, '') || '919800000000';
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
    'Hi Webzy team, mujhe ek Webzy link banana hai. Please help.',
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={copy.whatsappHelpLabel}
      title={copy.whatsappHelpLabel}
      className="fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#15803D] text-sm font-bold text-white shadow-lg transition hover:bg-[#166534] sm:bottom-6 sm:right-6 sm:h-auto sm:min-h-[48px] sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5"
    >
      <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.177.181-.076.355.101.173.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
      </svg>
      <span className="hidden sm:inline">{copy.whatsappHelpLabel}</span>
    </a>
  );
}
