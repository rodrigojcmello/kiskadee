# Foreground profiles

## Decision

`global.foregrounds.profiles` is the preset-owned catalog of reusable foreground recipes. Each
color family owns a required `standard` profile. Chromatic families may publish an independent
`deep` profile; `neutral` supports only `standard`. A
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
every family; `deep` is optional for chromatic families and forbidden for `neutral`. When present,
`deep` is not a modifier applied to `standard`: it
owns a complete, independently validated recipe. Every published theme contains an `onSubtle`
branch and may contain an `onVivid` branch. Each branch must contain exactly these strengths:

```text
high | medium | low | lowest
```

`high` is the strongest foreground; `medium`, `low`, and `lowest` progressively reduce its
prominence. The hierarchy does not require absolute black or white. Presets author each level for
the physical theme, segment, context, and chromatic profile. `highest` is not a Text emphasis.

The four-level migration preserves the former Medium as High, the former Low as Medium, and the
former Lowest as Lowest. A new Low fills the interval between the latter two. Existing consumers
migrate their explicit coordinates accordingly; component surface emphases are not renamed.

`neutral.deep` is not an alternative neutral recipe, alias, or compatibility branch. Existing
consumers choose an appropriate coordinate in `neutral.standard`, accepting deliberate changes
where the former Deep recipe differed. All gray, black, and white variations share that one profile.

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
chromatic references and their Deep aliases are optional preset capabilities. `neutral-deep` is
not a public foreground name, and `{ family: 'neutral', profile: 'deep' }` is invalid for every element.

React keeps the common case flat: `foreground="red"` selects the local mapping to `red.standard`,
while `foreground="red-deep"` selects the mapping to `red.deep`. The suffix is a public alias, not
the storage shape of the global catalog.

An element cannot author both `foreground` and `palettes.*.textColor`. The profile is lowered into
that ordinary color channel, so allowing both sources would create ambiguous ownership.

References are validated before compilation. Unknown families, unavailable profiles, incomplete
emphasis coverage, unsupported interaction states, mismatched context branches, and invalid IDs are
authoring errors.

## Text default emphasis

Every authored Text component declares `components.text.options.emphasis` using one of the four
foreground levels. This is a component option, independent from global typography profiles and
from any other component's explicit foreground selection. Fluent 2 selects `high` to preserve the
former default appearance.

The Builder publishes the option in the existing Text core component artifact as
`options.emphasis`. React resolves an explicit Text `emphasis` prop before this authored default.
If the current artifact or option is unavailable, omitted emphasis inherits color; runtime does
not synthesize a fallback level or reuse a previous preset's default. An explicit emphasis can
still resolve against a matching available color map. `foreground="inherit"` bypasses both.

Family IDs remain extensible for preset-local chromatic recipes. Core's explicit neutral catalog
type forbids a Deep branch, and literal `fg()`/`fg.parentState()` helpers reject Neutral Deep
coordinates at compile time. Dynamic IDs and structured references are validated at the Schema
boundary; parsing rejects Neutral Deep coordinates regardless of static type information.

## Atomic foreground coordinates

Component slots that need to choose one coordinate rather than project a complete Text profile use
the schema-only `fg` authoring API:

```ts
fg('red.deep.light.onSubtle.high')
fg.parentState('red.deep.light.onSubtle.high.pending')
```

The serializable forms are respectively `fg:red.deep.light.onSubtle.high` and
`{ parentState: 'fg:red.deep.light.onSubtle.high.pending' }`. A coordinate contains family,
profile, physical source theme, Surface Context, strength, and an optional global foreground state;
omitting state selects `rest`. The consuming palette supplies the segment.

Atomic references are valid only inside `textColor`. Unknown coordinates fail validation; there is
no profile, theme, context, strength, state, or segment fallback. `parentState` means that the slot
reacts to the state scope owner and lowers to the existing `==` selector mechanism. It is unrelated
to tonal `referenceColor()` and replaces the ambiguous use of the legacy authoring shape
`{ ref: ... }` for global foreground coordinates.

The component's emphasis and the selected foreground strength are intentionally independent. A
Button `low` label may use `red.deep...high` when all enabled labels share one approved color.

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
text.e1.c.s.<foreground>.h|m|l|ll
text.e1.c.v.<foreground>.h|m|l|ll
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
and `yellow`. The six chromatic families also publish `deep`; `neutral` has only `standard`. Text
exposes chromatic Deep profiles through flat React aliases such as `foreground="blue-deep"` and
`foreground="red-deep"`. Those families correspond to the preset's approved primitive assets; it
does not synthesize the remaining Core hues. Component-owned foreground slots may consume atomic
coordinates from this catalog without inheriting Text's default emphasis.
