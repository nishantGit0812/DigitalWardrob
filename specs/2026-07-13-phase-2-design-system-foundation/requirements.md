# Requirements — Phase 2: Design System Foundation

Covers roadmap items **2.1–2.16** (see [`../roadmap.md`](../roadmap.md)). This phase is not user-facing product scope on its own — it's the shared tokens, theme structure, icon pipeline, ~40-component library, and cross-cutting hooks (responsive, haptic, sound) that every phase from Phase 3 (Wardrobe Core) onward consumes rather than reinvents per screen. Sequenced immediately after Phase 1 (Profiles & Security, already shipped) and before Wardrobe Core, so the first real product screens are built against a finished component set instead of one-off styling.

## Scope

In scope (roadmap 2.1–2.16, kept together as one phase per the roadmap's own phase boundary and stakeholder decision):

1. Design tokens module (`src/app/theme/tokens.ts`): spacing, radius, elevation, stroke-width, opacity scales (spec §44.1–§44.6).
2. Remaining size tokens: icon/avatar/button/FAB/chip heights, card/grid/nav spacing, animation-duration scale, z-index/stacking policy (spec §44.7–§44.14).
3. Theme file refactor: split Phase 1's `paperTheme.ts` into `colors.light.ts` / `colors.dark.ts` / `statusColors.ts` / `typography.ts` / `light.ts` / `dark.ts` per spec §58.2 — restructuring only, no visual diff. `disabledState.ts` and `textContrast.ts` carry forward unchanged (both already take a generic theme/hex input, so the refactor around them doesn't touch either).
4. `@material-symbols/svg-400`/`@material-symbols/svg-500` (pre-built Material Symbols Rounded SVGs) + `react-native-svg` dependencies — **not** React Native Vector Icons: no npm package ships Material Symbols as an RNVI font family (RNVI only publishes the older Material Icons/Material Design Icons fonts), corrected while building Task Group 3, see tech-stack.md's Icons row; Material Symbols Rounded base set configuration (spec §46.1); SVGO pre-commit hook added to Husky (spec §60.1).
5. Custom icon subset: cutout icon, Try-On tab outline/filled pair, backup/restore icon (spec §46.2/§46.3), each registered in the typed icon-name map in the same commit it's added.
6. Shared components batch 1 — Button (Filled/Outlined/Text/Tonal), Icon Button, FAB (spec §45.1).
7. Shared components batch 2 — Card (base), List Item, Section Header (spec §45.2). Feature-specific card variants are built later, on top of this base.
8. Shared components batch 3 — Dialog, Bottom Sheet, Snackbar, Tooltip (spec §45.6).
9. Shared components batch 4 — Chip family (base/filter/assist/tag), Badge (spec §45.7).
10. Shared components batch 5 — Progress Indicator, Skeleton Loader, Loading Overlay (spec §45.8).
11. Shared components batch 6 — Empty State, Confirmation/Error/Success/Backup-Progress Dialog (spec §45.9).
12. Responsive-layout hook: `useBreakpoint()` over `useWindowDimensions` (phone portrait/landscape, tablet at `sw600dp`+) plus Jetpack WindowManager `FoldingFeature` detection for foldables (spec §53); adds the `androidx.window` native dependency.
13. `useHaptic()` hook + its global on/off Settings-store key (spec §51) — native haptics module and hook only; the Settings-screen toggle row ships later (roadmap 9.12).
14. Sound-effects hook, off-by-default (spec §52) — see Decisions below for the now-resolved library choice.
15. Retrofit: wire PIN success/failure haptics (spec §51) onto the already-shipped Phase 1 PIN Entry component — first real consumer of 2.13's hook.
16. Adaptive app icon: replace the RN default launcher icon with the logomark construction (spec §47.1–§47.6), including the monochrome themed-icon layer and notification icon (spec §48.1/§48.3/§48.7).

Out of scope (deferred to later phases per roadmap):

- Feature-specific card variants (Wardrobe/Outfit/Category/Profile/Statistic Card, Calendar Cell) — built in the phase that first needs them (Phase 3+), on top of 2.7's base Card.
- The Settings screen itself and its Haptics/Sound toggle *rows* (roadmap 9.4) — only the underlying hooks/store keys ship here.
- Blur detection (spec §55.4) on the Item Capture screen — depends on OpenCV, which lands in Phase 7; tracked there, not here.
- Any wardrobe, outfit, planner, statistics, try-on, or backup product logic (Phase 3 onward).
- Dynamic color / Material You theming — deliberately excluded per spec §28a.2 (fixed brand palette); the adaptive icon's monochrome layer is the only Android 12+ dynamic-color touchpoint, and it's an OS icon-theming mechanism, not a Paper theme concern.

## Decisions

Resolved with the stakeholder before writing this spec:

| Decision | Choice | Rationale |
|---|---|---|
| Phase scope | **Full Phase 2 (2.1–2.16) as one spec/branch** | Matches the roadmap's own phase boundary and how Phase 0/1 were scoped. Task groups within `plan.md` still allow independent sub-PRs. |
| Sound-playback library (2.14, previously unresolved in tech-stack.md) | **Custom native module, not a third-party package** — a small Kotlin module wrapping Android `SoundPool` (short, low-latency UI sound-effect playback), exposed as a TurboModule and bridged through a single `useSound()` JS hook, mirroring the existing `useHaptic()` pattern (tech-stack.md, Native Layer table) | Ruled out `react-native-sound` (unconfirmed New Architecture support — this project runs `newArchEnabled=true`, the same bar that already ruled out other packages for filesystem access) and a Nitro-modules alternative (adds a new third-party dependency/build-tool for a handful of short clip plays). A custom module matches the project's existing "one native module per capability" convention (already used for biometric, profile PIN, and haptics), needs no new third-party dependency, and is trivially guaranteed New-Architecture-compatible since it's authored in-house. `SoundPool` is purpose-built for exactly this use case (short, low-latency UI sounds) rather than the streaming/background-audio use cases larger audio libraries target. |
| Icon/component build order | **Tokens → theme refactor → icon pipeline → components (batches 1–6) → hooks → PIN-haptic retrofit → adaptive icon**, per roadmap numbering | Components consume tokens and icons, so both must exist first; hooks (2.12–2.14) are independent of the component batches and can be parallelized; the PIN-haptic retrofit (2.15) is the first consumer of 2.13 so it must follow it; the adaptive icon (2.16) has no dependency on the rest and can land anytime but is sequenced last as a low-risk closeout item. |

Carried over from project-level docs (not re-litigated here, see [`../tech-stack.md`](../tech-stack.md) and [`../mission.md`](../mission.md)):

- No new UI-kit library — this phase is a token/file-structure/component discipline layered on top of the already-chosen React Native Paper (MD3), not a replacement of it.
- Dynamic color / Material You is deliberately not applied to the Paper theme (spec §28a.2) — fixed brand palette is part of the product's identity.
- Every icon used as a tab/chip selection indicator ships both outlined and filled variants, no exceptions (spec §28a.5).
- Reduced-motion branching (`AccessibilityInfo.isReduceMotionEnabled()`) applies to every non-gesture animation this phase's components introduce (mission.md non-negotiable #4, spec §28a.7).
- Haptics route through one global on/off toggle, default on, single enforcement point (spec §51); sound is off by default and never load-bearing for a screen-reader or muted-device user (spec §52).
- Design QA Checklist (spec §61) and Design Handoff Checklist (spec §62) both start applying as of this phase — Phase 0/1 predate them and are not retroactively audited.
- Clean Architecture (`Presentation → Domain → Data → Native`) and feature-based folder structure with ESLint import-boundary enforcement continue to apply to every new module this phase adds.
- No network permission, no analytics/telemetry SDKs (mission.md non-negotiable #1) — applies even to any future crash/error surfacing this phase's Dialog/Snackbar components might tempt.

## Contact / Ownership

- **Feature owner:** Nishant (repo owner, `nishantGit0812` on GitHub).
- **Spec author / assistant-assisted planning:** drafted with Claude Code from `specs/roadmap.md`, `specs/mission.md`, and `specs/tech-stack.md` as source of truth. Any conflict between this spec and those files should be reconciled, not silently overridden (per mission.md's own stated policy).
- **Branch:** `feature/phase-2-design-system-foundation` (off `develop`, per the repo's git strategy — PRs target `develop`, not `main`).

## Non-Negotiables Carried Forward

Per [`../mission.md`](../mission.md):

- Accessible by default: every component this phase ships (Button, Dialog, Chip, etc.) must meet WCAG-aligned contrast/touch-target/TalkBack requirements from first merge — this phase is the one every later screen's accessibility posture depends on.
- No network permission, no analytics/telemetry/crash-reporter SDKs — including inside the new Snackbar/Dialog/Error-state components this phase introduces, which might otherwise tempt a "just report this error" telemetry add.
- No TODO/placeholder code paths merged, except intentionally-scoped stubs already carried from earlier phases (dark-mode no-op from Phase 0, until roadmap 9.1), documented as such.
- Every decorative animation this phase's components introduce respects the system reduced-motion setting (spec §28a.7) — this is the phase that establishes the shared pattern every later screen's animations reuse.
