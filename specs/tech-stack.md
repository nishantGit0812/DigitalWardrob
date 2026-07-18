# Tech Stack

Technology decisions for WardrobeAI, as finalized in [`docs/spec.md`](../docs/spec.md) (spec v1.4.0-draft, §8, §20–§22, §28a, §40, §44–§63). These are treated as locked for v1 unless a decision here is explicitly revisited — the spec's changelog shows prior "to be confirmed" items were deliberately closed out before freeze, so don't reopen them without cause.

Phase 0 and Phase 1 (both already shipped — see [`roadmap.md`](roadmap.md)) predate the sections below marked "since §44"; nothing here changes what they already built, only what Phase 2 onward should build on top of them. One exception: Phase 1's theme files (`paperTheme.ts`, `disabledState.ts`, `textContrast.ts`) predate §58's now-locked theme file structure and are refactored — not rewritten from scratch — as the first item of Phase 2 (see "Design Tokens & Theming" below).

## Platform & Target

- **Android only** for v1 (no iOS).
- `minSdkVersion 31` (Android 12), `targetSdkVersion 36` (Android 16), `compileSdkVersion` latest stable at build time.
- Flagship-focused device target: assumes GPU delegate availability and NNAPI/GPU acceleration for TFLite. Broader device support (API 24+, CPU-only fallback) is explicitly deferred to a future roadmap item, not v1.
- Build artifact: Android App Bundle (`.aab`), Play App Signing enabled. Distribution via Google Play Store.

## App Layer (TypeScript / React Native)

| Concern | Choice |
|---|---|
| Framework | React Native, TypeScript (`strict: true`, no implicit `any`) |
| Navigation | React Navigation — native-stack for root/profile flows, bottom-tabs for the main authenticated area |
| State management | Redux Toolkit (`createEntityAdapter` for normalized collections) |
| Persisted UI state | Redux Persist → MMKV (non-sensitive, non-redundant state only: theme, last tab, filter prefs) |
| UI kit | React Native Paper (Material Design 3) |
| Camera | React Native Vision Camera |
| Image cropping/import | React Native Image Crop Picker |
| Image loading/caching | React Native Fast Image |
| Lists | FlashList (virtualized, for wardrobe grid / outfit pickers) |
| Gestures/animation | React Native Reanimated, React Native Gesture Handler |
| Layout primitives | React Native Safe Area Context, React Native Screens |
| Icons | `@material-symbols/svg-400`/`@material-symbols/svg-500` (pre-built Material Symbols Rounded SVGs, weight 400/500 — **corrected in Phase 2 Task Group 3**: no npm package ships Material Symbols as a react-native-vector-icons font family, verified against the live registry when this task group was built; React Native Vector Icons only publishes the older Material Icons/Material Design Icons fonts) + React Native SVG (renders both the base-set and custom wardrobe-specific icon subset, spec §28a.5) — every icon used as a tab/chip selection indicator ships an outlined *and* filled variant, no exceptions (a Phase 0 draft of this section's predecessor originally missed this for one custom icon; see spec §28a.5) |
| Typography | Bundled Inter variable font static assets (spec §28a.4) — no remote/Google Fonts fetch, kept offline-safe |
| Local database access | op-sqlite (DAO layer, versioned migrations on app start) |
| Key-value storage | MMKV (active profile id, theme mode, onboarding flag — chosen over AsyncStorage for synchronous hot-path reads) |
| Filesystem access | `@dr.pogodin/react-native-fs` (per-profile image directory create/delete, Task Group 2; general file I/O for Phase 2+ wardrobe photos) — a maintained fork of the original `react-native-fs`, with full New Architecture/TurboModule support (this project's `newArchEnabled=true`). No filesystem library was chosen in Phase 0; this fills that gap as of Task Group 2. |
| Biometric bridge (JS side) | AndroidX Biometric, via native bridge |
| Sound playback (since §52, optional/off-by-default UI sounds) | **Not yet finalized.** Needs a New Architecture/TurboModule-compatible RN audio-playback package (this project runs `newArchEnabled=true`, the same bar `@dr.pogodin/react-native-fs` was chosen against) — candidates to evaluate include `react-native-sound` (mature but unconfirmed New Arch support) and any Nitro-modules-based alternative. Camera shutter sound is *not* part of this decision — it uses the OS `MediaActionSound.SHUTTER_CLICK` system sound directly (some regions mandate an unsilenceable shutter sound; letting the OS own it handles that automatically). To be confirmed as part of Phase 2's sound-effects hook (roadmap 2.14). |

**Explicitly not used:** RTK Query (no network layer to justify it — repository calls are async thunks into the Data layer).

## Native Layer (Kotlin)

| Concern | Choice |
|---|---|
| Language | Kotlin (idiomatic modern Kotlin, no Java for new native modules) |
| Module system | TurboModules, one module per capability (pose, segmentation, matting, compositing, backup, biometric, profile PIN) |
| Concurrency | Kotlin Coroutines + structured concurrency (`Dispatchers.Default`/`Dispatchers.IO`), never raw threads, never the UI/JS thread for heavy work |
| Pose detection | MediaPipe Android SDK — Pose (`BlazePose` model bundle) |
| Person segmentation | MediaPipe Android SDK — Selfie Segmentation |
| Garment matting (clothing cutout) | General-purpose salient-object segmentation TFLite model (e.g. MODNet/U²-Net-class) — bundled `.tflite` asset. **Open risk:** exact model not yet chosen, needs a spike (see roadmap). |
| Compositing | OpenCV Android (via JNI) — affine/perspective warp + alpha blend, anchored to pose landmarks |
| Backup encryption | Google Tink (Android) — authenticated encryption, passphrase-derived key |
| Biometric (native) | AndroidX Biometric |
| Haptics (native, since §51) | Android `VibrationEffect`/`HapticFeedbackConstants` composition primitives (API 31+, available on every target device — no legacy `vibrate(ms)` fallback needed). Small native module exposing named effects (tick/click/double-click/heavy-click) rather than raw durations, bridged through a single `useHaptic()` JS hook so the spec's one global on/off toggle (§51) has one enforcement point. |
| Foldable hinge detection (native, since §53.4) | Jetpack WindowManager (`androidx.window:window`) — reads `FoldingFeature` geometry so a Dialog/Bottom Sheet can avoid straddling a book-mode hinge. New dependency introduced by the responsive-layout spec, not present in the original Phase 0 stack. |

All models ship bundled in the APK/AAB — nothing is downloaded post-install (required for the fully-offline guarantee).

## Storage

- **SQLite**, one physical database file **per profile** (`wardrobe_<profileId>.db`) — this is the primary enforcement mechanism for profile data isolation, not just a query-level filter.
- A small shared `app_meta.db` (or MMKV) holds the profile registry and global settings.
- **Images are never stored as BLOBs** — only relative file paths in SQLite; actual files live under internal `files/profiles/<profileId>/...`.
- No external/public storage for live app data. Android Storage Access Framework (SAF) is used only transiently, at explicit backup export/import.

## Architecture

Clean Architecture, strict one-way dependency flow:

```
Presentation → Domain → Data → Native
```

- **Domain** is pure TypeScript — no React Native or Android imports, testable outside any app runtime.
- **Data** is the only layer allowed to touch SQLite, the filesystem, or native bridges; it implements Domain's repository interfaces.
- **Native modules** are only reached through Data's `NativeBridge` interface — never called directly from Domain or Presentation.
- Feature-based folder structure (`features/<name>/{data,domain,presentation}`), enforced via ESLint import boundary rules — no reaching into another feature's internals except through its public `presentation` exports or a shared `domain` interface.

Full rule set: spec §18a.

## Design Tokens & Theming (since §44, §58)

No new libraries — this is a file-structure and token-naming discipline layered on top of React Native Paper (already in the App Layer table above). Built once in Phase 2 (roadmap 2.1–2.3), consumed by every phase after:

- **Token module**: `src/app/theme/tokens.ts` exports a single typed `Tokens` object covering spacing, radius, elevation, stroke widths, opacity, icon/avatar/button/FAB/chip sizes, card/grid/nav spacing, animation durations, and the z-index/stacking policy (spec §44.1–§44.14) — every one of these is a named constant; a raw pixel/dp literal in a component's `StyleSheet` outside this file is a spec violation, not a style preference.
- **Theme file structure** (spec §58.2): `colors.light.ts` / `colors.dark.ts` (the §28a.3 MD3 role tables), `statusColors.ts` (the Worn/Planned/Skipped semantic tokens, theme-aware by value rather than light/dark-split), `typography.ts` (the §28a.4 Inter role map), assembled into `light.ts` / `dark.ts` and consumed via a single `useAppTheme()` hook — never `Appearance.getColorScheme()` read directly inside a component. Phase 1 shipped an earlier, simpler theme shape (`paperTheme.ts`, `disabledState.ts`, `textContrast.ts`); Phase 2 refactors those into this structure rather than leaving two theme systems live side by side.
- **Dynamic color / Material You**: deliberately *not* applied to the app's Paper theme (a fixed brand palette is part of the product's identity, spec §28a.2) — the only place Android 12+ dynamic color is used is the adaptive launcher icon's monochrome themed layer, which is an OS-level icon-theming mechanism, not a Paper theme concern (spec §58.4).

## Icon, Illustration & Asset Pipeline (since §46, §49, §60)

- **Base icons**: Material Symbols, Rounded style, configured per spec §46.1 (fill axis 0/1 for idle/selected, weight 400/500, optical size 24, grade 0) via React Native Vector Icons, already listed in the App Layer table.
- **Custom icons & illustrations**: authored as SVG on a 24×24 (icons, spec §46.2) or 320×240 (illustrations, spec §49.1) artboard, run through SVGO (`removeViewBox: false`, `removeDimensions: true`, `convertShapeToPath: false`) as a Husky pre-commit hook alongside the existing lint/format hooks — a build-time pipeline addition, no new runtime dependency. Rendered via React Native SVG at runtime; no per-size raster variants are generated.
- **Registration discipline**: every custom icon is added to the typed icon-name map (`src/shared/assets/icons/index.ts`) in the same commit that adds its SVG file — an icon with no map entry should fail lint, not exist as dead weight.
- **Folder structure**: `src/shared/assets/{fonts,icons/base,icons/custom,illustrations}`; brand-only exports (Play Store icon, Feature Graphic, standalone logo layers) live under `docs/architecture/brand-assets/`, outside the app bundle (spec §60.6).

## Design Process (since §59, §61, §62)

Process, not code — recorded here because it gates what Phase 2+ treats as "spec-complete" for a screen:

- **Figma source of truth**: a `wardrobeai-foundations` library (colors/type/spacing as Figma Variables, spec §59.2/§59.4) and a `wardrobeai-components` library (every component in spec §45 as a variant set, spec §59.3) are the authored origin for every token and component this file and the spec describe. A frame is only implementation-ready once tagged `Ready for Dev` (spec §59.8).
- **Design QA Checklist** (spec §61): a manual visual-QA pass (alignment, contrast, dark/light, touch targets, reduced motion, responsiveness) run on a physical device before any feature is called done, in addition to — not instead of — the automated test layers below.
- **Design Handoff Checklist** (spec §62): before implementation starts on a new screen, its Figma frame must satisfy this checklist (bound Variables, all required states present, empty/loading/error states specified, accessibility labels for icon-only controls, final copy). Both checklists apply starting with Phase 2 — Phase 0/1 predate them and are not retroactively audited against them.

## Accessibility & UX Patterns (since §28a, §50–§53)

No new libraries beyond the small native haptics module (Native Layer table above) — these are usage patterns on top of dependencies already listed:

- **Reduced motion**: every non-gesture animation (toggles, screen transitions, the planner "Worn" microinteraction) must branch on React Native's `AccessibilityInfo.isReduceMotionEnabled()` / `reduceMotionChanged` event — which reflects Android's system "Remove animations" setting — and skip straight to the end state (≤50ms) when it's on. Gesture-driven Try-On layer transforms (Reanimated, direct 1:1 response to touch) are exempt. Spec §28a.7, and the full per-interaction table in spec §50.
- **Disabled state**: standard MD3 treatment (38% opacity content / 12% opacity container), derived from the same on-surface/surface tokens already in the theme rather than a separate hardcoded gray — applies wherever a control is conditionally disabled (Add Profile at 4/4, category delete blocked, an unfilled Outfit Builder slot). Spec §28a.9, §44.4.
- **Loading treatment**: `ActivityIndicator` (React Native Paper) for single-result waits with no progressive layout (Background Removal Review, Try-On Canvas); Reanimated-based skeleton/shimmer for list-shaped first loads (Wardrobe grid, Outfit Builder pickers) — no separate skeleton library needed. Spec §28a.9, §45.8.
- **Haptics**: routed through a single `useHaptic()` hook (Native Layer table above) with one global on/off Settings toggle, default on — never a per-interaction preference. Spec §51.
- **Sound**: optional, off by default (inverse of haptics — audible to everyone nearby on a shared household device, spec §4); every sound-paired event already has a haptic and/or visual signal as the primary carrier, so sound is never load-bearing for a screen-reader or muted-device user. Spec §52.
- **Responsive breakpoints**: a shared `useBreakpoint()`-style hook wraps `useWindowDimensions` (phone portrait/landscape, tablet at `sw600dp`+) and Jetpack WindowManager's `FoldingFeature` (folded/unfolded, hinge-aware modal placement) — one hook, consumed everywhere, rather than ad hoc width checks per screen. Spec §53.

## Testing

| Layer | Tooling |
|---|---|
| Unit | Jest |
| Component | React Native Testing Library |
| Integration | Jest + in-memory/temp SQLite |
| Native module | JUnit + Espresso (Android instrumentation) |
| E2E | Detox |
| Performance | Android Studio Profiler + custom timing harness |

CI runs unit/component/integration tests and lint on every PR; Detox/instrumentation suites run nightly/pre-release against an emulator matrix matching API 31+.

**React Native Testing Library is the required standard for every component-level test** — querying by role/text/label as a user would, not inspecting internals. Raw `react-test-renderer` (with no RNTL queries) is acceptable only for the most trivial smoke-render check, never as a substitute for RNTL on anything with user-facing behavior to assert. **Known gap:** `__tests__/App.test.tsx` (Phase 0) predates this being made explicit and currently uses bare `react-test-renderer`; it should be migrated once RNTL is installed rather than treated as the pattern to copy.

## Tooling & Process

- ESLint + Prettier, enforced pre-commit via Husky and in CI.
- No commented-out code, no placeholder/stub implementations merged to `develop`.
- Git: `main` (release-only, tagged), `develop` (integration), `feature/<ticket>-<short-desc>`, `release/<version>`, `hotfix/<version>-<short-desc>`.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `perf:`).
- Semantic Versioning for the app; SQLite schema versioned independently (`schema_version` in backup manifest + `PRAGMA user_version`).

## Explicitly Excluded

Per the spec's Constraints (§7) and Security Strategy (§26), these are constraints on the tech stack, not just missing features:

- No backend of any kind (no REST API, GraphQL, Firebase, Supabase, or any managed cloud service).
- No authentication server, no login, no user accounts.
- No analytics or telemetry SDKs of any kind, including crash reporters that phone home.
- No online AI inference — all MediaPipe/TFLite/OpenCV inference is on-device.
- No advertisements.
- No network permission requested in the manifest at all.
