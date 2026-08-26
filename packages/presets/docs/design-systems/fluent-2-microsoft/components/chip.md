# Fluent 2 Microsoft Chip Evidence

This file records source evidence and Kiskadee adaptations for the Chip authored in
`packages/presets/src/presets/fluent-2-microsoft/components/chip.schema.ts`.

## Sources

- [Fluent 2 Tag usage](https://fluent2.microsoft.design/components/web/react/core/tag/usage)
- [Fluent React Tag styles](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-tags/library/src/components/Tag/useTagStyles.styles.ts)
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

The three Kiskadee Chip scales map to Fluent Tag Extra-small, Small, and Medium. They are authored
independently from Button:

| Kiskadee scale | Fluent Tag size | Chip height | Label profile | Leading icon |
| --- | --- | --- | --- | --- |
| `s:sm:1` | Extra-small | 20 px | Caption | 12 px |
| `s:md:1` | Small | 24 px | Caption | 16 px |
| `s:lg:1` | Medium | 32 px | Body | 20 px |

The corresponding Fluent Button range is 24/32/40 px. The smaller 20/24/32 px Chip range preserves
the intended subordinate hierarchy between an entity/value and a command. This is a Kiskadee
preset-authoring recommendation, not a Core constraint: custom presets may choose other dimensions
when their source design system requires them, but official Kiskadee-authored presets should follow
the hierarchy unless their evidence documents an exception.

The Chip never reads Button geometry or derives one scale from another. Icon and remove glyph sizes
select existing `global.iconSizes` references. Spacing between Chip and nested Badge belongs to
`e7`; the nested Badge preserves its own classes and Rest state.

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
