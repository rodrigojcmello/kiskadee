# Fluent 2 Microsoft Chip Evidence

This file records source evidence and Kiskadee adaptations for the Chip authored in
`packages/presets/src/presets/fluent-2-microsoft/components/chip.schema.ts`.

## Sources

- [Fluent 2 Tag usage](https://fluent2.microsoft.design/components/web/react/core/tag/usage)
- [Fluent React Tag source](https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-tags/library/src)
- [Fluent 2 color tokens](https://fluent2.microsoft.design/color-tokens/)
- [Preset tonal evidence](../colors/fluent-tonal-scale-evidence.md)

## Canonical identity

Fluent uses Tag for selected, categorized, or removable values and recommends Badge for passive
system-generated data. Kiskadee preserves that semantic split but names the entity/filter/value
component **Chip**. This name is a Kiskadee normalization; it does not claim that Fluent publishes a
separate Chip component.

Static, selectable, removable, and selectable-plus-removable compositions share one visual family.
Selection and removal remain separate interaction targets, matching the Fluent Tag principle that
the dismiss control is distinct from the primary content. The compound DOM is a Kiskadee headless
contract and never nests one button inside another.

## Visual axes

The first preset supports `neutral` and `primary` intents, `high`, `medium`, `low`, and `lowest`
emphases, `rounded` and `pill` radii, and three scales: `s:sm:1`, `s:md:1`, and `s:lg:1`.

Fluent Tag provides the source geometry and neutral/brand relationships, while Kiskadee extends the
appearance to a regular four-emphasis axis so Chip composes consistently with the framework:

| Kiskadee emphasis | Presentation | Status |
| --- | --- | --- |
| `high` | vivid filled entity surface | Kiskadee extension |
| `medium` | tinted entity surface | Official adapted |
| `low` | outlined entity surface | Official adapted |
| `lowest` | transparent entity surface | Kiskadee extension |

Only the primary/content surface (`e2`) owns Hover, Pressed, Focus, Selected, and Disabled deltas.
Static `Chip.Content` consumes Rest only. `Chip.Select` projects selection through `aria-pressed` and
the generated state selectors. `Chip.Remove` owns its own button states and does not toggle the
primary selection.

The primary and Remove controls are sibling surfaces in the DOM but form one continuous visual
Chip. Each surface authors its own outer radius and border values; Structural CSS zeroes only their
adjacent logical corners. This is a Kiskadee compound-control adaptation that preserves valid
semantics without visually splitting the entity and its dismiss affordance.

The first scale mapping uses the same compact control range already established by Fluent Button:
24 px Small, 32 px Medium, and 40 px Large. Label typography reuses the preset-wide Caption/Body
profiles. Icon and remove glyph sizes select existing `global.iconSizes` references. Spacing between
Chip and nested Badge belongs to `e7`; the nested Badge preserves its own classes and Rest state.

## Surface context

Chip consumes the nearest `surfaceContext` and publishes a serialized `contentSurfaceContext` for
independent descendants. Transparent and subtle appearances preserve the received surface. Vivid
filled presentations publish `onVivid`; selected tinted presentations may publish the authored
state-specific value. This is a **Kiskadee extension** because Fluent Tag does not expose Kiskadee's
surface-context propagation model.

The map is authored sparsely. An omitted Selected or Disabled output inherits the Rest output;
`inherit` explicitly preserves the consumed surface. No luminance, DOM, or class-name inference is
permitted.

## Color mapping

All colors use the preset getter and approved tonal families. Neutral uses Fluent's tinted Neutral;
Primary uses the approved Brand/Blue family. On-vivid branches are independently authored to keep
foreground and controls legible on vivid ancestors. These branches are Kiskadee adaptations, not a
claim that Fluent publishes an equivalent surface-context matrix.
