'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getSupabaseBrowserClient,
  isBrowserSupabaseConfigured,
} from '../../../../../infra/supabase/browser';

export interface AuthModalProps {
  isOpen: boolean;
  reason?: string;
  draftToken?: string;
  onClose: () => void;
  onVerified: () => Promise<void> | void;
}

type ModalStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'error';

export function AuthModal({
  isOpen,
  reason,
  draftToken,
  onClose,
  onVerified,
}: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState<ModalStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const mountedRef = useRef<boolean>(true);

  const supabaseConfigured = isBrowserSupabaseConfigured();

  useEffect(() => {
    mountedRef.current = true;
    setMounted(true);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset transient state and manage focus + body scroll lock when modal opens/closes
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setStatus('idle');
    setOtpCode('');
    setErrorMessage('');
    setResendCooldown(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  // Focus email input once portal has mounted
  useEffect(() => {
    if (!isOpen || !mounted || status !== 'idle') return;
    const focusTimer = window.setTimeout(() => {
      emailInputRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen, mounted, status]);

  // Focus OTP input when transitioning to verification step
  useEffect(() => {
    if (isOpen && status === 'sent') {
      const timer = window.setTimeout(() => {
        otpInputRef.current?.focus();
      }, 30);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, status]);

  // Cooldown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen || !mounted) {
    return null;
  }

  async function sendOtp(cleanEmail: string) {
    if (!supabaseConfigured) {
      setStatus('error');
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      if (draftToken) {
        document.cookie = `webzy_pending_draft=${encodeURIComponent(draftToken)}; path=/; max-age=3600; SameSite=Lax`;
      }

      const supabase = getSupabaseBrowserClient();
      const currentPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/orders';
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        },
      });

      if (!mountedRef.current) return;

      if (error) {
        const lower = (error.message || '').toLowerCase();
        setStatus('error');
        setErrorMessage(
          lower.includes('rate limit') || lower.includes('too many')
            ? 'Email sending limit reached for this hour. If you already have a code in your inbox, click "Already have a code?" below.'
            : error.message || 'Unable to send verification code. Please retry.',
        );
        return;
      }

      setStatus('sent');
      setResendCooldown(30);
    } catch (err) {
      if (!mountedRef.current) return;
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to send login code right now. Please retry.',
      );
    }
  }

  async function handleSendSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    await sendOtp(cleanEmail);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    setOtpCode('');
    await sendOtp(cleanEmail);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setStatus('sent');
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = otpCode.replace(/\s+/g, '');

    if (cleanCode.length < 6) {
      setErrorMessage('Please enter the 6-digit code from your email.');
      return;
    }

    setStatus('verifying');
    setErrorMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      const attemptTypes = ['email', 'magiclink', 'signup'] as const;
      let verified = false;
      let lastErrMsg = '';
      for (const otpType of attemptTypes) {
        const { data: verifyData, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanCode,
          type: otpType,
        });
        if (!error && verifyData.session) {
          verified = true;
          break;
        }
        lastErrMsg = error?.message || lastErrMsg;
      }

      if (!mountedRef.current) return;

      if (!verified) {
        setStatus('sent');
        setErrorMessage(lastErrMsg || 'Invalid or expired code. Please check or resend.');
        return;
      }

      if (draftToken) {
        await fetch('/api/auth/attach-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draftToken }),
        }).catch(() => {});
      }

      if (!mountedRef.current) return;
      await onVerified();
    } catch (err) {
      if (!mountedRef.current) return;
      setStatus('sent');
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not verify code right now. Please retry.',
      );
    }
  }

  const contextualReason =
    reason?.trim() ||
    'Sign in with a 6-digit email code to view your orders, saved drafts, and account settings.';

  const isOtpStep = status === 'sent' || status === 'verifying';

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-webzy-ink/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Dialog Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="webzy-auth-modal-title"
        aria-describedby="webzy-auth-modal-reason"
        className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-webzy-tint bg-white shadow-2xl animate-scale-in"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-webzy-ink/[0.07] px-5 py-3.5 sm:px-6 sm:py-4">
          <h2
            id="webzy-auth-modal-title"
            className="font-heading text-lg font-bold leading-tight text-webzy-ink"
          >
            {isOtpStep ? 'Enter your 6-digit code' : 'Sign in to Webzy'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="btn-spring flex h-11 w-11 -mr-1.5 shrink-0 items-center justify-center rounded-full border border-webzy-tint bg-white text-webzy-ink/70 hover:border-webzy-primary/40 hover:text-webzy-ink"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Contextual Reason Callout */}
          <div
            id="webzy-auth-modal-reason"
            className="rounded-2xl border border-webzy-tint bg-webzy-surface/70 px-4 py-3 text-xs leading-relaxed text-webzy-ink/85"
          >
            {contextualReason}
          </div>

          {!supabaseConfigured ? (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-950">
              <strong>Setup needed:</strong> Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> to enable email
              OTP authentication.
            </div>
          ) : null}

          {isOtpStep ? (
            <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/75 px-4 py-3">
                <p className="text-xs font-bold text-emerald-950">
                  Verification code sent to {email.trim().toLowerCase()}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-emerald-900/90">
                  Stay right here without losing your progress. Enter the 6-digit code from your
                  inbox below.
                </p>
              </div>

              <div>
                <label
                  htmlFor="auth-modal-otp"
                  className="block text-xs font-bold text-webzy-ink"
                >
                  6-digit verification code
                </label>
                <input
                  ref={otpInputRef}
                  id="auth-modal-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="mt-1.5 min-h-[48px] w-full rounded-xl border border-emerald-300 bg-white px-4 text-center font-mono text-lg font-bold tracking-[0.28em] text-webzy-ink outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                />
              </div>

              {errorMessage ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
                >
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'verifying'}
                className="btn-spring inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary hover:opacity-95 disabled:opacity-50"
              >
                {status === 'verifying' ? 'Verifying code...' : 'Verify & Continue'}
              </button>

              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setOtpCode('');
                    setErrorMessage('');
                  }}
                  className="font-semibold text-webzy-ink/70 hover:text-webzy-ink hover:underline"
                >
                  Change email
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResend}
                  className="font-bold text-webzy-primary hover:underline disabled:cursor-not-allowed disabled:text-webzy-ink/40 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="auth-modal-email"
                  className="block text-xs font-bold text-webzy-ink"
                >
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="auth-modal-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 min-h-[46px] w-full rounded-xl border border-webzy-tint bg-white px-4 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                />
              </div>

              {status === 'error' && errorMessage ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
                >
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={status === 'sending' || !supabaseConfigured}
                className="btn-spring inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary hover:opacity-95 disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending 6-digit code...' : 'Send 6-digit login code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const clean = email.trim().toLowerCase();
                  if (!clean || !clean.includes('@')) {
                    setStatus('error');
                    setErrorMessage('Enter your email address first.');
                    return;
                  }
                  setErrorMessage('');
                  setStatus('sent');
                }}
                className="inline-flex min-h-[38px] w-full items-center justify-center rounded-full border border-webzy-tint bg-webzy-surface/60 px-4 text-xs font-bold text-webzy-ink/80 transition hover:border-webzy-primary/40 hover:text-webzy-primary"
              >
                Already have a code? Enter it here
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-webzy-ink/[0.07] px-6 py-3 text-xs text-webzy-ink/55">
          <span>Email code sign-in</span>
          <Link
            href="/login"
            onClick={onClose}
            className="font-semibold text-webzy-primary hover:underline whitespace-nowrap"
          >
            Full login page
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
