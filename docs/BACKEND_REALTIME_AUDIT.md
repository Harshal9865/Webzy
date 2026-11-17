# Webzy Backend & Real-Time Reliability Audit (10-Agent Synthesis)

Synthesized from specialist audits covering Architecture, UPI/Payments, Security/DPDP, Media/AI, Receiver WebViews, Admin Dispute Ops, Theme Engine, and Real-Time Competitor Research before Phase 3–4 execution.

## 1. Real-Time Customer Failure Mitigations
- **Instagram / WhatsApp In-App Browser `localStorage` resets:** Draft tokens are persisted server-side in Postgres (`drafts.draft_token_hash`), mirrored into `HttpOnly` cookies, and synced to URL `?draft=` + `localStorage` backup with a 1-tap **"Save & copy resume link"** escape hatch.
- **2–3 GB RAM Budget Android OOM crashes on 12MB Photos:** Sequential client compressor (`compressImageForMobileUpload`) resizes 1 image at a time (`<= 1280px` edge, `bitmap.close()`), followed by pure-TS server magic-byte validation (`JPEG`/`PNG`/`WebP`), dimension-bomb cap (`<= 4096px`), and EXIF/GPS segment stripping (`sanitizeUploadedImage`) into private `webzy-media`.
- **UPI App-Switch Browser Tab Kill & Out-of-Order Webhooks (Phase 4):** Monotonic state transitions (`draft -> payment_pending -> paid -> published`), raw-body HMAC verification, `payment_events` dedupe, atomic `issue_invoice_for_order` sequence, `claim_jobs` (`SKIP LOCKED`), and 5m/10m watchdog reconciliation.
- **Midnight IST Reveal Drift:** Normalized `reveal_at` to `Asia/Kolkata` (`+05:30`) `TIMESTAMPTZ` and evaluated against Postgres `now()` rather than Android device clocks.
- **Scam / Phishing Links in Ready-Made Sites:** `detectScamPatterns` blocks URLs, shortlinks, UPI handles, emails, IFSC codes, and phone numbers (Devanagari + ASCII digits) across all ready-made themes, allowing `whatsappPhone` strictly on `business-greeting-01`.

## 2. Phase 2 Security & Alignment Fixes Applied
- `public.is_admin()` hardened to require JWT `aal = 'aal2'` + `is_banned = false`.
- `evaluateAdminAccess()` updated with `isBanned` check; `apps/admin` gates all auth views against banned status.
- Removed `sites_owner_update`, `drafts_owner_all`, and direct client `consent_log_insert_own` RLS policies; added immutable `BEFORE UPDATE OR DELETE` triggers on `consent_log`, `audit_log`, and `moderation_log`.
- Added Postgres `rate_limits` + `consume_rate_limit` RPC for high-load serverless traffic.
- Fixed `MfaClient.tsx` `factorsData.all` factor type error + retry recovery, and added PII masking in `packages/core/src/logger.ts`.
