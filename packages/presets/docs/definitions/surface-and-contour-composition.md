# Surface and Contour Composition

Status: recommended authoring direction for all presets, not a mandatory contract.

## Recommendation

Prefer opaque fills for ordinary surfaces and translucent paint for borders and
dividing lines. Opaque surfaces establish a predictable base color; translucent
contours incorporate the underlying surface color rather than imposing a fixed gray.
This applies as a starting point to new work and gradual review of existing presets.
It does not require immediate refactoring or make existing solid borders invalid.

Choose contour polarity for the actual surface: black alpha commonly suits light
surfaces, while white alpha commonly suits dark or vivid surfaces. Do not copy one
preset's alpha percentages into every preset or assume surface context alone proves
sufficient contrast. Preserve each design system's hierarchy and source evidence.

## Exceptions and ownership

Source-defined opaque strokes, chromatic boundaries, interactive or accessibility
requirements, and translucent materials such as acrylic or glass can justify other
recipes. Retain and document those decisions in the preset's evidence; this guidance
does not override official fidelity or prohibit transparent surface fills.

Presets own paint recipes. Core contracts continue to accept supported color values;
Builders and platform components must not introduce automatic opacity conversion or
background-dependent color correction. Use existing shared contour references where
appropriate; Card and Separator retain their own geometry and intensity selection.
Apply alpha to the paint, not opacity to a container and all its descendants.

## Compare recipes and rendered results separately

A sampled HEX is the final visible color, not proof of its source recipe. The same
visible gray may come from opaque paint or black alpha over a light surface. They
match on that surface but can diverge on another.

Compare surface fills by their intended role and color. Compare contours on the same
background, with equivalent line width, state and rendering conditions. Record source
paint, alpha, underlying surface and composited result separately. Inspect representative
white, gray, colored and dark surfaces where the recipe is intended to apply. Avoid
inferring a universal alpha from a single screenshot or confusing an outer surface
boundary with an internal divider. Small quantization differences follow
[color fidelity rounding](color-fidelity-rounding.md).

## Gradual adoption

Review existing presets when their colors or surface recipes are next revisited in
an authorized task. Identify the semantic role and source evidence, assess current
opaque/translucent behavior, and either adopt this recommendation or preserve an
explained exception. No repository-wide migration, mandatory validation rule or
runtime behavior change follows from this document.
