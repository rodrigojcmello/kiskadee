# Foreground profiles

## Decision

`global.foregrounds.profiles` is the preset-owned catalog of reusable foreground recipes. A
participating element maps its local foreground name to a catalog profile:

```ts
global.foregrounds.profiles.neutral

components.text.elements.e1.foreground = {
  neutral: 'neutral',
  blue: 'blue',
  red: 'red'
};
```

The catalog standardizes recurring text colors in the same way that
`global.typography.profiles` standardizes recurring text metrics. The two catalogs remain
independent: typography answers how text is shaped, while foreground answers how strongly it is
painted against the current surface.

## Profile contract

A foreground profile is keyed by segment and theme. Every published theme contains an `onSubtle`
branch and may contain an `onVivid` branch. Each branch must contain exactly these Rest-only
strengths:

```text
medium | low | lowest
```

`high` and `highest` are intentionally excluded from `TextEmphasis`. `Text` has no surface of its
own, so `medium` is the normal and strongest foreground, while `low` and `lowest` de-emphasize it.
The contract does not publish an exceptional neutral black merely to fill an ordinal level. If a
stronger acromatic foreground is ever source-backed, it remains part of the `neutral` profile and
requires an explicit contract revision rather than a separate semantic intent.

This does not change the component emphasis rule for surface-owning components such as Button and
Card, where emphasis describes the strength of the component surface.

## Foreground names versus component intents

`neutral` is the required achromatic family. Every black, gray, and white variation belongs to
that same family; `black` is intentionally not a Text foreground name.

Chromatic foregrounds are named directly by canonical hue: `red`, `orange`, `yellow`, `green`,
`teal`, `cyan`, `blue`, `purple`, `pink`, and `brown`. These names select visual color families;
they do not assign action semantics. In particular, standalone Text does not rename `red` to
`destructive`, `green` to `positive`, or `blue` to `primary`.

Core defines the complete vocabulary, while each preset publishes only the families backed by its
approved primitive catalog. A missing family is an unsupported preset capability: React Text
inherits color instead of silently falling back to `neutral` or another hue.

## Element references

An element-level `foreground` map translates a local foreground name into a global profile ID.
Profile IDs and local foreground IDs use lowercase kebab case. `inherit` is reserved for the React
API and is not a schema profile or reference value. Text requires `neutral`; chromatic references
are optional preset capabilities.

An element cannot author both `foreground` and `palettes.*.textColor`. The profile is lowered into
that ordinary color channel, so allowing both sources would create ambiguous ownership.

References are validated before compilation. Unknown profiles, incomplete emphasis coverage,
unsupported interaction states, mismatched context branches, and invalid IDs are authoring errors.

## Surface Context inheritance

Foreground recipes consume the same `onSubtle` and `onVivid` vocabulary used by other components.
For React `Text`, resolution precedence is:

```text
surfaceContext prop -> nearest SurfaceContextProvider -> onSubtle
```

`Text` consumes this value and never publishes a new Provider. Surface-owning ancestors such as
Card may publish the context produced by their own content surface. Nested composition is therefore
recursive through the React tree, but it is not an automatic light/dark inversion: every
surface-owning component publishes the context it actually creates, transparent components inherit,
and an explicit Provider or prop can override the inherited value where composition requires it.

## Build and runtime boundary

The Web Builder expands foreground references before the ordinary color pipeline. For `Text.e1`,
the initial output is:

```text
text.e1.c.s.<foreground>.m|l|ll
text.e1.c.v.<foreground>.m|l|ll
```

The `c` bucket remains the color channel and `t` remains the typography channel. No foreground
bucket, CSS variable, Provider, or browser profile lookup is introduced. Surface-context metadata
is calculated after profile expansion so manifests describe the emitted classes rather than only
the unexpanded schema.

The React component resolves typography and foreground independently. `foreground="inherit"`
suppresses only the color class. During a preset, segment, or theme transition, a pending Text color
artifact is not allowed to preserve a class from the previous selection; Text temporarily inherits
color until the matching artifact arrives. A preset without a Text color artifact also inherits
silently. If an artifact exists but does not publish the requested surface context, the existing
missing-context warning applies and Text inherits instead of falling back to another context.

## Current integration

Fluent 2 Microsoft publishes `neutral`, `blue`, `red`, `green`, `purple`, `orange`, and `yellow`.
The six chromatic families correspond exactly to that preset's approved primitive assets; it does
not synthesize the remaining Core hues. Existing text slots inside Button, Badge, Card, Chip, and
other components continue using their component-owned color recipes. Moving those slots to shared
foreground profiles remains a separate migration.
