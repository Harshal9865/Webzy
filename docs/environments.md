# Webzy 3-Environment Setup Guide (`local`, `staging`, `production`)

Use three completely separate setups so test orders and fake payments can never touch live customers or money.

| Item | `local` | `staging` | `production` |
| :--- | :--- | :--- | :--- |
| **App URL** | `http://localhost:3000` | `https://staging.webzy.in` (host preview) | `https://webzy.in` |
| **Admin URL** | `http://localhost:3001` | `https://admin-staging.webzy.in` | `https://admin.webzy.in` |
| **Supabase Project** | `webzy-local` (or dev project) | `webzy-staging` | `webzy-prod` (paid Pro backups before launch) |
| **Storage Bucket** | Private `webzy-uploads-local` | Private `webzy-uploads-staging` | Private `webzy-uploads-prod` |
| **Payment Provider** | `mock` | `mock` (Phases 4–6) → Razorpay **TEST** keys (Phase 7/Live prep) | `mock` disabled (`ALLOW_MOCK_IN_PROD=false`) → Razorpay **LIVE** keys only in Section 27 |
| **Hosting** | Local Node 20 | Cloudflare Pages/Workers or Netlify | Cloudflare Pages/Workers or Netlify commercial tier *(never Vercel Hobby)* |

## Plain-English Founder Setup Steps
1. **GitHub:** Create a private repository, enable **2FA**, protect `main`, and verify `.github/workflows/ci.yml` passes on pull requests.
2. **Supabase (3 Projects or Local + Staging + Prod):** Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into each environment's secret settings (never into code).
3. **Resend Email:** Configure Resend API + DNS (SPF, DKIM, DMARC) and wire Resend SMTP inside Supabase Auth so magic-link emails arrive cleanly.
4. **Sentry & UptimeRobot:** Paste `SENTRY_DSN` into host env vars and point an UptimeRobot 5-minute monitor at `https://<your-domain>/api/health`.
5. **Password Manager (Bitwarden):** Store every root login, 2FA recovery code, and API key with both founders (where applicable).
