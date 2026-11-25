'use client';

import React from 'react';
import type { WeddingIconKey, WeddingThemeKey } from '../schema';
import { getWeddingThemePalette } from '../themePalettes';

interface DividerProps {
  theme?: WeddingThemeKey;
  className?: string;
}

/**
 * Refined Heritage / Botanical Gold Filigree Section Divider
 */
export function RoyalFlourishDivider({ theme = 'emerald', className = '' }: DividerProps) {
  const pal = getWeddingThemePalette(theme);
  const accent = pal.goldStroke;
  const secondary = pal.secondaryOrnamentHex;

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span
        className="h-[1px] w-12 sm:w-16"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent})`,
        }}
      />
      <svg className="h-5 w-10 shrink-0" viewBox="0 0 64 28" fill="none">
        <path
          d="M32 3 C35 10, 42 12, 48 14 C42 16, 35 18, 32 25 C29 18, 22 16, 16 14 C22 12, 29 10, 32 3 Z"
          fill={accent}
          fillOpacity="0.18"
          stroke={accent}
          strokeWidth="1.2"
        />
        <circle cx="32" cy="14" r="2.2" fill={secondary} />
        <path
          d="M6 14 C10 10, 14 10, 16 14 C14 18, 10 18, 6 14 Z"
          stroke={accent}
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M58 14 C54 10, 50 10, 48 14 C50 18, 54 18, 58 14 Z"
          stroke={accent}
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <span
        className="h-[1px] w-12 sm:w-16"
        style={{
          background: `linear-gradient(270deg, transparent, ${accent})`,
        }}
      />
    </div>
  );
}

/**
 * Heritage Palace Crest SVG for Destination Venue Showcase
 */
export function PalaceCrestIcon({ className = 'h-12 w-12', color = '#C5A059' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* Kalash Pinnacle */}
      <circle cx="32" cy="8" r="2.2" fill={color} />
      <path d="M32 10.5 L32 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Central Onion Dome */}
      <path
        d="M19 29 C19 19, 27 15, 32 13 C37 15, 45 19, 45 29 Z"
        fill={color}
        fillOpacity="0.14"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Side Chhatri Domes */}
      <path
        d="M9 34 C9 28, 13 26, 16 25 C19 26, 22 28, 22 34 Z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="1.2"
      />
      <path
        d="M42 34 C42 28, 45 26, 48 25 C51 26, 55 28, 55 34 Z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="1.2"
      />
      {/* Cornice Line */}
      <path d="M7 34 L57 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Cusped Central Arch */}
      <path
        d="M24 52 L24 41 C24 37.5, 28.5 36.5, 32 34.5 C35.5 36.5, 40 37.5, 40 41 L40 52"
        stroke={color}
        strokeWidth="1.5"
        fill={color}
        fillOpacity="0.08"
      />
      {/* Side Pillars */}
      <path d="M12 34 L12 52 M19 34 L19 52 M45 34 L45 52 M52 34 L52 52" stroke={color} strokeWidth="1.3" />
      {/* Marble Plinth */}
      <path d="M6 52 L58 52 M9 56 L55 56" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Refined Cultural Indian Ceremony Line Icons
 */
export function CeremonyIcon({
  iconKey,
  className = 'h-5 w-5',
  color = 'currentColor',
}: {
  iconKey: WeddingIconKey;
  className?: string;
  color?: string;
}) {
  switch (iconKey) {
    case 'ganesha':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.5 0 4.5 1.8 4.5 4.2 0 1.4-.6 2.5-1.5 3.3 1.4.8 2.2 2.2 2.2 3.8 0 2.6-2.1 4.7-4.8 4.7-1.6 0-2.6-.7-3.1-1.6-.4-.7-.2-1.6.5-1.9.7-.3 1.5.1 1.7.8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.2C7.5 4.8 9.5 3 12 3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.5c-1.4.5-2 2-1.5 3.4.4 1.1 1.4 1.8 2.5 1.9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9.5c1.4.5 2 2 1.5 3.4-.4 1.1-1.4 1.8-2.5 1.9" />
          <circle cx="12" cy="6.8" r="0.8" fill={color} />
        </svg>
      );
    case 'haldi':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          {/* Marigold / Sun Mandala */}
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"
          />
          <circle cx="12" cy="12" r="1.4" fill={color} />
        </svg>
      );
    case 'mehendi':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          {/* Ornate Paisley / Lotus Motif */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3C15.5 7 18 10.5 18 14a6 6 0 11-12 0c0-3.5 2.5-7 6-11z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.5c1.8 2 3 3.8 3 5.5a3 3 0 11-6 0c0-1.7 1.2-3.5 3-5.5z" />
          <circle cx="12" cy="14" r="1" fill={color} />
        </svg>
      );
    case 'sangeet':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5.5l11-2.5v12.5" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="17.5" cy="15.5" r="2.5" />
          <path strokeLinecap="round" d="M9 9.5l11-2.5" />
        </svg>
      );
    case 'pheras':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          {/* Sacred Agni Kund Flame */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.8 3.2 5 6.2 5 9.2A5 5 0 017 12.2C7 9.2 9.2 6.2 12 3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9.2c1.2 1.4 2.1 2.7 2.1 4a2.1 2.1 0 11-4.2 0c0-1.3.9-2.6 2.1-4z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 19h14M7 21h10" />
        </svg>
      );
    case 'cocktail':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14l-7 8.5L5 4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.5V20M8.5 20h7" />
        </svg>
      );
    case 'ring_ceremony':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          <circle cx="9.5" cy="13.5" r="5" />
          <circle cx="14.5" cy="13.5" r="5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5l1.5 2.5-1.5 1.5L10.5 7 12 4.5z" />
        </svg>
      );
    case 'church':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v5M9.5 5.5h5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l7-5 7 5v8H5v-8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 21v-4a2 2 0 114 0v4" />
        </svg>
      );
    case 'toast':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h4l-.8 7a2.5 2.5 0 01-2.5 2.2A2.5 2.5 0 015.2 10L4.5 3H7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.7 12.2V20M5.5 20h4.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4l-.7 7a2.5 2.5 0 01-2.5 2.2A2.5 2.5 0 0113.3 10L12.5 3H15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.8 12.2V20M13.5 20h4.5" />
        </svg>
      );
    case 'reception':
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
          {/* Chandelier / Royal Celebration */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M7 11c0-2.5 2.2-4 5-4s5 1.5 5 4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h16M6 13v2a6 6 0 0012 0v-2" />
          <path strokeLinecap="round" d="M12 19v2M9 21h6" />
        </svg>
      );
  }
}
