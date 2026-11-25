'use client';

import React, { useEffect, useRef } from 'react';

export default function WebGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reportedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${error?.name || 'Error'}:${error?.message || ''}:${error?.digest || ''}`;
    if (reportedKeyRef.current === key) return;
    reportedKeyRef.current = key;

    const route =
      typeof window !== 'undefined' ? window.location.pathname.slice(0, 120) : '/';

    void fetch('/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        name: (error?.name || 'Error').slice(0, 64),
        message: (error?.message || 'Unhandled global UI error').slice(0, 240),
        digest: typeof error?.digest === 'string' ? error.digest.slice(0, 64) : undefined,
        route,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F6',
          color: '#2B1B24',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: '24px',
        }}
      >
        <main
          style={{
            maxWidth: '460px',
            width: '100%',
            borderRadius: '24px',
            border: '1px solid #F1DCE5',
            backgroundColor: '#FFFFFF',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(43, 27, 36, 0.06)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, lineHeight: 1.25 }}>
            Something went wrong
          </h1>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#5C4752',
            }}
          >
            We hit an unexpected issue loading Webzy. Please try again or return to the homepage.
          </p>
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                minHeight: '44px',
                padding: '0 22px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                padding: '0 22px',
                borderRadius: '9999px',
                border: '1px solid #F1DCE5',
                backgroundColor: '#FFFFFF',
                color: '#2B1B24',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
