# Webzy Technical Debt & Follow-Up Log (`DEBT.md`)

> Per File 03 §14 & Master Build Prompt §23: track every deliberate shortcut here and allocate at least 10% of each phase to paying down debt.

| ID | Phase | Item | Reason / Tradeoff | Target Paydown |
| :--- | :--- | :--- | :--- | :--- |
| `DEBT-001` | Phase 0 | Locked binary cleanup (`node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node`) | Held open by previous local dev process during workspace reset; resolved automatically on next `npm install` after closing terminal dev server | Phase 0 local install |
| `DEBT-002` | Phase 0 | Missing pre-build reference files (`webzy-store-v3.html`, PDF `01 Charter`, PDF `02 PRD`) | Requested from founder before building Phase 1 storefront components & exact DB RLS tables | Before Phase 1 |
| `DEBT-003` | Phase 0 | `@webzy/jobs` in-memory/stub runner | Persistent DB-backed `jobs` table + worker cron scheduled for Phase 4 after Phase 2 schema review | Phase 4 |
