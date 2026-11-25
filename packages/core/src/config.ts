import type { AppEnvironment, PaymentProviderName } from './types';

export interface WebzyPublicConfig {
  appEnv: AppEnvironment;
  webUrl: string;
  adminUrl: string;
  defaultValidityDays: number;
  gstRegistered: boolean;
  isMockPaymentMode: boolean;
  allowMockInProd: boolean;
  payButtonDisabled: boolean;
  paymentProvider: PaymentProviderName;
  business: {
    name: string;
    address: string;
    supportEmail: string;
    supportWhatsapp: string;
    supportHours: string;
    grievanceName: string;
    grievanceEmail: string;
  };
  flags: {
    scheduledReveal: boolean;
    pinLock: boolean;
    openedAlert: boolean;
    openedAlertPaid: boolean;
    maanJaoTheme: boolean;
  };
}

function toBool(val: string | undefined, fallback: boolean): boolean {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return fallback;
}

function toPositiveInt(val: string | undefined, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function resolveAppEnvironment(env: NodeJS.ProcessEnv = process.env): AppEnvironment {
  const explicit = env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase();
  if (explicit === 'production') return 'production';
  if (explicit === 'staging') return 'staging';
  if (explicit === 'local') return 'local';

  const nodeEnv = env.NODE_ENV?.trim().toLowerCase();
  if (nodeEnv === 'production') return 'production';
  if (nodeEnv === 'staging') return 'staging';
  return 'local';
}

export function resolvePaymentProvider(env: NodeJS.ProcessEnv = process.env): PaymentProviderName {
  return env.PAYMENT_PROVIDER === 'razorpay' ? 'razorpay' : 'mock';
}

/**
 * Production guard from Section 10:
 * When `appEnv === 'production'` and `PAYMENT_PROVIDER === 'mock'`, Pay is disabled
 * unless `ALLOW_MOCK_IN_PROD=true`.
 */
export function getWebzyPublicConfig(env: NodeJS.ProcessEnv = process.env): WebzyPublicConfig {
  const appEnv = resolveAppEnvironment(env);
  const paymentProvider = resolvePaymentProvider(env);
  const allowMockInProd = toBool(env.ALLOW_MOCK_IN_PROD, false);
  const isMockPaymentMode = paymentProvider === 'mock';
  const payButtonDisabled =
    appEnv === 'production' && isMockPaymentMode && !allowMockInProd;

  return {
    appEnv,
    webUrl: env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
    adminUrl: env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001',
    defaultValidityDays: toPositiveInt(env.DEFAULT_VALIDITY_DAYS, 7),
    gstRegistered: toBool(env.GST_REGISTERED, false),
    isMockPaymentMode,
    allowMockInProd,
    payButtonDisabled,
    paymentProvider,
    business: {
      name: env.WEBZY_BUSINESS_NAME || 'Webzy',
      address: env.WEBZY_BUSINESS_ADDRESS || 'Jaipur, Rajasthan, India',
      supportEmail: env.WEBZY_SUPPORT_EMAIL || 'support@webzy.in',
      supportWhatsapp: env.WEBZY_SUPPORT_WHATSAPP || '+919800000000',
      supportHours: env.WEBZY_SUPPORT_HOURS || '9:00 AM to 9:00 PM IST',
      grievanceName: env.WEBZY_GRIEVANCE_NAME || 'Founder Grievance Officer',
      grievanceEmail: env.WEBZY_GRIEVANCE_EMAIL || 'grievance@webzy.in',
    },
    flags: {
      scheduledReveal: toBool(env.FEATURE_SCHEDULED_REVEAL, true),
      pinLock: toBool(env.FEATURE_PIN_LOCK, true),
      openedAlert: toBool(env.FEATURE_OPENED_ALERT, false),
      openedAlertPaid: toBool(env.FEATURE_OPENED_ALERT_PAID, false),
      maanJaoTheme: toBool(env.FEATURE_MAAN_JAO, false),
    },
  };
}
