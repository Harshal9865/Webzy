export type WeddingLanguage = 'en' | 'hi' | 'gu' | 'mr' | 'pa' | 'bn' | 'ta' | 'te' | 'kn';

export const WEDDING_LANGUAGE_OPTIONS: Array<{
  code: WeddingLanguage;
  nativeLabel: string;
  englishLabel: string;
}> = [
  { code: 'en', nativeLabel: 'English', englishLabel: 'English' },
  { code: 'hi', nativeLabel: 'हिन्दी', englishLabel: 'Hindi' },
  { code: 'gu', nativeLabel: 'ગુજરાતી', englishLabel: 'Gujarati' },
  { code: 'mr', nativeLabel: 'मराठी', englishLabel: 'Marathi' },
  { code: 'pa', nativeLabel: 'ਪੰਜਾਬੀ', englishLabel: 'Punjabi' },
  { code: 'bn', nativeLabel: 'বাংলা', englishLabel: 'Bengali' },
  { code: 'ta', nativeLabel: 'தமிழ்', englishLabel: 'Tamil' },
  { code: 'te', nativeLabel: 'తెలుగు', englishLabel: 'Telugu' },
  { code: 'kn', nativeLabel: 'ಕನ್ನಡ', englishLabel: 'Kannada' },
];

const VALID_WEDDING_LANGS = new Set<string>(WEDDING_LANGUAGE_OPTIONS.map((l) => l.code));

export function parseWeddingLanguage(raw: string | undefined | null): WeddingLanguage | null {
  if (raw && VALID_WEDDING_LANGS.has(raw)) {
    return raw as WeddingLanguage;
  }
  return null;
}

export type WeddingThemeKey =
  | 'emerald'
  | 'royal-red'
  | 'royal-blue'
  | 'temple-gold'
  | 'rose-ivory'
  | 'christian-ivory';

export type WeddingTemplateId =
  | 'wedding-emerald-01'
  | 'wedding-royal-red-01'
  | 'wedding-royal-blue-01'
  | 'wedding-temple-gold-01'
  | 'wedding-rose-ivory-01'
  | 'wedding-christian-ivory-01';

export type WeddingTradition = 'hindu' | 'christian';

export const ALL_WEDDING_TEMPLATE_IDS: readonly WeddingTemplateId[] = [
  'wedding-emerald-01',
  'wedding-royal-red-01',
  'wedding-royal-blue-01',
  'wedding-temple-gold-01',
  'wedding-rose-ivory-01',
  'wedding-christian-ivory-01',
] as const;

const WEDDING_TEMPLATE_SET = new Set<string>(ALL_WEDDING_TEMPLATE_IDS);

export function isWeddingTemplateId(raw: string | undefined | null): raw is WeddingTemplateId {
  return Boolean(raw && WEDDING_TEMPLATE_SET.has(raw));
}

export function resolveWeddingThemeKey(templateId: string | undefined | null): WeddingThemeKey {
  switch (templateId) {
    case 'wedding-royal-red-01':
      return 'royal-red';
    case 'wedding-royal-blue-01':
      return 'royal-blue';
    case 'wedding-temple-gold-01':
      return 'temple-gold';
    case 'wedding-rose-ivory-01':
      return 'rose-ivory';
    case 'wedding-christian-ivory-01':
      return 'christian-ivory';
    case 'wedding-emerald-01':
    default:
      return 'emerald';
  }
}

export function resolveWeddingTradition(
  templateIdOrTheme?: string | null,
  explicitTradition?: WeddingTradition
): WeddingTradition {
  if (explicitTradition) return explicitTradition;
  if (templateIdOrTheme === 'wedding-christian-ivory-01' || templateIdOrTheme === 'christian-ivory') {
    return 'christian';
  }
  return 'hindu';
}

export type WeddingIconKey =
  | 'ganesha'
  | 'haldi'
  | 'mehendi'
  | 'sangeet'
  | 'pheras'
  | 'reception'
  | 'cocktail'
  | 'ring_ceremony'
  | 'church'
  | 'toast';

export interface WeddingEventItem {
  id: string;
  title: string;
  dateTime: string;
  venueName: string;
  address: string;
  mapUrl?: string;
  dressCode?: string;
  eventDressPalette?: string[];
  iconKey: WeddingIconKey;
}

export interface WeddingVenueHighlight {
  name: string;
  city: string;
  tagline: string;
  mapUrl: string;
  distanceNote?: string;
}

export interface WeddingStoryMilestone {
  year: string;
  title: string;
  caption: string;
}

export interface WeddingHospitalityNote {
  title: string;
  detail: string;
}

export interface WeddingRsvpConfig {
  enabled: boolean;
  whatsappNumber?: string;
  deadlineDate?: string;
  maxGuests: number;
  askMealPreference: boolean;
}

export interface WeddingShagunConfig {
  enabled: boolean;
  upiId?: string;
  beneficiaryName?: string;
}

export interface WeddingInvitation {
  slug: string;
  templateId: WeddingTemplateId;
  tradition?: WeddingTradition;
  language: WeddingLanguage;
  brideName: string;
  groomName: string;
  coupleTagline?: string;
  hashtag?: string;
  brideParents?: string;
  groomParents?: string;
  familyBlessingLine?: string;
  personalMessage: string;
  weddingDate: string;
  venueHighlight?: WeddingVenueHighlight;
  events: WeddingEventItem[];
  gallery: string[];
  storyTitle?: string;
  storyText?: string;
  storyMilestones?: WeddingStoryMilestone[];
  hospitalityNotes?: WeddingHospitalityNote[];
  musicUrl?: string;
  rsvp: WeddingRsvpConfig;
  shagun?: WeddingShagunConfig;
  themeOverrides?: {
    accentColor?: string;
  };
  publishedAt?: string;
  expiresAt?: string;
  passwordProtect?: string;
}

export function validateWeddingInvitation(input: Partial<WeddingInvitation>): WeddingInvitation {
  if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug)) {
    throw new Error('Invalid wedding slug. Must contain only lowercase letters, numbers, and hyphens.');
  }
  if (!input.brideName || !input.groomName) {
    throw new Error('Bride and Groom names are required.');
  }
  if (!input.weddingDate) {
    throw new Error('Wedding date is required.');
  }
  const templateId: WeddingTemplateId = isWeddingTemplateId(input.templateId)
    ? input.templateId
    : 'wedding-emerald-01';
  const tradition = resolveWeddingTradition(templateId, input.tradition);
  const defaultBlessing =
    tradition === 'christian'
      ? 'Love is patient, love is kind — 1 Corinthians 13:4'
      : '|| Shri Ganeshay Namah ||';

  return {
    slug: input.slug,
    templateId,
    tradition,
    language: input.language ?? 'en',
    brideName: input.brideName,
    groomName: input.groomName,
    coupleTagline: input.coupleTagline,
    hashtag: input.hashtag,
    brideParents: input.brideParents,
    groomParents: input.groomParents,
    familyBlessingLine: input.familyBlessingLine ?? defaultBlessing,
    personalMessage: input.personalMessage ?? '',
    weddingDate: input.weddingDate,
    venueHighlight: input.venueHighlight,
    events: input.events ?? [],
    gallery: input.gallery ?? [],
    storyTitle: input.storyTitle ?? 'Our Journey',
    storyText: input.storyText,
    storyMilestones: input.storyMilestones,
    hospitalityNotes: input.hospitalityNotes,
    musicUrl: input.musicUrl,
    rsvp: input.rsvp ?? {
      enabled: true,
      maxGuests: 2,
      askMealPreference: true,
    },
    shagun: input.shagun,
    themeOverrides: input.themeOverrides,
    publishedAt: input.publishedAt,
    expiresAt: input.expiresAt,
    passwordProtect: input.passwordProtect,
  };
}
