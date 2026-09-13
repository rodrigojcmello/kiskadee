# Material Design 3 Google TextField Evidence

## Sources

- [Material Design 3 Text fields overview](https://m3.material.io/components/text-fields/overview)
- [Material Design 3 Text fields specifications](https://m3.material.io/components/text-fields/specs)
- Existing Material primitive, semantic, typography, radius, focus, and state evidence in this preset
- Existing Fluent 2 TextField schema as the approved fallback for shared Kiskadee slots where the
  client-rendered Material token table does not expose a separate value

## Coverage

The existing richer TextField contract remains intact: `standard` exposes `outline`, `underline`,
and `borderless` modes, with floating and inline label geometry, input, message, and underline
indicator slots. Every authored palette-bearing slot emits `default` and `dynamic` segments for
both `light` and `dark` themes, with both `onSubtle` and `onVivid` contexts. The inverse context is an explicit **Kiskadee
extension**: the inspected source does not define a separate vivid-parent recipe. It is authored
through the existing getter, independently from the resolved `onSubtle` colors.

## Mapping and adaptations

- Outline and underline controls retain their existing Material state layering, focus ring source,
  label placement, density scales, and error/warning intent paths.
- Borderless controls retain their existing neutral, error, and warning surfaces. Their authored
  light gray values now resolve from `primitive.black.v1` through `c`, keeping the visual intent
  while removing schema literals.
- The existing light `low` emphasis projection from the dark Medium recipe remains part of the
  richer Material TextField coverage.
- Rest is the base state. Focus, hover, disabled, and read-only entries remain where they provide
  a visual delta or reset a composed control state; no new interaction policy is introduced.

All colors resolve through `c` or `c.ref` and the existing Material component intents. The schema
does not add a platform API, tonal generator, asset, or appearance family.

## Inverse recipe and state precedence

- Both themes use physical white from `primitive.black.v1` for inverse text, disabled paint at
  38%, and input/label read-only text at 70%. Text does not inherit error/warning stroke hues.
- Neutral borders/underlines use white at 60% Rest, 70% Hover, and 100% Focus.
- Error/warning borders and underlines use their component role's Light vivid reference:
  Rest/Focus offset 0, Hover -1, ReadOnly +1. The same Light track is deliberate in both themes
  because the parent is vivid; it is not inferred from an existing HEX or from theme names.
- Outline shells use the explicit transparent cap, a white 8% Hover layer, and a transparent
  Focus reset. Floating-notched shells retain white 10% or semantic vivid fill without fake
  Focus/ReadOnly deltas. Borderless shells use white 10/8/16% for neutral Rest/Hover/Focus;
  semantic shells use vivid offsets 0/-1/-2 and ReadOnly +1. Borderless borders stay transparent.
- Rest-equal Focus is intentional only where it clears the outline Hover layer or restores the
  semantic stroke over Hover. The generated Focus selector follows Hover and has matching
  specificity. Field-owned border/underline geometry continues to signal focus.
- Borderless neutral ReadOnly has no independent fill delta. Constant text/fill/border colors
  omit redundant entries.
- Transparency comes from the explicit cap argument. There is no suffix-based classification:
  opaque black remains opaque, even if an onSubtle recipe resolves to it.

These inverse formulas are documented Kiskadee adaptations, not newly extracted Material tokens.
The existing onSubtle recipe is unchanged by this correction.

## Validation target

Focused checks should cover each mode's palette-bearing elements across both segments, both theme
tracks, and both surface contexts. The generated result must contain no literal color values and
must preserve the existing TextField element and mode names.

Regression tests cover semantic state deltas, production transparent caps, opaque black inputs,
and intentional inverse Focus resets across both segments and themes.
