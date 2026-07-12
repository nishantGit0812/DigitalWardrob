# Requirements — Phase 0: Foundation

Covers roadmap items **0.1–0.6** (see [`../roadmap.md`](../roadmap.md)). This is the first implementation phase for the project — nothing has been scaffolded yet, so this spec establishes the repo's baseline app skeleton that every later phase builds on.

## Scope

In scope (roadmap 0.1–0.6, kept together as one phase per stakeholder decision):

1. Project scaffolding — React Native + TypeScript, lint/format/pre-commit tooling, CI skeleton.
2. Feature-based folder structure with enforced Clean Architecture import boundaries.
3. SQLite layer — op-sqlite integration, migration runner, per-profile DB file creation capability.
4. MMKV setup — shared `app_meta` store (profile registry, global settings).
5. Navigation shell — root stack, bottom-tab skeleton, empty placeholder screens.
6. MD3 theming — light/dark tokens, dark-mode toggle wired to a no-op setting.

Out of scope (deferred to later phases per roadmap):

- Any actual profile creation/security logic (Phase 1).
- Any wardrobe data, camera, or item CRUD (Phase 2+).
- Real dark-mode persistence/behavior beyond a no-op toggle (real implementation is roadmap 8.1).
- Native modules beyond what op-sqlite/MMKV require out of the box (pose/segmentation/matting/compositing/backup/biometric native modules all come in later phases).

## Decisions

Resolved with the stakeholder before writing this spec:

| Decision | Choice | Rationale |
|---|---|---|
| Package manager | **npm** | Bundled with Node, no extra install, simplest default for a single-package repo. |
| React Native version | **Latest stable, via `@react-native-community/cli init`** | Matches tech-stack.md's "latest stable at build time" stance for `compileSdkVersion`; no known native-dependency ceiling identified yet that would force a pin. Revisit if Vision Camera / op-sqlite / Reanimated compatibility issues surface once those land in later phases. |
| CI provider | **GitHub Actions** | Repo already hosted on GitHub (`nishantGit0812/...`); no new account or service integration needed. |
| Phase scope | **Keep 0.1–0.6 together as a single phase/branch** | Matches the roadmap's own phase boundary; task groups within `plan.md` still let sub-items merge independently if needed. |

Carried over from project-level docs (not re-litigated here, see [`../tech-stack.md`](../tech-stack.md)):

- TypeScript `strict: true`, no implicit `any`.
- ESLint + Prettier, enforced pre-commit via Husky and in CI.
- Clean Architecture: `Presentation → Domain → Data → Native`, one-way dependency flow, enforced via ESLint import-boundary rules (spec §18a).
- Feature-based folders: `features/<name>/{data,domain,presentation}`.
- UI kit: React Native Paper (MD3). Navigation: React Navigation (native-stack + bottom-tabs). State: Redux Toolkit. Persisted UI state: Redux Persist → MMKV.
- `minSdkVersion 31`, `targetSdkVersion 36`, Android only, no network permission in the manifest at all — CI and any generated manifest must not introduce one.
- Conventional Commits; branch naming `feature/<ticket>-<short-desc>`.

## Contact / Ownership

- **Feature owner:** Nishant (repo owner, `nishantGit0812` on GitHub).
- **Spec author / assistant-assisted planning:** this spec was drafted with Claude Code from `specs/roadmap.md`, `specs/mission.md`, and `specs/tech-stack.md` as source of truth. Any conflict between this spec and those files should be reconciled, not silently overridden (per mission.md's own stated policy).
- **Branch:** `feature/phase-0-foundation`.

## Non-Negotiables Carried Forward

Per [`../mission.md`](../mission.md), even though Phase 0 has no user-facing data yet:

- No network permission requested at any point, including in CI-generated or default RN manifests — strip it if the init template adds one.
- No analytics/telemetry/crash-reporter SDKs introduced during scaffolding, even as "just for now" placeholders.
- No TODO/placeholder code paths merged (mission.md Definition of Done).
