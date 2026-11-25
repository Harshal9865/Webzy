import crypto from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import {
  type AiDraftTone,
  detectScamPatterns,
  getFallbackAiDraft,
  getWebzyPublicConfig,
  logEvent,
  parseLanguageCode,
  toCoreLanguageCode,
} from '@webzy/core';
import { getThemeById } from '@webzy/themes';
import { guardMutationRequest } from '../../../../../../../infra/security/requestGuard';
import { getSupabaseEnv } from '../../../../../../../infra/supabase/env';
import { createSupabaseAdminClient } from '../../../../../../../infra/supabase/server';

const VALID_TONES = new Set<AiDraftTone>(['cute', 'emotional', 'funny', 'formal']);
const MAX_AI_GENERATIONS_PER_DRAFT = 5;

async function generateWithGemini(params: {
  occasion: string;
  tone: AiDraftTone;
  language: 'hinglish' | 'hi' | 'en';
  receiverName: string;
  maxLength: number;
}): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5500);

  try {
    const langInstruction =
      params.language === 'hi'
        ? 'Write strictly in natural Hindi using Devanagari script.'
        : params.language === 'en'
          ? 'Write in warm, natural Indian English.'
          : 'Write in warm, conversational Hinglish (Roman script).';

    const prompt = [
      `Write ONE short original ${params.occasion} greeting message in a ${params.tone} tone.`,
      langInstruction,
      `Recipient name: ${JSON.stringify(params.receiverName)}.`,
      `Maximum ${params.maxLength} characters.`,
      'Rules: Original prose only. NO Bollywood/film lyrics, NO movie dialogues, NO URLs, NO phone numbers, NO UPI IDs, NO hashtags, NO intro text.',
    ].join(' ');

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 160 },
        }),
        signal: controller.signal,
      },
    );

    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!raw || raw.length < 15) return null;

    const cleaned = raw.replace(/^["'`]+|["'`]+$/g, '').trim().slice(0, params.maxLength);
    if (!detectScamPatterns(cleaned).allowed) return null;
    if (params.language === 'hi' && !/[\u0900-\u097F]/.test(cleaned)) return null;

    return cleaned;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await guardMutationRequest(request, {
      bucket: 'ai_draft',
      maxHits: 15,
      windowSeconds: 3600,
    });
    if (guard) return guard;

    const body = (await request.json().catch(() => ({}))) as {
      themeId?: unknown;
      draftToken?: unknown;
      tone?: unknown;
      language?: unknown;
      receiverName?: unknown;
    };

    const config = getWebzyPublicConfig();
    const theme = getThemeById(typeof body.themeId === 'string' ? body.themeId : '', {
      includeMaanJao: config.flags.maanJaoTheme,
    });
    const occasion = theme?.occasion ?? 'birthday';
    const tone: AiDraftTone =
      typeof body.tone === 'string' && VALID_TONES.has(body.tone as AiDraftTone)
        ? (body.tone as AiDraftTone)
        : 'cute';
    const language = parseLanguageCode(typeof body.language === 'string' ? body.language : undefined);
    const safeReceiver = (typeof body.receiverName === 'string' ? body.receiverName : '')
      .replace(/[\r\n\t]/g, ' ')
      .trim()
      .slice(0, 40);
    const maxLen =
      theme?.fields.find((f) => f.key === 'message')?.max ?? 280;

    let remainingCredits = MAX_AI_GENERATIONS_PER_DRAFT;
    if (
      typeof body.draftToken === 'string' &&
      /^[A-Za-z0-9_-]{24,128}$/.test(body.draftToken) &&
      getSupabaseEnv().adminConfigured
    ) {
      const admin = createSupabaseAdminClient();
      const tokenHash = crypto.createHash('sha256').update(body.draftToken).digest('hex');
      const { data: draft } = await admin
        .from('drafts')
        .select('id, ai_generations_used')
        .eq('draft_token_hash', tokenHash)
        .is('deleted_at', null)
        .maybeSingle();

      if (draft) {
        const used = draft.ai_generations_used ?? 0;
        if (used >= MAX_AI_GENERATIONS_PER_DRAFT) {
          return NextResponse.json(
            {
              error: 'You have used all 5 AI suggestions for this draft. Feel free to edit directly!',
              remainingCredits: 0,
            },
            { status: 429 },
          );
        }
        await admin
          .from('drafts')
          .update({ ai_generations_used: used + 1 })
          .eq('id', draft.id);
        remainingCredits = MAX_AI_GENERATIONS_PER_DRAFT - (used + 1);
      }
    }

    const coreLanguage = toCoreLanguageCode(language);
    const geminiText = await generateWithGemini({
      occasion,
      tone,
      language: coreLanguage,
      receiverName: safeReceiver || 'Dost',
      maxLength: maxLen,
    });

    const message =
      geminiText ||
      getFallbackAiDraft({
        occasion,
        tone,
        language: coreLanguage,
        receiverName: safeReceiver || 'Dost',
        maxLength: maxLen,
      });

    logEvent('info', 'web.ai_draft.generated', {
      occasion,
      tone,
      language,
      source: geminiText ? 'gemini' : 'fallback',
    });

    return NextResponse.json({
      message,
      source: geminiText ? 'gemini' : 'fallback',
      tone,
      language,
      remainingCredits,
    });
  } catch (err) {
    logEvent('error', 'web.ai_draft.exception', {
      message: err instanceof Error ? err.message.slice(0, 120) : 'unknown',
    });
    return NextResponse.json(
      { error: 'Unable to draft right now. Please type your message directly.', retryable: true },
      { status: 500 },
    );
  }
}
