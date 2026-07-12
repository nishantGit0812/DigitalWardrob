# Requirements — Phase 1: Profiles & Security

Covers roadmap items **1.1–1.10** (see [`../roadmap.md`](../roadmap.md)). Phase 0 shipped the app skeleton (folders, SQLite/MMKV primitives, navigation, theming) with no real data or security. Phase 1 is the first phase that touches actual user data, which is why it's sequenced immediately after foundation and before wardrobe: everything from Phase 2 onward is per-profile data, so isolation has to exist first (mission.md non-negotiable #2).

## Scope

In scope (roadmap 1.1–1.10, kept together as one phase per stakeholder decision):

1. Device biometric gate screen (AndroidX Biometric bridge, native module), with device PIN/pattern/password as fallback when biometric hardware is unavailable or unenrolled.
2. Profile Selection screen (grid, up to 4 profiles).
3. Create Profile (name + avatar/color), written to the `app_meta` registry.
4. Per-profile SQLite DB file + image directory provisioning on profile creation (FR-2/NFR-6 isolation, enforced at the storage layer, not just filtered in the UI).
5. Edit profile (rename/re-avatar).
6. Delete profile, with confirmation, cascading DB file + image directory removal.
7. Per-profile PIN setup during profile creation (FR-4a): 4-digit numeric, bcrypt-hashed with a per-profile salt, stored via `EncryptedSharedPreferences`.
8. PIN entry gate on profile selection.
9. Forgot-PIN reset (FR-4b): re-passing the device biometric gate routes into a "set new PIN" flow that replaces the stored hash — not a one-time bypass.
10. Disabled-state token (38%/12% opacity, spec §28a.9) added to the theme, applied first to the "Add Profile" action at 4/4 profiles.

Out of scope (deferred to later phases per roadmap):

- Any wardrobe data, camera, or item CRUD (Phase 2+).
- Background removal, outfits, planner, statistics, try-on, backup (Phase 2+ through 7).
- Real dark-mode persistence (roadmap 8.1) and other Phase 8 hardening items — Phase 1 only reuses the Phase 0 no-op toggle, unchanged.
- Biometric timeout setting (roadmap 8.2) — Phase 1's biometric gate has no session-expiry logic yet.

## Decisions

Resolved with the stakeholder before writing this spec:

| Decision | Choice | Rationale |
|---|---|---|
| PIN hashing scheme | **bcrypt** | Purpose-built for password/PIN hashing, adjustable work factor, mature Android library support. Preferred over PBKDF2 (weaker at equal cost) and Argon2 (less mature Android/RN tooling). |
| Forgot-PIN behavior (1.9) | **Full reset, not session bypass** | Biometric success routes into a "set new PIN" flow that replaces the stored hash. Matches standard mobile forgot-PIN UX; a session-only bypass would leave the old (possibly forgotten) PIN in place with no way to change it. |
| Phase scope | **Single phase (1.1–1.10 together)**, one branch/spec | Matches the roadmap's own phase boundary, consistent with how Phase 0 was scoped. Task groups within `plan.md` still allow independent sub-PRs. |
| No-biometric-hardware fallback (1.1) | **Fall back to device PIN/pattern/password** | AndroidX Biometric's `BIOMETRIC_WEAK \| DEVICE_CREDENTIAL` combo supports this natively — reuses the device's own lock-screen credential, no new UI required. Blocking app usage entirely was rejected as excluding users without biometric hardware. |
| Per-profile PIN format (1.7/1.8) | **4-digit numeric** | Standard mobile PIN convention, fastest entry, matches lock-screen UX users already expect. 6-digit and variable-length were considered and rejected as unnecessary complexity for v1. |

Carried over from project-level docs (not re-litigated here, see [`../tech-stack.md`](../tech-stack.md) and [`../mission.md`](../mission.md)):

- Profile isolation enforced at the storage layer: one SQLite file per profile (`wardrobe_<profileId>.db`), images under `files/profiles/<profileId>/...`, never as BLOBs.
- Up to 4 profiles per install (mission.md).
- `EncryptedSharedPreferences` for PIN hash storage; biometric bridge via AndroidX Biometric, native module per tech-stack.md's one-module-per-capability convention.
- Clean Architecture: `Presentation → Domain → Data → Native`, enforced via ESLint import boundaries.
- Accessibility non-negotiables apply starting this phase: 48dp touch targets, TalkBack compatibility, contrast compliance, reduced-motion branching on any animation this phase introduces (spec §28a.7) — Phase 1 is the first phase to ship real animated interactions (PIN entry feedback, profile grid transitions).
- No network permission, no analytics/telemetry SDKs (mission.md non-negotiable #1) — applies even though PIN/biometric logic might tempt a "just log failed attempts" telemetry add; explicitly do not.

## Contact / Ownership

- **Feature owner:** Nishant (repo owner, `nishantGit0812` on GitHub).
- **Spec author / assistant-assisted planning:** drafted with Claude Code from `specs/roadmap.md`, `specs/mission.md`, and `specs/tech-stack.md` as source of truth. Any conflict between this spec and those files should be reconciled, not silently overridden (per mission.md's own stated policy).
- **Branch:** `feature/phase-1-profiles-security` (off `develop`, per the repo's git strategy — PRs target `develop`, not `main`).

## Non-Negotiables Carried Forward

Per [`../mission.md`](../mission.md):

- Profile isolation must be real at the storage layer from the first profile ever created — this phase is where that guarantee is either established correctly or not at all, since every later phase builds data on top of it.
- No network permission, no analytics/telemetry/crash-reporter SDKs, including anything that logs PIN attempts or biometric events off-device.
- No TODO/placeholder code paths merged, except intentionally-scoped stubs already carried from Phase 0 (dark-mode no-op), documented as such.
- Accessible by default: this phase's PIN entry, profile grid, and biometric gate screens must meet WCAG-aligned contrast/touch-target/TalkBack requirements from first merge, not deferred to Phase 8.
