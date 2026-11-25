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
      <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
              Webzy Admin · Setup Required
            </span>
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Connect Supabase &amp; Seed Admin First
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Add Supabase keys in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-800">.env.local</code> and run{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-800">npm run seed:admin</code>.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {config.appEnv !== 'production' ? (
                <Link
                  href="/api/health"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
                >
                  Check /api/health
                </Link>
              ) : null}
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Back to Storefront
              </Link>
            </div>
          </div>
        </main>
      </div>
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
      <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-amber-200 bg-white p-7 shadow-sm sm:p-8">
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
              AAL2 Verification
            </span>
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-slate-900">
              2FA Verification Required
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              Strict 2FA (AAL2) is enabled for production admin sessions. Open the dedicated Admin Console MFA gate to complete verification.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={config.adminUrl}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
              >
                Open Admin MFA Console ↗
              </a>
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Back Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (gate === 'forbidden') {
    return (
      <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-white p-7 shadow-sm sm:p-8">
            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
              Access Restricted
            </span>
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-slate-900">
              Admin Access Needed
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Signed in as <strong className="text-slate-900">{session.user?.email}</strong>, which does not currently hold the{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-800">admin</code> role.
            </p>
            <div className="mt-5 space-y-4">
              {config.appEnv === 'local' ? <AdminLocalElevateButton /> : null}
              <div className="flex flex-wrap items-center gap-3">
                <AdminSignOutButton redirectTo="/" />
                <Link
                  href="/"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Back to Storefront
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
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
