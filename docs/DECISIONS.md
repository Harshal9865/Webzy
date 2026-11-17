# Webzy Architecture & Product Decision Log

| Date | ID | Decision | Reason / Source |
| :--- | :--- | :--- | :--- |
| 2026-11-17 | `DEC-001` | Fresh monorepo reset preserving `references/*.jpeg` only, structured as `/apps/web`, `/apps/admin`, `/packages/core`, `/packages/themes`, `/packages/jobs`, `/infra`, `/docs` using npm workspaces | Founder request ("delete current project aside from the reference images and redo project from this prompt") + Section 23 / PDF 03 §3 |
| 2026-11-17 | `DEC-002` | Keep `PAYMENT_PROVIDER=mock` as default in `.env.example`, disabled in production unless `ALLOW_MOCK_IN_PROD=true` | Master Build Prompt §2 & §10: simulate only money until Section 27 go-live |
| 2026-11-17 | `DEC-003` | Store open questions (`GST_REGISTERED=false`, `DEFAULT_VALIDITY_DAYS=30`, `FEATURE_OPENED_ALERT=false`, `FEATURE_MAAN_JAO=false`) in typed env/config | Master Build Prompt §3 & §26 defaults |
| 2026-11-17 | `DEC-004` | Defer DB SQL migrations cleanly to Phase 2 founder review (`infra/supabase/` holds typed client + connection probe in Phase 0) | Master Build Prompt §0 ("Ask me before: changing the database design") & §24 (Phase 0 vs Phase 2) |
