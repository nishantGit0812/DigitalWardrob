# Plan — Phase 1: Profiles & Security

Numbered task groups, each independently verifiable. Sequenced so storage-layer isolation and the biometric gate land before anything that depends on them (profile CRUD needs the DB/image provisioning primitive; PIN entry needs a profile to gate).

## Task Group 1 — Device Biometric Gate (roadmap 1.1)

1.1. Native module wrapping AndroidX Biometric (`BIOMETRIC_WEAK | DEVICE_CREDENTIAL` combo), exposed via TurboModule per tech-stack.md's one-module-per-capability convention.
1.2. Biometric Gate screen: prompts on app launch, before Profile Selection is reachable.
1.3. Fallback path: when biometric hardware is absent/unenrolled, `DEVICE_CREDENTIAL` transparently offers device PIN/pattern/password instead — verify this is automatic via the BiometricPrompt API, not a custom-built fallback UI.
1.4. Reduced-motion check on the gate's enter/exit transition (spec §28a.7) — first animation in the app, sets the pattern later screens in this phase reuse.

## Task Group 2 — Per-Profile Storage Primitives (roadmap 1.4)

2.1. Extend Phase 0's SQLite primitive: on profile creation, create `wardrobe_<profileId>.db` and run initial migrations.
2.2. Create `files/profiles/<profileId>/` image directory on profile creation.
2.3. Delete path: remove both the DB file and the image directory as a single atomic-as-possible operation (used by Task Group 4).
2.4. Integration test: create two profiles, write a marker file/row to each, confirm no query or file path from profile A's Data-layer code can reach profile B's DB or directory (this is the first concrete proof of mission.md non-negotiable #2 — profile isolation enforced at the storage layer).

## Task Group 3 — Profile Selection & Create (roadmap 1.2, 1.3)

3.1. Profile Selection screen: grid layout, up to 4 profile tiles + an "Add Profile" action.
3.2. Create Profile screen: name input + avatar/color picker, writes a new entry to the `app_meta` profile registry (MMKV, from Phase 0's schema).
3.3. Wire Create Profile to Task Group 2's storage provisioning — a profile is not considered created until its DB file and image directory both exist.
3.4. "Add Profile" action disabled at 4/4 profiles, using the Task Group 6 disabled-state token (forward dependency — land Task Group 6 first or stub the token here and confirm it's swapped in, not duplicated).

## Task Group 4 — Edit & Delete Profile (roadmap 1.5, 1.6)

4.1. Edit Profile screen: rename + re-avatar, updates the `app_meta` registry entry in place.
4.2. Delete Profile flow: confirmation dialog (destructive-action pattern, explicit "this cannot be undone" copy since there's no passphrase-recovery-style safety net here either).
4.3. Delete Profile wired to Task Group 2.3's cascading removal (DB file + image directory), plus removal of the registry entry and PIN hash (Task Group 5).
4.4. Integration test: delete profile A, confirm profile B's data and files are untouched (isolation must hold on the deletion path too, not just creation).

## Task Group 5 — PIN Setup, Entry & Reset (roadmap 1.7, 1.8, 1.9)

5.1. PIN Setup screen: 4-digit numeric entry (entered during Create Profile, Task Group 3), bcrypt-hash with a per-profile salt, stored via `EncryptedSharedPreferences` keyed by profile id.
5.2. PIN Entry screen: gates profile selection — selecting a profile from the grid (Task Group 3.1) prompts for its PIN before entering the profile's data.
5.3. PIN verification: bcrypt-compare against the stored hash; no plaintext PIN ever persisted or logged.
5.4. Forgot-PIN flow: "Forgot PIN" option on PIN Entry re-invokes Task Group 1's biometric gate; success routes into a "Set New PIN" screen (reuses 5.1's UI) that overwrites the existing hash.
5.5. Integration test: wrong PIN rejected, correct PIN accepted, forgot-PIN-via-biometric successfully replaces the hash and the new PIN (not the old one) subsequently works.

## Task Group 6 — Disabled-State Token (roadmap 1.10)

6.1. Add the disabled-state token (38% opacity content / 12% opacity container, derived from existing on-surface/surface theme colors per spec §28a.9) to the Phase 0 theme.
6.2. Apply it to the "Add Profile" action at 4/4 profiles (Task Group 3.4) as the first consumer.
6.3. Confirm the token is defined once in the shared theme, not re-implemented locally in the profile grid component — every later disabled control (category delete, Outfit Builder slots) reuses this same token.

## Sequencing Notes

- Task Group 1 (biometric gate) and Task Group 2 (storage primitives) are independent of each other and can be parallelized.
- Task Group 3 depends on Task Group 2 (needs provisioning) and Task Group 6 (needs the disabled-state token) — land 6 before or alongside 3, not after.
- Task Group 4 depends on Task Group 2 (cascading delete primitive) and Task Group 5 (PIN hash removal on delete).
- Task Group 5 depends on Task Group 1 (forgot-PIN reuses the biometric gate) and Task Group 3 (PIN is set during Create Profile).
- Suggested build order: 1 and 2 in parallel → 6 → 3 → 5 → 4.
