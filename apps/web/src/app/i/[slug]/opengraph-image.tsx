import { ImageResponse } from 'next/og';
import {
  MOCK_EMERALD_WEDDING,
  MOCK_ROYAL_RED_WEDDING,
} from '@webzy/themes/weddings/mockData';

export const runtime = 'edge';
export const alt = 'Webzy Royal Wedding Invitation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function formatWeddingDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default async function WeddingOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isRed =
    slug === 'riya-siddharth' ||
    slug === 'royal-red' ||
    slug === 'wedding-royal-red-01' ||
    slug.includes('red') ||
    slug.includes('royal');

  const data = isRed ? MOCK_ROYAL_RED_WEDDING : MOCK_EMERALD_WEDDING;

  const bgGradient = isRed
    ? 'linear-gradient(135deg, #4E0814 0%, #7A1426 50%, #3A050D 100%)'
    : 'linear-gradient(135deg, #273D2B 0%, #3C5742 50%, #1F3223 100%)';

  const cardBg = isRed ? '#FFFDF9' : '#FBFDF9';
  const primaryText = isRed ? '#6B0F1E' : '#243B2A';
  const goldAccent = '#C9A243';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgGradient,
          padding: 44,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: cardBg,
            borderRadius: 36,
            border: `3px solid ${goldAccent}`,
            padding: '40px 64px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#8C6D23',
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {data.familyBlessingLine || '|| Shri Ganeshay Namah ||'}
          </div>

          <div
            style={{
              fontSize: 22,
              color: '#5C4B4E',
              marginBottom: 12,
              fontStyle: 'italic',
            }}
          >
            Together with our families, you are warmly invited to the wedding of
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              fontSize: 82,
              fontWeight: 700,
              color: primaryText,
              lineHeight: 1.05,
              marginTop: 8,
              marginBottom: 18,
            }}
          >
            <span>{data.brideName}</span>
            <span style={{ color: goldAccent, fontStyle: 'italic', fontSize: 58 }}>&amp;</span>
            <span>{data.groomName}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              borderTop: `1px solid ${goldAccent}`,
              borderBottom: `1px solid ${goldAccent}`,
              padding: '12px 32px',
              fontSize: 24,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#8C6D23',
              fontWeight: 700,
            }}
          >
            <span>{formatWeddingDate(data.weddingDate)}</span>
            <span>·</span>
            <span>{data.events?.[0]?.venueName || 'Royal Palace Celebration'}</span>
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 16,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#7A6B6E',
            }}
          >
            TAP LINK TO OPEN INTERACTIVE INVITATION · WEBZY WEDDINGS
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
