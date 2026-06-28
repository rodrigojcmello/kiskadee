# Card Schema Rules

Card schema rules define the generated surface contract for the styled React
Card components.

## Elements

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

- `neutral.low`
- `neutral.medium`
- `neutral.high`
- `neutral.highest`
- `primary.low`
- `primary.medium`
- `primary.high`
- `primary.highest`

Do not create literal intents such as `black`, `gray`, `darkGray`, or
`darkPrimary`. Those are visual aliases for semantic intent/emphasis
combinations.

`low` in light themes is the base/white own surface. This is intentionally
shared across intents unless a component documents an exception. Therefore
`neutral.low` and `primary.low` may resolve to the same Card background.

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
