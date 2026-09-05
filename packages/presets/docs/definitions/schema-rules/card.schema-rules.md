# Card Schema Rules

Card schema rules define the generated surface contract for the styled React
Card components.

## Elements

## Independent static border

`options.border[segment][theme][surfaceContext][intent][emphasis]` publishes boolean defaults.
Every declared combination must have an existing box Rest, border Rest, positive border width
and visible border style. The map controls activation only; colors remain in `e1.palettes`.
Presets without the map retain legacy behavior. Emphasis suggests the default rather than
restricting the availability of a border. Static consumers may override visibility independently
of shadow. CardAction retains the declared default as its legacy Rest visibility and preserves
its interaction deltas; this extension does not redesign interaction-state recipes.

## Surface ownership

Card uses `e1` as the root surface element.

`e1` owns the Card's visible container styling:

- background / box color;
- border;
- radius;
- shadow/elevation effect hooks;
- interaction-state styling for `CardAction`.

Do not add extra public Card elements only to model local layout wrappers inside
showcase examples. Internal composition should stay in React/CSS unless the
design system needs a stable visual slot.

## Surface Color Path

The generated schema path for Card surface color is:

```txt
components.card.elements.e1.palettes[segment][theme].boxColor[intent][emphasis].rest
```

That path is the source for tooling that needs literal Card surface colors, such
as the Showcase surface picker.

`manifest.json` is a capability/index artifact. It may confirm that an
intent/emphasis/state combination exists, but it must not be treated as the
literal color source.

## Intent And Emphasis

Card can expose `neutral` and `primary` as public intents because the whole Card
surface changes semantic family.

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
