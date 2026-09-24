# Card Schema Rules

Card schema rules define the generated surface contract for the styled React
Card components. [Container surface ownership](../../../../../docs/definitions/container-and-card-surfaces.md)
defines the cross-package relationship.

## Elements

## Independent static border

`options.border[segment][theme][surfaceContext][intent][emphasis]` publishes boolean defaults.
Every declared combination must resolve a Container box Rest, Card border Rest, positive border width
and visible border style. The map controls activation only; colors remain in `e1.palettes`.
Presets without the map retain legacy behavior. Emphasis suggests the default rather than
restricting the availability of a border. Static consumers may override visibility independently
of shadow. CardAction retains the declared default as its legacy Rest visibility and preserves
its interaction deltas; this extension does not redesign interaction-state recipes.

## Surface ownership

Card uses `e1` as the root surface element.

`surfaceSource: 'container'` declares the Container Rest fill used by `e1`. Card `e1` owns:

- border;
- radius;
- shadow/elevation effect hooks;
- box-color changes and other interaction-state styling for `CardAction`.

Every Card coordinate must have a matching `components.container.e1` Rest surface in the same
segment, theme, input context, intent and emphasis. Core rejects a missing reference. Web Builder
combines Container Rest with Card's own recipe before emitting Card classes and artifacts. React
loads only the resolved Card artifact, and Card keeps one root node.

Do not add extra public Card elements only to model local layout wrappers inside
showcase examples. Internal composition should stay in React/CSS unless the
design system needs a stable visual slot.

## Surface Color Path

The authored schema path for a Rest surface is:

```txt
components.container.elements.e1.palettes[segment][theme][surfaceContext].boxColor[intent][emphasis].rest
```

The generated Card artifact still carries the resolved Rest surface and is the source for tooling
that inspects Card-specific combinations. The Container artifact is the source for tooling that
inspects continuous background colors.

`manifest.json` is a capability/index artifact. It may confirm that an
intent/emphasis/state combination exists, but it must not be treated as the
literal color source.

## Intent And Emphasis

Card can expose `neutral` and `primary` as public intents because the whole Card
surface changes semantic family. Optional `neutralComplementary` and
`primaryComplementary` surfaces may be selected by a static Card with the frame of their base
intent. They do not imply interactive CardAction recipes. Their emphasis names identify the base
surface to which they are recommended, not a second ascending color scale. Equal resolved colors
across base and complementary intents are valid.

Current first-party Card surface buckets are:

- `neutral.lowest`
- `neutral.low`
- `neutral.medium`
- `neutral.high`
- `neutral.highest`
- `primary.lowest`
- `primary.low`
- `primary.medium`
- `primary.high`
- `primary.highest`

Showcase component examples can depend on these Card buckets when they need a
real preset-owned surface. A preset that exposes components intended for those
examples should provide the Card surface contract as a minimum companion
component, even if the upstream design system does not publish a formal Card
component.

When a preset adapts Card without an upstream formal Card component, document
the source evidence and adaptation rationale under that design system's preset
documentation. Do not encode the source-of-truth explanation only in schema
code or in this generic component rule ledger.

Do not create literal intents such as `black`, `gray`, `darkGray`, or
`darkPrimary`. Those are visual aliases for semantic intent/emphasis
combinations.

`lowest` is the no-own-surface Card bucket. It should be used only when the Card
is transparent at rest and the surrounding ambient surface remains the real
container surface.

`low` in light themes is the base/white own surface. It may also carry the
visible border treatment for design systems that call this variant "outline",
because Kiskadee does not expose `outline` as a separate Card axis. This is
intentionally shared across intents unless a component documents an exception.
Therefore `neutral.low` and `primary.low` may resolve to the same Card
background.

`medium` is the default public Card baseline. It is the normal light tonal Card
surface in the Kiskadee axis model, even though many product UIs call a white
Card the "default" card visually.

`high` is the strong/vivid own surface bucket.

`highest` is the extreme own-surface bucket. It is not dark mode. In the current
light-theme model, `neutral.highest` may be absolute black and
`primary.highest` may be a very dark primary surface.

## Scoped Dark Theme

Do not simulate scoped dark theme by adding dark-looking Card colors to local
Showcase code.

Scoped component themes require a separate explicit mechanism, such as a future
theme scope provider, and generated dark palettes for the components involved.
Until that exists, dark-looking Card surfaces are still light-theme
intent/emphasis buckets.


## Required Primary Highest for onVivid

A preset that supports canonical `onVivid` composition must publish `primary.highest` in the
Container Rest and the resolved Card palettes, plus
`components.container.options.canonicalSurfaces` for each supported segment/theme. Its `contentSurfaceContext`
for enabled Rest/Selected descendants must be `onVivid`. This is the usable canonical vivid
surface for other components, not an optional duplicate of pale surfaces. `neutral.highest` may
remain absent. Do not remove Primary Highest as part of reducing subtle background variants or
replace it with Showcase-only stress colors. Material's regression test covers this requirement.
