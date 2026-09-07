# Shared Contour Color Profiles

Status: canonical cross-package contract.

## Purpose and ownership

`global.contours.profiles` shares solid color recipes between outlines and dividing lines.
Core owns the serializable contract; Presets own the recipes; Web Builder resolves references
before Style Keys and metadata; platform components consume their existing generated classes.
This is a global color catalog, not an Effect, Provider, or shared component.

## Authorship

The catalog is optional. Its hierarchy is intention, profile, palettes, segment, theme,
surface context, emphasis, and Rest. Each intention requires `standard`; additional named
profiles are permitted. A published theme requires `onSubtle`, with optional `onVivid`.
Each context requires `medium`; other ComponentEmphasis values are optional.
V1 publishes solid colors and Rest only. Gradients and interaction-state catalogs are outside
this initial contract. Missing coordinates are errors, not inferred colors or fallback profiles.

Use `contour('neutral.standard.light.onSubtle.medium')` from Core in a component
`borderColor` or `boxColor` palette, or in a Separator profile's `boxColor` palette.
The enclosing palette supplies the segment. The token explicitly selects theme, context,
and intensity; a component's surface emphasis does not implicitly select contour intensity.
Catalog colors must be concrete and cannot reference another contour or foreground.

Schemas that author colors directly remain supported. `global.separators.profiles` retains
its geometry and existing element references; its palette may select shared contour colors.
A Card retains border width, style, activation defaults, and interaction-state deltas.
Neither component consumes the other component's presentation recipe.

The initial Fluent publication contains only `neutral.standard`. Additional semantic intentions
can be added to the catalog without changing this grammar. This does not automatically publish
new Separator props or migrate chromatic component borders.

## Web handoff

Core exposes contour authorship through its regular entrypoint and Zod validation through
`@kiskadee/core/contour-contract`. Build validation covers component and global Separator
references, including unused declared profiles. Palette-source resolution expands separator
profiles and then resolves contour references for both Style Keys and published metadata.
No contour token, catalog bucket, runtime color resolver, or Provider is shipped to the browser.

## Fluent migration

Fluent `neutral.standard.medium` preserves the tinted Card boundary onSubtle: L10 in Light
and D45 in Dark/Darker. OnVivid uses physical white at 15% opacity for medium and 8% for low.
The vivid primary highest Card explicitly selects onVivid medium regardless of its input context,
because its own painted surface is vivid. Its existing white-at-15% boundary is preserved.
Neutral Card borders select the incoming context. Border activation and interaction deltas remain
independent. OnSubtle low is unchanged; internal Separator consumers share the revised recipes.
Other presets remain unchanged.

This is an authorized Kiskadee consistency refinement, not a claim that Fluent upstream
specifies identical border and divider colors. See the [Card evidence](../../packages/presets/docs/design-systems/fluent-2-microsoft/components/card.md#shared-neutral-contours).
