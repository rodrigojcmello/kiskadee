# Preset Tonal Scale Integration

Status: partially resolved. The shared tonal shape is integrated; importing authored tonal-system
bundles into official presets remains deferred.

`@kiskadee/core`, presets, the Web Builder, and runtime now share the canonical Kiskadee tone grid
and HEX contract. This structural migration deliberately preserves the existing preset family
taxonomy and mechanically migrated values. It is not visual approval of any official preset.

Balanced remains frozen by the canonical golden barrier. The remaining integration boundary is
the deliberate import and mapping of package-owned tonal-system artifacts into a preset:

- tonal-system artifacts are not automatically preset artifacts;
- the shared scale shape does not choose family IDs, semantic aliases, rest anchors, or component
  state mappings;
- official Design System values still require explicit source evidence and a documented de-para.

An explicit future decision to begin preset integration must produce a separate
plan. That approval is about crossing the package boundary; it is not approval
of the already canonical Balanced scale or of package-owned artifact export.
That follow-up must decide:

- the adapter from primitive family assets to existing preset schemas;
- whether import or compilation is invoked manually or by a build workflow;
- how generated slots map to existing preset schemas and semantic layers;
- how official Design System evidence and explicit exceptions are recorded;
- validation and rollout for the first pilot preset.

The canonical low-level and system contracts are documented in
`docs/definitions/tonal-scale.md` and `docs/definitions/tonal-system.md`.
Decisions in this deferred document must not change either contract implicitly.
