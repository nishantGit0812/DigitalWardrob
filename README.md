# DigitalWardrob (WardrobeAI)

**Status:** Specification phase — see [`Digital_Wardroad.md`](./Digital_Wardroad.md) for the full spec (v1.2.0-draft).

WardrobeAI is an offline-first Android application that lets a person digitize their physical wardrobe, organize it, plan outfits, and preview how clothing looks on them via on-device 2D virtual try-on — with zero backend, zero account, and zero data ever leaving the device. Up to four people can share one installation through fully isolated local profiles (e.g. a household), each with their own wardrobe, photos, planner, and stats.

## Why

Wardrobe apps today either require a cloud account and upload personal photos to a server, or don't offer try-on at all. WardrobeAI is a privacy-first, fully local alternative, using MediaPipe + TensorFlow Lite for on-device computer vision.

## Goals

- Catalog a wardrobe with photos, categories, and rich metadata in under 30 seconds per item.
- 2D virtual try-on that composites a full outfit (top + bottom + shoes, etc.) onto the user's own Profile Body Photo, entirely offline.
- Outfit planning against a calendar with simple wear statistics.
- No data ever leaves the device: no network calls, no analytics, no accounts.
- Up to 4 isolated local profiles on one install.
- Material Design 3, dark-mode-capable, accessible UI.

## Non-Goals

- Not a 3D avatar or body-scanning app.
- Not a social/sharing platform.
- Not a shopping or e-commerce integration.
- Not cross-device sync (manual encrypted backup/restore only).
- Not a generative "what should I wear" recommendation engine (v1).
- Android only for v1 (not iOS).

## Core Features

- **Profiles** — up to 4 local profiles, each fully isolated at the database and file-storage level, with device-level biometric gate and an optional per-profile PIN.
- **Wardrobe** — add items via camera/gallery, crop, on-device background removal, customizable categories, rich metadata, search/filter.
- **Outfit Builder** — compose outfits from existing items across categories; save, edit, delete.
- **Virtual Try-On** — MediaPipe Pose + Selfie Segmentation composite garments onto a Profile Body Photo, with manual reposition/scale/rotate.
- **Planner** — assign outfits or items to calendar dates, mark worn, track planned vs. worn status.
- **Favorites** — favorite/unfavorite items and outfits, with a dedicated view.
- **Statistics** — wear counts, most/least-worn, category breakdowns, unworn items — all derived read-only from the wear log.
- **Backup & Restore** — export an encrypted (Google Tink), passphrase-protected archive of the database and images; restore with integrity checks.

## Tech Stack

| Layer | Technology |
|---|---|
| App framework | React Native + TypeScript (strict) |
| State | Redux Toolkit, Redux Persist |
| UI kit | React Native Paper (Material Design 3) |
| Navigation | React Navigation (native-stack + bottom-tabs) |
| Local database | SQLite via op-sqlite (one DB file per profile) |
| Key-value storage | MMKV |
| Camera / cropping | React Native Vision Camera, React Native Image Crop Picker |
| Computer vision (native) | MediaPipe Android SDK (Pose, Selfie Segmentation), TensorFlow Lite (garment matting), OpenCV Android |
| Native modules | Kotlin, TurboModules, Coroutines |
| Biometrics | AndroidX Biometric |
| Backup encryption | Google Tink (authenticated encryption, passphrase-derived key) |
| Gestures/animation | React Native Reanimated, React Native Gesture Handler |

## Architecture

Clean Architecture with a strict one-way dependency flow:

```
Presentation (screens, components, hooks, Redux slices)
        ↓
Domain (use-cases, entities — pure TypeScript, no RN/Android imports)
        ↓
Data (repositories, SQLite DAOs, file storage, native bridges)
        ↓
Native (Kotlin TurboModules — pose, segmentation, matting, compositing, backup, biometric, profile PIN)
```

Each `features/<x>/` module is self-contained (`data/domain/presentation`), enforced via ESLint import boundaries. See [`Digital_Wardroad.md`](./Digital_Wardroad.md) §18–§18a for the full architecture diagram and rules.

## Device Target

`minSdkVersion 31` (Android 12), `targetSdkVersion 36` (Android 16) — flagship-focused to reliably support GPU-accelerated on-device CV inference. See spec §8 for the full rationale.

## Privacy & Security

- 100% offline — no network permission requested at all.
- No analytics, telemetry, or crash-reporting SDKs that phone home.
- No backend, no accounts, no login.
- Device-level biometric gate plus an optional per-profile PIN for shared-device households.
- Backup archives are encrypted by default; there is no passphrase recovery by design.

## Project Structure

```
wardrobe-ai/
  android/                # Native Android project (Kotlin native modules)
  src/
    app/                  # Navigation root, theming, Redux store setup
    features/              # profiles, wardrobe, categories, outfits, planner,
                            # favorites, statistics, tryOn, backup, settings
    shared/                # cross-feature components, hooks, database, utils
  __tests__/               # unit, integration, e2e
  docs/                    # spec.md, architecture, ADRs
  .github/workflows/       # CI (build, lint, test)
```

See spec §17 for the complete breakdown.

## Development

This project is currently in the specification/pre-implementation phase — no application code has been committed yet. Once implementation begins:

- `develop` is the integration branch; feature branches are cut as `feature/<ticket>-<short-desc>` and PR back into `develop` with required passing CI + review.
- `main` is release-only, always deployable and tagged.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `perf:`).

See spec §41–§43 for the full Git strategy, versioning strategy, and release checklist.

## Documentation

The full software specification — product vision, functional/non-functional requirements, database design, screen specs, architecture, testing strategy, risk analysis, and more — lives in [`Digital_Wardroad.md`](./Digital_Wardroad.md).
