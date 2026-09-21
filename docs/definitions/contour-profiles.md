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
V1 publishes solid paint colors (including alpha) and Rest only. Here, solid means
non-gradient, not necessarily opaque. Gradients and interaction-state catalogs are outside
this initial contract. Missing coordinates are errors, not inferred colors or fallback profiles.

Use `contour('neutral.standard.light.onSubtle.medium')` from Core in a component
`borderColor`, `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor`,
or `boxColor` palette, where the component element allows that channel, or in a Separator
profile's `boxColor` palette. Physical-side channels follow the
[border-side color contract](../../packages/core/docs/definitions/border-side-colors.md).
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

## Preset guidance and Fluent usage

Prefer the advisory [surface and contour composition guidance](../../packages/presets/docs/definitions/surface-and-contour-composition.md)
when authoring or reviewing presets. This recommendation does not constrain the color
contract or require migration of existing recipes.

Fluent shares contour recipes between Separator and selected Card boundaries. The
component explicitly selects an intensity; changing Medium does not change a Card
that references Low. Preset-specific values and approved adaptations are maintained
in the [current Card evidence](../../packages/presets/docs/design-systems/fluent-2-microsoft/components/card.md#shared-neutral-contours),
not duplicated in this cross-package contract. Border activation and interaction deltas
remain independent of the shared Rest catalog.
