# Container Schema Rules

Container publishes the preset's continuous Rest surfaces. Its `e1` has `boxColor` only: no
padding, border, radius, shadow, or interaction-state palette. Each published coordinate is
selected by segment, theme, input surface context, color variant, intent and emphasis:

```txt
components.container.elements.e1.palettes[segment][theme][surfaceContext][colorVariant]
  .boxColor[intent][emphasis].rest
```

`components.container.contentSurfaceContext` selects one of two forms. An authored map
declares the context a surface delivers to descendants, using the same color-variant coordinate.
`{ derive: { element: 'e1', property: 'boxColor' } }` computes the map from effective Rest
paint for every declared segment and theme. A transparent Rest inherits the input context.
Only published coordinates are supported.

`components.container.options.canonicalSurfaces[segment][theme]` authors the recommended
surface catalog and its order. Each entry references a published Container Rest surface in
`onSubtle.standard` by intent and emphasis. The authored map form requires the classification
on each catalog entry. The derived form requires the catalog and fills in its classifications
from the calculated Rest outputs. Only Card-compatible entries are projected into the Card
catalog.

An entry can mark `referenceFor: 'onSubtle' | 'onVivid'` to select a representative backdrop
for compositing translucent fills. Surface Builder requires one opaque Standard Rest reference
for each role in every participating segment and theme. Its contrast comparison uses the
theme's fixed white or black reference independently of the chosen backdrop.

`neutral` and `primary` are base surface intents. `neutralComplementary` and
`primaryComplementary` are optional companions for internal regions such as headers or footers.
The companion's emphasis names its recommended base pair: `neutralComplementary.low` is paired
with `neutral.low`, regardless of whether its literal color also occurs elsewhere. Pairing is
guidance, not a nesting constraint. Do not auto-fill all five emphases or forbid repeated colors.

Card declares `surfaceSource: 'container'` and references Container's Rest surfaces; Card keeps
its own borders, geometry, effects and interactive color deltas. See the
[cross-package surface decision](../../../../../docs/definitions/container-and-card-surfaces.md)
and [Card rules](card.schema-rules.md).

Official presets use the strict color locator workflow and preserve source evidence. A
mechanical migration of existing Card Rest values does not claim a new upstream color. Newly
calibrated companion pairs must record their source and adaptation status under the preset's
design-system documentation. Other component backgrounds remain owned by their components.
