'use client';

import { useRouter } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { UserProfileRecord } from '@webzy/core';
import {
  getSupabaseBrowserClient,
  isBrowserSupabaseConfigured,
} from '../../../../../infra/supabase/browser';
import { AuthModal } from './AuthModal';

export interface AuthUser {
  id: string;
  email: string;
  avatarUrl?: string | null;
}

export interface OpenAuthModalOptions {
  reason?: string;
  onSuccess?: () => void;
  draftToken?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfileRecord | null;
  loading: boolean;
  isAuthenticated: boolean;
  authModalOpen: boolean;
  openAuthModal: (opts?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  authModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  refreshAuth: async () => {},
  signOut: async () => {},
});

interface AuthMeResponse {
  authenticated?: boolean;
  user?: AuthUser | null;
  profile?: UserProfileRecord | null;
}

function dispatchOrdersUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('webzy_orders_updated'));
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [modalReason, setModalReason] = useState<string | undefined>(undefined);
  const [modalDraftToken, setModalDraftToken] = useState<string | undefined>(undefined);

  const onSuccessRef = useRef<(() => void) | undefined>(undefined);
  const prevUserIdRef = useRef<string | null>(null);
  const hasProfileRef = useRef<boolean>(false);
  const inFlightRefreshRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef<boolean>(true);

  const refreshAuth = useCallback(async () => {
    if (inFlightRefreshRef.current) {
      return inFlightRefreshRef.current;
    }

    const request = (async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (!mountedRef.current) return;

        if (!res.ok) {
          const hadUser = prevUserIdRef.current !== null;
          prevUserIdRef.current = null;
          hasProfileRef.current = false;
          setUser(null);
          setProfile(null);
          if (hadUser) dispatchOrdersUpdated();
          return;
        }

        const data = (await res.json().catch(() => ({}))) as AuthMeResponse;
        const nextUser = data.authenticated && data.user ? data.user : null;
        const nextProfile = data.authenticated && data.profile ? data.profile : null;

        const nextUserId = nextUser?.id ?? null;
        const authChanged = prevUserIdRef.current !== nextUserId;
        prevUserIdRef.current = nextUserId;
        hasProfileRef.current = Boolean(nextProfile);

        setUser(nextUser);
        setProfile(nextProfile);

        if (authChanged) {
          dispatchOrdersUpdated();
        }
      } catch {
        // Keep current state resilient on transient network failure
      } finally {
        inFlightRefreshRef.current = null;
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    })();

    inFlightRefreshRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refreshAuth();

    const handleCustomAuthRefresh = () => {
      void refreshAuth();
    };
    window.addEventListener('webzy_auth_updated', handleCustomAuthRefresh);

    let unsubscribe: (() => void) | undefined;
    try {
      if (isBrowserSupabaseConfigured()) {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mountedRef.current) return;

          if (event === 'SIGNED_OUT' || !session?.user) {
            const hadUser = prevUserIdRef.current !== null;
            prevUserIdRef.current = null;
            hasProfileRef.current = false;
            setUser(null);
            setProfile(null);
            setLoading(false);
            if (hadUser || event === 'SIGNED_OUT') {
              dispatchOrdersUpdated();
            }
            return;
          }

          if (
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'USER_UPDATED' ||
            event === 'INITIAL_SESSION'
          ) {
            const sessionUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
            };
            const authChanged = prevUserIdRef.current !== sessionUser.id;
            prevUserIdRef.current = sessionUser.id;
            setUser(sessionUser);
            setLoading(false);
            if (authChanged) {
              dispatchOrdersUpdated();
            }
            if (
              event === 'SIGNED_IN' ||
              event === 'USER_UPDATED' ||
              authChanged ||
              !hasProfileRef.current
            ) {
              void refreshAuth();
            }
          }
        });

        unsubscribe = () => subscription.unsubscribe();
      }
    } catch {
      // Supabase browser env vars missing or unavailable; fall back to /api/auth/me only
    }

    return () => {
      mountedRef.current = false;
      window.removeEventListener('webzy_auth_updated', handleCustomAuthRefresh);
      unsubscribe?.();
    };
  }, [refreshAuth]);

  const openAuthModal = useCallback((opts?: OpenAuthModalOptions) => {
    setModalReason(opts?.reason);
    setModalDraftToken(opts?.draftToken);
    onSuccessRef.current = opts?.onSuccess;
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setModalReason(undefined);
    setModalDraftToken(undefined);
    onSuccessRef.current = undefined;
  }, []);

  const handleModalVerified = useCallback(async () => {
    await refreshAuth();
    dispatchOrdersUpdated();

    const callback = onSuccessRef.current;
    setAuthModalOpen(false);
    setModalReason(undefined);
    setModalDraftToken(undefined);
    onSuccessRef.current = undefined;

    callback?.();
    router.refresh();
  }, [refreshAuth, router]);

  const signOut = useCallback(async () => {
    prevUserIdRef.current = null;
    hasProfileRef.current = false;
    setUser(null);
    setProfile(null);
    setAuthModalOpen(false);

    try {
      if (isBrowserSupabaseConfigured()) {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore client signOut error if Supabase env is not configured
    }

    dispatchOrdersUpdated();
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      refreshAuth,
      signOut,
    }),
    [
      user,
      profile,
      loading,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      refreshAuth,
      signOut,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authModalOpen ? (
        <AuthModal
          isOpen={authModalOpen}
          reason={modalReason}
          draftToken={modalDraftToken}
          onClose={closeAuthModal}
          onVerified={handleModalVerified}
        />
      ) : null}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
