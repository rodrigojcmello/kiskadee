# Button color variants

Status: Web adapter contract. The [shared Core definition](../../../../../core/docs/definitions/color-variants.md)
owns the palette axis, inheritance and qualified-intent grammar.

Button exposes the shared `colorVariant` axis through `intent` and `selectionIntent`.
A plain system intent selects Standard; a single `-alt` suffix requests Alternative for the
same semantic intent. The public value type is `ButtonIntentValue`:

```tsx
<Button intent="primary-alt">Action</Button>

<Button
  intent="neutral"
  selectionIntent="primary-alt"
  controlState={selected}
  selectionEmphasis="low"
>
  Selected action
</Button>
```

Semantic intent registries retain `primary`, `neutral`, `positive`, and the other system names.
`primary-alt` does not create another semantic family. External `brand.*` names are recognized
before the suffix: `brand.example-alt` remains that complete brand name. Invalid or doubled
system suffixes are rejected. A brand still requires its compatible BrandPack boundary.

`selectionIntent` resolves from the explicit prop, the preset's `options.selectionIntent`,
then the base semantic intent and its effective color variant. The preset option accepts
`SystemButtonIntentValue` only. If a requested base Alternative resolves to Standard at the base
emphasis, omitted selection keeps that Standard variant when selecting normal High paint; it
does not retry the original suffix at High. An explicit qualified `selectionIntent` remains
an independent request.
Selection emphasis, semantic state, geometry, effects and accessibility keep their existing
contracts. Returning to the unselected state restores the base qualified intent.

## Published recipe selection

Core and Builder resolve omitted Alternative leaves from Standard before class emission. An
authored leaf owns its complete state map: omitted Hover keeps that leaf's Rest and never
imports Standard Hover. React selects the published variant and does not merge palettes,
resolve color values or reconstruct CSS.

Availability is scoped to the active preset, segment, theme, surface context, semantic intent
and emphasis. An unavailable Alternative uses Standard for that same coordinate. An unchanged
Neutral recipe may inherit Standard without being advertised as a distinct Alternative.
The existing whole-recipe intent and High selection fallbacks still apply when their required
paint coverage is missing; visible parts do not independently choose unrelated intents.

The same resolved body choice selects ordinary paint, normal High selection projections,
Group paint and the produced descendant `contentSurfaceContext`. Geometry, typography, sizes
and decorative ownership stay on the original `e1` through `e12` anatomy. A surfaced icon
region retains its Neutral Medium domain within the same effective color variant, including
Standard leaves inherited during the build; content without its own palette inherits the label.

Indicators retain Standard paint on the original inside/outside `e11`/`e12` recipes for the
effective semantic intent and emphasis. They have no independent color API. `selectionEmphasis`
still requests the line and `indicatorPlacement` selects its placement. Alternative body paint
does not recalibrate indicator colors or change indicator activation, geometry or state.

## Groups and resources

`Button.Group.intent` includes the variant qualification and owns the shared base appearance.
Frame, member and divider projections consume that shared coordinate. Conflicting member
`intent` values follow the existing Group warning and inheritance contract. Each member's
`selectionIntent` remains local, and selected members continue hiding adjacent dividers.

Class-map format version 3 uses `c.<surfaceContext>.<colorVariant>.<intent>.<emphasis>`;
context buckets are `s`/`v` and variant buckets are `s`/`a`. Palette artifacts publish the
corresponding variant availability and produced context. Combined and split loading use the
same contract; a theme, segment, preset or context change selects those resources together.
BrandPack boundaries validate format version 3, component identity and the map envelope before
revealing their children, including SSR preloads. Legacy unversioned and unwrapped brand maps
remain unavailable through the Boundary fallback instead of reaching component rendering.
No additional Provider is introduced.
