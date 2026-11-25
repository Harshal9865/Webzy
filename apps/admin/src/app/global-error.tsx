'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

export default function AdminGlobalError({
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
        message: (error?.message || 'Unhandled admin global UI error').slice(0, 240),
        digest: typeof error?.digest === 'string' ? error.digest.slice(0, 64) : undefined,
        route,
      }),
    }).catch(() => { });
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
          color: '#450A0A',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          padding: '24px',
        }}
      >
        <main
          style={{
            maxWidth: '460px',
            width: '100%',
            borderRadius: '24px',
            border: '1px solid #FECACA',
            backgroundColor: '#FEF2F2',
            padding: '28px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, lineHeight: 1.25 }}>
            Admin Console Error
          </h1>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#7F1D1D',
            }}
          >
            An unexpected error occurred loading the internal admin console. Retry below or return to the dashboard.
          </p>
          <div
            style={{
              marginTop: '20px',
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
                padding: '0 20px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                padding: '0 20px',
                borderRadius: '9999px',
                border: '1px solid #FECACA',
                backgroundColor: '#FFFFFF',
                color: '#450A0A',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
