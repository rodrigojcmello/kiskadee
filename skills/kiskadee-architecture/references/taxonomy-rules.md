# Taxonomy Rules

Use this classification before introducing new token keys, APIs, or generation rules.

## Palettes (colors)

- Semantic color layer: intent, emphasis, state.
- Drives text/fill/border meaning.
- Should not encode geometry or optional visual effects.

## Scales

- Size and geometry normalization.
- Examples: spacing, sizing, radius scales.
- Should not encode semantic color meaning.

## Decorations

- Structural, always-on base look.
- Examples: border style policy, typography mapping, default radius mode.
- Should not be modeled as opt-in effects.

## Effects

- Additive, optional visuals.
- Examples: shadow variants, animated/corner effects.
- Should not redefine semantic color contracts.

## Decision checklist

1. Is this always-on base styling? -> `Decorations`
2. Is this optional and additive? -> `Effects`
3. Is this semantic color meaning/state? -> `Palettes`
4. Is this geometry/spacing/sizing normalization? -> `Scales`

## Common mistakes

- Putting optional effects inside decorations.
- Putting semantic intent into scales.
- Encoding component layout decisions in core tokens.
