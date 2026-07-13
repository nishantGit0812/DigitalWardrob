# Roadmap

High-level implementation order for WardrobeAI, broken into small phases. Each phase is scoped to be independently buildable and verifiable rather than a whole feature at once — the goal is a steady sequence of small, demonstrable steps, not a handful of big-bang milestones.

Ordering rationale: foundation first, then security/profiles (everything else is per-profile data, so isolation has to exist before there's data to isolate), then the wardrobe core (the app's baseline value), then progressively higher-risk/higher-complexity features, with Virtual Try-On — the largest native/CV surface — deliberately late so the core data model is proven before the riskiest work starts. Backup depends on the full data model existing, so it comes after. Hardening and release close it out.

Phase numbers are stable identifiers for planning/tracking, not calendar weeks. Cross-reference FR-numbers point back to [`docs/spec.md`](../docs/spec.md).

**Consolidated from an earlier 12-phase draft** (see git history for the original Phase 0–11 breakdown): three pairs of adjacent, tightly-coupled, small phases were merged — Outfits+Favorites, Planner+Statistics, and Settings&Polish+Hardening&Release — since each pair shared a dependency chain and neither half had independent shippable value without the other. One phase (Background Removal) stayed standalone despite being small, because it's a native-model spike with genuine open risk that's easier to timebox in isolation. Dependency ordering is unchanged; only numbering and grouping shifted.

**Sub-items added by the spec's 1.3.1 UX review** (§28a): folded into whichever phase first touches the affected screen, rather than opening a new phase — none of them are large enough to justify their own phase, and doing it this way keeps each phase's own feature grouped with its own polish. Phase 0 is complete and intentionally untouched by this pass; all additions below land in Phase 1 or later.

**Renumbered for the spec's 1.4.0 implementation-level UX/UI pass** (§44–§63): unlike the 1.3.1 review, this pass is too large to fold silently into existing phases — it specifies a full design-token set, a ~40-component shared library, and icon/logo/illustration/motion/haptic/sound systems that every later phase should *consume*, not reinvent per screen. A new **Phase 2 — Design System Foundation** is inserted immediately after Phase 1 to build that shared infrastructure once. Every phase from the old Phase 2 (Wardrobe Core) onward shifts down by one number; no dependency ordering changes, only the numbers and the new phase. Phase 0 and Phase 1 are complete, already shipped, and untouched by this pass — where the new spec sections affect something Phase 1 already built (PIN-entry haptics, being the one concrete case), that lands as a small, explicitly-labeled retrofit item in Phase 2 rather than reopening Phase 1's scope. Each phase below is also broken into smaller sub-items than before, per the same "small, demonstrable steps" principle in the opening paragraph — several of the larger phases (Wardrobe Core, Virtual Try-On) picked up a handful of new small items this pass, rather than absorbing the new spec detail as unstated scope creep inside an existing item.

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

## Phase 2 — Design System Foundation

New phase, inserted by the 1.4.0 pass. Nothing here is user-facing product scope on its own — it's the shared tokens, components, icons, and cross-cutting hooks that every phase from here on consumes rather than rebuilds. Sequenced immediately after Profiles & Security (the first phase to render real screens beyond Phase 0's placeholders) and before Wardrobe Core, so the very first real feature screens are built against finished components, not a one-off style.

- **2.1** Design tokens module (`src/app/theme/tokens.ts`): spacing, radius, elevation, stroke-width, and opacity scales (spec §44.1–§44.6).
- **2.2** Remaining size tokens: icon/avatar/button/FAB/chip heights, card/grid/nav spacing, animation-duration scale, z-index/stacking policy (spec §44.7–§44.14).
- **2.3** Theme file refactor: split Phase 1's `paperTheme.ts`/`disabledState.ts`/`textContrast.ts` into `colors.light.ts` / `colors.dark.ts` / `statusColors.ts` / `typography.ts` / `light.ts` / `dark.ts` per spec §58.2 — a restructuring of already-shipped Phase 1 theming, not new behavior, so it ships as its own small, easily-reviewed commit with no visual diff.
- **2.4** Add `react-native-svg` and React Native Vector Icons dependencies; configure the Material Symbols Rounded base set (fill/weight/optical-size axes, spec §46.1); add the SVGO pre-commit hook to Husky (spec §60.1).
- **2.5** Custom icon subset: cutout icon, Try-On tab outline/filled pair, backup/restore icon (spec §46.2/§46.3), each registered in the typed icon-name map the same commit it's added.
- **2.6** Shared components, batch 1 — Button (Filled/Outlined/Text/Tonal), Icon Button, FAB (spec §45.1).
- **2.7** Shared components, batch 2 — Card (base), List Item, Section Header (spec §45.2). Feature-specific card variants (Wardrobe/Outfit/Category/Profile/Statistic Card, Calendar Cell) are *not* built here — they're built in the phase that first needs them, on top of this base.
- **2.8** Shared components, batch 3 — Dialog, Bottom Sheet, Snackbar, Tooltip (spec §45.6).
- **2.9** Shared components, batch 4 — Chip family (base/filter/assist/tag), Badge (spec §45.7).
- **2.10** Shared components, batch 5 — Progress Indicator, Skeleton Loader, Loading Overlay (spec §45.8).
- **2.11** Shared components, batch 6 — Empty State, Confirmation/Error/Success/Backup-Progress Dialog (spec §45.9).
- **2.12** Responsive-layout hook: `useBreakpoint()`-style wrapper over `useWindowDimensions` (phone portrait/landscape, tablet at `sw600dp`+) plus Jetpack WindowManager `FoldingFeature` detection for foldables (spec §53) — add the `androidx.window` native dependency.
- **2.13** `useHaptic()` hook and its global on/off Settings-store key (spec §51) — the small native haptics module (tech-stack.md) and the hook are built here; the actual Settings-screen toggle *row* ships later (roadmap 9.12), once a Settings screen exists to put it on.
- **2.14** Sound-effects hook, off-by-default, same now-plumb/later-surface pattern as 2.13 (spec §52) — blocked on finalizing the audio-playback library (tech-stack.md, "Sound playback" — not yet decided).
- **2.15** Retrofit: wire PIN success/failure haptics (spec §51) onto the already-shipped Phase 1 PIN Entry component. The haptic spec didn't exist when Phase 1 shipped; this is a small addition on top of finished work, not a reopening of Phase 1's scope, and is the first real consumer of 2.13's hook.
- **2.16** Adaptive app icon: replace the React Native default launcher icon with the logomark construction (spec §47.1–§47.6), including the monochrome themed-icon layer and the notification icon (spec §48.1/§48.3/§48.7).

## Phase 3 — Wardrobe Core

- **3.1** Categories: seeded defaults + CRUD (add/rename/reorder), using the Category Card / List Item pattern from Phase 2 (spec §45.2, §54.12).
- **3.2** Category delete guard: `ON DELETE RESTRICT` + UI pre-check blocking delete when items are assigned (FR-8), disabled-state token from Phase 1 (1.10).
- **3.3** Item capture: camera flow (Vision Camera) inside the shared Camera Overlay component, with the Item Capture dashed-outline guide and its auto-fading hint (spec §45.10, §55.1).
- **3.4** Item capture: gallery import fallback via Android's system Photo Picker (`ACTION_PICK_IMAGES`, no broad media permission needed, spec §55.8) — also reachable as a first-class equal choice from the Image Picker sheet, not only as a permission-denial fallback.
- **3.5** Camera permission handling: lazy request on first capture attempt, denial routes to the Gallery path plus an "Open Settings" deep link, never a dead end (spec §55.5).
- **3.6** Item crop screen: themed native Crop Overlay with the 1:1 aspect preset (spec §45.10, §55.9). *Blur detection (spec §55.4) is explicitly deferred to Phase 7* — it depends on OpenCV, which this phase does not yet bundle (OpenCV lands in Phase 7 for compositing); it will be retrofitted onto this screen then (see 7.4). Lighting-hint (§55.3) has no such dependency and ships here.
- **3.7** Item metadata form (name, category, brand, color, size, season, tags) + save, using the Text Field / Dropdown / Tag Chip components from Phase 2 (spec §45.5, §45.7).
- **3.8** Wardrobe grid (list/browse only, no search/filter yet): Wardrobe Card component (spec §45.2), phone-portrait/landscape/tablet column counts (spec §44.11, §53.1–§53.3), Skeleton Loader on first SQLite load (spec §45.8).
- **3.9** Item detail view.
- **3.10** Item edit.
- **3.11** Item delete — verify `wear_log` rows survive via nulled FK + name snapshot, not cascade-deleted (FR-11); Delete-then-Undo Snackbar microinteraction (spec §50 "Delete"/"Undo" rows) and the Delete haptic (spec §51).
- **3.12** Search: case-insensitive, partial-match across name/brand/tags (FR-10), Search Bar → Search Field expand/collapse pattern with 150ms debounce (spec §45.4).
- **3.13** Filters: category/color/season/favorite, composable (AND) with search, as Filter Chips (spec §45.7).
- **3.14** Empty Wardrobe illustration state (`il_empty_wardrobe`, spec §49.5) on the Empty State component from Phase 2 (spec §45.9) — closes the true-first-run case where the grid would otherwise render nothing.

## Phase 4 — Background Removal (native spike)

- **4.1** Spike: evaluate 2–3 candidate lightweight matting TFLite models against sample clothing photos; pick one.
- **4.2** Native garment-matting module (Kotlin, TFLite interpreter) wired via TurboModule.
- **4.3** Background Removal Review screen (before/after **toggle**, not a slider — a binary cutout-vs-transparency result doesn't benefit from a wipe-reveal metaphor, spec §56.4), Retry action (FR-7).
- **4.4** Wire the matting-model wait to the Progress Indicator loading treatment (spec §28a.9, §45.8, §56.1) and the reduced-motion check (§28a.7) for its enter/exit transition; add the Cancel action after a 2-second grace period (spec §56.2).

## Phase 5 — Outfits & Favorites

- **5.1** Outfit Builder: category slots (Card-base drop targets, spec §54.13) + item picker (single item per relevant category), empty-slot disabled-state token (1.10).
- **5.2** Save/name an outfit.
- **5.3** Outfit Detail view: flat-lay composite render (spec §54.14).
- **5.4** Outfit edit.
- **5.5** Outfit delete, with planner-impact confirmation when planner entries reference it (FR-13); Delete/Undo microinteraction (spec §50), matching 3.11's pattern.
- **5.6** Favorite/unfavorite toggle on item detail and outfit detail: fill + spring-bounce microinteraction and haptic tick on favoriting only, not un-favoriting (spec §50 "Favorite toggle" row, §51).
- **5.7** Favorites screen (Items / Outfits tabs), filtered query only — no new table; each tab's empty state is independent (`il_empty_favorites`, spec §49.5, §54.19).
- **5.8** Outfit Builder empty-wardrobe illustration state (`il_empty_outfit_builder`, spec §49.5) — closes the gap where a first-run user can reach Outfit Builder (a sibling bottom tab, not gated behind Wardrobe) before adding any items.

## Phase 6 — Planner & Statistics

- **6.1** Calendar view (month/day states, no entries yet): Calendar Cell component, sized to clear the 48dp touch-target minimum across a 7-column row on the smallest supported width (spec §45.2, §54.15).
- **6.2** Create planner entry: assign an outfit OR a single item to a date (never both — FR-15 CHECK constraint).
- **6.3** Planner Entry Detail view.
- **6.4** Edit/remove a planner entry.
- **6.5** Mark entry "worn" → writes `wear_log` row(s) (FR-17); checkmark scale-in microinteraction + haptic tick (spec §50/§51 "Planner mark worn" rows).
- **6.6** Un-mark "worn" back to "planned" → deletes the corresponding `wear_log` row(s), keeping Statistics consistent; lighter haptic than 6.5's, deliberately (spec §51 "Planner un-mark worn" row).
- **6.7** Wear-count aggregate query per item.
- **6.8** Most-worn / least-worn / never-worn (unworn) views.
- **6.9** Category breakdown (item count + wear count by category).
- **6.10** Statistics Dashboard screen: Statistic Card summary row + category-breakdown bar chart with tabular-figure counts (spec §28a.4, §54.20), wiring 6.7–6.9.
- **6.11** Worn/Planned/Skipped status badges wired to the semantic status color tokens, including the on-fill text/icon colors and the corrected Skipped pairing (spec §28a.3 — the 1.3.0 draft's plain-Outline Skipped label fell just under the 4.5:1 body-text contrast bar it claimed to meet; fixed to the Secondary token before this phase consumes it).
- **6.12** Statistics "all caught up" illustration state (`il_stats_all_caught_up`, spec §49.5) — replaces only the never-worn list section, not the whole dashboard, keeping the rest of the Statistics Dashboard's content visible (spec §28a.1 tone rule, §54.20).

## Phase 7 — Virtual Try-On

The largest native/CV surface in the app; deliberately sequenced after the core data model (wardrobe, outfits) is stable and tested.

- **7.1** Profile Body Photo capture screen (one per profile, retakeable): full-body dashed framing guide, cycled from the six body-shape/stance silhouette variants (spec §49.3, §55.2), 3-second capture countdown (spec §55.6).
- **7.2** Native pose-detection module (MediaPipe Pose), landmark output cached to `body_photo.pose_landmarks_json`.
- **7.3** Native person-segmentation module (MediaPipe Selfie Segmentation).
- **7.4** Native compositing module (OpenCV): warp + alpha-blend a single garment onto a segmented photo using landmark anchors. **Retrofit:** once OpenCV is bundled here, wire blur detection (Laplacian-variance sharpness check, spec §55.4) onto Phase 3's already-shipped Item Capture screen — deferred from 3.6 specifically because it needed this dependency.
- **7.5** Try-On Canvas: render auto-placed single item end-to-end, using the Try-On Layer component (spec §45.11).
- **7.6** Extend compositing to a full saved outfit (multiple layered garments, `layer_order`); layer-thumbnail strip to switch the active layer (spec §57.1).
- **7.7** Manual reposition/scale/rotate gestures per layer (Reanimated + Gesture Handler): four corner Gesture Handles doing combined scale+rotate, center-area drag for pure translation, simultaneous-recognizer gesture priority scoped to mutually exclusive hit-areas (spec §57.3–§57.5).
- **7.8** Alignment-guide snapping: per-category pose-landmark guide lines rendered only while a layer is actively being dragged and within 6dp, with the lightest haptic tick in the whole app as feedback (spec §57.6, §51 "Try-On layer snap" row).
- **7.9** Undo/Redo: local, non-persisted linear transform-history stack per session, cleared on navigating away (spec §57.8, consistent with §19's decision to keep Try-On gesture state out of Redux/SQLite until Save).
- **7.10** Save or discard the final composited preview image: fast low-res preview during gesture interaction, full-resolution re-composite on Save (spec §57.9); Save haptic (spec §51 "Try-On save" row).
- **7.11** Before/After comparison slider on the saved result — a wipe-reveal against the plain Profile Body Photo, distinct from Phase 4's binary before/after toggle since both sides here are full photographic images (spec §56.5).
- **7.12** Wire "Try On" entry point directly from Outfit Detail (FR-14).
- **7.13** Try-On bottom-tab icon: draw both the outlined-idle and filled-selected variants (spec §28a.5 — the 1.3.0 draft specified only one drawing, the sole icon in the tab bar that would otherwise have lacked a selected-state variant); wire the pose/segmentation/compositing wait to the same Progress Indicator loading treatment as Phase 4.

## Phase 8 — Backup & Restore

- **8.1** Native backup module: bundle a profile's SQLite DB + image directory into a zip with a manifest (app version, schema version, checksum).
- **8.2** Encrypt archive by default via Google Tink, passphrase set at export time (FR-29a/NFR-9).
- **8.3** Export flow UI: profile-scope selection, passphrase entry (reusing the Password Field variant, spec §45.5) via SAF/share-sheet destination picker, and the Backup Progress Dialog for the operation itself (spec §45.9, §54.22).
- **8.4** Restore flow: passphrase validation before reading contents, manifest/schema-version/checksum validation.
- **8.5** Restore import: transactional DB row import + image file copy, all-or-nothing on any validation failure; overwrite-existing-profile vs. restore-as-new-profile paths; Success/Error Dialog on completion rather than a passive Snackbar, since this is a rare, high-stakes action worth confirming explicitly (spec §45.9).

## Phase 9 — Hardening, Polish & Release

- **9.1** Dark Mode toggle (System/Light/Dark) — real implementation, replacing the Phase 0 stub; theme-switch cross-fade transition (spec §58.6).
- **9.2** Biometric timeout setting.
- **9.3** Home Dashboard: real content (today's planned outfit hero, quick-action buttons, recent-items row, spec §54.5), replacing the Phase 0 placeholder tab — sequenced here because it depends on Wardrobe, Planner, and Try-On data all existing.
- **9.4** Settings screen: Haptics and Sound toggle rows (spec §51/§52), surfaced here for the first time — the underlying hooks and store keys were plumbed back in Phase 2 (2.13/2.14) so every feature since could already call them.
- **9.5** Accessibility pass: `accessibilityLabel`s, 48dp touch targets (measured against the visual/touch-target split in spec §44.9, not just estimated), TalkBack verification across all screens, and a reduced-motion verification pass (system "Remove animations" on → every decorative animation since Phase 1 collapses to its end state instantly; spec §28a.7, full interaction table in §50).
- **9.6** Responsive/orientation pass across the full breakpoint matrix — phone portrait/landscape, tablet (`sw600dp`+), and folded/unfolded foldables (spec §53.1–§53.7) — prioritizing camera/crop/try-on screens, expanded from the original phase's phone-orientation-only scope now that tablet and foldable breakpoints are concretely specified.
- **9.7** Local-only structured logging + manual log export via SAF (no third-party crash/analytics SDK).
- **9.8** Profile-isolation integration test (no query/file path can cross profile boundaries).
- **9.9** Cross-schema-version backup/restore test (older manifest into a newer app build).
- **9.10** OOM/resource-exhaustion test path for the CV pipelines, on a low-end-of-flagship reference device.
- **9.11** Detox E2E suite for the critical path: create profile → add item → build outfit → try on (including a basic gesture-reposition step) → plan → statistics update.
- **9.12** Performance pass: cold start (<2s, NFR-2), warm try-on latency (<3s, NFR-3), first-run model-load ceiling (NFR-3a).
- **9.13** Full Design QA Checklist pass (spec §61) across every shipped screen, and a Design Handoff Checklist (spec §62) sign-off audit for any frame that was implemented ahead of it.
- **9.14** Play Store icon and Feature Graphic finalized (spec §48.4/§48.5) and uploaded to Play Console.
- **9.15** Release prep: signed AAB via CI, Play Console Data Safety form ("no data collected"), versioning bump, release checklist (§43).

## Explicitly Deferred (not in this roadmap)

Per the spec's Future Roadmap (§31) and Non-Goals — do not pull these forward without an explicit decision:

- Broader device support (API 24+, CPU-only CV fallback).
- Additional locales.
- "What should I wear today" suggestion engine.
- Tablet-optimized multi-pane layouts, including the permanent Navigation Drawer / Navigation Rail patterns the spec already themes but doesn't yet instantiate (spec §45.3).
