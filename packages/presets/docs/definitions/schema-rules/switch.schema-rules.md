# Switch Schema Rules

This file is the component-local schema rule ledger for Switch preset authoring.

Use the `schema-rules/<component>.schema-rules.md` suffix for rules that must stay visible across
future schema, builder, runtime, and showcase work. These files are for durable component-specific
schema rules, not temporary implementation notes.

## Thumb Size Is Schema-Owned

Loud rule: `effects.thumbShrink` is a generic Switch capability. Per-scale visual behavior belongs in
the schema values, not in runtime availability gates.

The component artifact may say:

```json
{
  "effects": {
    "thumbShrink": true
  }
}
```

That means the selected preset has a Switch thumb-shrink effect. It does not need to say which scales
should visually shrink.

When a Switch preset supports multiple thumb scales, the schema must make the thumb-shrink effect
intent explicit for those scales. If a very small Switch should not shrink further, repeat the normal
thumb size in `effects.thumbShrink.rest` for that scale instead of adding a runtime condition.

Example:

```ts
e3: {
  scales: {
    boxWidth: {
      's:sm:1': 20,
      's:md:1': 24,
      's:lg:1': 28
    },
    boxHeight: {
      's:sm:1': 20,
      's:md:1': 24,
      's:lg:1': 28
    }
  },
  effects: {
    thumbShrink: {
      rest: {
        boxWidth: {
          's:sm:1': 20,
          's:md:1': 16,
          's:lg:1': 20
        },
        boxHeight: {
          's:sm:1': 20,
          's:md:1': 16,
          's:lg:1': 20
        }
      }
    }
  }
}
```

In this example:

- `s:sm:1` keeps the off/rest visual thumb at `20 x 20`, so the effect is neutral for that scale.
- `s:md:1` shrinks from `24 x 24` to `16 x 16`.
- `s:lg:1` shrinks from `28 x 28` to `20 x 20`.

Do not introduce a per-scale `effectAvailability` rule just to disable this effect for small Switch
sizes. Repeating the base thumb size is the schema-native way to express "the effect exists, but this
scale should not visually shrink."

## Authoring Requirements

- If `effects.thumbShrink.rest.boxWidth` participates in a multi-scale Switch preset, define its value
  for every supported thumb scale.
- If `effects.thumbShrink.rest.boxHeight` participates in a multi-scale Switch preset, define its value
  for every supported thumb scale.
- Missing width or height means that axis is not changed by the effect.
- Do not omit a scale merely to neutralize the effect. Use the normal `scales` value for that scale.
- Use a scalar value only when the same thumb-shrink effect value is intentionally correct for every
  supported Switch scale.
- The runtime should apply the generated classes for the current scale. It should not re-decide
  design intent by scale when the schema already expresses it.
- If a preset supports internal thumb icons, define them through `e6`, not through thumb `e3`.
- `e6.scales.boxWidth` and `e6.scales.boxHeight` own the icon slot size.
- `e6.palettes.*.textColor` owns icon color and maps to CSS `color` for `currentColor` icons.
- Do not add a separate `iconColor` channel or expect the builder to rewrite SVG `fill`, `stroke`,
  or `path` attributes.
- A preset that does not define `e6` should be treated as not supporting Switch thumb icons.

## Surface-Adapted Emphasis

A preset may define `neutral.low` in a light theme as the same visual treatment as
`neutral.medium` in a dark theme when both represent the component running on a
strong dark surface.

This equivalence is a preset-authored palette decision, not a generic automatic
theme inversion rule.

## Why This Rule Exists

Switch thumb-shrink is tightly coupled to normal thumb geometry. The schema already owns both normal
thumb geometry and off/rest effect geometry, and the builder already emits size-aware thumb-shrink
classes. Adding per-scale runtime capability metadata would create a second source of truth for a
decision that can be represented directly in schema.

Keeping the decision in schema preserves preset fidelity and avoids extra runtime branches.
