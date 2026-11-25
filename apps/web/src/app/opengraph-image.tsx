import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'A special Webzy is waiting for you';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F8',
          padding: '40px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '2px solid #FFE8EF',
            borderRadius: '36px',
            padding: '60px 80px',
            boxShadow: '0 20px 40px rgba(43, 27, 46, 0.08)',
            maxWidth: '1000px',
            textAlign: 'center',
          }}
        >
          {/* Logo Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              backgroundColor: '#E11D63',
              color: '#ffffff',
              fontSize: '44px',
              fontWeight: 'bold',
              marginBottom: '28px',
            }}
          >
            W
          </div>

          <div
            style={{
              color: '#E11D63',
              fontSize: '20px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            A special gift is waiting
          </div>

          <h1
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#2B1B2E',
              lineHeight: 1.15,
              margin: '0 0 16px 0',
            }}
          >
            Someone made a Webzy for you
          </h1>

          <p
            style={{
              fontSize: '26px',
              color: '#6B5A6E',
              margin: '0 0 32px 0',
              fontWeight: 500,
            }}
          >
            Tap to open your personalized animated celebration link.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2B1B2E',
            }}
          >
            <span>webzy.in</span>
            <span style={{ color: '#E11D63' }}>·</span>
            <span style={{ color: '#059669' }}>Personal Keepsake</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
