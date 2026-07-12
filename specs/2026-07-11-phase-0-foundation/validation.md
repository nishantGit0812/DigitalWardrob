# Validation — Phase 0: Foundation

How to know Phase 0 is actually done, not just "code exists." Mirrors mission.md's product-level Definition of Done, scoped down to what's meaningful pre-feature-work: builds, boundaries, and no TODO/placeholder paths beyond the deliberately-scoped no-op stubs called out in `plan.md`.

## Per-Task-Group Checks

**Task Group 1 — Scaffolding**
- [ ] `npm install && npm run android` builds and launches the app on an emulator or device without errors.
- [ ] `npx tsc --noEmit` passes with `strict: true` and no implicit `any` anywhere.
- [ ] `npm run lint` passes clean.
- [ ] A commit with a deliberate lint violation is rejected by the Husky pre-commit hook (test once, then don't merge it).
- [ ] GitHub Actions workflow runs on a test PR and both lint + test jobs go green.
- [ ] `AndroidManifest.xml` contains no `INTERNET` or other network permission.
- [ ] Only `package-lock.json` is committed — no `yarn.lock`.

**Task Group 2 — Folder Structure**
- [ ] `src/{app,features,shared}` exists and at least one feature follows `features/<name>/{data,domain,presentation}`.
- [ ] A deliberate cross-boundary import (e.g. Domain importing `react-native`, or Presentation reaching into another feature's internal Data file) fails lint — proven once during development, not left in the codebase.
- [ ] No such violation exists in the final merged state.

**Task Group 3 — SQLite**
- [ ] Calling the "create/open per-profile DB" primitive with a test profile id produces a file named `wardrobe_<profileId>.db` in the expected app-internal directory.
- [ ] `PRAGMA user_version` reflects the migration runner's tracked schema version after a fresh create.
- [ ] Integration test (Jest + temp/in-memory SQLite per tech-stack.md's testing table) covers: fresh create, re-open existing file, migration bump.

**Task Group 4 — MMKV**
- [ ] `app_meta` store is readable/writable synchronously (no `await` needed) — confirms MMKV, not AsyncStorage, is actually wired up.
- [ ] Store shape matches what Phase 1's profile registry will need (reviewed against roadmap 1.3/1.4, even though Phase 1 isn't implemented yet).

**Task Group 5 — Navigation**
- [ ] App launches directly into the bottom-tab shell with all planned tabs present and switchable.
- [ ] Each tab renders its placeholder screen without crashing.
- [ ] TalkBack can reach and announce each tab (accessibility isn't deferred to Phase 10 for basic navigation — mission.md's "accessible by default" is non-negotiable from the start).

**Task Group 6 — Theming**
- [ ] Dark-mode toggle visibly changes MD3 tokens across the placeholder screens.
- [ ] Toggle is confirmed to be a no-op across app restarts (i.e. it does *not* persist) — this is the expected Phase 0 behavior, not a bug; re-check this box specifically so no one "fixes" it early and steps on roadmap 10.1's scope.
- [ ] Manual check in both light and dark mode for contrast compliance (WCAG-aligned per mission.md).

## Phase-Level Definition of Done

- [ ] All six task groups above are individually checked off.
- [ ] No TODO/placeholder code paths exist **except** the two deliberately-scoped stubs (dark-mode no-op setting, empty nav screens) — and both are documented as intentional in code comments or PR description, not silent gaps.
- [ ] Manually verified on a physical Android device (not just emulator) per mission.md's Definition of Done, in both light/dark mode and both orientations.
- [ ] `main`/`develop` merge does not introduce network permissions, analytics/telemetry SDKs, or crash reporters (mission.md non-negotiables — checked even though Phase 0 has no user data yet).
- [ ] CI is green on the PR that merges this phase.
