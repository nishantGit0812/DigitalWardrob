# Tech Stack

Technology decisions for WardrobeAI, as finalized in [`docs/spec.md`](../docs/spec.md) (spec v1.3.1-draft, §8, §20–§22, §28a, §40). These are treated as locked for v1 unless a decision here is explicitly revisited — the spec's changelog shows prior "to be confirmed" items were deliberately closed out before freeze, so don't reopen them without cause.

Phase 0 (already shipped — see [`roadmap.md`](roadmap.md)) predates the sections below marked "since §28a"; nothing here changes what Phase 0 already built, only what Phase 1 onward should build on top of it.

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
| Icons | React Native Vector Icons (Material Symbols base set) + React Native SVG (custom wardrobe-specific icon subset, spec §28a.5) — every icon used as a tab/chip selection indicator ships an outlined *and* filled variant, no exceptions (a Phase 0 draft of this section's predecessor originally missed this for one custom icon; see spec §28a.5) |
| Typography | Bundled Inter variable font static assets (spec §28a.4) — no remote/Google Fonts fetch, kept offline-safe |
| Local database access | op-sqlite (DAO layer, versioned migrations on app start) |
| Key-value storage | MMKV (active profile id, theme mode, onboarding flag — chosen over AsyncStorage for synchronous hot-path reads) |
| Filesystem access | `@dr.pogodin/react-native-fs` (per-profile image directory create/delete, Task Group 2; general file I/O for Phase 2+ wardrobe photos) — a maintained fork of the original `react-native-fs`, with full New Architecture/TurboModule support (this project's `newArchEnabled=true`). No filesystem library was chosen in Phase 0; this fills that gap as of Task Group 2. |
| Biometric bridge (JS side) | AndroidX Biometric, via native bridge |

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

## Accessibility & UX Patterns (since §28a)

No new libraries — these are usage patterns on top of dependencies already listed above, required starting with whichever Phase 1+ feature first introduces the relevant UI (see `roadmap.md`):

- **Reduced motion**: every non-gesture animation (toggles, screen transitions, the planner "Worn" microinteraction) must branch on React Native's `AccessibilityInfo.isReduceMotionEnabled()` / `reduceMotionChanged` event — which reflects Android's system "Remove animations" setting — and skip straight to the end state when it's on. Gesture-driven Try-On layer transforms (Reanimated, direct 1:1 response to touch) are exempt. Spec §28a.7.
- **Disabled state**: standard MD3 treatment (38% opacity content / 12% opacity container), derived from the same on-surface/surface tokens already in the theme rather than a separate hardcoded gray — applies wherever a control is conditionally disabled (Add Profile at 4/4, category delete blocked, an unfilled Outfit Builder slot). Spec §28a.9.
- **Loading treatment**: `ActivityIndicator` (React Native Paper) for single-result waits with no progressive layout (Background Removal Review, Try-On Canvas); Reanimated-based skeleton/shimmer for list-shaped first loads (Wardrobe grid, Outfit Builder pickers) — no separate skeleton library needed. Spec §28a.9.

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
