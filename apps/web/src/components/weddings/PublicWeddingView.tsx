'use client';

import React, { useEffect, useState } from 'react';
import { WeddingScroll, type WeddingInvitation, type WeddingLanguage } from '@webzy/themes';

interface PublicWeddingViewProps {
  initialData: WeddingInvitation;
  slug: string;
  guestName?: string | null;
  initialLang?: WeddingLanguage;
}

export function PublicWeddingView({
  initialData,
  slug,
  guestName,
  initialLang,
}: PublicWeddingViewProps) {
  const [data, setData] = useState<WeddingInvitation>(() =>
    initialLang ? { ...initialData, language: initialLang } : initialData,
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`webzy_wedding_published_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved) as WeddingInvitation;
        if (parsed && parsed.brideName && parsed.groomName) {
          setData(initialLang ? { ...parsed, language: initialLang } : parsed);
        }
      }
    } catch {
      // Ignore storage read errors and keep initialData
    }
  }, [slug, initialLang]);

  return <WeddingScroll data={data} guestName={guestName} />;
}
