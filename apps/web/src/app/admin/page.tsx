import Link from 'next/link';
import { evaluateAdminAccess, getWebzyPublicConfig, isAdminMfaRequired } from '@webzy/core';
import { loadAdminDashboardSnapshot } from '../../../../../infra/supabase/adminSnapshot';
import { getAuthSessionState } from '../../../../../infra/supabase/auth';
import { AdminDashboardClient } from '../../../../admin/src/components/AdminDashboardClient';
import { AdminLocalElevateButton } from '../../../../admin/src/components/AdminLocalElevateButton';
import { AdminSignOutButton } from '../../../../admin/src/components/AdminSignOutButton';
import { WebAdminAuthPrompt } from '../../components/admin/WebAdminAuthPrompt';

export const dynamic = 'force-dynamic';

export default async function WebAdminConsolePage() {
  const config = getWebzyPublicConfig();
  const session = await getAuthSessionState();

  if (!session.configured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-12 bg-[#FAF8F6]">
        <div className="rounded-3xl border border-webzy-tint bg-white p-7 shadow-sm">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            Webzy Admin · Setup Required
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold text-webzy-ink">
            Connect Supabase &amp; Seed Admin First
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-webzy-ink/80">
            Add Supabase keys in <code>.env.local</code> and run <code>npm run seed:admin</code>.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/api/health"
              className="inline-flex min-h-[44px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
            >
              Check /api/health
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-full border border-webzy-tint bg-white px-5 text-xs font-bold text-webzy-ink"
            >
              Back to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const requireMfa = isAdminMfaRequired();
  const gate = evaluateAdminAccess({
    isAuthenticated: Boolean(session.user),
    role: session.profile?.role,
    aal: session.aal,
    isBanned: session.profile?.is_banned,
    requireMfa,
  });

  if (gate === 'unauthenticated') {
    return <WebAdminAuthPrompt webUrl="/" />;
  }

  if (gate === 'mfa_required') {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12 bg-[#FAF8F6]">
        <div className="rounded-3xl border border-amber-200 bg-white p-7 shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-webzy-ink">
            2FA Verification Required
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-webzy-ink/75">
            Strict 2FA (AAL2) is enabled for production admin sessions. Open the dedicated Admin Console MFA gate to complete verification.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={config.adminUrl}
              className="inline-flex min-h-[42px] items-center rounded-full bg-webzy-primary px-5 text-xs font-bold text-white"
            >
              Open Admin MFA Console ↗
            </a>
            <Link
              href="/"
              className="inline-flex min-h-[42px] items-center rounded-full border border-webzy-tint px-5 text-xs font-bold text-webzy-ink"
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (gate === 'forbidden') {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-5 py-12 bg-[#FAF8F6]">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-7 text-red-950 shadow-sm">
          <h1 className="font-heading text-2xl font-bold">Admin Access Needed</h1>
          <p className="mt-2 text-sm">
            Signed in as <strong>{session.user?.email}</strong>, which does not currently hold the <code>admin</code> role.
          </p>
          <div className="mt-5 space-y-4">
            {config.appEnv === 'local' ? <AdminLocalElevateButton /> : null}
            <div className="flex flex-wrap items-center gap-3">
              <AdminSignOutButton redirectTo="/" />
              <Link
                href="/"
                className="inline-flex min-h-[38px] items-center rounded-xl border border-red-200 bg-white px-4 text-xs font-bold text-red-900"
              >
                Back to Storefront
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const snapshot = await loadAdminDashboardSnapshot();

  return (
    <AdminDashboardClient
      config={{
        appEnv: config.appEnv,
        webUrl: '/',
      }}
      sessionEmail={session.profile?.email ?? session.user?.email ?? 'admin@webzy.in'}
      requireMfa={requireMfa}
      supabaseHealth={snapshot.supabaseHealth}
      counts={snapshot.counts}
      executiveMetrics={snapshot.executiveMetrics}
      userItems={snapshot.userItems}
      siteItems={snapshot.siteItems}
      recentOrders={snapshot.recentOrders}
      recentReports={snapshot.recentReports}
      recentTakedowns={snapshot.recentTakedowns}
      customRequests={snapshot.customRequests}
      waitlistItems={snapshot.waitlistItems}
      recentModLogs={snapshot.recentModLogs}
      recentAudits={snapshot.recentAudits}
      statsLoadError={snapshot.statsLoadError}
      signOutRedirect="/"
    />
  );
}
