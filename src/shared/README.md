# Shared

Cross-cutting code used by more than one feature, per `docs/spec.md` §17.
Populated as later task groups need it:

- `database/` — SQLite connection manager, migrations (Task Group 3).
- `components/`, `hooks/`, `utils/`, `types/`, `constants/`, `assets/` —
  reusable pieces added as features are built (Phase 1 onward).

Testing per `tech-stack.md`: Jest for `database/`/`utils/` unit and
integration tests; shared `components/`/`hooks/` must use React Native
Testing Library rather than bare `react-test-renderer`.
