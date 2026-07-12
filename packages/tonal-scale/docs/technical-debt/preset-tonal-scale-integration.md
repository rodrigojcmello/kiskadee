# Preset Tonal Scale Integration

Status: deferred. The package-owned tonal-system artifact contract does not
authorize preset integration.

This document reserves a follow-up for connecting `@kiskadee/tonal-scale` to
official presets. It is not an active proposal and does not define a preset
adapter, migration, or ownership boundary.

Balanced is frozen by the canonical golden barrier. The harmonized tonal system
now owns a package-local source recipe, resolved manifest, and primitive-family
color assets. None of those decisions changes the integration boundary:

- presets and their types remain unchanged;
- tonal-system artifacts are not preset artifacts and have no implicit mapping
  to the current preset schema;
- no component state mapping or preset anchor policy is introduced.

An explicit future decision to begin preset integration must produce a separate
plan. That approval is about crossing the package boundary; it is not approval
of the already canonical Balanced scale or of package-owned artifact export.
The integration plan must decide:

- the adapter from primitive family assets to existing preset schemas;
- whether import or compilation is invoked manually or by a build workflow;
- how generated slots map to existing preset schemas and semantic layers;
- whether any shared color types need migration;
- how official Design System evidence and explicit exceptions are recorded;
- compatibility, validation, and rollout for the first pilot preset.

The canonical low-level and system contracts are documented in
`docs/definitions/tonal-scale.md` and `docs/definitions/tonal-system.md`.
Decisions in this deferred document must not change either contract implicitly.
