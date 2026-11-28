'use client';

import type React from 'react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { type CoreLanguageCode, type LanguageCode, pickLocalizedText, toCoreLanguageCode } from '@webzy/core';
import { getWebzyFooterLabel, type OccasionSiteProps } from './shared/OccasionPrimitives';
import { SerendipityInkReveal } from './travel/SerendipityInkReveal';

export type TravelThemeVariant = 'serendipity' | 'atlas' | 'capsule';

const ATLAS_KEYWORDS = ['atlas', 'editorial', 'magazine', 'destinations', 'europe', 'world'];
const CAPSULE_KEYWORDS = ['capsule', 'flight', 'boarding', 'night', 'obsidian', 'dark', 'aviation'];

/** Deterministically maps buyer style / relation field to one of 3 cohesive travel moods. */
export function resolveTravelTheme(relation?: string): TravelThemeVariant {
  const normalized = (relation ?? '').trim().toLowerCase();
  if (!normalized) return 'serendipity';
  for (const kw of CAPSULE_KEYWORDS) {
    if (normalized.includes(kw)) return 'capsule';
  }
  for (const kw of ATLAS_KEYWORDS) {
    if (normalized.includes(kw)) return 'atlas';
  }
  return 'serendipity';
}

interface HeroSliceItem {
  id: string;
  voyageLetter: string;
  cityLetter: string;
  city: string;
  region: string;
  coordinates: string;
  season: string;
  tagline: string;
  src: string;
  fallbackGradient: string;
  atlasId?: string;
}

const HERO_SLICES: readonly HeroSliceItem[] = [
  {
    id: 'slice-jaipur',
    voyageLetter: 'V',
    cityLetter: 'J',
    city: 'Jaipur',
    region: 'Rajasthan, India',
    coordinates: '26.91° N · 75.78° E',
    season: 'Oct — Mar',
    tagline: 'Sandstone lattices, lotus arches & twilight silhouettes over Jal Mahal',
    src: '/templates/travel/jaipur-slices.jpg',
    fallbackGradient: 'linear-gradient(180deg, #273D52 0%, #C66A43 60%, #3E241E 100%)',
    atlasId: 'jaipur',
  },
  {
    id: 'slice-tokyo',
    voyageLetter: 'O',
    cityLetter: 'T',
    city: 'Tokyo',
    region: 'Kanto, Japan',
    coordinates: '35.67° N · 139.65° E',
    season: 'Mar — May',
    tagline: 'Lantern-lit shrine eaves framed against Mount Fuji at amber dusk',
    src: '/templates/travel/tokyo-fuji.jpg',
    fallbackGradient: 'linear-gradient(180deg, #1E3E5D 0%, #D98C5E 58%, #211B2E 100%)',
    atlasId: 'tokyo',
  },
  {
    id: 'slice-procida',
    voyageLetter: 'Y',
    cityLetter: 'P',
    city: 'Procida',
    region: 'Bay of Naples, Italy',
    coordinates: '40.76° N · 14.01° E',
    season: 'May — Sep',
    tagline: 'Pastel fishermen facades, quiet cobblestone alleys & slow harbor light',
    src: '/templates/cafe/rose-cottage.jpg',
    fallbackGradient: 'linear-gradient(180deg, #4F88B6 0%, #E7C389 55%, #1D4B5D 100%)',
    atlasId: 'procida',
  },
  {
    id: 'slice-spain',
    voyageLetter: 'A',
    cityLetter: 'S',
    city: 'Tossa de Mar',
    region: 'Costa Brava, Spain',
    coordinates: '41.72° N · 2.93° E',
    season: 'Jun — Sep',
    tagline: 'Pine-clad cliffs, turquoise coves & terracotta fortress roofs by the sea',
    src: '/templates/travel/spain-coast.jpg',
    fallbackGradient: 'linear-gradient(180deg, #2D6E82 0%, #C97648 64%, #3D281D 100%)',
    atlasId: 'spain',
  },
  {
    id: 'slice-paris',
    voyageLetter: 'G',
    cityLetter: 'F',
    city: 'Paris',
    region: 'Ile-de-France, France',
    coordinates: '48.85° N · 2.35° E',
    season: 'Apr — Jun',
    tagline: 'Cream climbing roses and golden ironwork overlooking the evening skyline',
    src: '/templates/travel/paris-balcony.jpg',
    fallbackGradient: 'linear-gradient(180deg, #4B6A90 0%, #E6B56A 58%, #26231F 100%)',
    atlasId: 'paris',
  },
  {
    id: 'slice-rome',
    voyageLetter: 'E',
    cityLetter: 'R',
    city: 'Twilight Skyline',
    region: 'Evening Passage',
    coordinates: '40.74° N · 73.98° W',
    season: 'Apr — Oct',
    tagline: 'Amber apartment windows glowing across city rooftops under twilight clouds',
    src: '/templates/occasions/upgrades/city-window-dusk.jpg',
    fallbackGradient: 'linear-gradient(180deg, #162442 0%, #C89328 55%, #1E1714 100%)',
    atlasId: 'procida',
  },
];

interface ItineraryDay {
  day: string;
  timeOfDay: string;
  title: string;
  detail: string;
  highlight: string;
}

interface AtlasDestination {
  id: string;
  tabLabel: string;
  displayWord: string;
  regionLabel: string;
  coordinates: string;
  backdropSrc: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  flightNo: string;
  seat: string;
  gate: string;
  cabinClass: string;
  daysToDeparture: number;
  duration: string;
  bestFor: string;
  summary: string;
  itinerary: readonly ItineraryDay[];
}

const ATLAS_DESTINATIONS: readonly AtlasDestination[] = [
  {
    id: 'jaipur',
    tabLabel: 'Jaipur',
    displayWord: 'JAIPUR',
    regionLabel: 'RAJASTHAN · ROYAL HERITAGE CIRCUIT',
    coordinates: '26.9124° N · 75.7873° E',
    backdropSrc: '/templates/travel/jaipur-slices.jpg',
    originCode: 'BOM',
    originCity: 'Mumbai',
    destCode: 'JAI',
    destCity: 'Jaipur',
    flightNo: 'WZ-108',
    seat: '14A',
    gate: 'T2-07',
    cabinClass: 'Atelier First',
    daysToDeparture: 12,
    duration: '01h 55m',
    bestFor: 'Heritage Architecture & Golden Hour',
    summary:
      'Step through rose-tinted palace gates at sunrise, wander block-print ateliers in Bagru, and watch flocks cross amber waters at dusk.',
    itinerary: [
      {
        day: 'Day 01',
        timeOfDay: 'Dawn & Dusk',
        title: 'Hawa Mahal Lattice Walk & Patrika Gate',
        detail:
          'Early-morning architectural walk before city traffic, followed by spiced chai on a rooftop overlooking Jantar Mantar and sunset reflection views at Jal Mahal.',
        highlight: 'Private Courtyard High Tea',
      },
      {
        day: 'Day 02',
        timeOfDay: 'Morning to Twilight',
        title: 'Amber Fort Ramparts & Hand-Block Textile Studio',
        detail:
          'Ascend the sandstone bastions with a conservation historian, then print your own indigo-and-madder linen scarf alongside fourth-generation artisans.',
        highlight: 'Bespoke Indigo Workshop',
      },
      {
        day: 'Day 03',
        timeOfDay: 'Golden Hour',
        title: 'Nahargarh Ridge Lantern Dinner',
        detail:
          'Curated slow morning through Johari Bazaar brass workshops, culminating in a private candlelit Rajasthani thali above the glowing Pink City skyline.',
        highlight: 'Hilltop Candlelight Tasting',
      },
    ],
  },
  {
    id: 'tokyo',
    tabLabel: 'Tokyo',
    displayWord: 'TOKYO',
    regionLabel: 'JAPAN · TRADITION MEETS TOMORROW',
    coordinates: '35.6762° N · 139.6503° E',
    backdropSrc: '/templates/travel/tokyo-fuji.jpg',
    originCode: 'DEL',
    originCity: 'New Delhi',
    destCode: 'NRT',
    destCity: 'Tokyo',
    flightNo: 'WZ-786',
    seat: '14A',
    gate: 'T3-42',
    cabinClass: 'Horizon Suite',
    daysToDeparture: 18,
    duration: '07h 40m',
    bestFor: 'Culinary Craft, Shrines & Horizon Views',
    summary:
      'Quiet cedar shrines at dawn, pour-over coffee rooms tucked into Yanaka alleys, and Mount Fuji silhouetted beyond the evening city glow.',
    itinerary: [
      {
        day: 'Day 01',
        timeOfDay: 'Early Morning',
        title: 'Asakusa Cedar Incense & Sumida River Cruise',
        detail:
          'Cross Senso-ji before the lanterns dim, browse handmade washi paper stationery shops, and glide south past Hamarikyu coastal gardens.',
        highlight: 'Matcha Tea Pavilion',
      },
      {
        day: 'Day 02',
        timeOfDay: 'Afternoon to Dusk',
        title: 'Aoyama Design Galleries & Fuji Twilight Deck',
        detail:
          'Explore minimalist timber architecture in Minami-Aoyama before ascending to a panoramic sunset lounge facing Tokyo Tower and snow-capped Fuji.',
        highlight: 'Sunset Skyline Table',
      },
      {
        day: 'Day 03',
        timeOfDay: 'Evening',
        title: 'Daikanyama Vinyl Cafes & Omakase Counter',
        detail:
          'Unrushed neighborhood stroll through independent bookshops and ceramics studios, closing with an intimate eight-seat seasonal tasting menu.',
        highlight: '8-Seat Chef Counter',
      },
    ],
  },
  {
    id: 'procida',
    tabLabel: 'Amalfi & Procida',
    displayWord: 'ITALY',
    regionLabel: 'BAY OF NAPLES · ISLAND ESCAPES',
    coordinates: '40.7610° N · 14.0189° E',
    backdropSrc: '/templates/cafe/rose-cottage.jpg',
    originCode: 'DEL',
    originCity: 'New Delhi',
    destCode: 'NAP',
    destCity: 'Naples',
    flightNo: 'WZ-409',
    seat: '09F',
    gate: 'B-14',
    cabinClass: 'Riviera Club',
    daysToDeparture: 24,
    duration: '08h 35m',
    bestFor: 'Pastel Harbors & Wooden Boat Coves',
    summary:
      'Drift across cerulean water into Marina Corricella where ochre and rose houses stack toward hilltop abbey bells and lemon groves.',
    itinerary: [
      {
        day: 'Day 01',
        timeOfDay: 'Midday',
        title: 'Hydrofoil Arrival & Marina Corricella Promenade',
        detail:
          'Step off the ferry onto car-free harbor stones for freshly baked lingua di bue pastry and chilled lemon granita beside moored fishing skiffs.',
        highlight: 'Harborfront Espresso',
      },
      {
        day: 'Day 02',
        timeOfDay: 'All Day',
        title: 'Classic Wooden Gozzo Charter Around Ischia & Positano',
        detail:
          'Drop anchor inside emerald volcanic grottoes with a private skipper, swimming beneath dramatic limestone cliffs and lingering over coastal antipasti.',
        highlight: 'Private Gozzo Sail',
      },
      {
        day: 'Day 03',
        timeOfDay: 'Sunset',
        title: 'Terra Murata Citadel & Cliffside Aperitivo',
        detail:
          'Climb to the medieval walled acropolis for sweeping views over Vesuvius and the Tyrrhenian Sea as church bells mark golden hour.',
        highlight: 'Abbey Terrace Aperitivo',
      },
    ],
  },
  {
    id: 'spain',
    tabLabel: 'Costa Brava',
    displayWord: 'SPAIN',
    regionLabel: 'CATALONIA · TOSSA DE MAR COAST',
    coordinates: '41.7197° N · 2.9308° E',
    backdropSrc: '/templates/travel/spain-coast.jpg',
    originCode: 'BOM',
    originCity: 'Mumbai',
    destCode: 'BCN',
    destCity: 'Barcelona',
    flightNo: 'WZ-512',
    seat: '06A',
    gate: 'A-19',
    cabinClass: 'Solstice Class',
    daysToDeparture: 31,
    duration: '09h 15m',
    bestFor: 'Coastal Trails & Medieval Fortresses',
    summary:
      'Follow aromatic Mediterranean pine paths along rugged red-rock coves into Vila Vella, the only fortified medieval town still guarding the Catalan coast.',
    itinerary: [
      {
        day: 'Day 01',
        timeOfDay: 'Afternoon',
        title: 'Vila Vella Ramparts & Lighthouse Terrace',
        detail:
          'Trace twelfth-century stone turrets above Platja Gran before descending into cobbled lanes draped with bougainvillea and ceramic studios.',
        highlight: 'Lighthouse Sea Overlook',
      },
      {
        day: 'Day 02',
        timeOfDay: 'Morning to Sunset',
        title: 'Cami de Ronda Cliff Trail & Cala Pola Swim',
        detail:
          'Walk the scenic coastal footpath scented with wild rosemary to hidden aquamarine bays, followed by wood-fired seafood paella by the shore.',
        highlight: 'Secret Cove Picnic',
      },
      {
        day: 'Day 03',
        timeOfDay: 'Evening',
        title: 'Emporda Vineyard Tasting & Twilight Harbor',
        detail:
          'Venture slightly inland to stone hilltop villages and olive estates, returning to Tossa de Mar as terracotta roofs glow beneath the stars.',
        highlight: 'Stone Estate Olive Press',
      },
    ],
  },
  {
    id: 'paris',
    tabLabel: 'Paris',
    displayWord: 'PARIS',
    regionLabel: 'FRANCE · BALCONIES & GOLDEN LIGHT',
    coordinates: '48.8566° N · 2.3522° E',
    backdropSrc: '/templates/travel/paris-balcony.jpg',
    originCode: 'DEL',
    originCity: 'New Delhi',
    destCode: 'CDG',
    destCity: 'Paris',
    flightNo: 'WZ-318',
    seat: '11K',
    gate: 'E-26',
    cabinClass: 'Salon Premier',
    daysToDeparture: 9,
    duration: '08h 50m',
    bestFor: 'Slow Boulevards, Art Salons & Patisserie',
    summary:
      'Wake to warm butter croissants on a rose-framed Haussmann balcony, wander hidden bookbinders along the Left Bank, and watch evening light gild the Seine.',
    itinerary: [
      {
        day: 'Day 01',
        timeOfDay: 'Morning',
        title: 'Saint-Germain Courtyards & Antique Prints',
        detail:
          'Browse centuries-old map sellers along the Seine quays and pause at a marble-topped corner cafe with flaky pain au chocolat.',
        highlight: 'Left Bank Print Curating',
      },
      {
        day: 'Day 02',
        timeOfDay: 'Afternoon to Dusk',
        title: 'Private Marais Sculpture Gardens & Balcony Golden Hour',
        detail:
          'Step inside quiet seventeenth-century courtyard museums before returning to rose-lined wrought iron balconies as the Eiffel silhouette illuminates.',
        highlight: 'Golden-Hour Balcony Salon',
      },
      {
        day: 'Day 03',
        timeOfDay: 'Evening',
        title: 'Palais Royal Arcades & Candlelit Bistro',
        detail:
          'Collect artisanal perfumery in sunlit stone colonnades and savor a relaxed seasonal dinner down a lantern-lit cobblestone lane.',
        highlight: 'Bespoke Scent Atelier',
      },
    ],
  },
];

interface WindowPortalOption {
  id: string;
  label: string;
  shortLabel: string;
  src: string;
  telemetryLeft: string;
  telemetryRight: string;
  poeticLine: string;
  frameStyle: 'aircraft' | 'train' | 'arch';
}

const WINDOW_PORTALS: readonly WindowPortalOption[] = [
  {
    id: 'flight-14a',
    label: 'Flight 14A · Above the Clouds',
    shortLabel: 'Flight 14A',
    src: '/templates/travel/airplane-window.jpg',
    telemetryLeft: 'ALT 38,000 FT · MACH 0.84',
    telemetryRight: 'SEAT 14A · GOLDEN HORIZON',
    poeticLine: 'Amber cloud decks stretching endlessly beneath the wingtip at dusk.',
    frameStyle: 'aircraft',
  },
  {
    id: 'alpine-express',
    label: 'Alpine Express · Golden Valley',
    shortLabel: 'Alpine Express',
    src: '/templates/travel/train-window.jpg',
    telemetryLeft: 'COACH 04 · 112 KM/H',
    telemetryRight: 'VALLEY PASS · LATE SUN',
    poeticLine: 'Sunlit mountain ridges and grazing pastures streaming softly past warm teak glass.',
    frameStyle: 'train',
  },
  {
    id: 'ocean-arch',
    label: 'Lost in Wonder · Ocean Arch',
    shortLabel: 'Ocean Arch',
    src: '/templates/occasions/upgrades/stained-glass-gate.jpg',
    telemetryLeft: 'COASTAL TUNNEL · CLEAR SKY',
    telemetryRight: 'CALM TIDE · 22° C',
    poeticLine: 'A quiet concrete frame opening directly onto towering cumulus clouds and open sea.',
    frameStyle: 'arch',
  },
];

interface PostageStampItem {
  id: string;
  country: string;
  city: string;
  denomination: string;
  year: string;
  coordinates: string;
  src: string;
  bgTint: string;
  stampInk: string;
  memoryTitle: string;
  memoryNote: string;
  postmarkCode: string;
  tiltClass: string;
}

const POSTAGE_STAMPS: readonly PostageStampItem[] = [
  {
    id: 'stamp-jaipur',
    country: 'INDIA POST',
    city: 'JAIPUR',
    denomination: '50 INR',
    year: '2026',
    coordinates: '26.91° N · 75.78° E',
    src: '/templates/travel/jaipur-slices.jpg',
    bgTint: '#F4DFC8',
    stampInk: '#7E2B22',
    memoryTitle: 'Birds Over Jal Mahal',
    memoryNote:
      'Every doorway here is hand-painted like a jewel box. At six in the evening the lake turns to liquid copper while flocks cross the sandstone horizon.',
    postmarkCode: 'JAI · 302002',
    tiltClass: '-rotate-2',
  },
  {
    id: 'stamp-tokyo',
    country: 'NIPPON',
    city: 'TOKYO',
    denomination: '120 YEN',
    year: '2026',
    coordinates: '35.67° N · 139.65° E',
    src: '/templates/travel/tokyo-fuji.jpg',
    bgTint: '#DCE7F3',
    stampInk: '#1A3454',
    memoryTitle: 'Sakura & Fuji Dusk',
    memoryNote:
      'Between cedar temple eaves and neon towers, the city falls remarkably hushed the exact minute Mount Fuji catches the last pink cloud.',
    postmarkCode: 'TYO · 100-00',
    tiltClass: 'rotate-1',
  },
  {
    id: 'stamp-italia',
    country: 'ITALIA',
    city: 'PROCIDA',
    denomination: '1.25 EUR',
    year: '2026',
    coordinates: '40.76° N · 14.01° E',
    src: '/templates/cafe/rose-cottage.jpg',
    bgTint: '#E8E3D5',
    stampInk: '#284A73',
    memoryTitle: 'Sunlit Rose Courtyard',
    memoryNote:
      'Morning espresso beside whitewashed stone walls draped in crimson climbing roses. Nobody hurries here; even the afternoon ferry sounds gentle.',
    postmarkCode: 'NAP · 80079',
    tiltClass: '-rotate-1',
  },
  {
    id: 'stamp-spain',
    country: 'ESPANA',
    city: 'COSTA BRAVA',
    denomination: '1.60 EUR',
    year: '2026',
    coordinates: '41.72° N · 2.93° E',
    src: '/templates/travel/spain-coast.jpg',
    bgTint: '#F3E4D5',
    stampInk: '#8C3F23',
    memoryTitle: 'Terracotta Cove Morning',
    memoryNote:
      'Wild rosemary on the cliff trail, turquoise boats anchored below the fortress wall, and long lunches shaded by pine canopies.',
    postmarkCode: 'GIR · 17320',
    tiltClass: 'rotate-2',
  },
  {
    id: 'stamp-france',
    country: 'LA POSTE',
    city: 'PARIS',
    denomination: '1.96 EUR',
    year: '2026',
    coordinates: '48.85° N · 2.35° E',
    src: '/templates/travel/paris-balcony.jpg',
    bgTint: '#F6EBD8',
    stampInk: '#263B59',
    memoryTitle: 'Roses on Iron Balconies',
    memoryNote:
      'Warm butter scent drifting up from the boulangerie below while golden sunset settles softly over limestone chimneys.',
    postmarkCode: 'PAR · 75007',
    tiltClass: '-rotate-2',
  },
  {
    id: 'stamp-rome',
    country: 'SKYLINE',
    city: 'MIDTOWN DUSK',
    denomination: '1.40 USD',
    year: '2026',
    coordinates: '40.74° N · 73.98° W',
    src: '/templates/occasions/upgrades/city-window-dusk.jpg',
    bgTint: '#EFE2C5',
    stampInk: '#3A281A',
    memoryTitle: 'Amber Arches After Midnight',
    memoryNote:
      'Walking past two millennia of travertine stone under indigo midnight skies makes every ordinary worry feel wonderfully small.',
    postmarkCode: 'ROM · 00184',
    tiltClass: 'rotate-1',
  },
];

interface PassportStampStop {
  id: 'jaipur' | 'kyoto' | 'amalfi' | 'paris';
  city: string;
  country: string;
  code: string;
  coordinates: string;
  inkHex: string;
  visaCode: string;
  tagline: Record<CoreLanguageCode, string>;
}

const PASSPORT_STAMPS: readonly PassportStampStop[] = [
  {
    id: 'jaipur',
    city: 'Jaipur',
    country: 'INDIA',
    code: 'JAI',
    coordinates: '26.91° N · 75.78° E',
    inkHex: '#B83B2A',
    visaCode: 'IND · 01',
    tagline: {
      en: 'Pink sandstone arches & dawn forts',
      hinglish: 'Gulabi mahal aur subah ka qila',
      hi: 'गुलाबी महल और सूर्योदय के क़िले',
    },
  },
  {
    id: 'kyoto',
    city: 'Kyoto',
    country: 'JAPAN',
    code: 'UKY',
    coordinates: '35.01° N · 135.76° E',
    inkHex: '#1E4C7A',
    visaCode: 'JPN · 02',
    tagline: {
      en: 'Cedar shrines & lantern tea lanes',
      hinglish: 'Cedar mandir aur lantern chai galiyan',
      hi: 'देवदार मंदिर और लालटेन चाय गलियाँ',
    },
  },
  {
    id: 'amalfi',
    city: 'Amalfi',
    country: 'ITALIA',
    code: 'AML',
    coordinates: '40.63° N · 14.60° E',
    inkHex: '#1E6B5C',
    visaCode: 'ITA · 03',
    tagline: {
      en: 'Lemon cliffs & turquoise coves',
      hinglish: 'Neebu pahadiyan aur neela samundar',
      hi: 'तटीय चट्टानें और नीला समंदर',
    },
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'FRANCE',
    code: 'PAR',
    coordinates: '48.85° N · 2.35° E',
    inkHex: '#6B3678',
    visaCode: 'FRA · 04',
    tagline: {
      en: 'Rose iron balconies & Seine dusk',
      hinglish: 'Gulab balconies aur Seine ki shaam',
      hi: 'गुलाब बालकनी और सीन की शाम',
    },
  },
];

interface TripMoodOption {
  id: string;
  label: Record<CoreLanguageCode, string>;
  tagline: Record<CoreLanguageCode, string>;
  pace: Record<CoreLanguageCode, string>;
}

const TRIP_MOODS: readonly TripMoodOption[] = [
  {
    id: 'heritage-architecture',
    label: {
      en: 'Heritage & Architecture',
      hinglish: 'Heritage & Architecture',
      hi: 'विरासत और वास्तुकला',
    },
    tagline: {
      en: 'Sunrise palace walks, conservation historians & hand-crafted stays',
      hinglish: 'Subah ke palace walks, historians aur boutique heritage stays',
      hi: 'सूर्योदय महल भ्रमण, इतिहासकार मार्गदर्शन और हेरिटेज निवास',
    },
    pace: {
      en: 'Curated · Dawn access',
      hinglish: 'Curated · Dawn access',
      hi: 'विशेष · प्रातः प्रवेश',
    },
  },
  {
    id: 'coastal-slow',
    label: {
      en: 'Coastal Slow-Travel',
      hinglish: 'Coastal Slow-Travel',
      hi: 'तटीय धीमी यात्रा',
    },
    tagline: {
      en: 'Private wooden boat coves, harborfront cafes & unhurried sunsets',
      hinglish: 'Private boat coves, harbor cafes aur sukoon bhari shaamein',
      hi: 'निजी नौका भ्रमण, तटीय कैफ़े और शांत सूर्यास्त',
    },
    pace: {
      en: 'Unrushed · 3-4 nights/stop',
      hinglish: 'Unrushed · 3-4 nights/stop',
      hi: 'आरामदायक · 3-4 रातें/पड़ाव',
    },
  },
  {
    id: 'culinary-markets',
    label: {
      en: 'Culinary & Markets',
      hinglish: 'Culinary & Markets',
      hi: 'पाक कला और बाज़ार',
    },
    tagline: {
      en: 'Chef counter tastings, spice bazaars & local patisserie trails',
      hinglish: 'Chef tastings, spice bazaars aur local patisserie trails',
      hi: 'शेफ टेस्टिंग, मसाला बाज़ार और स्थानीय व्यंजन यात्रा',
    },
    pace: {
      en: 'Tasting-led · Small tables',
      hinglish: 'Tasting-led · Small tables',
      hi: 'स्वाद-केंद्रित · निजी टेबल',
    },
  },
  {
    id: 'mountain-retreat',
    label: {
      en: 'Mountain Retreat',
      hinglish: 'Mountain Retreat',
      hi: 'पर्वतीय विश्राम',
    },
    tagline: {
      en: 'Scenic alpine rails, cedar lodges & mist-wrapped valley mornings',
      hinglish: 'Scenic alpine trains, cedar lodges aur pahadi subah',
      hi: 'पर्वतीय रेल यात्रा, देवदार लॉज और धुंध भरी सुबह',
    },
    pace: {
      en: 'Restorative · High vistas',
      hinglish: 'Restorative · High vistas',
      hi: 'सुकून भरा · ऊँचे शिखर',
    },
  },
];

interface TripSeasonOption {
  id: string;
  label: Record<CoreLanguageCode, string>;
  months: string;
}

const TRIP_SEASONS: readonly TripSeasonOption[] = [
  {
    id: 'spring',
    label: { en: 'Spring', hinglish: 'Spring', hi: 'वसंत' },
    months: 'Mar — May',
  },
  {
    id: 'summer',
    label: { en: 'Summer', hinglish: 'Summer', hi: 'ग्रीष्म' },
    months: 'Jun — Aug',
  },
  {
    id: 'autumn',
    label: { en: 'Autumn', hinglish: 'Autumn', hi: 'शरद' },
    months: 'Sep — Nov',
  },
  {
    id: 'winter',
    label: { en: 'Winter', hinglish: 'Winter', hi: 'शीत' },
    months: 'Dec — Feb',
  },
];

interface TravelLocalizedCopy {
  switcher: Record<TravelThemeVariant, string>;
  heroBadge: string;
  heroTapHint: string;
  chapterInkEyebrow: string;
  chapterInkTitle: string;
  chapterInkDesc: string;
  chapterAtlasEyebrow: string;
  chapterAtlasTitle: string;
  chapterWindowEyebrow: string;
  chapterWindowTitle: string;
  chapterStampsEyebrow: string;
  chapterStampsTitle: string;
  chapterPassportEyebrow: string;
  chapterPassportTitle: string;
  chapterPassportDesc: string;
  passportStampedWord: string;
  passportTapToStamp: string;
  passportInked: string;
  passportStampAll: string;
  passportReset: string;
  chapterConciergeEyebrow: string;
  chapterConciergeTitle: string;
  moodPrompt: string;
  seasonPrompt: string;
  whatsappCta: string;
  copyBriefCta: string;
  copiedBriefCta: string;
  curatedByLabel: string;
  holdSeatPrefix: string;
  seatReserved: string;
  customItineraryBadge: string;
  passportRouteLabel: string;
  seasonLabel: string;
}

const TRAVEL_COPY: Record<CoreLanguageCode, TravelLocalizedCopy> = {
  en: {
    switcher: {
      serendipity: 'Serendipity Ink',
      atlas: 'World Atlas',
      capsule: 'Flight Capsule',
    },
    heroBadge: 'CURATED TRAVEL MONOGRAPH',
    heroTapHint: 'Hover or tap any column to expand destination coordinates',
    chapterInkEyebrow: 'CHAPTER 01 · INTERACTIVE INK REVEAL',
    chapterInkTitle: 'Unveil the Hidden Horizon',
    chapterInkDesc:
      'Sweep across the gallery linen canvas to part the woodblock veil—awakening soaring cranes, drifting mist, and warm lantern light.',
    chapterAtlasEyebrow: 'CHAPTER 02 · DESTINATION ATLAS & BOARDING PASS',
    chapterAtlasTitle: 'Routes Written Behind the Horizon',
    chapterWindowEyebrow: 'CHAPTER 03 · WINDOW-SEAT PARALLAX PORTAL',
    chapterWindowTitle: 'Look Outside While the World Glides By',
    chapterStampsEyebrow: 'CHAPTER 04 · SOUVENIR MAGNETS & POSTAGE WALL',
    chapterStampsTitle: 'Collected Postmarks Along the Route',
    chapterPassportEyebrow: 'CHAPTER 05 · COLLECTIBLE PASSPORT STAMP BOOK',
    chapterPassportTitle: 'Ink Your Multi-City Route',
    chapterPassportDesc:
      'Tap any destination below to ink-stamp your digital passport and build a tailored multi-city expedition inquiry.',
    passportStampedWord: 'stamped',
    passportTapToStamp: 'Tap to Ink Stamp',
    passportInked: 'Passport Stamped',
    passportStampAll: 'Stamp All 4',
    passportReset: 'Reset',
    chapterConciergeEyebrow: 'CHAPTER 06 · BESPOKE EXPEDITION CONCIERGE',
    chapterConciergeTitle: 'Design Your Next Departure',
    moodPrompt: 'Choose your trip mood',
    seasonPrompt: 'Preferred travel season',
    whatsappCta: 'Plan This Voyage on WhatsApp',
    copyBriefCta: 'Copy Voyage Brief',
    copiedBriefCta: 'Voyage Brief Copied',
    curatedByLabel: 'Expedition Curated By',
    holdSeatPrefix: 'Hold Seat',
    seatReserved: 'Seat Reserved',
    customItineraryBadge: 'Custom Stops',
    passportRouteLabel: 'Passport Route',
    seasonLabel: 'Preferred Season',
  },
  hinglish: {
    switcher: {
      serendipity: 'Serendipity Ink',
      atlas: 'World Atlas',
      capsule: 'Flight Capsule',
    },
    heroBadge: 'CURATED TRAVEL MONOGRAPH',
    heroTapHint: 'Kisi bhi column par hover ya tap karein — destination details khulengi',
    chapterInkEyebrow: 'CHAPTER 01 · INTERACTIVE INK REVEAL',
    chapterInkTitle: 'Chhupi Hui Duniya Ko Unveil Karein',
    chapterInkDesc:
      'Safed canvas par cursor ghumayein ya ungli drag karein — udte hue pakshi, mist aur golden lantern zinda ho uthenge.',
    chapterAtlasEyebrow: 'CHAPTER 02 · DESTINATION ATLAS & BOARDING PASS',
    chapterAtlasTitle: 'Sapno Ke Routes Aur Live Boarding Pass',
    chapterWindowEyebrow: 'CHAPTER 03 · WINDOW-SEAT PARALLAX PORTAL',
    chapterWindowTitle: 'Window Seat Se Dekhein Badalta Aasmaan',
    chapterStampsEyebrow: 'CHAPTER 04 · SOUVENIR MAGNETS & POSTAGE WALL',
    chapterStampsTitle: 'Har Safar Ki Yaadgaar Stamp Wall',
    chapterPassportEyebrow: 'CHAPTER 05 · COLLECTIBLE PASSPORT STAMP BOOK',
    chapterPassportTitle: 'Apna Multi-City Passport Stamp Karein',
    chapterPassportDesc:
      'Niche kisi bhi shehar par tap karke digital passport par ink-stamp lagayein aur apni multi-city inquiry ready karein.',
    passportStampedWord: 'stamped',
    passportTapToStamp: 'Tap Karein · Ink Stamp',
    passportInked: 'Stamp Lag Gaya',
    passportStampAll: 'Saare 4 Stamp Karein',
    passportReset: 'Reset',
    chapterConciergeEyebrow: 'CHAPTER 06 · BESPOKE EXPEDITION CONCIERGE',
    chapterConciergeTitle: 'Apna Agla Safar Plan Karein',
    moodPrompt: 'Apna trip mood chunein',
    seasonPrompt: 'Pasandida travel season',
    whatsappCta: 'WhatsApp Par Trip Plan Karein',
    copyBriefCta: 'Trip Brief Copy Karein',
    copiedBriefCta: 'Trip Brief Copy Ho Gaya',
    curatedByLabel: 'Curated By',
    holdSeatPrefix: 'Hold Seat',
    seatReserved: 'Seat Reserved',
    customItineraryBadge: 'Custom Stops',
    passportRouteLabel: 'Passport Route',
    seasonLabel: 'Travel Season',
  },
  hi: {
    switcher: {
      serendipity: 'सेरेंडिपिटी इंक',
      atlas: 'वर्ल्ड एटलस',
      capsule: 'फ्लाइट कैप्सूल',
    },
    heroBadge: 'विशेष यात्रा संग्रह',
    heroTapHint: 'किसी भी स्तंभ पर टैप करें और गंतव्य विवरण देखें',
    chapterInkEyebrow: 'अध्याय 01 · इंटरैक्टिव इंक रिवील',
    chapterInkTitle: 'छिपे हुए क्षितिज को उजागर करें',
    chapterInkDesc:
      'सफ़ेद कैनवास पर कर्सर घुमाएँ या स्पर्श करें — उड़ते पक्षी, धुंध और सुनहरी लालटेन सजीव हो उठेंगी।',
    chapterAtlasEyebrow: 'अध्याय 02 · डेस्टिनेशन एटलस व बोर्डिंग पास',
    chapterAtlasTitle: 'क्षितिज के पार चुनिंदा यात्राएँ',
    chapterWindowEyebrow: 'अध्याय 03 · विंडो-सीट पैरेलैक्स पोर्टल',
    chapterWindowTitle: 'खिड़की से बदलती दुनिया का नज़ारा',
    chapterStampsEyebrow: 'अध्याय 04 · डाक टिकट व स्मृति संग्रह',
    chapterStampsTitle: 'हर पड़ाव की डाक मुहर और यादें',
    chapterPassportEyebrow: 'अध्याय 05 · डिजिटल पासपोर्ट स्टैम्प बुक',
    chapterPassportTitle: 'अपने पसंदीदा शहरों पर मुहर लगाएँ',
    chapterPassportDesc:
      'नीचे किसी भी शहर पर टैप कर डिजिटल पासपोर्ट में इंक-स्टैम्प लगाएँ और अपनी मल्टी-सिटी यात्रा योजना तैयार करें।',
    passportStampedWord: 'स्टैम्प पूर्ण',
    passportTapToStamp: 'मुहर लगाने को टैप करें',
    passportInked: 'पासपोर्ट स्टैम्प लगा',
    passportStampAll: 'सभी 4 स्टैम्प करें',
    passportReset: 'रीसेट',
    chapterConciergeEyebrow: 'अध्याय 06 · व्यक्तिगत यात्रा परामर्श',
    chapterConciergeTitle: 'अपनी अगली यात्रा की रूपरेखा बनाएँ',
    moodPrompt: 'अपनी यात्रा शैली चुनें',
    seasonPrompt: 'पसंदीदा यात्रा मौसम',
    whatsappCta: 'WhatsApp पर यात्रा प्लान करें',
    copyBriefCta: 'यात्रा विवरण कॉपी करें',
    copiedBriefCta: 'विवरण कॉपी हो गया',
    curatedByLabel: 'यात्रा संकलनकर्ता',
    holdSeatPrefix: 'सीट सुरक्षित करें',
    seatReserved: 'सीट आरक्षित',
    customItineraryBadge: 'कस्टम पड़ाव',
    passportRouteLabel: 'पासपोर्ट मार्ग',
    seasonLabel: 'यात्रा मौसम',
  },
};

const TRAVEL_CONTAINER_CSS = `
.wz-tv-root {
  container-type: inline-size;
  container-name: travel-shell;
}
.wz-tv-atlas-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.15rem;
}
.wz-tv-window-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;
}
.wz-tv-stamp-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}
.wz-tv-mood-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.65rem;
}
.wz-tv-concierge-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}
.wz-tv-passport-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.wz-tv-hero-slices {
  height: 410px;
}
.wz-tv-slice-letter {
  font-size: clamp(1.45rem, 6.2cqw, 4.1rem);
}
.wz-tv-horizon-word {
  font-size: clamp(3.1rem, 16.5cqw, 10.5rem);
}
@container travel-shell (min-width: 580px) {
  .wz-tv-hero-slices {
    height: 540px;
  }
  .wz-tv-atlas-grid {
    grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
    gap: 1.5rem;
    align-items: start;
  }
  .wz-tv-window-grid {
    grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
    gap: 1.75rem;
  }
  .wz-tv-stamp-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.15rem;
  }
  .wz-tv-mood-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
  .wz-tv-passport-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.95rem;
  }
  .wz-tv-concierge-split {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 1.75rem;
    align-items: stretch;
  }
}
@container travel-shell (min-width: 860px) {
  .wz-tv-hero-slices {
    height: 600px;
  }
  .wz-tv-stamp-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.95rem;
  }
}
@keyframes wzTvRouteDash {
  to {
    stroke-dashoffset: -44;
  }
}
.wz-tv-route-dash {
  animation: wzTvRouteDash 3.6s linear infinite;
}
.wz-tv-stamp-outer {
  padding: 5px;
  background-image: radial-gradient(circle at 5px 5px, transparent 3.1px, var(--stamp-paper) 3.5px);
  background-size: 10px 10px;
  background-position: -5px -5px;
}
@media (prefers-reduced-motion: reduce) {
  .wz-tv-route-dash {
    animation: none !important;
  }
}
`;

function sanitizeWhatsAppPhone(raw?: string): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (/^(?:91)?[6-9]\d{9}$/.test(digits)) {
    return digits.length === 10 ? `91${digits}` : digits;
  }
  if (/^[1-9]\d{9,14}$/.test(digits)) {
    return digits;
  }
  return null;
}

function hiSafeStyle(language: LanguageCode): React.CSSProperties | undefined {
  if (language === 'hi') {
    return {
      fontStyle: 'normal',
      letterSpacing: '0em',
    };
  }
  return undefined;
}

function useTravelReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    }
    return undefined;
  }, []);

  return reduced;
}

/**
 * Bespoke Travel Flagship Website (`travel-voyage-01`):
 * 1. 6-Slice Vertical Accordion Hero ("V O Y A G E")
 * 2. Signature <SerendipityInkReveal /> Interactive Woodblock Ink-Wash Canvas
 * 3. Destination Atlas with Behind-Horizon Display Typography, 3D Boarding Pass Capsule & Day 1-3 Itineraries
 * 4. Interactive Window-Seat Parallax Portal (Flight 14A, Alpine Express, Ocean Arch)
 * 5. Perforated Postage Stamp & Souvenir Magnet Wall with Animated SVG Route Trail
 * 6. Concierge Trip Inquiry with Mood Selector & Direct WhatsApp Booking CTA
 */
export function TravelVoyageSite({
  data,
  language,
  watermarked = false,
  onOpened,
}: OccasionSiteProps) {
  const autoVariant = resolveTravelTheme(data.relation);
  const [manualVariant, setManualVariant] = useState<TravelThemeVariant | null>(null);
  const activeVariant: TravelThemeVariant =
    watermarked && manualVariant ? manualVariant : autoVariant;

  const coreLang = toCoreLanguageCode(language);
  const copy = TRAVEL_COPY[coreLang] ?? TRAVEL_COPY.en;
  const langSafe = hiSafeStyle(language);
  const reducedMotion = useTravelReducedMotion();
  const routeGradId = `wz-tv-route-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const openedOnceRef = useRef(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setManualVariant(null);
  }, [data.relation]);

  useEffect(() => {
    if (openedOnceRef.current) return;
    openedOnceRef.current = true;
    onOpened?.();
  }, [onOpened]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);

  // Section states
  const [activeSliceIdx, setActiveSliceIdx] = useState<number>(0);
  const [activeAtlasId, setActiveAtlasId] = useState<string>(ATLAS_DESTINATIONS[1].id);
  const [openDayIdx, setOpenDayIdx] = useState<number>(0);
  const [boardedPass, setBoardedPass] = useState<boolean>(false);
  const [boardingTilt, setBoardingTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  const [activePortalId, setActivePortalId] = useState<string>(WINDOW_PORTALS[0].id);
  const [portalShift, setPortalShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shadeLevel, setShadeLevel] = useState<'open' | 'dusk'>('open');

  const [activeStampId, setActiveStampId] = useState<string>(POSTAGE_STAMPS[0].id);
  const [stampedCities, setStampedCities] = useState<Record<string, boolean>>({
    jaipur: true,
  });
  const [selectedMoodId, setSelectedMoodId] = useState<string>(TRIP_MOODS[0].id);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(TRIP_SEASONS[0].id);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Custom user photos cleanly validated
  const userPhotos = useMemo(() => {
    if (!Array.isArray(data.photos)) return [];
    return data.photos
      .map((src) => (typeof src === 'string' ? src.trim() : ''))
      .filter((src) => src.length > 0 && !failedImages[src])
      .slice(0, 6);
  }, [data.photos, failedImages]);

  const brandTitle = (data.receiverName ?? '').trim() || 'SERENDIPITY VOYAGES';
  const curatorName = (data.senderName ?? '').trim() || 'Atelier Travel Concierge';
  const heroHeadline =
    (data.headline ? pickLocalizedText(data.headline, language).trim() : '') ||
    'Slow journeys crafted across heritage palaces, quiet islands & horizon trains.';
  const conciergeMessage =
    (data.message ? pickLocalizedText(data.message, language).trim() : '') ||
    'Every itinerary is tailored by hand—balancing sunrise architectural walks, hidden coastal harbors, and unhurried moments worth remembering for decades.';
  const editionBadge =
    (data.offerTag ? pickLocalizedText(data.offerTag, language).trim() : '') || copy.heroBadge;

  const customHighlights = useMemo(() => {
    if (!Array.isArray(data.highlights)) return [];
    return data.highlights
      .map((item) => ({
        title: item?.title ? pickLocalizedText(item.title, language).trim() : '',
        detail: item?.detail ? pickLocalizedText(item.detail, language).trim() : '',
      }))
      .filter((item) => item.title.length > 0 || item.detail.length > 0);
  }, [data.highlights, language]);

  // Merge user uploaded photos seamlessly into hero slices if supplied
  const resolvedSlices = useMemo(() => {
    return HERO_SLICES.map((slice, idx) => {
      const customSrc = userPhotos[idx];
      return {
        ...slice,
        effectiveSrc: customSrc && !failedImages[customSrc] ? customSrc : slice.src,
        isCustomPhoto: Boolean(customSrc && !failedImages[customSrc]),
      };
    });
  }, [userPhotos, failedImages]);

  const activeSlice = resolvedSlices[activeSliceIdx] ?? resolvedSlices[0];
  const activeAtlas =
    ATLAS_DESTINATIONS.find((d) => d.id === activeAtlasId) ?? ATLAS_DESTINATIONS[0];
  const resolvedActiveItinerary = useMemo(() => {
    return activeAtlas.itinerary.map((step, idx) => {
      const custom = customHighlights[idx];
      if (!custom) return step;
      return {
        ...step,
        title: custom.title || step.title,
        detail: custom.detail || step.detail,
      };
    });
  }, [activeAtlas.itinerary, customHighlights]);
  const activePortal =
    WINDOW_PORTALS.find((p) => p.id === activePortalId) ?? WINDOW_PORTALS[0];

  // Blend user custom highlights cleanly into the souvenir stamps
  const resolvedStamps = useMemo(() => {
    return POSTAGE_STAMPS.map((stamp, idx) => {
      const custom = customHighlights[idx];
      if (!custom) return stamp;
      return {
        ...stamp,
        memoryTitle: custom.title || stamp.memoryTitle,
        memoryNote: custom.detail || stamp.memoryNote,
      };
    });
  }, [customHighlights]);

  const activeStamp =
    resolvedStamps.find((s) => s.id === activeStampId) ?? resolvedStamps[0];
  const activeMood =
    TRIP_MOODS.find((m) => m.id === selectedMoodId) ?? TRIP_MOODS[0];
  const activeSeason =
    TRIP_SEASONS.find((s) => s.id === selectedSeasonId) ?? TRIP_SEASONS[0];

  const stampedList = useMemo(
    () => PASSPORT_STAMPS.filter((stop) => Boolean(stampedCities[stop.id])),
    [stampedCities],
  );
  const stampedCount = stampedList.length;

  const togglePassportStamp = useCallback((id: PassportStampStop['id']) => {
    setStampedCities((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const stampAllPassportStops = useCallback(() => {
    setStampedCities({ jaipur: true, kyoto: true, amalfi: true, paris: true });
  }, []);

  const resetPassportStops = useCallback(() => {
    setStampedCities({});
  }, []);

  // Theme palette tokens driven by activeVariant ('serendipity' | 'atlas' | 'capsule')
  const palette = useMemo(() => {
    if (activeVariant === 'capsule') {
      return {
        isDark: true,
        outerBg: '#0B111C',
        sectionAltBg: '#111A2B',
        cardBg: '#141F33',
        ink: '#F4F1EA',
        mutedInk: '#A9B7CC',
        border: 'rgba(244,241,234,0.14)',
        accent: '#E5A23C',
        accentInk: '#0B111C',
        secondaryAccent: '#5CA7D6',
        bannerClass: 'border-white/15 bg-[#0F1726]/95 text-[#E5A23C]',
      };
    }
    if (activeVariant === 'atlas') {
      return {
        isDark: false,
        outerBg: '#FBF7F0',
        sectionAltBg: '#F3ECE0',
        cardBg: '#FFFFFF',
        ink: '#12273D',
        mutedInk: '#52657A',
        border: 'rgba(18,39,61,0.14)',
        accent: '#C85A3F',
        accentInk: '#FBF7F0',
        secondaryAccent: '#1D5273',
        bannerClass: 'border-[#12273D]/15 bg-[#12273D] text-[#FBF7F0]',
      };
    }
    return {
      isDark: false,
      outerBg: '#FAF9F6',
      sectionAltBg: '#F2EFE9',
      cardBg: '#FFFFFF',
      ink: '#15233A',
      mutedInk: '#536275',
      border: 'rgba(111,124,140,0.28)',
      accent: '#15233A',
      accentInk: '#FAF9F6',
      secondaryAccent: '#C9832E',
      bannerClass: 'border-[#6F7C8C]/25 bg-[#15233A] text-[#F6D393]',
    };
  }, [activeVariant]);

  const handleSelectAtlas = useCallback((id: string) => {
    setActiveAtlasId(id);
    setOpenDayIdx(0);
    setBoardedPass(false);
  }, []);

  const handleBoardingPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      setBoardingTilt({
        rx: Number((-ny * 10).toFixed(2)),
        ry: Number((nx * 12).toFixed(2)),
      });
    },
    [reducedMotion],
  );

  const handleBoardingPointerLeave = useCallback(() => {
    setBoardingTilt({ rx: 0, ry: 0 });
  }, []);

  const handlePortalPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      setPortalShift({
        x: Number((-nx * 24).toFixed(1)),
        y: Number((-ny * 18).toFixed(1)),
      });
    },
    [reducedMotion],
  );

  const handlePortalPointerLeave = useCallback(() => {
    setPortalShift({ x: 0, y: 0 });
  }, []);

  const sanitizedPhone = useMemo(
    () => sanitizeWhatsAppPhone(data.whatsappPhone),
    [data.whatsappPhone],
  );

  const conciergeBriefText = useMemo(() => {
    const routeSummary =
      stampedList.length > 0
        ? stampedList.map((s) => `${s.city} (${s.code})`).join(' -> ')
        : `${activeAtlas.tabLabel} (${activeAtlas.originCode} -> ${activeAtlas.destCode})`;
    return `Hello ${curatorName}, I would like to plan a ${activeMood.label.en} multi-city voyage for ${activeSeason.label.en} (${activeSeason.months}). Stamped Passport Route (${stampedCount}/4): ${routeSummary}. Reference Flight: ${activeAtlas.flightNo} · Curated via ${brandTitle}.`;
  }, [
    curatorName,
    activeMood.label.en,
    activeSeason.label.en,
    activeSeason.months,
    stampedList,
    stampedCount,
    activeAtlas.tabLabel,
    activeAtlas.originCode,
    activeAtlas.destCode,
    activeAtlas.flightNo,
    brandTitle,
  ]);

  const whatsappHref = useMemo(() => {
    if (!sanitizedPhone) return null;
    return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(conciergeBriefText)}`;
  }, [sanitizedPhone, conciergeBriefText]);

  const handleCopyBrief = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(conciergeBriefText).catch(() => {});
    }
    setCopiedBrief(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedBrief(false), 2400);
  }, [conciergeBriefText]);

  const markImageFailed = useCallback((src: string) => {
    setFailedImages((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  }, []);

  return (
    <div
      className="wz-tv-root relative flex min-h-full w-full flex-col justify-between overflow-x-clip rounded-[28px]"
      style={{
        backgroundColor: palette.outerBg,
        color: palette.ink,
        colorScheme: palette.isDark ? 'dark' : 'light',
      }}
    >
      <style>{TRAVEL_CONTAINER_CSS}</style>

      {watermarked ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none relative z-30 flex justify-center border-b py-1.5 font-mono text-[10px] font-bold tracking-[0.2em] ${palette.bannerClass}`}
        >
          WEBZY FREE PREVIEW
        </div>
      ) : null}

      {/* EDITORIAL TOP MASTHEAD */}
      <header
        className="relative z-20 border-b px-4 py-3 sm:px-7"
        style={{ borderColor: palette.border }}
      >
        <div className="mx-auto flex max-w-[1140px] flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Minimalist Compass Rose Mark */}
            <svg
              viewBox="0 0 28 28"
              className="h-6 w-6 shrink-0"
              aria-hidden="true"
              style={{ color: palette.secondaryAccent }}
            >
              <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
              <polygon points="14,4 16.6,12 14,14 11.4,12" fill="currentColor" />
              <polygon points="14,24 16.6,16 14,14 11.4,16" fill="currentColor" opacity="0.35" />
              <circle cx="14" cy="14" r="1.6" fill="currentColor" />
            </svg>
            <div className="min-w-0">
              <p className="truncate font-editorial text-sm font-normal uppercase tracking-[0.14em] sm:text-base">
                {brandTitle}
              </p>
              <p
                className="truncate font-mono text-[9px] uppercase tracking-[0.18em]"
                style={{ color: palette.mutedInk }}
              >
                {editionBadge}
              </p>
            </div>
          </div>

          <nav
            aria-label="Travel sections"
            className="flex items-center gap-1 overflow-x-auto scrollbar-none"
          >
            {[
              { href: '#wz-travel-ink', label: 'Ink Reveal' },
              { href: '#wz-travel-atlas', label: 'Atlas' },
              { href: '#wz-travel-window', label: 'Window' },
              { href: '#wz-travel-stamps', label: 'Stamps' },
              { href: '#wz-travel-passport', label: 'Passport' },
              { href: '#wz-travel-concierge', label: 'Concierge' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-full px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-100 opacity-75"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col">
        {/* ================================================================= */}
        {/* SECTION 1: 6-SLICE VERTICAL ACCORDION HERO ("V O Y A G E")         */}
        {/* ================================================================= */}
        <section aria-label="Featured destinations hero" className="relative px-3 pb-7 pt-4 sm:px-7 sm:pt-6">
          <div className="mx-auto max-w-[1140px]">
            <div className="relative overflow-hidden rounded-[22px] bg-[#0F1725] shadow-[0_26px_65px_-28px_rgba(11,17,28,0.6)]">
              <div className="wz-tv-hero-slices flex w-full gap-[2px] bg-[#0B101A]">
                {resolvedSlices.map((slice, idx) => {
                  const isExpanded = idx === activeSliceIdx;
                  return (
                    <button
                      key={slice.id}
                      type="button"
                      onMouseEnter={() => setActiveSliceIdx(idx)}
                      onFocus={() => setActiveSliceIdx(idx)}
                      onClick={() => {
                        setActiveSliceIdx(idx);
                        if (slice.atlasId) {
                          handleSelectAtlas(slice.atlasId);
                        }
                      }}
                      aria-expanded={isExpanded}
                      aria-label={`${slice.city}, ${slice.region} — ${slice.coordinates}`}
                      className="group relative flex h-full min-w-[26px] flex-col justify-between overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A23C] sm:min-w-[38px]"
                      style={{
                        flexGrow: isExpanded ? 3.8 : 0.65,
                        flexBasis: '0%',
                        transition: reducedMotion
                          ? 'none'
                          : 'flex-grow 540ms cubic-bezier(0.22, 1, 0.36, 1)',
                        background: slice.fallbackGradient,
                      }}
                    >
                      {!failedImages[slice.effectiveSrc] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={slice.effectiveSrc}
                          alt={`${slice.city} vista`}
                          onError={() => markImageFailed(slice.effectiveSrc)}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
                          style={{
                            transform: isExpanded ? 'scale(1.04)' : 'scale(1.12)',
                            filter: isExpanded ? 'brightness(0.86)' : 'brightness(0.58) saturate(0.88)',
                          }}
                        />
                      ) : null}

                      {/* Atmospheric gradient vignette for razor-sharp typography legibility */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background: isExpanded
                            ? 'linear-gradient(180deg, rgba(11,17,28,0.48) 0%, rgba(11,17,28,0.16) 44%, rgba(11,17,28,0.82) 100%)'
                            : 'linear-gradient(180deg, rgba(11,17,28,0.52) 0%, rgba(11,17,28,0.34) 50%, rgba(11,17,28,0.72) 100%)',
                        }}
                      />

                      {/* Top Index, Monogram & Season Pill (kept neatly at top so center title never collides) */}
                      <div className="relative z-10 flex items-center justify-between gap-1.5 p-2.5 sm:p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[8.5px] font-bold tracking-[0.16em] text-white/80 sm:text-[9.5px] sm:tracking-[0.2em]">
                            0{idx + 1}
                          </span>
                          <span
                            className={`font-editorial text-xs tracking-[0.12em] transition-opacity duration-300 sm:text-sm ${
                              isExpanded ? 'text-[#F5D492] opacity-100' : 'text-white/75 opacity-80'
                            }`}
                          >
                            {slice.voyageLetter}
                          </span>
                        </div>
                        {isExpanded ? (
                          <span className="hidden rounded-full border border-white/25 bg-black/40 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#F5D492] backdrop-blur-xs sm:inline-block">
                            {slice.season}
                          </span>
                        ) : null}
                      </div>

                      {/* Open middle breathing zone reserved cleanly for the centered editorial title */}
                      <div className="pointer-events-none flex-1" aria-hidden="true" />

                      {/* Bottom Metadata Revealed on Active Slice */}
                      <div className="relative z-10 p-2.5 sm:p-4">
                        {isExpanded ? (
                          <div className="max-w-xs space-y-0.5 animate-fade-in sm:space-y-1">
                            <p className="truncate font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[#F5D492] sm:text-[9.5px] sm:tracking-[0.18em]">
                              {slice.coordinates}
                            </p>
                            <p className="font-editorial text-lg leading-tight text-white sm:text-2xl">
                              {slice.city}
                              <span className="ml-1.5 hidden font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 sm:inline">
                                {slice.region}
                              </span>
                            </p>
                            <p className="line-clamp-2 font-sans text-[10px] leading-snug text-white/85 sm:text-xs sm:leading-relaxed">
                              {slice.tagline}
                            </p>
                          </div>
                        ) : (
                          <p className="truncate text-center font-mono text-[8px] uppercase tracking-[0.12em] text-white/75 sm:text-[9px] sm:tracking-[0.18em]">
                            {slice.city.slice(0, 3)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CENTERED FLOATING EDITORIAL TITLE OVERLAY (Clean legibility band, zero collision with slice letters) */}
              <div className="pointer-events-none absolute inset-x-4 top-[42%] z-20 -translate-y-1/2 text-center sm:inset-x-6 sm:top-[44%]">
                <div className="mx-auto inline-block max-w-3xl rounded-2xl bg-[#0B111C]/40 px-4 py-3 backdrop-blur-[3px] sm:px-7 sm:py-4">
                  <p className="truncate font-mono text-[8.5px] font-semibold uppercase tracking-[0.22em] text-[#F6D393] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-[10.5px] sm:tracking-[0.34em]">
                    {activeSlice.coordinates} · {activeSlice.city.toUpperCase()}
                  </p>
                  <h1
                    className="mx-auto mt-1 font-editorial font-normal uppercase tracking-[0.1em] text-white drop-shadow-[0_10px_32px_rgba(0,0,0,0.72)] sm:mt-1.5 sm:tracking-[0.14em]"
                    style={{
                      fontSize: 'clamp(1.3rem, 5.2cqw, 4rem)',
                      lineHeight: 1.06,
                      ...langSafe,
                    }}
                  >
                    {brandTitle}
                  </h1>
                  <p
                    className="mx-auto mt-1.5 line-clamp-2 max-w-lg font-literary text-[11px] italic text-white/95 drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] sm:mt-2 sm:line-clamp-none sm:text-base"
                    style={langSafe}
                  >
                    {heroHeadline}
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Hero Coordinate Bar & Quick Custom Photo Indicator */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: palette.mutedInk }}>
                {copy.heroTapHint}
              </p>
              <div className="flex items-center gap-2">
                {userPhotos.length > 0 ? (
                  <span
                    className="rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                    style={{
                      borderColor: palette.border,
                      color: palette.secondaryAccent,
                    }}
                  >
                    {userPhotos.length} Custom Travel Frames Featured
                  </span>
                ) : null}
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
                  V · O · Y · A · G · E
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2: SIGNATURE SERENDIPITY INK-WASH INTERACTIVE CANVAS       */}
        {/* ================================================================= */}
        <section
          id="wz-travel-ink"
          className="border-y px-3 py-8 sm:px-7 sm:py-11"
          style={{
            borderColor: palette.border,
            backgroundColor: palette.sectionAltBg,
          }}
        >
          <div className="mx-auto max-w-[1140px]">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div className="max-w-xl">
                <p
                  className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: palette.secondaryAccent }}
                >
                  {copy.chapterInkEyebrow}
                </p>
                <h2
                  className="mt-1 font-editorial text-2xl leading-tight sm:text-4xl"
                  style={langSafe}
                >
                  {copy.chapterInkTitle}
                </h2>
                <p
                  className="mt-1.5 font-sans text-xs leading-relaxed sm:text-sm"
                  style={{ color: palette.mutedInk }}
                >
                  {copy.chapterInkDesc}
                </p>
              </div>
              <div
                className="rounded-full border px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em]"
                style={{ borderColor: palette.border, color: palette.mutedInk }}
              >
                WOODBLOCK APERTURE · 60FPS INK
              </div>
            </div>

            <SerendipityInkReveal
              title="SERENDIPITY"
              subtitle="Thought Epiphany"
            />
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 3: DESTINATION ATLAS + BEHIND-HORIZON TYPE + BOARDING PASS */}
        {/* ================================================================= */}
        <section id="wz-travel-atlas" className="px-3 py-9 sm:px-7 sm:py-12">
          <div className="mx-auto max-w-[1140px]">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: palette.secondaryAccent }}
                >
                  {copy.chapterAtlasEyebrow}
                </p>
                <h2
                  className="mt-1 font-editorial text-2xl leading-tight sm:text-4xl"
                  style={langSafe}
                >
                  {copy.chapterAtlasTitle}
                </h2>
              </div>

              {/* 5 Destination Selector Tabs */}
              <div
                role="tablist"
                aria-label="Destination atlas selector"
                className="flex flex-wrap items-center gap-1.5"
              >
                {ATLAS_DESTINATIONS.map((dest) => {
                  const isActive = dest.id === activeAtlas.id;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectAtlas(dest.id)}
                      className="min-h-[44px] rounded-full border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95"
                      style={
                        isActive
                          ? {
                              backgroundColor: palette.accent,
                              borderColor: palette.accent,
                              color: palette.accentInk,
                            }
                          : {
                              backgroundColor: 'transparent',
                              borderColor: palette.border,
                              color: palette.ink,
                            }
                      }
                    >
                      {dest.tabLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DRAMATIC BEHIND-HORIZON DISPLAY TYPOGRAPHY STAGE */}
            <div className="relative overflow-hidden rounded-[22px] bg-[#101A28] shadow-[0_24px_56px_-26px_rgba(12,20,34,0.55)]">
              <div className="relative aspect-[16/10] min-h-[260px] w-full sm:aspect-[21/10] sm:min-h-[340px]">
                {!failedImages[activeAtlas.backdropSrc] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={activeAtlas.id}
                    src={activeAtlas.backdropSrc}
                    alt={activeAtlas.tabLabel}
                    onError={() => markImageFailed(activeAtlas.backdropSrc)}
                    className="absolute inset-0 h-full w-full object-cover animate-fade-in"
                  />
                ) : null}

                {/* Upper atmospheric sky wash so behind-horizon display typography pops softly */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(11,20,34,0.62) 0%, rgba(11,20,34,0.22) 48%, rgba(11,20,34,0.86) 100%)',
                  }}
                />

                {/* Monumental Translucent Display Word Layered Behind the Horizon Band */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-[14%] flex justify-center overflow-hidden px-3"
                >
                  <span
                    className="wz-tv-horizon-word select-none font-zine uppercase leading-[0.86] tracking-[0.09em] text-white/35 mix-blend-overlay"
                    style={{
                      WebkitMaskImage:
                        'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.88) 54%, rgba(0,0,0,0.08) 95%)',
                      maskImage:
                        'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.88) 54%, rgba(0,0,0,0.08) 95%)',
                    }}
                  >
                    {activeAtlas.displayWord}
                  </span>
                </div>

                {/* Horizon Foreground Metadata Bar */}
                <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#F6D393] backdrop-blur-xs">
                      {activeAtlas.regionLabel}
                    </span>
                    <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-white/85">
                      {activeAtlas.coordinates}
                    </span>
                  </div>

                  <div className="max-w-2xl">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F6D393]">
                      {activeAtlas.bestFor}
                    </p>
                    <h3 className="mt-1 font-editorial text-2xl text-white sm:text-4xl">
                      {activeAtlas.tabLabel}
                    </h3>
                    <p className="mt-1.5 font-sans text-xs leading-relaxed text-white/90 sm:text-sm">
                      {activeAtlas.summary}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOARDING PASS CAPSULE + DAY 1 / DAY 2 / DAY 3 ITINERARY */}
            <div className="wz-tv-atlas-grid mt-5">
              {/* Left: 3D Pointer-Tilt Live Boarding Pass Capsule Card */}
              <div style={{ perspective: '950px' }}>
                <div
                  onPointerMove={handleBoardingPointerMove}
                  onPointerLeave={handleBoardingPointerLeave}
                  className="relative overflow-hidden rounded-[22px] border border-[#2A3950]/35 bg-[#121D2F] p-5 text-[#F5F1E8] shadow-[0_26px_55px_-24px_rgba(12,20,34,0.65)]"
                  style={{
                    transform: reducedMotion
                      ? 'none'
                      : `rotateX(${boardingTilt.rx}deg) rotateY(${boardingTilt.ry}deg)`,
                    transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Ticket Side Cutout Notches */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-3 top-[58%] h-6 w-6 rounded-full"
                    style={{ backgroundColor: palette.outerBg }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 top-[58%] h-6 w-6 rounded-full"
                    style={{ backgroundColor: palette.outerBg }}
                  />

                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#E5A23C]">
                      BOARDING CAPSULE · {activeAtlas.flightNo}
                    </span>
                    <span className="rounded-full border border-[#E5A23C]/40 bg-[#E5A23C]/15 px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#F6D393]">
                      {activeAtlas.daysToDeparture} Days to Departure
                    </span>
                  </div>

                  {/* Airport Code Flight Path Header */}
                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div>
                      <p className="font-zine text-4xl leading-none tracking-[0.06em] text-white sm:text-5xl">
                        {activeAtlas.originCode}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9FB0C7]">
                        {activeAtlas.originCity}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 px-1">
                      <svg
                        viewBox="0 0 84 20"
                        className="h-5 w-20 text-[#E5A23C]"
                        fill="none"
                        aria-hidden="true"
                      >
                        <line
                          x1="2"
                          y1="10"
                          x2="78"
                          y2="10"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeDasharray="3 4"
                          opacity="0.55"
                        />
                        <path
                          d="M46 10 L39 5.5 L41 10 L39 14.5 Z"
                          fill="currentColor"
                        />
                        <circle cx="4" cy="10" r="2.2" fill="currentColor" />
                        <circle cx="80" cy="10" r="2.2" fill="currentColor" />
                      </svg>
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#9FB0C7]">
                        {activeAtlas.duration}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="font-zine text-4xl leading-none tracking-[0.06em] text-[#F6D393] sm:text-5xl">
                        {activeAtlas.destCode}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9FB0C7]">
                        {activeAtlas.destCity}
                      </p>
                    </div>
                  </div>

                  {/* Perforated Tear Line */}
                  <div className="my-4 border-t border-dashed border-white/20" />

                  {/* Flight Telemetry Grid */}
                  <div className="grid grid-cols-4 gap-2 text-left">
                    <div>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#8FA2BC]">
                        FLIGHT
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-bold text-white">
                        {activeAtlas.flightNo}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#8FA2BC]">
                        SEAT
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-bold text-[#F6D393]">
                        {activeAtlas.seat}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#8FA2BC]">
                        GATE
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-bold text-white">
                        {activeAtlas.gate}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#8FA2BC]">
                        CLASS
                      </p>
                      <p className="mt-0.5 truncate font-mono text-xs font-bold text-white">
                        {activeAtlas.cabinClass}
                      </p>
                    </div>
                  </div>

                  {/* Crisp SVG Boarding Barcode + Interactive Check-In Toggle */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <svg
                      viewBox="0 0 156 26"
                      className="h-6 w-36 text-white/85"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      {[
                        2, 6, 9, 14, 17, 23, 27, 30, 36, 40, 46, 49, 55, 61, 65, 70,
                        76, 81, 85, 92, 97, 102, 108, 113, 117, 124, 129, 134, 141, 147,
                      ].map((xPos, i) => (
                        <rect
                          key={`bar-${xPos}`}
                          x={xPos}
                          y="2"
                          width={i % 3 === 0 ? 3 : 1.5}
                          height="22"
                          rx="0.5"
                        />
                      ))}
                    </svg>

                    <button
                      type="button"
                      onClick={() => setBoardedPass((prev) => !prev)}
                      aria-pressed={boardedPass}
                      className={`min-h-[44px] rounded-full px-3.5 text-[10.5px] font-bold uppercase tracking-[0.14em] transition-all active:scale-95 ${
                        boardedPass
                          ? 'bg-[#2EA06F] text-white'
                          : 'bg-[#E5A23C] text-[#0B111C] hover:bg-[#F3B857]'
                      }`}
                    >
                      {boardedPass ? copy.seatReserved : `${copy.holdSeatPrefix} ${activeAtlas.seat}`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Expandable Day 1 / Day 2 / Day 3 Curated Expedition Itinerary */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <span
                    className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: palette.mutedInk }}
                  >
                    CURATED 3-DAY EXPEDITION · {activeAtlas.tabLabel.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    {customHighlights.length > 0 ? (
                      <span
                        className="rounded-full border px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em]"
                        style={{
                          borderColor: palette.secondaryAccent,
                          color: palette.secondaryAccent,
                        }}
                      >
                        {copy.customItineraryBadge}
                      </span>
                    ) : null}
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-[0.14em]"
                      style={{ color: palette.secondaryAccent }}
                    >
                      01 — 03
                    </span>
                  </div>
                </div>

                {resolvedActiveItinerary.map((step, idx) => {
                  const isOpen = openDayIdx === idx;
                  return (
                    <div
                      key={`${activeAtlas.id}-${step.day}`}
                      className="overflow-hidden rounded-2xl border transition-colors"
                      style={{
                        borderColor: isOpen ? palette.secondaryAccent : palette.border,
                        backgroundColor: palette.cardBg,
                      }}
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenDayIdx(isOpen ? -1 : idx)}
                        className="flex min-h-[54px] w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]"
                              style={{ color: palette.secondaryAccent }}
                            >
                              {step.day}
                            </span>
                            <span
                              className="font-mono text-[9.5px] uppercase tracking-[0.12em]"
                              style={{ color: palette.mutedInk }}
                            >
                              · {step.timeOfDay}
                            </span>
                          </div>
                          <p className="mt-0.5 font-editorial text-lg leading-snug">
                            {step.title}
                          </p>
                        </div>

                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs"
                          style={{ borderColor: palette.border }}
                        >
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      {isOpen ? (
                        <div
                          className="border-t px-4 pb-4 pt-3 animate-fade-in"
                          style={{ borderColor: palette.border }}
                        >
                          <p
                            className="font-sans text-xs leading-relaxed sm:text-[13px]"
                            style={{ color: palette.mutedInk }}
                          >
                            {step.detail}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                            style={{
                              borderColor: palette.border,
                              color: palette.secondaryAccent,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: palette.secondaryAccent }}
                              aria-hidden="true"
                            />
                            <span>Signature Moment: {step.highlight}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4: INTERACTIVE WINDOW-SEAT PARALLAX PORTAL                 */}
        {/* ================================================================= */}
        <section
          id="wz-travel-window"
          className="border-y px-3 py-9 sm:px-7 sm:py-12"
          style={{
            borderColor: palette.border,
            backgroundColor: palette.sectionAltBg,
          }}
        >
          <div className="mx-auto max-w-[1140px]">
            <div className="wz-tv-window-grid">
              {/* Left: Sculpted Airplane / Train / Coastal Arch Window Frame */}
              <div className="mx-auto w-full max-w-[460px]">
                <div
                  onPointerMove={handlePortalPointerMove}
                  onPointerLeave={handlePortalPointerLeave}
                  className="relative overflow-hidden rounded-[44px] border-[10px] border-[#262B36] bg-[#141923] p-3 shadow-[0_28px_64px_-22px_rgba(12,18,30,0.6),inset_0_2px_10px_rgba(255,255,255,0.22)]"
                >
                  {/* Recessed Inner Cabin Rim */}
                  <div
                    className={`relative aspect-[4/5] w-full overflow-hidden border-4 border-[#10141C] bg-[#0D131F] shadow-[inset_0_10px_28px_rgba(0,0,0,0.65)] ${
                      activePortal.frameStyle === 'arch'
                        ? 'rounded-t-[999px] rounded-b-[20px]'
                        : activePortal.frameStyle === 'train'
                          ? 'rounded-[24px]'
                          : 'rounded-[96px]'
                    }`}
                  >
                    {!failedImages[activePortal.src] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={activePortal.id}
                        src={activePortal.src}
                        alt={activePortal.label}
                        onError={() => markImageFailed(activePortal.src)}
                        className="h-full w-full object-cover"
                        style={{
                          transform: reducedMotion
                            ? 'scale(1.04)'
                            : `translate3d(${portalShift.x}px, ${portalShift.y}px, 0) scale(1.13)`,
                          transition: 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                    ) : null}

                    {/* Optional Dusk Cabin Shade Curtain */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#171E2C]/90 via-[#171E2C]/65 to-transparent transition-all duration-500"
                      style={{
                        height: shadeLevel === 'dusk' ? '44%' : '0%',
                        opacity: shadeLevel === 'dusk' ? 1 : 0,
                      }}
                    />

                    {/* Subtle curved glass highlight reflection */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(125deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.03) 34%, transparent 56%, rgba(0,0,0,0.28) 100%)',
                      }}
                    />

                    {/* Cabin Telemetry Overlay Inside Lower Glass */}
                    <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/90 backdrop-blur-xs">
                      <span className="truncate">{activePortal.telemetryLeft}</span>
                      <span className="shrink-0 text-[#F6D393]">{activePortal.telemetryRight}</span>
                    </div>
                  </div>

                  {/* Tactile Window Shade Handle Notch */}
                  <div className="mt-2.5 flex items-center justify-between px-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/55">
                      WINDOW PORTAL · PARALLAX LIVE
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShadeLevel((prev) => (prev === 'open' ? 'dusk' : 'open'))
                      }
                      aria-pressed={shadeLevel === 'dusk'}
                      className="min-h-[44px] rounded-full border border-white/20 bg-white/10 px-3.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/20"
                    >
                      {shadeLevel === 'dusk' ? 'Raise Shade' : 'Dusk Tint'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Portal Selector & Narrative */}
              <div className="space-y-4">
                <div>
                  <p
                    className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: palette.secondaryAccent }}
                  >
                    {copy.chapterWindowEyebrow}
                  </p>
                  <h2
                    className="mt-1 font-editorial text-2xl leading-tight sm:text-4xl"
                    style={langSafe}
                  >
                    {copy.chapterWindowTitle}
                  </h2>
                  <p
                    className="mt-2 font-literary text-sm italic leading-relaxed sm:text-base"
                    style={{ color: palette.mutedInk, ...langSafe }}
                  >
                    {activePortal.poeticLine}
                  </p>
                </div>

                <div
                  role="tablist"
                  aria-label="Choose window seat portal view"
                  className="space-y-2.5"
                >
                  {WINDOW_PORTALS.map((portal, idx) => {
                    const isActive = portal.id === activePortal.id;
                    return (
                      <button
                        key={portal.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActivePortalId(portal.id)}
                        className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all active:scale-[0.99]"
                        style={{
                          backgroundColor: isActive ? palette.accent : palette.cardBg,
                          borderColor: isActive ? palette.accent : palette.border,
                          color: isActive ? palette.accentInk : palette.ink,
                        }}
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-[9px] uppercase tracking-[0.18em] opacity-70">
                            VIEW 0{idx + 1} · {portal.telemetryRight}
                          </p>
                          <p className="mt-0.5 truncate font-editorial text-lg">
                            {portal.label}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-xs opacity-75">→</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5: SOUVENIR MAGNET & PERFORATED POSTAGE STAMP WALL         */}
        {/* ================================================================= */}
        <section id="wz-travel-stamps" className="px-3 py-9 sm:px-7 sm:py-12">
          <div className="mx-auto max-w-[1140px]">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: palette.secondaryAccent }}
                >
                  {copy.chapterStampsEyebrow}
                </p>
                <h2
                  className="mt-1 font-editorial text-2xl leading-tight sm:text-4xl"
                  style={langSafe}
                >
                  {copy.chapterStampsTitle}
                </h2>
              </div>

              {/* Miniature Vintage Postcard & Magnet Shelf Accent Strip */}
              <div className="flex items-center gap-2">
                {['/templates/travel/souvenir-magnets.jpg', '/templates/travel/vintage-postcards.jpg'].map(
                  (thumbSrc, idx) =>
                    !failedImages[thumbSrc] ? (
                      <div
                        key={thumbSrc}
                        className="h-11 w-16 overflow-hidden rounded-lg border shadow-xs"
                        style={{ borderColor: palette.border }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbSrc}
                          alt={idx === 0 ? 'Souvenir city magnets archive' : 'Vintage travel postcards archive'}
                          loading="lazy"
                          onError={() => markImageFailed(thumbSrc)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null,
                )}
              </div>
            </div>

            {/* Animated Dashed Route Trail Connecting Stamps */}
            <div className="relative">
              <svg
                viewBox="0 0 1100 72"
                preserveAspectRatio="none"
                className="pointer-events-none mb-2 hidden h-10 w-full sm:block"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={routeGradId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C85A3F" />
                    <stop offset="50%" stopColor="#E5A23C" />
                    <stop offset="100%" stopColor="#5CA7D6" />
                  </linearGradient>
                </defs>
                <path
                  d="M 42 46 Q 165 6, 285 38 T 550 30 T 820 42 T 1058 26"
                  fill="none"
                  stroke={`url(#${routeGradId})`}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeDasharray="7 8"
                  className="wz-tv-route-dash"
                />
                {[42, 245, 448, 652, 855, 1058].map((cx, i) => (
                  <circle
                    key={`route-node-${cx}`}
                    cx={cx}
                    cy={i % 2 === 0 ? 44 : 26}
                    r="4.2"
                    fill={palette.secondaryAccent}
                  />
                ))}
              </svg>

              {/* Perforated Postage Stamp Grid */}
              <div className="wz-tv-stamp-grid">
                {resolvedStamps.map((stamp) => {
                  const isActive = stamp.id === activeStamp.id;
                  return (
                    <button
                      key={stamp.id}
                      type="button"
                      onClick={() => setActiveStampId(stamp.id)}
                      aria-pressed={isActive}
                      className={`wz-tv-stamp-outer group relative flex flex-col text-left transition-all duration-300 hover:z-10 hover:rotate-0 hover:-translate-y-1 active:scale-95 ${
                        isActive ? 'z-10 rotate-0 scale-[1.03]' : stamp.tiltClass
                      }`}
                      style={
                        {
                          '--stamp-paper': stamp.bgTint,
                          color: stamp.stampInk,
                          filter: isActive
                            ? 'drop-shadow(0 14px 20px rgba(15,24,40,0.34))'
                            : 'drop-shadow(0 8px 14px rgba(15,24,40,0.22))',
                        } as React.CSSProperties
                      }
                    >
                      <div
                        className="flex h-full w-full flex-col p-1.5"
                        style={{
                          backgroundColor: stamp.bgTint,
                          boxShadow: isActive ? 'inset 0 0 0 1.5px #E5A23C' : 'none',
                        }}
                      >
                        <div className="flex items-center justify-between px-0.5 pb-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em]">
                          <span className="truncate">{stamp.country}</span>
                          <span>{stamp.denomination}</span>
                        </div>

                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-black/10">
                          {!failedImages[stamp.src] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={stamp.src}
                              alt={`${stamp.city} postage stamp`}
                              loading="lazy"
                              onError={() => markImageFailed(stamp.src)}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : null}
                          <span className="absolute bottom-1 right-1 rounded-xs bg-black/60 px-1.5 py-0.5 font-mono text-[7.5px] font-bold tracking-widest text-white">
                            {stamp.year}
                          </span>
                        </div>

                        <p className="mt-1.5 truncate text-center font-editorial text-sm font-semibold tracking-wider">
                          {stamp.city}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE POSTCARD MEMORY NOTE & HIGHLIGHT CARD */}
            <div
              className="mt-6 overflow-hidden rounded-[22px] border p-5 shadow-sm sm:p-6"
              style={{
                borderColor: palette.border,
                backgroundColor: palette.cardBg,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        borderColor: palette.border,
                        color: palette.secondaryAccent,
                      }}
                    >
                      AIR MAIL POSTCARD · {activeStamp.postmarkCode}
                    </span>
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-[0.14em]"
                      style={{ color: palette.mutedInk }}
                    >
                      {activeStamp.coordinates}
                    </span>
                  </div>

                  <h3 className="mt-2 font-editorial text-2xl sm:text-3xl" style={langSafe}>
                    {activeStamp.memoryTitle}
                  </h3>
                  <p
                    className="mt-2 max-w-2xl font-literary text-sm italic leading-relaxed sm:text-base"
                    style={{ color: palette.mutedInk, ...langSafe }}
                  >
                    &ldquo;{activeStamp.memoryNote}&rdquo;
                  </p>
                </div>

                {/* Circular Postmark Cancellation SVG Stamp */}
                <svg
                  viewBox="0 0 92 92"
                  className="h-20 w-20 shrink-0 opacity-75"
                  aria-hidden="true"
                  style={{ color: palette.secondaryAccent }}
                >
                  <circle cx="46" cy="46" r="40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" />
                  <circle cx="46" cy="46" r="29" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M8 40 Q 28 34, 46 40 T 84 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
                  <path d="M8 52 Q 28 46, 46 52 T 84 52" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
                  <text
                    x="46"
                    y="49"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="8.5"
                    fontWeight="700"
                    letterSpacing="1.6"
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                  >
                    {activeStamp.city.slice(0, 8)}
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5B: COLLECTIBLE TRAVEL PASSPORT STAMP BOOK (X/4 STAMPED)  */}
        {/* ================================================================= */}
        <section
          id="wz-travel-passport"
          className="border-t px-3 py-9 sm:px-7 sm:py-12"
          style={{
            borderColor: palette.border,
            backgroundColor: palette.outerBg,
          }}
        >
          <div className="mx-auto max-w-[1140px]">
            <div className="rounded-[24px] border p-4 shadow-sm sm:p-6" style={{ borderColor: palette.border, backgroundColor: palette.cardBg }}>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4" style={{ borderColor: palette.border }}>
                <div className="max-w-xl">
                  <p
                    className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: palette.secondaryAccent }}
                  >
                    {copy.chapterPassportEyebrow}
                  </p>
                  <h2
                    className="mt-1 font-editorial text-2xl leading-tight sm:text-3xl"
                    style={langSafe}
                  >
                    {copy.chapterPassportTitle}
                  </h2>
                  <p
                    className="mt-1.5 font-sans text-xs leading-relaxed sm:text-sm"
                    style={{ color: palette.mutedInk, ...langSafe }}
                  >
                    {copy.chapterPassportDesc}
                  </p>
                </div>

                {/* Live X/4 Stamped Progress Counter + Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    aria-live="polite"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      borderColor: palette.secondaryAccent,
                      color: palette.secondaryAccent,
                    }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.secondaryAccent }} aria-hidden="true" />
                    <span>
                      {stampedCount}/4 {copy.passportStampedWord}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={stampedCount === 4 ? resetPassportStops : stampAllPassportStops}
                    className="inline-flex min-h-[44px] items-center rounded-full border px-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition active:scale-95"
                    style={{
                      borderColor: palette.border,
                      color: palette.ink,
                    }}
                  >
                    {stampedCount === 4 ? copy.passportReset : copy.passportStampAll}
                  </button>
                </div>
              </div>

              {/* Passport Progress Rail */}
              <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: palette.sectionAltBg }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(stampedCount / PASSPORT_STAMPS.length) * 100}%`,
                    backgroundColor: palette.secondaryAccent,
                  }}
                />
              </div>

              {/* 4 Curated Destination Passport Ink Cards */}
              <div className="wz-tv-passport-grid mt-5">
                {PASSPORT_STAMPS.map((stop, idx) => {
                  const isStamped = Boolean(stampedCities[stop.id]);
                  return (
                    <button
                      key={stop.id}
                      type="button"
                      aria-pressed={isStamped}
                      onClick={() => togglePassportStamp(stop.id)}
                      className="group relative flex min-h-[158px] flex-col justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200 active:scale-[0.98]"
                      style={{
                        borderColor: isStamped ? stop.inkHex : palette.border,
                        backgroundColor: palette.isDark
                          ? isStamped
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(255,255,255,0.02)'
                          : isStamped
                            ? '#FBF7EE'
                            : palette.sectionAltBg,
                      }}
                    >
                      {/* Top Visa Header */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: palette.mutedInk }}
                        >
                          {stop.visaCode}
                        </span>
                        <span
                          className="rounded-sm border px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.14em]"
                          style={{
                            borderColor: isStamped ? stop.inkHex : palette.border,
                            color: isStamped ? stop.inkHex : palette.mutedInk,
                          }}
                        >
                          {stop.code}
                        </span>
                      </div>

                      {/* City Name & Tagline */}
                      <div className="relative z-10 my-2">
                        <p className="font-editorial text-xl leading-tight" style={langSafe}>
                          {stop.city}
                        </p>
                        <p
                          className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em]"
                          style={{ color: palette.mutedInk }}
                        >
                          {stop.country} · {stop.coordinates}
                        </p>
                        <p
                          className="mt-1.5 text-[11px] leading-snug"
                          style={{ color: palette.mutedInk, ...langSafe }}
                        >
                          {stop.tagline[coreLang]}
                        </p>
                      </div>

                      {/* Bottom Ink Status Line */}
                      <div className="relative z-10 flex items-center justify-between gap-2 border-t pt-2" style={{ borderColor: palette.border }}>
                        <span
                          className="font-mono text-[9px] font-bold uppercase tracking-[0.14em]"
                          style={{ color: isStamped ? stop.inkHex : palette.mutedInk }}
                        >
                          {isStamped ? copy.passportInked : copy.passportTapToStamp}
                        </span>
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] font-bold"
                          style={{
                            borderColor: isStamped ? stop.inkHex : palette.border,
                            backgroundColor: isStamped ? stop.inkHex : 'transparent',
                            color: isStamped ? '#FFFFFF' : palette.mutedInk,
                          }}
                          aria-hidden="true"
                        >
                          {isStamped ? 'OK' : '+'}
                        </span>
                      </div>

                      {/* Tactile Inked Immigration Seal SVG Overlay when Stamped */}
                      {isStamped ? (
                        <svg
                          viewBox="0 0 96 96"
                          aria-hidden="true"
                          className={`pointer-events-none absolute -right-2 top-5 h-20 w-20 opacity-80 transition-transform duration-300 ${
                            idx % 2 === 0 ? '-rotate-12' : 'rotate-12'
                          }`}
                          style={{ color: stop.inkHex }}
                        >
                          <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeDasharray="5 2.5" />
                          <circle cx="48" cy="48" r="31" fill="none" stroke="currentColor" strokeWidth="1.2" />
                          <line x1="16" y1="48" x2="80" y2="48" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                          <text
                            x="48"
                            y="42"
                            textAnchor="middle"
                            fill="currentColor"
                            fontSize="9.5"
                            fontWeight="800"
                            letterSpacing="1.6"
                            fontFamily="ui-monospace, SFMono-Regular, monospace"
                          >
                            {stop.code}
                          </text>
                          <text
                            x="48"
                            y="59"
                            textAnchor="middle"
                            fill="currentColor"
                            fontSize="7"
                            fontWeight="700"
                            letterSpacing="1.4"
                            fontFamily="ui-monospace, SFMono-Regular, monospace"
                          >
                            VERIFIED
                          </text>
                        </svg>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 6: CONCIERGE TRIP INQUIRY & DIRECT WHATSAPP CTA            */}
        {/* ================================================================= */}
        <section
          id="wz-travel-concierge"
          className="border-t px-3 py-9 sm:px-7 sm:py-12"
          style={{
            borderColor: palette.border,
            backgroundColor: palette.sectionAltBg,
          }}
        >
          <div className="mx-auto max-w-[1140px]">
            <div className="wz-tv-concierge-split">
              {/* Left: Editorial Personal Note, Mood Selector & Season Selector */}
              <div className="space-y-5">
                <div>
                  <p
                    className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: palette.secondaryAccent }}
                  >
                    {copy.chapterConciergeEyebrow}
                  </p>
                  <h2
                    className="mt-1 font-editorial text-2xl leading-tight sm:text-4xl"
                    style={langSafe}
                  >
                    {copy.chapterConciergeTitle}
                  </h2>
                  <p
                    className="mt-2.5 font-literary text-sm leading-relaxed sm:text-base"
                    style={{ color: palette.mutedInk, ...langSafe }}
                  >
                    {conciergeMessage}
                  </p>
                </div>

                <div>
                  <p
                    className="mb-2.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: palette.mutedInk }}
                  >
                    {copy.moodPrompt}
                  </p>
                  <div
                    role="radiogroup"
                    aria-label={copy.moodPrompt}
                    className="wz-tv-mood-grid"
                  >
                    {TRIP_MOODS.map((mood) => {
                      const isSelected = mood.id === activeMood.id;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedMoodId(mood.id)}
                          className="flex min-h-[60px] flex-col justify-center rounded-2xl border px-3.5 py-2.5 text-left transition-all active:scale-[0.99]"
                          style={{
                            backgroundColor: isSelected ? palette.accent : palette.cardBg,
                            borderColor: isSelected ? palette.accent : palette.border,
                            color: isSelected ? palette.accentInk : palette.ink,
                          }}
                        >
                          <span className="font-editorial text-base leading-snug" style={langSafe}>
                            {mood.label[coreLang]}
                          </span>
                          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] opacity-75">
                            {mood.pace[coreLang]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Travel Season Pill Row */}
                <div>
                  <p
                    className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: palette.mutedInk }}
                  >
                    {copy.seasonPrompt}
                  </p>
                  <div
                    role="radiogroup"
                    aria-label={copy.seasonPrompt}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                  >
                    {TRIP_SEASONS.map((season) => {
                      const isSelected = season.id === activeSeason.id;
                      return (
                        <button
                          key={season.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedSeasonId(season.id)}
                          className="flex min-h-[48px] flex-col items-center justify-center rounded-xl border px-2.5 py-1.5 text-center transition active:scale-95"
                          style={{
                            backgroundColor: isSelected ? palette.secondaryAccent : palette.cardBg,
                            borderColor: isSelected ? palette.secondaryAccent : palette.border,
                            color: isSelected ? '#FFFFFF' : palette.ink,
                          }}
                        >
                          <span className="text-xs font-bold leading-tight" style={langSafe}>
                            {season.label[coreLang]}
                          </span>
                          <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] opacity-80">
                            {season.months}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Live Concierge Dispatch Dossier & WhatsApp CTA */}
              <div
                className="flex flex-col justify-between rounded-[22px] border p-5 shadow-sm sm:p-6"
                style={{
                  borderColor: palette.border,
                  backgroundColor: palette.cardBg,
                }}
              >
                <div>
                  <div
                    className="flex items-center justify-between border-b pb-3"
                    style={{ borderColor: palette.border }}
                  >
                    <span
                      className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: palette.secondaryAccent }}
                    >
                      EXPEDITION DOSSIER
                    </span>
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-[0.14em]"
                      style={{ color: palette.mutedInk }}
                    >
                      {stampedCount}/4 · {activeAtlas.flightNo}
                    </span>
                  </div>

                  <dl className="mt-4 space-y-3 text-xs">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: palette.mutedInk }}>
                        {copy.passportRouteLabel}
                      </dt>
                      <dd className="text-right font-editorial text-base">
                        {stampedList.length > 0
                          ? stampedList.map((s) => s.city).join(' · ')
                          : activeAtlas.tabLabel}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: palette.mutedInk }}>
                        Travel Mood
                      </dt>
                      <dd className="text-right font-editorial text-base" style={langSafe}>
                        {activeMood.label[coreLang]}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: palette.mutedInk }}>
                        {copy.seasonLabel}
                      </dt>
                      <dd className="text-right font-sans font-semibold" style={langSafe}>
                        {activeSeason.label[coreLang]} ({activeSeason.months})
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: palette.mutedInk }}>
                        {copy.curatedByLabel}
                      </dt>
                      <dd className="text-right font-sans font-semibold">{curatorName}</dd>
                    </div>
                  </dl>

                  <p
                    className="mt-4 rounded-xl border p-3 font-sans text-[11.5px] leading-relaxed"
                    style={{
                      borderColor: palette.border,
                      color: palette.mutedInk,
                      ...langSafe,
                    }}
                  >
                    {activeMood.tagline[coreLang]}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[#1C7C54] px-5 text-xs font-bold tracking-wide text-white shadow-sm transition hover:bg-[#176846] active:scale-[0.98]"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="h-4 w-4 shrink-0"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M10 2a8 8 0 0 0-6.86 12.1L2 18l4.02-1.08A8 8 0 1 0 10 2Zm3.95 11.15c-.17.47-.98.9-1.36.96-.35.05-.79.08-1.27-.08-.3-.1-.68-.22-1.17-.43-2.06-.89-3.4-2.98-3.5-3.12-.1-.14-.84-1.11-.84-2.12 0-1.01.53-1.51.72-1.71.19-.21.41-.26.55-.26h.4c.13 0 .3-.05.47.36.17.42.59 1.44.64 1.54.05.11.09.23.02.37-.07.14-.11.23-.22.36-.11.12-.23.28-.33.37-.11.11-.22.23-.1.45.12.22.55.9 1.18 1.46.81.72 1.49.95 1.71 1.06.22.11.35.09.48-.05.13-.14.55-.64.7-.86.15-.22.3-.18.5-.11.2.07 1.29.61 1.51.72.22.11.37.16.42.26.06.09.06.55-.11 1.02Z" />
                      </svg>
                      <span>{copy.whatsappCta}</span>
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleCopyBrief}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border px-4 text-xs font-semibold transition active:scale-[0.98]"
                    style={
                      whatsappHref
                        ? {
                            borderColor: palette.border,
                            color: palette.ink,
                          }
                        : {
                            backgroundColor: palette.accent,
                            borderColor: palette.accent,
                            color: palette.accentInk,
                          }
                    }
                  >
                    {copiedBrief ? copy.copiedBriefCta : copy.copyBriefCta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* WEBZY FOOTER */}
      <footer
        className="relative z-20 px-4 pb-5 pt-4 text-center text-[11px] font-medium"
        style={{ color: palette.mutedInk }}
      >
        {getWebzyFooterLabel(language)}
      </footer>

      {/* FLOATING WATERMARKED PREVIEW STYLE SWITCHER */}
      {watermarked ? (
        <div className="pointer-events-none sticky bottom-3 z-40 mt-auto flex w-full justify-center px-3 pb-1">
          <div
            role="tablist"
            aria-label="Travel edition style switcher"
            className="pointer-events-auto inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-[#121926]/90 p-1 text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md scrollbar-none"
          >
            {(['serendipity', 'atlas', 'capsule'] as const).map((variant) => {
              const isSelected = activeVariant === variant;
              const pillStyle =
                variant === 'serendipity'
                  ? 'bg-[#FAF9F6] text-[#15233A]'
                  : variant === 'atlas'
                    ? 'bg-[#C85A3F] text-[#FBF7F0]'
                    : 'bg-[#E5A23C] text-[#0B111C]';

              return (
                <button
                  key={variant}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setManualVariant(variant)}
                  className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-3.5 text-[11px] font-semibold tracking-wide transition-all active:scale-95 ${
                    isSelected
                      ? `${pillStyle} shadow-xs`
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {copy.switcher[variant]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
