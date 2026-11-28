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

type ModalMode = 'signin' | 'signup' | 'magic';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AuthModal({
  isOpen,
  reason,
  draftToken,
  onClose,
  onVerified,
}: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<ModalMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setErrorMessage('');
    setNoticeMessage('');
    setBusy(false);

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

  useEffect(() => {
    if (!isOpen || !mounted) return;
    const focusTimer = window.setTimeout(() => {
      emailInputRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen, mounted, mode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  if (!isOpen || !mounted) {
    return null;
  }

  function switchMode(nextMode: ModalMode) {
    setMode(nextMode);
    setErrorMessage('');
    setNoticeMessage('');
  }

  async function attachDraftAndFinish() {
    if (draftToken) {
      await fetch('/api/auth/attach-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftToken }),
      }).catch(() => {});
    }
    if (!mountedRef.current) return;
    await onVerified();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!mountedRef.current) return;

      if (error) {
        const lower = (error.message || '').toLowerCase();
        setErrorMessage(
          lower.includes('invalid login') || lower.includes('invalid credentials')
            ? 'Incorrect email or password. New here? Switch to "Create Account" above.'
            : error.message || 'Unable to sign in right now.',
        );
        return;
      }

      await attachDraftAndFinish();
    } catch (err) {
      if (!mountedRef.current) return;
      setErrorMessage(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          password,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        error?: string;
      };

      if (!mountedRef.current) return;

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            (res.status === 409
              ? 'This email already has an account. Switch to Sign In.'
              : 'Could not create your account right now.'),
        );
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!mountedRef.current) return;

      if (signInErr) {
        setNoticeMessage('Account created! Sign in with your password below.');
        setMode('signin');
        return;
      }

      await attachDraftAndFinish();
    } catch (err) {
      if (!mountedRef.current) return;
      setErrorMessage(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setErrorMessage('Authentication keys are not configured in this environment.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setBusy(true);
    setErrorMessage('');
    setNoticeMessage('');

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
        setErrorMessage(
          lower.includes('rate limit') || lower.includes('too many')
            ? 'Email sending limit reached for this hour. Use Email & Password sign-in instead — it works instantly.'
            : error.message || 'Unable to send sign-in link.',
        );
        return;
      }

      setCooldown(45);
      setNoticeMessage(
        `One-click sign-in link sent to ${cleanEmail}. Open your inbox and tap the button to return signed in.`,
      );
    } catch (err) {
      if (!mountedRef.current) return;
      setErrorMessage(err instanceof Error ? err.message : 'Unable to send sign-in link.');
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  const contextualReason =
    reason?.trim() ||
    'Sign in or create a free Webzy account with any email address to access your orders and saved drafts.';

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
            {mode === 'signup'
              ? 'Create Webzy Account'
              : mode === 'magic'
                ? 'Sign in with Email Link'
                : 'Sign in to Webzy'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="btn-spring flex h-10 w-10 -mr-1.5 shrink-0 items-center justify-center rounded-full border border-webzy-tint bg-white text-webzy-ink/70 hover:border-webzy-primary/40 hover:text-webzy-ink"
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
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          {/* Tabs */}
          <div className="mb-4 grid grid-cols-2 rounded-2xl border border-webzy-tint bg-webzy-surface/60 p-1">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`min-h-[36px] rounded-xl text-xs font-bold transition ${
                mode === 'signin'
                  ? 'bg-white text-webzy-primary shadow-sm'
                  : 'text-webzy-ink/65 hover:text-webzy-ink'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`min-h-[36px] rounded-xl text-xs font-bold transition ${
                mode === 'signup'
                  ? 'bg-white text-webzy-primary shadow-sm'
                  : 'text-webzy-ink/65 hover:text-webzy-ink'
              }`}
            >
              Create Account
            </button>
          </div>

          <div
            id="webzy-auth-modal-reason"
            className="rounded-2xl border border-webzy-tint bg-webzy-surface/60 px-3.5 py-2.5 text-xs leading-relaxed text-webzy-ink/80"
          >
            {contextualReason}
          </div>

          {!supabaseConfigured ? (
            <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
              <strong>Setup needed:</strong> Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </div>
          ) : null}

          {noticeMessage ? (
            <div
              role="status"
              className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-900"
            >
              {noticeMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-900"
            >
              {errorMessage}
            </div>
          ) : null}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="auth-modal-email" className="block text-xs font-bold text-webzy-ink">
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
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                />
              </div>

              <div>
                <label htmlFor="auth-modal-password" className="block text-xs font-bold text-webzy-ink">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="auth-modal-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white pl-3.5 pr-14 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-bold text-webzy-ink/60 hover:text-webzy-ink"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy || !supabaseConfigured}
                className="btn-spring inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary hover:opacity-95 disabled:opacity-50"
              >
                {busy ? 'Signing in...' : 'Sign In & Continue →'}
              </button>
            </form>
          ) : null}

          {mode === 'signup' ? (
            <form onSubmit={handleSignUp} className="mt-4 space-y-3">
              <div>
                <label htmlFor="auth-modal-name" className="block text-xs font-bold text-webzy-ink">
                  Full Name
                </label>
                <input
                  id="auth-modal-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                />
              </div>

              <div>
                <label htmlFor="auth-modal-signup-email" className="block text-xs font-bold text-webzy-ink">
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="auth-modal-signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                />
              </div>

              <div>
                <label htmlFor="auth-modal-signup-password" className="block text-xs font-bold text-webzy-ink">
                  Password (min 8 characters)
                </label>
                <div className="relative mt-1">
                  <input
                    id="auth-modal-signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white pl-3.5 pr-14 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-bold text-webzy-ink/60 hover:text-webzy-ink"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy || !supabaseConfigured}
                className="btn-spring inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary hover:opacity-95 disabled:opacity-50"
              >
                {busy ? 'Creating account...' : 'Create Account & Continue →'}
              </button>
            </form>
          ) : null}

          {mode === 'magic' ? (
            <form onSubmit={handleMagicLink} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="auth-modal-magic-email" className="block text-xs font-bold text-webzy-ink">
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  id="auth-modal-magic-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-webzy-tint bg-white px-3.5 text-sm text-webzy-ink outline-none transition focus:border-webzy-primary focus:ring-2 focus:ring-webzy-primary/15"
                />
              </div>

              <button
                type="submit"
                disabled={busy || cooldown > 0 || !supabaseConfigured}
                className="btn-spring inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-webzy-primary px-6 py-2.5 text-sm font-bold text-white shadow-btn-primary hover:opacity-95 disabled:opacity-50"
              >
                {busy
                  ? 'Sending link...'
                  : cooldown > 0
                    ? `Sent (${cooldown}s)`
                    : 'Send One-Click Email Link →'}
              </button>

              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="inline-flex min-h-[36px] w-full items-center justify-center rounded-full border border-webzy-tint bg-white px-4 text-xs font-bold text-webzy-ink/75 hover:text-webzy-primary"
              >
                Use Email &amp; Password instead
              </button>
            </form>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-webzy-ink/[0.07] px-5 py-3 text-xs text-webzy-ink/60 sm:px-6">
          {mode !== 'magic' ? (
            <button
              type="button"
              onClick={() => switchMode('magic')}
              className="font-semibold text-webzy-ink/70 hover:text-webzy-primary hover:underline"
            >
              Use Email Link instead
            </button>
          ) : (
            <span>Passwordless link</span>
          )}
          <Link
            href={draftToken ? `/login?draftToken=${encodeURIComponent(draftToken)}` : '/login'}
            onClick={onClose}
            className="font-semibold text-webzy-primary hover:underline whitespace-nowrap"
          >
            Forgot password / Full page
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
