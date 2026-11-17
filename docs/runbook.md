# Webzy Operations Runbook (Phase 0 Stub)

> Will expand per phase (`publish`, `watchdog`, `refunds`, `takedowns`, `DPDP requests`, `backups`).

## 1. Incident SOP (Short Form — PDF 06 §10)
1. **Detect:** Alert from UptimeRobot / Sentry / Admin 5-minute paid-but-unpublished check, or customer message.
2. **Assign:** Founder on duty takes lead.
3. **Contain:** Enable fallback page / pause promotions / disable affected feature flag.
4. **Fix or Roll Back:** Use hosting one-click rollback if caused by a recent release.
5. **Communicate:** Honest Hinglish update on expected fix time without leaking other users' details.
6. **Review (within 3 days):** Document root cause, fix, and prevention below in `/docs/DEBT.md`.

## 2. Emergency Fallback Checklist (Paid, No Link / Webhook Down)
- Inspect `/api/health` on Web & Admin.
- Inspect payment events & watchdog job logs (`Phase 4`).
- Never manually edit production rows without writing an `audit_log` entry.

## 3. Uptime & Monitoring Targets
- Web health ping (`every 5 min`): `GET /api/health` (checks app env, Supabase connectivity, payment mode, Sentry config).
- Admin health ping: `GET /api/health` on `@webzy/admin`.
