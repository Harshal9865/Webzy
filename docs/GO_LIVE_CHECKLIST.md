# Webzy Production Go-Live Checklist (Phase 7)

This checklist covers everything needed to move Webzy from local Test Mode (`PAYMENT_PROVIDER=mock`) to real public traffic (`https://webzy.in`).

---

## 1. Database & Storage (Supabase)
- [ ] Run migrations `0001_initial_schema.sql` through `0006_phase6_moderation_and_requests.sql` in order in Supabase SQL Editor.
- [ ] Confirm Storage bucket `webzy-media` exists and is marked **Private** (signed URLs only).
- [ ] Under **Authentication -> URL Configuration**, add your production `Site URL` (`https://webzy.in`) and Redirect URLs (`https://webzy.in/auth/callback` + your admin domain `https://admin.webzy.in/auth/callback`).
- [ ] Under **Authentication -> Multi-Factor (MFA)**, keep **App Authenticator (TOTP)** enabled.
- [ ] Under **Authentication -> Emails -> Templates -> Magic Link**, confirm `{{ .Token }}` is visible in the email template so users can type the 6-digit code directly on `/login`.
- [ ] Enable Supabase daily backups / Point-in-Time Recovery (PITR) before paid launch.

## 2. Production Environment Variables
Configure in your hosting provider (`Vercel` / `Netlify` / `Railway`):
- `NEXT_PUBLIC_APP_ENV=production`
- `NEXT_PUBLIC_WEB_URL=https://webzy.in`
- `NEXT_PUBLIC_ADMIN_URL=https://admin.webzy.in`
- `NEXT_PUBLIC_SUPABASE_URL=` (your Supabase Project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=` (publishable / anon key)
- `SUPABASE_SERVICE_ROLE_KEY=` (server-only secret key)
- `RESEND_API_KEY=` + verified sender `EMAIL_FROM=Webzy <hello@webzy.in>`
- `UPTIME_PING_SECRET=` (32+ char random secret for `/api/cron/watchdog` & `/api/cron/lifecycle`)
- `GEMINI_API_KEY=` (for on-demand AI message suggestions)
- **Payments (when switching from Test Mode to Live UPI):**
  - Implement live Orders/Webhook/Refund calls in `packages/core/src/payments.ts` (`RazorpayPaymentProvider`)
  - Set `PAYMENT_PROVIDER=razorpay`, `RAZORPAY_KEY_ID=`, `RAZORPAY_KEY_SECRET=`, `RAZORPAY_WEBHOOK_SECRET=`

## 3. Scheduled Cron Jobs
Point your cron runner (Vercel Cron / GitHub Actions / UptimeRobot) with header `Authorization: Bearer <UPTIME_PING_SECRET>`:
- **Every 10 minutes (`POST /api/cron/watchdog`):** Recovers stuck paid orders and alerts if any order stays unpublished.
- **Every 1 hour (`POST /api/cron/lifecycle`):** Unlocks scheduled surprises at their IST `reveal_at`, expires ended sites, and deletes expired unpaid drafts + orphaned Storage files.

## 4. Legal & Brand Sign-Off Before Charging Real Money
- [ ] Have an Indian advocate review `/terms`, `/privacy`, `/refund`, `/content-policy`, and `/takedown` and remove `(DRAFT)` tags if any remain.
- [ ] Confirm `NEXT_PUBLIC_GRIEVANCE_NAME`, `NEXT_PUBLIC_GRIEVANCE_EMAIL`, `NEXT_PUBLIC_SUPPORT_WHATSAPP`, and `NEXT_PUBLIC_BUSINESS_ADDRESS` point to your live company details.
- [ ] Run `npm run typecheck && npm test && npm run build` cleanly on the release branch.
