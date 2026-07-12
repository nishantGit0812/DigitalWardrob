# Shared

Cross-cutting code used by more than one feature, per `docs/spec.md` §17.
Populated as later task groups need it:

- `database/` — SQLite connection manager, migrations, and
  `deleteProfileDatabase` (Task Group 2.3's cascading delete).
- `filesystem/profileImageDirectory.ts` — per-profile image directory
  create/delete (Task Group 2.2/2.3), via `@dr.pogodin/react-native-fs`
  (tech-stack.md gap filled here; no filesystem library was chosen in
  Phase 0).
- `profileId.ts` — `assertValidProfileId`, shared by `database/` and
  `filesystem/` so every storage primitive agrees on what a safe profileId
  looks like.
- `hooks/useReducedMotionPreference.ts` — backs every reduced-motion branch
  (spec.md §28a.7); first consumer is the biometric gate's enter/exit fade
  (Task Group 1.4).
- `components/`, `utils/`, `types/`, `constants/`, `assets/` — reusable
  pieces added as features are built (Phase 1 onward).

Testing per `tech-stack.md`: Jest for `database/`/`utils/` unit and
integration tests; shared `components/`/`hooks/` must use React Native
Testing Library rather than bare `react-test-renderer`.
