# Roadmap

High-level implementation order for WardrobeAI, broken into small phases. Each phase is scoped to be independently buildable and verifiable (usually a day or less of focused work) rather than a whole feature at once — the goal is a steady sequence of small, demonstrable steps, not a handful of big-bang milestones.

Ordering rationale: foundation first, then security/profiles (everything else is per-profile data, so isolation has to exist before there's data to isolate), then the wardrobe core (the app's baseline value), then progressively higher-risk/higher-complexity features, with Virtual Try-On — the largest native/CV surface — deliberately late so the core data model is proven before the riskiest work starts. Backup depends on the full data model existing, so it comes after. Hardening and release close it out.

Phase numbers are stable identifiers for planning/tracking, not calendar weeks. Cross-reference FR-numbers point back to [`docs/spec.md`](../docs/spec.md).

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

## Phase 4 — Outfits

- **4.1** Outfit Builder: category slots + item picker (single item per relevant category).
- **4.2** Save/name an outfit.
- **4.3** Outfit Detail view.
- **4.4** Outfit edit.
- **4.5** Outfit delete, with planner-impact confirmation when planner entries reference it (FR-13).

## Phase 5 — Favorites

- **5.1** Favorite/unfavorite toggle on item detail and outfit detail.
- **5.2** Favorites screen (Items / Outfits tabs), filtered query only — no new table.

## Phase 6 — Planner

- **6.1** Calendar view (month/day states, no entries yet).
- **6.2** Create planner entry: assign an outfit OR a single item to a date (never both — FR-15 CHECK constraint).
- **6.3** Planner Entry Detail view.
- **6.4** Edit/remove a planner entry.
- **6.5** Mark entry "worn" → writes `wear_log` row(s) (FR-17).
- **6.6** Un-mark "worn" back to "planned" → deletes the corresponding `wear_log` row(s), keeping Statistics consistent.

## Phase 7 — Statistics

- **7.1** Wear-count aggregate query per item.
- **7.2** Most-worn / least-worn / never-worn (unworn) views.
- **7.3** Category breakdown (item count + wear count by category).
- **7.4** Statistics Dashboard screen wiring all of the above (FR-21, read-only derived views only — no stats table).

## Phase 8 — Virtual Try-On

The largest native/CV surface in the app; deliberately sequenced after the core data model (wardrobe, outfits) is stable and tested.

- **8.1** Profile Body Photo capture screen (one per profile, retakeable).
- **8.2** Native pose-detection module (MediaPipe Pose), landmark output cached to `body_photo.pose_landmarks_json`.
- **8.3** Native person-segmentation module (MediaPipe Selfie Segmentation).
- **8.4** Native compositing module (OpenCV): warp + alpha-blend a single garment onto a segmented photo using landmark anchors.
- **8.5** Try-On Canvas: render auto-placed single item end-to-end.
- **8.6** Extend compositing to a full saved outfit (multiple layered garments, `layer_order`).
- **8.7** Manual reposition/scale/rotate gestures per layer (Reanimated + Gesture Handler), pre-save.
- **8.8** Save or discard the final composited preview image.
- **8.9** Wire "Try On" entry point directly from Outfit Detail (FR-14).

## Phase 9 — Backup & Restore

- **9.1** Native backup module: bundle a profile's SQLite DB + image directory into a zip with a manifest (app version, schema version, checksum).
- **9.2** Encrypt archive by default via Google Tink, passphrase set at export time (FR-29a/NFR-9).
- **9.3** Export flow UI: profile-scope selection, passphrase entry, SAF/share-sheet destination picker.
- **9.4** Restore flow: passphrase validation before reading contents, manifest/schema-version/checksum validation.
- **9.5** Restore import: transactional DB row import + image file copy, all-or-nothing on any validation failure; overwrite-existing-profile vs. restore-as-new-profile paths.

## Phase 10 — Settings & Polish

- **10.1** Dark Mode toggle (System/Light/Dark) — real implementation, replacing the Phase 0 stub.
- **10.2** Biometric timeout setting.
- **10.3** Accessibility pass: `accessibilityLabel`s, 48dp touch targets, TalkBack verification across all screens.
- **10.4** Both-orientation layout pass, prioritizing camera/crop/try-on screens.
- **10.5** Local-only structured logging + manual log export via SAF (no third-party crash/analytics SDK).

## Phase 11 — Hardening & Release

- **11.1** Profile-isolation integration test (no query/file path can cross profile boundaries).
- **11.2** Cross-schema-version backup/restore test (older manifest into a newer app build).
- **11.3** OOM/resource-exhaustion test path for the CV pipelines, on a low-end-of-flagship reference device.
- **11.4** Detox E2E suite for the critical path: create profile → add item → build outfit → try on → plan → statistics update.
- **11.5** Performance pass: cold start (<2s, NFR-2), warm try-on latency (<3s, NFR-3), first-run model-load ceiling (NFR-3a).
- **11.6** Release prep: signed AAB via CI, Play Console Data Safety form ("no data collected"), versioning bump, release checklist (§43).

## Explicitly Deferred (not in this roadmap)

Per the spec's Future Roadmap (§31) and Non-Goals — do not pull these forward without an explicit decision:

- Broader device support (API 24+, CPU-only CV fallback).
- Additional locales.
- "What should I wear today" suggestion engine.
- Tablet-optimized multi-pane layouts.
