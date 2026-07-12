# Roadmap

High-level implementation order for WardrobeAI, broken into small phases. Each phase is scoped to be independently buildable and verifiable rather than a whole feature at once — the goal is a steady sequence of small, demonstrable steps, not a handful of big-bang milestones.

Ordering rationale: foundation first, then security/profiles (everything else is per-profile data, so isolation has to exist before there's data to isolate), then the wardrobe core (the app's baseline value), then progressively higher-risk/higher-complexity features, with Virtual Try-On — the largest native/CV surface — deliberately late so the core data model is proven before the riskiest work starts. Backup depends on the full data model existing, so it comes after. Hardening and release close it out.

Phase numbers are stable identifiers for planning/tracking, not calendar weeks. Cross-reference FR-numbers point back to [`docs/spec.md`](../docs/spec.md).

**Consolidated from an earlier 12-phase draft** (see git history for the original Phase 0–11 breakdown): three pairs of adjacent, tightly-coupled, small phases were merged — Outfits+Favorites, Planner+Statistics, and Settings&Polish+Hardening&Release — since each pair shared a dependency chain and neither half had independent shippable value without the other. One phase (Background Removal) stayed standalone despite being small, because it's a native-model spike with genuine open risk that's easier to timebox in isolation. Dependency ordering is unchanged; only numbering and grouping shifted.

**Sub-items added by the spec's 1.3.1 UX review** (§28a): folded into whichever phase first touches the affected screen, rather than opening a new phase — none of them are large enough to justify their own phase, and doing it this way keeps each phase's own feature grouped with its own polish. Phase 0 is complete and intentionally untouched by this pass; all additions below land in Phase 1 or later.

## Phase 0 — Foundation

- **0.1** Project scaffolding: RN + TypeScript (`strict: true`), ESLint + Prettier + Husky pre-commit, CI skeleton (lint + test on PR).
- **0.2** Feature-based folder structure (`src/{app,features,shared}`) with ESLint import-boundary rules enforcing Clean Architecture layering (§18a).
- **0.3** SQLite layer: op-sqlite integration, migration runner, ability to create/open a per-profile DB file.
- **0.4** MMKV setup + shared `app_meta` store (profile registry, global settings).
- **0.5** Navigation shell: root stack, bottom-tab skeleton, empty placeholder screens for each tab.
- **0.6** MD3 theming: light/dark tokens, dark-mode toggle wired to a no-op setting.

## Phase 1 — Profiles & Security

- **1.1** Device biometric gate screen (AndroidX Biometric bridge, native module).
- **1.2** Profile Selection screen (grid, up to 4).
- **1.3** Create Profile (name + avatar/color), writes to `app_meta` registry.
- **1.4** Per-profile DB file + image directory provisioning on profile creation (FR-2/NFR-6 isolation, enforced at storage layer).
- **1.5** Edit profile (rename/re-avatar).
- **1.6** Delete profile, with confirmation, cascading DB file + image directory removal.
- **1.7** Per-profile PIN setup during profile creation (FR-4a), salted/hashed, stored via `EncryptedSharedPreferences`.
- **1.8** PIN entry gate on profile selection.
- **1.9** Forgot-PIN reset via re-passing the device biometric gate (FR-4b).
- **1.10** Disabled-state token (38%/12% opacity on the shared on-surface/surface theme colors, spec §28a.9) added to the theme and applied to its first consumer: the "Add Profile" action once 4/4 profiles exist (1.2). Every later disabled control (category delete, Outfit Builder slots) reuses this token rather than inventing its own.

## Phase 2 — Wardrobe Core

- **2.1** Categories: seeded defaults + CRUD (add/rename/reorder).
- **2.2** Category delete guard: `ON DELETE RESTRICT` + UI pre-check blocking delete when items are assigned (FR-8).
- **2.3** Item capture: camera flow (Vision Camera).
- **2.4** Item capture: gallery import fallback.
- **2.5** Item crop screen.
- **2.6** Item metadata form (name, category, brand, color, size, season, tags) + save.
- **2.7** Wardrobe grid (list/browse only, no search/filter yet).
- **2.8** Item detail view.
- **2.9** Item edit.
- **2.10** Item delete — verify `wear_log` rows survive via nulled FK + name snapshot, not cascade-deleted (FR-11).
- **2.11** Search: case-insensitive, partial-match across name/brand/tags (FR-10).
- **2.12** Filters: category/color/season/favorite, composable (AND) with search.

## Phase 3 — Background Removal (native spike)

- **3.1** Spike: evaluate 2–3 candidate lightweight matting TFLite models against sample clothing photos; pick one.
- **3.2** Native garment-matting module (Kotlin, TFLite interpreter) wired via TurboModule.
- **3.3** Background Removal Review screen (before/after toggle, retry), inserted into the add-item flow between crop and metadata (FR-7).
- **3.4** Wire the matting-model wait (3.2/3.3) to the spec's defined loading treatment — indeterminate `ActivityIndicator`, not a skeleton, since there's no partial layout to reveal (spec §28a.9) — and to the reduced-motion check (§28a.7) for its enter/exit transition.

## Phase 4 — Outfits & Favorites

- **4.1** Outfit Builder: category slots + item picker (single item per relevant category).
- **4.2** Save/name an outfit.
- **4.3** Outfit Detail view.
- **4.4** Outfit edit.
- **4.5** Outfit delete, with planner-impact confirmation when planner entries reference it (FR-13).
- **4.6** Favorite/unfavorite toggle on item detail and outfit detail.
- **4.7** Favorites screen (Items / Outfits tabs), filtered query only — no new table.
- **4.8** Outfit Builder empty-wardrobe illustration state ("Add a few wardrobe items before building your first outfit," linking to Wardrobe's add-item flow, spec §28a.6) — closes the gap where a first-run user can reach Outfit Builder (a sibling bottom tab, not gated behind Wardrobe) before adding any items. Category slots also apply the 1.10 disabled-state token before a valid item is picked.

## Phase 5 — Planner & Statistics

- **5.1** Calendar view (month/day states, no entries yet).
- **5.2** Create planner entry: assign an outfit OR a single item to a date (never both — FR-15 CHECK constraint).
- **5.3** Planner Entry Detail view.
- **5.4** Edit/remove a planner entry.
- **5.5** Mark entry "worn" → writes `wear_log` row(s) (FR-17).
- **5.6** Un-mark "worn" back to "planned" → deletes the corresponding `wear_log` row(s), keeping Statistics consistent.
- **5.7** Wear-count aggregate query per item.
- **5.8** Most-worn / least-worn / never-worn (unworn) views.
- **5.9** Category breakdown (item count + wear count by category).
- **5.10** Statistics Dashboard screen wiring all of the above (FR-21, read-only derived views only — no stats table).
- **5.11** Worn/Planned/Skipped status badges wired to the semantic status color tokens, including the on-fill text/icon colors and the corrected Skipped pairing (spec §28a.3 — the 1.3.0 draft's plain-Outline Skipped label fell just under the 4.5:1 body-text contrast bar it claimed to meet; fixed to the Secondary token before this phase consumes it).

## Phase 6 — Virtual Try-On

The largest native/CV surface in the app; deliberately sequenced after the core data model (wardrobe, outfits) is stable and tested.

- **6.1** Profile Body Photo capture screen (one per profile, retakeable).
- **6.2** Native pose-detection module (MediaPipe Pose), landmark output cached to `body_photo.pose_landmarks_json`.
- **6.3** Native person-segmentation module (MediaPipe Selfie Segmentation).
- **6.4** Native compositing module (OpenCV): warp + alpha-blend a single garment onto a segmented photo using landmark anchors.
- **6.5** Try-On Canvas: render auto-placed single item end-to-end.
- **6.6** Extend compositing to a full saved outfit (multiple layered garments, `layer_order`).
- **6.7** Manual reposition/scale/rotate gestures per layer (Reanimated + Gesture Handler), pre-save.
- **6.8** Save or discard the final composited preview image.
- **6.9** Wire "Try On" entry point directly from Outfit Detail (FR-14).
- **6.10** Try-On bottom-tab icon: draw both the outlined-idle and filled-selected variants (spec §28a.5 — the 1.3.0 draft specified only one drawing, the sole icon in the tab bar that would otherwise have lacked a selected-state variant). Wire the pose/segmentation/compositing wait (6.2–6.6) to the same `ActivityIndicator` loading treatment as 3.4.

## Phase 7 — Backup & Restore

- **7.1** Native backup module: bundle a profile's SQLite DB + image directory into a zip with a manifest (app version, schema version, checksum).
- **7.2** Encrypt archive by default via Google Tink, passphrase set at export time (FR-29a/NFR-9).
- **7.3** Export flow UI: profile-scope selection, passphrase entry, SAF/share-sheet destination picker.
- **7.4** Restore flow: passphrase validation before reading contents, manifest/schema-version/checksum validation.
- **7.5** Restore import: transactional DB row import + image file copy, all-or-nothing on any validation failure; overwrite-existing-profile vs. restore-as-new-profile paths.

## Phase 8 — Hardening, Polish & Release

- **8.1** Dark Mode toggle (System/Light/Dark) — real implementation, replacing the Phase 0 stub.
- **8.2** Biometric timeout setting.
- **8.3** Accessibility pass: `accessibilityLabel`s, 48dp touch targets, TalkBack verification across all screens, and a reduced-motion verification pass (system "Remove animations" on → every decorative animation added since Phase 1 collapses to its end state instantly; spec §28a.7) — added as an explicit checklist item in the 1.3.1 review since motion is as much a WCAG-alignment concern (NFR-7) as contrast and touch targets, and it's cheap to miss when each animation is added piecemeal per-phase rather than swept at once.
- **8.4** Both-orientation layout pass, prioritizing camera/crop/try-on screens.
- **8.5** Local-only structured logging + manual log export via SAF (no third-party crash/analytics SDK).
- **8.6** Profile-isolation integration test (no query/file path can cross profile boundaries).
- **8.7** Cross-schema-version backup/restore test (older manifest into a newer app build).
- **8.8** OOM/resource-exhaustion test path for the CV pipelines, on a low-end-of-flagship reference device.
- **8.9** Detox E2E suite for the critical path: create profile → add item → build outfit → try on → plan → statistics update.
- **8.10** Performance pass: cold start (<2s, NFR-2), warm try-on latency (<3s, NFR-3), first-run model-load ceiling (NFR-3a).
- **8.11** Release prep: signed AAB via CI, Play Console Data Safety form ("no data collected"), versioning bump, release checklist (§43).

## Explicitly Deferred (not in this roadmap)

Per the spec's Future Roadmap (§31) and Non-Goals — do not pull these forward without an explicit decision:

- Broader device support (API 24+, CPU-only CV fallback).
- Additional locales.
- "What should I wear today" suggestion engine.
- Tablet-optimized multi-pane layouts.
