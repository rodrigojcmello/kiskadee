# Monorepo Map

This is a routing aid derived from
[`docs/definitions/project-governance.md`](../../../docs/definitions/project-governance.md). The
governance definition is authoritative when this summary is incomplete or stale.

## Quick ownership map

- `packages/core`: platform-agnostic Schema contracts, types, taxonomy, and utilities.
- `packages/presets`: official design-system instances, evidence, values, and recommendations.
- `packages/tonal-scale`: deterministic tonal-family generation and its dedicated inspection UI.
- `packages/brands`: third-party brand identity, provenance, portable tonal assets, and packs.
- `packages/fonts`: opt-in online font integrations and selected-family preparation.
- `packages/icons`: canonical icon assets, names, family mappings, metadata, and adapters.
- `packages/css-build`: shared CSS processing mechanics.
- `packages/web-builder`: Schema-to-Web generation, Style Keys, emission policy, and artifacts.
- `packages/runtime`: shared browser runtime infrastructure for dynamic colors, font preparation,
  and platform classes.
- `packages/headless/react`: unstyled React behavior, semantics, and accessibility.
- `packages/components/react` (`p-react`): visual React composition, DOM, and structural Sass.
- `packages/components/android` (`p-android`): native Android component implementation.
- `packages/components/ios` (`p-ios`): native iOS component implementation.
- `packages/showcase` (Showcase): Web consumer, inspection app, and visual-validation scenarios.

## Boundary rules

- An import or dependency does not transfer authority to the consumer.
- Do not move preset adaptation into Core.
- Do not move design-system appearance or generated class maps into Headless React.
- Do not move Web generation policy into `p-react`.
- Do not let structural CSS redefine Schema-owned visual values.
- Do not let `p-android` or `p-ios` create platform-specific design-system schemas.
- Do not treat Showcase-only needs as framework contracts.
- Do not manually promote generated artifacts or fixtures into authoring sources.

## Quick routing guide

- New cross-platform contract or token shape -> `packages/core`
- Preset-specific value or source mapping -> `packages/presets`
- Tonal-family mathematics or output contract -> `packages/tonal-scale`
- Third-party brand identity or pack -> `packages/brands`
- Font resource integration -> `packages/fonts`
- Icon asset or family mapping -> `packages/icons`
- Generic CSS processing -> `packages/css-build`
- Generated CSS, class map, manifest, or Style Emission Policy -> `packages/web-builder`
- Browser dynamic colors, font-preparation orchestration, or platform classes -> `packages/runtime`
- React keyboard, state, semantics, or accessibility -> `packages/headless/react`
- React visual structure or structural Sass -> `packages/components/react`
- Native platform implementation -> matching `packages/components/<platform>` project
- Demo or visual inspection scenario -> `packages/showcase`

## Canonical delivery flows

```text
Core -> Presets -> Web Builder -> p-react -> Showcase/application
                  Headless React -> p-react

Core + Presets -> canonical Schema or derived payload -> p-android/p-ios -> local showcase
```

Optional resources join only through their documented handoffs. Successful upstream generation does
not prove delivery until the intended consumer and validation surface are complete.
