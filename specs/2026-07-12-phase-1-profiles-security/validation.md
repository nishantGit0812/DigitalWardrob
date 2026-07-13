# Validation — Phase 1: Profiles & Security

How to know Phase 1 is actually done. Mirrors mission.md's product-level Definition of Done, with extra weight on profile isolation since this phase establishes the guarantee every later phase's data depends on.

## Per-Task-Group Checks

**Task Group 1 — Biometric Gate**
- [ ] On a device/emulator with biometrics enrolled, the gate prompts and accepts a valid biometric before Profile Selection is reachable.
- [ ] On a device/emulator with no biometric hardware or no enrollment, the gate transparently falls back to device PIN/pattern/password (via `DEVICE_CREDENTIAL`) — no custom fallback UI needed, confirm the OS-native prompt appears.
- [ ] Gate cannot be bypassed (no back-navigation or deep link reaches Profile Selection without passing it).
- [ ] Reduced-motion system setting on → gate's enter/exit transition collapses to instant, no animation.

**Task Group 2 — Per-Profile Storage Primitives**
- [ ] Creating a profile produces `wardrobe_<profileId>.db` and `files/profiles/<profileId>/` at the expected internal paths.
- [ ] Isolation integration test passes: profile A's Data-layer code cannot read/write profile B's DB file or image directory under any code path exercised.
- [ ] Deleting a profile removes both its DB file and image directory; a second profile's files are confirmed untouched in the same test run.

**Task Group 3 — Profile Selection & Create**
- [ ] Profile Selection grid displays 0–4 profiles correctly, including the empty (first-run) state.
- [ ] Create Profile requires a name, offers avatar/color selection, and only completes once both the registry entry and Task Group 2's storage provisioning succeed (no orphaned registry entry without a DB file, or vice versa).
- [ ] At exactly 4 profiles, "Add Profile" renders disabled using the Task Group 6 token — not a separate hardcoded style.
- [ ] TalkBack can reach and announce each profile tile and the Add Profile action (including its disabled state).

**Task Group 4 — Edit & Delete Profile**
- [ ] Rename and re-avatar persist and reflect immediately on Profile Selection.
- [ ] Delete requires explicit confirmation with clear "cannot be undone" messaging.
- [ ] Deleting profile A cascades its DB file, image directory, registry entry, and PIN hash; profile B is verified unaffected in the same test.

**Task Group 5 — PIN Setup, Entry & Reset**
- [ ] PIN Setup accepts only 4-digit numeric input; stored value is a bcrypt hash (with per-profile salt) via `EncryptedSharedPreferences` — confirm no plaintext PIN appears in storage, logs, or crash output.
- [ ] PIN Entry rejects an incorrect PIN with clear feedback and accepts the correct one, unlocking the selected profile.
- [ ] Forgot-PIN: triggers the Task Group 1 biometric gate; on success, routes to Set New PIN; the new PIN's hash overwrites the old one such that the old PIN no longer works and the new one does.
- [ ] No PIN attempt (success or failure) is logged, transmitted, or persisted anywhere beyond the immediate UI feedback (mission.md non-negotiable #1).

**Task Group 6 — Disabled-State Token**
- [ ] Token is defined once in the shared theme (derived from on-surface/surface tokens), not duplicated per-component.
- [ ] Visually confirmed at 38%/12% opacity on the Add Profile action in both light and dark mode, contrast-compliant per WCAG.

## Phase-Level Definition of Done

- [ ] All six task groups above are individually checked off.
- [ ] Profile isolation is proven, not assumed: the Task Group 2 and Task Group 4 isolation tests both pass, and no shared query, cache, or file path crosses a profile boundary anywhere in this phase's code.
- [ ] No TODO/placeholder code paths exist anywhere in this phase's merged code.
- [ ] Manually verified on a physical Android device (not just emulator) in both light/dark mode and both orientations, per mission.md's Definition of Done.
- [ ] TalkBack pass across every new screen this phase adds (Biometric Gate, Profile Selection, Create/Edit/Delete Profile, PIN Setup/Entry/Reset).
- [ ] No network permission, analytics/telemetry SDK, or crash reporter introduced (mission.md non-negotiables — re-checked explicitly since this phase handles sensitive PIN/biometric flows where "just for debugging" logging is a common slip).
- [ ] CI is green on the PR that merges this phase into `develop`.
