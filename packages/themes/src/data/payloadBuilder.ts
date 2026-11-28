import type { LocalizedText } from '@webzy/core';
import type { ThemeDemoPayload, ThemeManifest } from '../schema';

export interface UserDraftFieldsInput {
  receiverName?: string;
  senderName?: string;
  relation?: string;
  message?: string;
  photos?: string[];
  whatsappPhone?: string;
  revealAt?: string;
  timezone?: string;
}

function buildLocalizedHeadline(
  theme: ThemeManifest,
  receiverName: string,
): LocalizedText {
  const safeName = receiverName.trim() || theme.demoData.receiverName;
  switch (theme.occasion) {
    case 'wedding':
      return {
        hinglish: `Shubh Vivah Aamantran · ${safeName}`,
        hi: `शुभ विवाह आमंत्रण · ${safeName}`,
        en: `Wedding Invitation · ${safeName}`,
      };
    case 'birthday':
      return {
        hinglish: `Janamdin Mubarak, ${safeName}!`,
        hi: `जन्मदिन मुबारक हो, ${safeName}!`,
        en: `Happy Birthday, ${safeName}!`,
      };
    case 'anniversary':
      return {
        hinglish: `Happy Anniversary, ${safeName}`,
        hi: `सालगिरह मुबारक, ${safeName}`,
        en: `Happy Anniversary, ${safeName}`,
      };
    case 'love':
      return {
        hinglish: `${safeName}, ek dil ki baat…`,
        hi: `${safeName}, एक दिल की बात…`,
        en: `${safeName}, something from the heart…`,
      };
    case 'business':
      return {
        hinglish: `${safeName} ki taraf se Shubhkamnayein`,
        hi: `${safeName} की ओर से शुभकामनाएँ`,
        en: `Warm Wishes from ${safeName}`,
      };
    case 'travel':
      return {
        hinglish: `${safeName} · World Voyage`,
        hi: `${safeName} · सफ़रनामा`,
        en: `${safeName} · Curated Voyages`,
      };
    case 'festival':
      return {
        hinglish: `Shubh Tyohar, ${safeName}!`,
        hi: `त्योहार की हार्दिक शुभकामनाएँ, ${safeName}!`,
        en: `Warm Festive Wishes, ${safeName}!`,
      };
    default:
      return {
        hinglish: `${safeName} ke liye ek muskaan`,
        hi: `${safeName} के लिए एक खास संदेश`,
        en: `A little note for ${safeName}`,
      };
  }
}

export function buildThemePayloadFromDraft(
  theme: ThemeManifest,
  input: UserDraftFieldsInput,
): ThemeDemoPayload {
  const receiverName = input.receiverName?.trim() || theme.demoData.receiverName;
  const senderName = input.senderName?.trim() || theme.demoData.senderName;
  const userMessage = input.message?.trim();

  return {
    ...theme.demoData,
    receiverName,
    senderName,
    relation: input.relation?.trim() || theme.demoData.relation,
    photos: Array.isArray(input.photos) ? input.photos.slice(0, 6) : [],
    revealAt: input.revealAt,
    timezone: input.timezone || 'Asia/Kolkata',
    whatsappPhone: input.whatsappPhone?.trim() ?? (input.receiverName ? '' : theme.demoData.whatsappPhone),
    headline: input.receiverName?.trim()
      ? buildLocalizedHeadline(theme, receiverName)
      : theme.demoData.headline,
    message: userMessage
      ? {
          hinglish: userMessage,
          hi: userMessage,
          en: userMessage,
        }
      : theme.demoData.message,
  };
}
