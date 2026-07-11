# Tech Stack

Technology decisions for WardrobeAI, as finalized in [`Digital_Wardroad.md`](../Digital_Wardroad.md) (spec v1.2.0-draft, §8, §20–§22, §40). These are treated as locked for v1 unless a decision here is explicitly revisited — the spec's changelog shows prior "to be confirmed" items were deliberately closed out before freeze, so don't reopen them without cause.

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
| Icons | React Native Vector Icons |
| Local database access | op-sqlite (DAO layer, versioned migrations on app start) |
| Key-value storage | MMKV (active profile id, theme mode, onboarding flag — chosen over AsyncStorage for synchronous hot-path reads) |
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
