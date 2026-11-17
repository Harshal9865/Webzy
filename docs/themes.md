# Webzy Theme Engine & Package Spec (`@webzy/themes`)

> Phase 0 Stub — schema contract matches Section 12 of the Master Build Prompt & File 03 §6.

## Rules Every Theme Package Must Follow
1. **Self-Contained Folder (`packages/themes/src/themes/<theme-id>/`):**
   - `theme.json` (`id`, `version`, `mode`, `occasion`, `languages`, `fields`, `music`, `price`)
   - React component accepting sanitized schema-driven payload
   - Language strings (`hinglish`, `hi`, `en`)
   - Demo sample content & preview artwork
2. **Schema-Driven Create Form:** Adding a new theme must **not** require new form code in `apps/web`.
3. **Versioning:** Live published sites stay bound to the `theme_version_id` captured at purchase time.
4. **Hard Limits & QA (Section 23 & File 06 §8):**
   - Max `<= 5` inputs for `ready-made` themes (unless schema specifies semi-custom)
   - Zero raw HTML (`dangerouslySetInnerHTML`), escape all user text, test `40`-character names and Hindi conjuncts (`Noto Sans Devanagari`), zero horizontal scroll at `360px` width, `<= 1.5 MB` receiver page load, tap-to-open unlocks audio.
5. **Launch Candidates (Phase 1+):**
   - `birthday-confetti-01`, `birthday-ashirwad-01`, `midnight-reveal-01` (`P1`), `will-you-01`, `our-timeline-01`, `maan-jao-01` (behind `FEATURE_MAAN_JAO` flag), `make-them-smile-01`, `valentine-week-pack-01` (`P1`), `our-year-01` (Dec MVP), `harvest-festival-01` (Jan MVP), `wedding-invite-classic-01` (semi-custom), `business-greeting-01`.
