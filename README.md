# Webzy — *"Apni feeling ka link"*

> Personalised animated mini-websites for Indian celebrations, ready in under 5 minutes.

## Monorepo Layout (Phase 0)

| Folder | Role |
| :--- | :--- |
| `apps/web` | Customer storefront, create flow, preview, checkout, sender area, receiver pages (`/s/[slug]`), and request form |
| `apps/admin` | Protected founder operations & moderation panel |
| `packages/core` | Shared config, design tokens, feature flags, pricing/payment types, error wrapper, and PII-safe logger |
| `packages/themes` | Self-contained `theme.json` schemas, React components, demo data, and assets |
| `packages/jobs` | Background workers (`publish`, `notify`, `reconcile`, `retention`) |
| `infra` | Supabase helpers, migration directory (pending Phase 2 review), Sentry helper, and commercial hosting config |
| `docs` | Runbook, theme spec, asset log, environment guide, technical debt tracker, and decision log |
| `references` | Founder-supplied visual inspiration screenshots (inspiration only — never pixel-copied) |

## Quick Local Setup (PowerShell)

1. Close any old running server (`Ctrl + C`) so locked binaries inside `node_modules` can update cleanly.
2. Copy the environment template and install dependencies:
```powershell
Copy-Item .env.example .env.local
npm install
```
3. Run the Phase 0 verification gate:
```powershell
npm run typecheck
npm test
npm run lint
npm run build
```
4. Start the Web and Admin apps locally:
```powershell
npm run dev:web
# in a second terminal:
npm run dev:admin
```
Then open `http://localhost:3000/api/health` and `http://localhost:3001/api/health` to inspect environment, Supabase, Sentry, and mock-payment readiness.
