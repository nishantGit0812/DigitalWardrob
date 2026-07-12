# Mission

Source of truth for *why* this product exists and *what* it must (and must not) do. Derived from stakeholder input in [`docs/spec.md`](../docs/spec.md) (spec v1.3.1-draft). If this file and the spec ever disagree, treat that as a signal to reconcile them, not to silently pick one.

## Product Vision

WardrobeAI is an offline-first Android application that lets a person digitize their physical wardrobe, organize it, plan outfits, and preview how clothing looks on them via on-device 2D virtual try-on — with zero backend, zero account, and zero data ever leaving the device. Up to four people can share one installation through fully isolated local profiles (e.g. a household), each with their own wardrobe, photos, planner, and stats.

**The bet:** wardrobe apps today either require a cloud account and upload personal photos to a server, or don't offer try-on at all. WardrobeAI proves a privacy-first, fully local alternative is viable on modern Android hardware using MediaPipe + TensorFlow Lite for on-device computer vision.

## Goals

- Let a user catalog their wardrobe with photos, categories, and rich metadata in under 30 seconds per item.
- Provide a 2D virtual try-on that composites a full outfit (top + bottom + shoes, etc.) onto the user's own Profile Body Photo, entirely offline.
- Support outfit planning against a calendar and surface simple wear statistics.
- Guarantee no data leaves the device: no network calls, no analytics, no accounts.
- Support up to 4 isolated local profiles on one install.
- Ship a Material Design 3, dark-mode-capable, accessible UI.

## Non-Goals

- Not a 3D avatar or body-scanning app.
- Not a social/sharing platform (no export-to-social, no community outfit feed).
- Not a shopping or e-commerce integration (no retailer catalogs, no purchase links).
- Not cross-device sync. Data does not leave the device that created it, except via explicit manual backup/restore files the user moves themselves.
- Not a fashion-recommendation AI (no "what should I wear" generative suggestions in v1).
- Not iOS. Android only for v1.

## Who This Is For

- **Priya, 27 — Wardrobe minimizer.** Wants to see everything she owns in one place, track what she actually wears, and stop buying duplicates. Cares about statistics and the unworn-items view.
- **Family household (shared device).** Up to 4 family members share one tablet/phone; each wants their wardrobe kept private from the others, including from other people who can also unlock the shared device. Cares about profile isolation and the biometric/PIN gate.
- **Devraj, 34 — Planner.** Lays outfits out the night before using the calendar/planner and likes seeing a try-on preview before committing.

## Non-Negotiable Product Principles

These are load-bearing for the product's entire value proposition — any implementation decision that violates one of these should be treated as a bug in the plan, not a shortcut:

1. **Zero data leaves the device.** No network permission, no analytics/telemetry SDKs (including crash reporters that phone home), no backend of any kind.
2. **Profile isolation is real, not cosmetic.** Enforced at the storage layer (separate SQLite file per profile), not just filtered in the UI.
3. **Backups are encrypted by default,** with no passphrase-recovery mechanism — this is a deliberate, disclosed trade-off, not an oversight.
4. **Accessible by default.** WCAG-aligned: 48dp touch targets, TalkBack-compatible, contrast-compliant in both light and dark mode, and every decorative animation respects the system reduced-motion setting rather than assuming motion is always welcome (spec §28a.7) — this isn't a Phase 0 concern, but it's binding starting with the first phase that ships an animation.
5. **Try-on is a preview, not a promise.** Manual reposition/scale/rotate exists specifically because automatic placement won't always be perfect — the product sets that expectation rather than overselling AR realism.

## Definition of Done (product-level)

A feature is done when it: matches its functional requirement in the spec, works fully offline, respects profile isolation, has been manually verified on a physical device in both light/dark mode and both orientations, and has no TODO/placeholder code paths. See the spec's §37–§38 for the full acceptance criteria and definition of done.
