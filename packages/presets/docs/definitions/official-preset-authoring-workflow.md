# Official Preset Authoring Workflow

This workflow defines the dependency order for adding or substantially revising an official
Kiskadee preset. A component schema should not be treated as isolated from the color and surface
contracts that its examples consume.

## 1. Record Source Evidence

Create or update the preset-wide source evidence before authoring schema values:

```text
packages/presets/docs/design-systems/<preset>/
  source-evidence.md
  colors/
  components/
```

Record the official source, inspected areas, Light and Dark coverage, upstream gaps, and every
Kiskadee adaptation. Component-specific evidence belongs in `components/<component>.md`.

## 2. Generate And Approve Tonal Assets

Resolve official primitive colors through `@kiskadee/tonal-scale` and preserve the reproducible
recipe, generated bundle, diagnostics, and source-to-Kiskadee comparison under the preset evidence
directory.

Generation is not approval. Promote only the reviewed subset needed by the preset. Keep official
source values, generated values, and adaptation distances traceable.

## 3. Promote Layer 1 Primitive Colors

Move approved generated families into the preset's primitive color source. Layer 1 owns complete
tonal families without component meaning.

Do not import documentation JSON into runtime code and do not place literal colors in an official
component schema.

## 4. Define Layer 2 Global Semantics

Map the promoted primitives to system-wide roles such as Primary, Neutral, Positive, Destructive,
and Warning. Resolve every declared segment and theme independently.

At this stage the preset can answer questions such as “which primitive family is Primary?”, but it
still has not defined how a Card or Button uses Primary.

## 5. Define Layer 3 Component Intents

Map global semantics into component-specific roles such as `button.primary`, `button.neutral`, and
`card.neutral`. Layer 3 expresses component meaning; it does not define the surrounding surface or
automatically create component palettes.

## 5a. Classify And Resolve Base Colors

Before authoring palettes in an FRF preset, classify each solid base color:

- use `reference` for a family-relative `subtle`/`vivid` formula;
- use `exact` only for a fixed source decision already registered under an `evidenceId`;
- use `cap` for physical white, black, and their alpha variants, including transparency.

Resolve these locators inside the preset. Do not publish provenance locators into the Schema and do
not bypass the strict resolver with literals or direct tonal lookup helpers.

## 6. Publish Canonical Surfaces

Before documenting components on preset-owned backgrounds, define the surface vocabulary through
Card:

1. Author the required Card Rest surfaces under
   `components.card.elements.e1.palettes[segment][theme].onSubtle.boxColor` and author the matching
   supported contextual branches.
2. Author `components.card.contentSurfaceContext` for the runtime transitions a Card publishes to
   descendants for every supported input context.
3. Declare the recommended order and associated descendant context through
   `components.card.options.canonicalSurfaces[segment][theme]`.
4. Include at least one entry whose `contentSurfaceContext` is `onSubtle`.
5. Include a strong Primary entry whose `contentSurfaceContext` is `onVivid` when components will
   be demonstrated on a vivid Primary canvas.

The canonical catalog resolves its surface swatches from the `onSubtle` Rest branch. At runtime,
Card consumes its explicit or inherited `surfaceContext` and selects the matching Card palette. The
runtime `contentSurfaceContext` map tells descendants which palette context to select; the matching
field in `canonicalSurfaces` documents the catalog entry and does not replace that map.

The Web Builder validates these references and publishes `components/card.kiskadee.json`. The
Showcase consumes that artifact as the canonical background catalog. Having a Primary color in
Layers 1, 2, or 3 is not sufficient to create this artifact.

Card is not a universal prerequisite for compiling another component. It becomes a delivery
prerequisite when the component's documentation or composition needs a preset-owned surrounding
surface. If an upstream design system has no formal Card component, document the surface adaptation
as a Kiskadee extension.

## 7. Author Component Surface Contexts

For each component, author the palettes it can render on the surrounding surfaces:

- `onSubtle` is required for every declared segment and theme;
- `onVivid` is optional;
- when `onVivid` exists, it must cover the same color-property, intent, and emphasis pairs as
  `onSubtle`;
- unsupported `onVivid` must remain unsupported and must never fall back silently to `onSubtle`.

The surrounding canvas and the component treatment are independent contracts:

```text
Card canonical surface
  -> supplies the actual background color

Component onVivid palette
  -> supplies the component colors that remain legible on that background
```

A preset needs both contracts for a complete vivid composition. A Card surface without a matching
component `onVivid` palette produces an unsupported component context. A component `onVivid`
palette without a canonical Card surface can render on a host-provided background, but the Showcase
has no preset-authored canonical canvas to display.

## 8. Build And Inspect Artifacts

After schema authoring, inspect the generated outputs instead of assuming that a successful build
proves the composition:

- `manifest.json` must announce the intended component surface contexts;
- `components/card.kiskadee.json` must exist when canonical surfaces are declared;
- Card canonical entries must contain resolved Rest colors in authored order;
- component class maps must contain `c.s` for `onSubtle` and `c.v` for `onVivid` when supported;
- every declared segment and theme must have the intended artifacts.

## 9. Validate In The Showcase

Validate at least:

- canonical subtle and vivid backgrounds;
- component `onSubtle` and `onVivid` treatments as separate capabilities;
- Light and Dark independently;
- Rest, Hover, Pressed, Focus, Selected, and Disabled according to the authored state contract;
- no transparent or host-default background where a canonical surface is expected;
- unsupported contexts are reported rather than visually approximated.

The Showcase is a consumer and validator. It must not invent missing preset colors, infer contrast
from luminance, or repair an incomplete Card or component schema.

## Delivery Gate

A component intended for both subtle and vivid documentation is complete only when this chain is
present:

```text
source evidence
  -> approved tonal asset
  -> Layer 1 primitive
  -> Layer 2 global semantic
  -> Layer 3 component intent
  -> Card canonical surface
  -> component onSubtle/onVivid palettes
  -> generated artifacts
  -> rendered Showcase validation
```
