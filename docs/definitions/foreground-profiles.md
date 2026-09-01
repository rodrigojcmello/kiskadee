# Foreground profiles

## Decision

`global.foregrounds.profiles` is the preset-owned catalog of reusable foreground recipes. Each
color family owns a required `standard` profile and may publish an independent `deep` profile. A
participating element maps its local foreground name to a specific family profile:

```ts
global.foregrounds.profiles.red.standard
global.foregrounds.profiles.red.deep

components.text.elements.e1.foreground = {
  neutral: { family: 'neutral', profile: 'standard' },
  red: { family: 'red', profile: 'standard' },
  'red-deep': { family: 'red', profile: 'deep' }
};
```

The catalog standardizes recurring text colors in the same way that
`global.typography.profiles` standardizes recurring text metrics. The two catalogs remain
independent: typography answers how text is shaped, while foreground answers how strongly it is
painted against the current surface.

## Profile contract

A family profile is a complete recipe keyed by segment and theme. `standard` is mandatory for
every family; `deep` is optional. When present, `deep` is not a modifier applied to `standard`: it
owns a complete, independently validated recipe. Every published theme contains an `onSubtle`
branch and may contain an `onVivid` branch. Each branch must contain exactly these strengths:

```text
medium | low | lowest
```

`high` and `highest` are intentionally excluded from `TextEmphasis`. `Text` has no surface of its
own, so `medium` is the normal and strongest foreground, while `low` and `lowest` de-emphasize it.
The contract does not require an exceptional neutral black merely to fill an ordinal level. A
preset may publish `neutral.deep` with the physical absolute cap as its `medium` anchor: black on a
Light track and white on inverted Dark/Darker tracks. Fluent 2 currently does so for atomic
component-slot consumption. Coinciding with `neutral.standard.medium` in another preset is valid
because the two profiles express stable choices, not guaranteed unique values.

This does not change the component emphasis rule for surface-owning components such as Button and
Card, where emphasis describes the strength of the component surface.

Every strength requires `rest` and may additionally publish `hover`, `pressed`, `pending`, and
`disabled`. These optional coordinates make the catalog reusable by component-owned text slots;
they do not make standalone Text interactive. Element-level `foreground` expansion deliberately
projects only `rest` for Text.

## Foreground names versus component intents

`neutral` is the required achromatic family. Every black, gray, and white variation belongs to
that same family; `black` is intentionally not a Text foreground name.

Chromatic foregrounds are named directly by canonical hue: `red`, `orange`, `yellow`, `green`,
`teal`, `cyan`, `blue`, `purple`, `pink`, and `brown`. These names select visual color families;
they do not assign action semantics. In particular, standalone Text does not rename `red` to
`destructive`, `green` to `positive`, or `blue` to `primary`.

Core defines the complete family vocabulary and the possible `-deep` public aliases, while each
preset publishes only the profiles backed by its approved primitive catalog. A missing family or
profile is an unsupported preset capability: React Text inherits color instead of silently falling
back to `neutral`, `standard`, or another hue.

## Element references

An element-level `foreground` map translates a local foreground name into a structured
`{ family, profile }` reference. Family IDs and local foreground IDs use lowercase kebab case;
profile names are the closed vocabulary `standard | deep`. `inherit` is reserved for the React API
and is not a schema family, profile, or reference value. Text requires a local `neutral` reference;
chromatic and deep references are optional preset capabilities.

React keeps the common case flat: `foreground="red"` selects the local mapping to `red.standard`,
while `foreground="red-deep"` selects the mapping to `red.deep`. The suffix is a public alias, not
the storage shape of the global catalog.

An element cannot author both `foreground` and `palettes.*.textColor`. The profile is lowered into
that ordinary color channel, so allowing both sources would create ambiguous ownership.

References are validated before compilation. Unknown families, unavailable profiles, incomplete
emphasis coverage, unsupported interaction states, mismatched context branches, and invalid IDs are
authoring errors.

## Atomic foreground coordinates

Component slots that need to choose one coordinate rather than project a complete Text profile use
the schema-only `fg` authoring API:

```ts
fg('red.deep.light.onSubtle.medium')
fg.parentState('red.deep.light.onSubtle.medium.pending')
```

The serializable forms are respectively `fg:red.deep.light.onSubtle.medium` and
`{ parentState: 'fg:red.deep.light.onSubtle.medium.pending' }`. A coordinate contains family,
profile, physical source theme, Surface Context, strength, and an optional global foreground state;
omitting state selects `rest`. The consuming palette supplies the segment.

Atomic references are valid only inside `textColor`. Unknown coordinates fail validation; there is
no profile, theme, context, strength, state, or segment fallback. `parentState` means that the slot
reacts to the state scope owner and lowers to the existing `==` selector mechanism. It is unrelated
to tonal `referenceColor()` and replaces the ambiguous use of the legacy authoring shape
`{ ref: ... }` for global foreground coordinates.

The component's emphasis and the selected foreground strength are intentionally independent. A
Button `low` label may use `red.deep...medium` when all enabled labels share one approved color.

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

The Web Builder expands element profiles and resolves atomic foreground coordinates before the
ordinary color pipeline. Atomic direct references become final colors; `fg.parentState()` becomes
the existing parent-state color representation. For `Text.e1`,
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

Fluent 2 Microsoft publishes `standard` for `neutral`, `blue`, `red`, `green`, `purple`, `orange`,
and `yellow`. All seven families publish `deep`. Text exposes the six chromatic profiles through
flat React aliases such as `foreground="blue-deep"` and `foreground="red-deep"`; the Fluent
`neutral.deep` profile currently exists for atomic component-slot consumption rather than as a
Text alias. Those families correspond exactly to the preset's approved primitive assets; it does
not synthesize the remaining Core hues. Fluent Button label and icon-region foregrounds consume
atomic coordinates from this catalog. Badge, Card, Chip, Brand Pack projections, and other
component-owned recipes remain separate migrations.
