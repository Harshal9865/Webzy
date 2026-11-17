'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { getSupabaseBrowserClient } from '../../../../infra/supabase/browser';

export function AdminSignOutButton() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSignOut() {
    setErrorMsg('');
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
      router.refresh();
    } catch {
      setErrorMsg('Sign out failed. Retry.');
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        suppressHydrationWarning
        type="button"
        onClick={handleSignOut}
        className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink hover:bg-webzy-surface"
      >
        Sign out
      </button>
      {errorMsg ? <span className="text-xs text-red-700">{errorMsg}</span> : null}
    </div>
  );
}
