# Container Schema Rules

Container publishes the preset's continuous Rest surfaces. Its `e1` has `boxColor` only: no
padding, border, radius, shadow, or interaction-state palette. Each published coordinate is
selected by segment, theme, input surface context, intent and emphasis:

```txt
components.container.elements.e1.palettes[segment][theme][surfaceContext]
  .boxColor[intent][emphasis].rest
```

`components.container.contentSurfaceContext` publishes the context a selected surface delivers
to descendants. A transparent Rest can inherit the input context. Missing coordinates remain
unsupported; neither Core, Builder nor React substitutes a fallback color.

`components.container.options.canonicalSurfaces[segment][theme]` authors the recommended
surface catalog and its order. Each entry must reference a published Container Rest surface.
The Builder also includes Card-compatible resolved entries in the Card artifact for existing
consumers. Container-only entries remain in the Container catalog; Card does not become its source.

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
