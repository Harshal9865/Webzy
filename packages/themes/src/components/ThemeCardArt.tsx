'use client';

import React from 'react';
import type { ThemeManifest } from '../schema';

interface ThemeCardArtProps {
  theme: ThemeManifest;
}

export function ThemeCardArt({ theme }: ThemeCardArtProps) {
  const { primary, secondary, surface, ink } = theme.palette;

  return (
    <div
      className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-black/5 p-4"
      style={{
        background: `linear-gradient(150deg, ${surface} 0%, #ffffff 100%)`,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
        style={{ backgroundColor: secondary }}
      />
      <div
        className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full opacity-15"
        style={{ backgroundColor: primary }}
      />

      <div className="relative flex h-full flex-col justify-between rounded-xl border border-black/5 bg-white/90 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-block h-2.5 w-12 rounded-full"
            style={{ backgroundColor: primary }}
          />
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: primary }}
          >
            {theme.occasion}
          </span>
        </div>

        <div className="my-auto py-2">
          <p className="line-clamp-1 font-heading text-sm font-bold" style={{ color: ink }}>
            {theme.demoData.headline.hinglish}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug" style={{ color: `${ink}B3` }}>
            {theme.demoData.message.hinglish}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primary }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: secondary }} />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFE8EF]" />
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: surface, color: primary }}
          >
            Tap to open
          </span>
        </div>
      </div>
    </div>
  );
}
