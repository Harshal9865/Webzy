import {
  MOCK_CHRISTIAN_IVORY_WEDDING,
  MOCK_EMERALD_WEDDING,
  MOCK_ROSE_IVORY_WEDDING,
  MOCK_ROYAL_BLUE_WEDDING,
  MOCK_ROYAL_RED_WEDDING,
  MOCK_TEMPLE_GOLD_WEDDING,
  type WeddingInvitation,
  type WeddingTemplateId,
  type WeddingTradition,
} from '@webzy/themes';

export type { WeddingTemplateId, WeddingTradition };

export interface WeddingEditionMeta {
  id: WeddingTemplateId;
  tradition: WeddingTradition;
  traditionLabel: string;
  editionRoman: string;
  monogram: string;
  coverSealLabel: string;
  ceremonyArtCaption: string;
  editorialName: string;
  collectionSubtitle: string;
  moodLabel: string;
  storyLead: string;
  specimenCouple: string;
  specimenCity: string;
  specimenDate: string;
  demoSlug: string;
  sampleGuest: string;
  priceInr: number;
  compareAtInr: number;
  validityDays: number;
  coverArtUrl: string;
  sceneArtUrl: string;
  sceneWideArtUrl: string;
  ceremonyArtUrl: string;
  isDarkTheme: boolean;
  palette: {
    primary: string;
    primaryHover: string;
    surface: string;
    accent: string;
    ink: string;
  };
  highlights: string[];
  includedSections: Array<{ title: string; detail: string }>;
  defaultData: WeddingInvitation;
}

export const WEDDING_EDITIONS: WeddingEditionMeta[] = [
  {
    id: 'wedding-emerald-01',
    tradition: 'hindu',
    traditionLabel: 'Hindu Vivah',
    editionRoman: 'Edition I',
    monogram: 'A & K',
    coverSealLabel: 'Doors',
    ceremonyArtCaption: 'Udaipur Mandap Art',
    editorialName: 'Swarna Vatika',
    collectionSubtitle: 'Emerald Palace · Hindu Vivah',
    moodLabel: 'Daylight Courtyard · Sage & Gold',
    storyLead: 'Udaipur Courtyard · 6 Click-Cards · 9 Languages',
    specimenCouple: 'Aanya & Kabir',
    specimenCity: 'Udaipur',
    specimenDate: '24 Dec 2026',
    demoSlug: 'aanya-kabir',
    sampleGuest: 'Sharma Family',
    priceInr: 499,
    compareAtInr: 1499,
    validityDays: 7,
    coverArtUrl: '/templates/wedding-emerald-01/art/doors-embossed.jpg',
    sceneArtUrl: '/templates/wedding-emerald-01/art/jharokha-scene.jpg',
    sceneWideArtUrl: '/templates/wedding-emerald-01/art/jharokha-scene-wide.jpg',
    ceremonyArtUrl: '/templates/weddings/art/ceremony-emerald-wide.jpg',
    isDarkTheme: false,
    palette: {
      primary: '#2D4F35',
      primaryHover: '#223D28',
      surface: '#F4F7F4',
      accent: '#C9A243',
      ink: '#1E3323',
    },
    highlights: [
      'Embossed Doors',
      'Click-Card Deck',
      'Dress Swatches',
      '1-Tap RSVP',
    ],
    includedSections: [
      {
        title: 'Palace Doors Cover',
        detail: '3D Embossed Gate Reveal',
      },
      {
        title: 'Shubh Muhurat Timer',
        detail: 'Live IST Countdown Card',
      },
      {
        title: 'Ceremony & Dress Deck',
        detail: 'Tap Tabs · Swatch Palette',
      },
      {
        title: 'Venue & Travel Guide',
        detail: '1-Tap Map · Stay Tabs',
      },
      {
        title: 'Story & Photo Deck',
        detail: 'Click Milestones · Touch Lightbox',
      },
      {
        title: 'RSVP & UPI Shagun',
        detail: '1-Tap Meal & Blessing',
      },
    ],
    defaultData: MOCK_EMERALD_WEDDING,
  },
  {
    id: 'wedding-royal-red-01',
    tradition: 'hindu',
    traditionLabel: 'Hindu Vivah',
    editionRoman: 'Edition II',
    monogram: 'R & S',
    coverSealLabel: 'Wax Seal',
    ceremonyArtCaption: 'Rajwada Mandap Art',
    editorialName: 'Sindoora Mahal',
    collectionSubtitle: 'Sindoor Velvet · Rajwada Vivah',
    moodLabel: 'Royal Palace · Sindoor & Gold',
    storyLead: 'Jaipur Jharokha · 6 Click-Cards · 9 Languages',
    specimenCouple: 'Riya & Siddharth',
    specimenCity: 'Jaipur',
    specimenDate: '18 Jan 2027',
    demoSlug: 'riya-siddharth',
    sampleGuest: 'Kapoor Family',
    priceInr: 499,
    compareAtInr: 1499,
    validityDays: 7,
    coverArtUrl: '/templates/wedding-royal-red-01/art/velvet-embossed.jpg',
    sceneArtUrl: '/templates/wedding-royal-red-01/art/mughal-scene.jpg',
    sceneWideArtUrl: '/templates/wedding-royal-red-01/art/mughal-scene-wide.jpg',
    ceremonyArtUrl: '/templates/weddings/art/ceremony-royal-wide.jpg',
    isDarkTheme: true,
    palette: {
      primary: '#6B0F1E',
      primaryHover: '#500A16',
      surface: '#FDF6F7',
      accent: '#D4AF37',
      ink: '#3A0710',
    },
    highlights: [
      'Velvet Wax Seal',
      'Click-Card Deck',
      'UPI Shagun',
      '1-Tap RSVP',
    ],
    includedSections: [
      {
        title: 'Sindoor Velvet Seal',
        detail: '4-Flap Wax Seal Reveal',
      },
      {
        title: 'Rajwada Jharokha Arch',
        detail: 'Mayur & Diya Art',
      },
      {
        title: 'Ceremony & Dress Deck',
        detail: 'Tap Tabs · Swatch Palette',
      },
      {
        title: 'Travel & Stay Tabs',
        detail: '1-Tap Map · Concierge Chips',
      },
      {
        title: 'Story & Photo Deck',
        detail: 'Click Milestones · Touch Lightbox',
      },
      {
        title: 'RSVP & UPI Shagun',
        detail: '1-Tap Meal & Blessing',
      },
    ],
    defaultData: MOCK_ROYAL_RED_WEDDING,
  },
  {
    id: 'wedding-christian-ivory-01',
    tradition: 'christian',
    traditionLabel: 'Christian Wedding',
    editionRoman: 'Edition III',
    monogram: 'C & A',
    coverSealLabel: 'Cathedral',
    ceremonyArtCaption: 'Chapel Altar Art',
    editorialName: 'Grace Cathedral',
    collectionSubtitle: 'Ivory Chapel · Christian Nuptials',
    moodLabel: 'Heritage Chapel · Ivory & Olive',
    storyLead: 'Goa Cathedral · 6 Click-Cards · 9 Languages',
    specimenCouple: 'Claire & Aaron',
    specimenCity: 'South Goa',
    specimenDate: '19 Dec 2026',
    demoSlug: 'claire-aaron',
    sampleGuest: 'Pereira Family',
    priceInr: 499,
    compareAtInr: 1499,
    validityDays: 7,
    coverArtUrl: '/templates/wedding-christian-ivory-01/art/chapel-cover.jpg',
    sceneArtUrl: '/templates/wedding-christian-ivory-01/art/chapel-scene.jpg',
    sceneWideArtUrl: '/templates/wedding-christian-ivory-01/art/chapel-scene-wide.jpg',
    ceremonyArtUrl: '/templates/weddings/art/ceremony-christian-wide.jpg',
    isDarkTheme: false,
    palette: {
      primary: '#2F3F33',
      primaryHover: '#223025',
      surface: '#FAF8F4',
      accent: '#C49A55',
      ink: '#28332B',
    },
    highlights: [
      'Cathedral Doors',
      'Click-Card Deck',
      'Roce & Mass',
      '1-Tap RSVP',
    ],
    includedSections: [
      {
        title: 'Cathedral Arch Doors',
        detail: 'Olive & Cross Seal',
      },
      {
        title: 'Vows & Scripture Card',
        detail: 'Verse & Live Countdown',
      },
      {
        title: 'Nuptial & Toast Deck',
        detail: 'Roce · Mass · Reception',
      },
      {
        title: 'Chapel & Shuttle Tabs',
        detail: '1-Tap Map · Timing Chips',
      },
      {
        title: 'Story & Photo Deck',
        detail: 'Click Milestones · Touch Lightbox',
      },
      {
        title: 'RSVP & Gift Fund',
        detail: '1-Tap Dietary & Blessing',
      },
    ],
    defaultData: MOCK_CHRISTIAN_IVORY_WEDDING,
  },
  {
    id: 'wedding-royal-blue-01',
    tradition: 'hindu',
    traditionLabel: 'Hindu Vivah',
    editionRoman: 'Edition IV',
    monogram: 'M & D',
    coverSealLabel: 'Jali Doors',
    ceremonyArtCaption: 'Starlit Baradari Art',
    editorialName: 'Neela Rajwada',
    collectionSubtitle: 'Midnight Indigo · Marwar Vivah',
    moodLabel: 'Moonlit Palace · Indigo & Gold',
    storyLead: 'Jodhpur Baradari · 6 Click-Cards · 9 Languages',
    specimenCouple: 'Meera & Dev',
    specimenCity: 'Jodhpur',
    specimenDate: '14 Feb 2027',
    demoSlug: 'meera-dev',
    sampleGuest: 'Rathore Family',
    priceInr: 499,
    compareAtInr: 1499,
    validityDays: 7,
    coverArtUrl: '/templates/wedding-royal-blue-01/art/indigo-doors.jpg',
    sceneArtUrl: '/templates/wedding-royal-blue-01/art/jodhpur-scene.jpg',
    sceneWideArtUrl: '/templates/wedding-royal-blue-01/art/jodhpur-scene-wide.jpg',
    ceremonyArtUrl: '/templates/weddings/art/ceremony-indigo-wide.jpg',
    isDarkTheme: true,
    palette: {
      primary: '#132447',
      primaryHover: '#0D1A35',
      surface: '#F4F5FA',
      accent: '#DFBE6B',
      ink: '#0F1C36',
    },
    highlights: [
      'Indigo Jali Doors',
      'Click-Card Deck',
      'Sufi Sangeet',
      '1-Tap RSVP',
    ],
    includedSections: [
      {
        title: 'Indigo Jali Shutters',
        detail: '3D Moonlit Gate Reveal',
      },
      {
        title: 'Starlit Jodhpur Scene',
        detail: 'Lantern & Dome Art',
      },
      {
        title: 'Ceremony & Dress Deck',
        detail: 'Tap Tabs · Swatch Palette',
      },
      {
        title: 'Palace Travel Tabs',
        detail: '1-Tap Map · Weather Chips',
      },
      {
        title: 'Story & Photo Deck',
        detail: 'Click Milestones · Touch Lightbox',
      },
      {
        title: 'RSVP & UPI Shagun',
        detail: '1-Tap Meal & Blessing',
      },
    ],
    defaultData: MOCK_ROYAL_BLUE_WEDDING,
  },
  {
    id: 'wedding-temple-gold-01',
    tradition: 'hindu',
    traditionLabel: 'Hindu Vivah',
    editionRoman: 'Edition V',
    monogram: 'A & K',
    coverSealLabel: 'Silk Zari',
    ceremonyArtCaption: 'Temple Mandapam Art',
    editorialName: 'Kashi Swarna',
    collectionSubtitle: 'Kanjeevaram Silk · Temple Muhurtham',
    moodLabel: 'Sunrise Temple · Maroon & Gold',
    storyLead: 'Dravidian Gopuram · 6 Click-Cards · 9 Languages',
    specimenCouple: 'Ananya & Karthik',
    specimenCity: 'Chennai',
    specimenDate: '29 Jan 2027',
    demoSlug: 'ananya-karthik',
    sampleGuest: 'Subramanian Family',
    priceInr: 499,
    compareAtInr: 1499,
    validityDays: 7,
    coverArtUrl: '/templates/wedding-temple-gold-01/art/kanjeevaram-cover.jpg',
    sceneArtUrl: '/templates/wedding-temple-gold-01/art/temple-gold-scene.jpg',
    sceneWideArtUrl: '/templates/wedding-temple-gold-01/art/temple-gold-scene-wide.jpg',
    ceremonyArtUrl: '/templates/weddings/art/ceremony-temple-wide.jpg',
    isDarkTheme: false,
    palette: {
      primary: '#5A1812',
      primaryHover: '#44110C',
      surface: '#FCF6EA',
      accent: '#E8BA55',
      ink: '#3B1710',
    },
    highlights: [
      'Silk Zari Cover',
      'Click-Card Deck',
      'Muhurtham & Sadhya',
      '1-Tap RSVP',
    ],
    includedSections: [
      {
        title: 'Kanjeevaram Zari Gate',
        detail: 'Silk & Kalash Reveal',
      },
      {
        title: 'Temple Gopuram Art',
        detail: 'Lotus & Brass Lamps',
      },
      {
        title: 'Muhurtham & Feast Deck',
        detail: 'Oonjal · Sadhya · Swatches',
      },
      {
        title: 'Temple Map & Tabs',
        detail: '1-Tap Map · Morning Guide',
      },
      {
        title: 'Story & Photo Deck',
        detail: 'Click Milestones · Touch Lightbox',
      },
      {
        title: '9 Indian Scripts',
        detail: 'Tamil · Telugu · Kannada',
      },
    ],
    defaultData: MOCK_TEMPLE_GOLD_WEDDING,
  },
  {
    id: 'wedding-rose-ivory-01',
    tradition: 'hindu',
    traditionLabel: 'Hindu Vivah',
    editionRoman: 'Edition VI',
    monogram: 'T & V',
    coverSealLabel: 'Wax Seal',
    ceremonyArtCaption: 'Rose Mandap Art',
    editorialName: 'Gulab Bagh',
    collectionSubtitle: 'Blush Marble · Garden Vivah',
    moodLabel: 'Golden Hour · Blush & Champagne',
    storyLead: 'Lotus Pavilion · 6 Click-Cards · 9 Languages',
    specimenCouple: 'Tara & Vihaan',
    specimenCity: 'Samode, Jaipur',
    specimenDate: '21 Feb 2027',
    demoSlug: 'tara-vihaan',
    sampleGuest: 'Khanna Family',
    priceInr: 499,
    compareAtInr: 1499,
    validityDays: 7,
    coverArtUrl: '/templates/wedding-rose-ivory-01/art/rose-folio-cover.jpg',
    sceneArtUrl: '/templates/wedding-rose-ivory-01/art/rose-palace-scene.jpg',
    sceneWideArtUrl: '/templates/wedding-rose-ivory-01/art/rose-palace-scene-wide.jpg',
    ceremonyArtUrl: '/templates/weddings/art/ceremony-rose-wide.jpg',
    isDarkTheme: false,
    palette: {
      primary: '#5E2839',
      primaryHover: '#491E2C',
      surface: '#FDF6F6',
      accent: '#C7985A',
      ink: '#4A2530',
    },
    highlights: [
      'Blush Wax Seal',
      'Click-Card Deck',
      'Pastel Swatches',
      '1-Tap RSVP',
    ],
    includedSections: [
      {
        title: 'Blush Silk Envelope',
        detail: 'Rose Quartz Seal Reveal',
      },
      {
        title: 'Marble Lotus Pavilion',
        detail: 'Golden Hour Garden Art',
      },
      {
        title: 'Daylight Ceremony Deck',
        detail: 'Tap Tabs · Pastel Swatches',
      },
      {
        title: 'Garden Map & Tabs',
        detail: '1-Tap Map · Shuttle Chips',
      },
      {
        title: 'Story & Photo Deck',
        detail: 'Click Milestones · Touch Lightbox',
      },
      {
        title: 'RSVP & UPI Shagun',
        detail: '1-Tap Meal & Blessing',
      },
    ],
    defaultData: MOCK_ROSE_IVORY_WEDDING,
  },
];

export function getWeddingEdition(id: string): WeddingEditionMeta | undefined {
  return WEDDING_EDITIONS.find((e) => e.id === id);
}

export function formatInrComma(amountInr: number): string {
  return `₹${Math.round(amountInr).toLocaleString('en-IN')}`;
}
