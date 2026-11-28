import { AddonId, LanguageCode, LocalizedText, WebzyError } from '@webzy/core';

export type ThemeMode = 'ready-made' | 'semi-custom';

export type ThemeOccasion =
  | 'wedding'
  | 'travel'
  | 'birthday'
  | 'love'
  | 'anniversary'
  | 'family'
  | 'festival'
  | 'portfolio'
  | 'business';

export type ThemeFieldType =
  | 'text'
  | 'longtext'
  | 'choice'
  | 'images'
  | 'image'
  | 'datetime';

export interface ThemeFieldOption {
  value: string;
  label: LocalizedText;
}

export interface ThemeFieldSchema {
  key: string;
  type: ThemeFieldType;
  label: LocalizedText;
  required?: boolean;
  optional?: boolean;
  max?: number;
  aiDraft?: boolean;
  options?: ThemeFieldOption[];
  placeholder?: LocalizedText;
}

export interface ThemeMusicOption {
  id: string;
  label: string;
  mood: string;
  licenseStatus: 'verified' | 'pending';
}

export interface ThemeDemoPayload {
  receiverName: string;
  senderName: string;
  relation?: string;
  photos?: string[];
  revealAt?: string;
  timezone?: string;
  headline: LocalizedText;
  message: LocalizedText;
  highlights?: Array<{
    title: LocalizedText;
    detail: LocalizedText;
  }>;
  whatsappPhone?: string;
  offerTag?: LocalizedText;
}

export interface ThemePalette {
  primary: string;
  secondary: string;
  surface: string;
  ink: string;
}

export interface ThemeManifest {
  id: string;
  version: string;
  mode: ThemeMode;
  occasion: ThemeOccasion;
  languages: LanguageCode[];
  price: {
    base: number;
    compareAt?: number;
    addons: AddonId[];
  };
  isActive: boolean;
  featureFlag?: 'maanJaoTheme';
  name: LocalizedText;
  audience: LocalizedText;
  signatureMoment: LocalizedText;
  palette: ThemePalette;
  fields: ThemeFieldSchema[];
  music: ThemeMusicOption[];
  demoData: ThemeDemoPayload;
}

export function validateThemeManifest(manifest: ThemeManifest): ThemeManifest {
  if (!manifest.id || !/^[a-z0-9-]+$/.test(manifest.id)) {
    throw new WebzyError('Invalid theme manifest id.', {
      code: 'THEME_INVALID_ID',
      statusCode: 400,
    });
  }
  if (manifest.price.base < 19) {
    throw new WebzyError('Theme base price must be at least 19 INR.', {
      code: 'THEME_INVALID_PRICE',
      statusCode: 400,
    });
  }
  if (manifest.fields.length === 0 || manifest.fields.length > 6) {
    throw new WebzyError('Ready-made theme must declare between 1 and 6 fields.', {
      code: 'THEME_INVALID_FIELD_COUNT',
      statusCode: 400,
    });
  }
  return manifest;
}
