# Plan — Phase 0: Foundation

Numbered task groups, each independently verifiable. Sequenced so later groups depend only on earlier ones (e.g. folder structure before anything imports across it; theming last since it's the most purely cosmetic layer to prove out).

## Task Group 1 — Project Scaffolding (roadmap 0.1)

1.1. Run `npx @react-native-community/cli init` (latest stable RN) targeting Android only; remove/ignore iOS-specific files it generates (no iOS in v1 per tech-stack.md).
1.2. Enable TypeScript `strict: true`, disable implicit `any`, in `tsconfig.json`.
1.3. Install and configure ESLint + Prettier with a shared config; wire Husky pre-commit hook to run lint + format check.
1.4. Add GitHub Actions CI workflow: lint + unit test job on every PR.
1.5. Confirm `npm` is the lockfile/package-manager of record (`package-lock.json` committed, no `yarn.lock`).
1.6. Verify no network permission (`android.permission.INTERNET` or similar) exists in the generated `AndroidManifest.xml`.

## Task Group 2 — Folder Structure & Architecture Boundaries (roadmap 0.2)

2.1. Create `src/{app,features,shared}` skeleton.
2.2. Establish the `features/<name>/{data,domain,presentation}` convention with one placeholder feature (or a `README.md` documenting the convention) so later phases have a template to follow.
2.3. Add ESLint import-boundary rules enforcing `Presentation → Domain → Data → Native` one-way flow (spec §18a) — domain must not import React Native or Android-specific modules; presentation must not reach into another feature's internals.
2.4. Add a deliberately-violating test import and confirm lint fails, then remove it — proves the rule is load-bearing, not decorative.

## Task Group 3 — SQLite Layer (roadmap 0.3)

3.1. Integrate `op-sqlite`.
3.2. Build a migration runner (versioned migrations, tracked via `PRAGMA user_version` per tech-stack.md).
3.3. Implement the capability to create/open a per-profile DB file (`wardrobe_<profileId>.db` naming convention) — no actual profile feature yet, just the Data-layer primitive Phase 1 will call.
3.4. Unit/integration test: create a DB file, run a no-op migration, confirm `user_version` is set and the file exists at the expected path.

## Task Group 4 — MMKV Setup (roadmap 0.4)

4.1. Integrate MMKV.
4.2. Implement the shared `app_meta` store shape (profile registry placeholder, global settings) — schema only, no Phase 1 profile CRUD yet.
4.3. Confirm MMKV is used (not AsyncStorage) per tech-stack.md's synchronous-hot-path-read rationale.

## Task Group 5 — Navigation Shell (roadmap 0.5)

5.1. Install React Navigation (native-stack + bottom-tabs).
5.2. Build the root stack with placeholder empty screens for each planned tab (Wardrobe, Outfits, Planner, Statistics, Settings — per mission.md's feature set).
5.3. Wire React Native Screens + Safe Area Context.
5.4. Confirm navigation compiles and runs on an emulator/device with tab switching functional (screens can be empty placeholders).

## Task Group 6 — MD3 Theming (roadmap 0.6)

6.1. Integrate React Native Paper, define light/dark MD3 token sets.
6.2. Add a dark-mode toggle in a placeholder Settings screen, wired to a **no-op** setting (real persistence lands in roadmap 10.1) — must not silently become a real implementation; keep it visibly a stub per the roadmap's own phase boundary.
6.3. Manually verify contrast-compliant rendering in both light and dark mode (mission.md accessibility principle applies even to placeholder screens).

## Sequencing Notes

- Groups 1–2 must land before 3–6 (everything else lives inside the folder structure and is subject to its lint boundaries).
- Groups 3 and 4 are independent of each other and of 5/6 — can be parallelized across PRs if useful.
- Group 6 intentionally last: it's the most visible/demo-able piece and benefits from the navigation shell (5) already existing to theme against.
