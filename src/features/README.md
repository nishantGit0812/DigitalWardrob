# Feature Module Convention

Each feature under `src/features/<name>/` is self-contained and follows Clean
Architecture layering, per `docs/spec.md` §17/§18a:

- `domain/` — entities and use-case interfaces. Pure TypeScript only; no
  React Native, Android, or platform-specific imports. Repository
  *interfaces* live here.
- `data/` — repository *implementations*, DAOs, native-bridge adapters. The
  only layer allowed to touch SQLite, the filesystem, or native modules.
- `presentation/` — screens, components, hooks, state slices. May only
  import from this feature's `domain/` layer — never `data/` directly, and
  never another feature's internals.

These boundaries are enforced by the ESLint rules in `.eslintrc.js`
(`no-restricted-imports` for the domain layer, `import/no-restricted-paths`
for the presentation layer), not just convention.

`profiles/` is currently a placeholder establishing this structure ahead of
its real implementation in Phase 1 (see `specs/roadmap.md`).
