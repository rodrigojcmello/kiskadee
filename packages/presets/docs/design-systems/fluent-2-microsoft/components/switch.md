# Fluent 2 Microsoft Switch Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`.

## Sources

- [Fluent 2 Switch usage](https://fluent2.microsoft.design/components/web/react/core/switch/usage)
- [Fluent UI React Switch styles](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-switch/library/src/components/Switch/useSwitchStyles.styles.ts)
- Promoted Fluent tonal evidence in
  [`fluent-tonal-scale-evidence.md`](../colors/fluent-tonal-scale-evidence.md)

## Source Coverage

| Source area | Inspected | Status |
| --- | --- | --- |
| Standard track, thumb, label, and checked state | Fluent usage and React styles | Official adapted |
| Hover, Pressed, Focus, and Disabled state rhythm | Existing Kiskadee schema; latest upstream comparison pending | Retained adaptation |
| Polarity presentation | No single upstream semantic variant | Kiskadee extension |
| Low on-primary presentation | No upstream emphasis/context matrix | Kiskadee extension |
| Activation-feedback halo | Shared Kiskadee effect | Kiskadee extension |

## Official Contract

- The standard control uses a 40 by 20 px track and a 14 px thumb at the Medium scale.
- The unchecked state uses a neutral surface and stroke; the checked state uses compound Brand
  colors with lighter thumb content.
- The label is independent from the interactive track and uses the preset body typography.
- The optional `e6` icon viewport is 10 px at `s:md:1`, represented by the shared
  `global.iconSizes.s:sm:3` profile.

## Color And Token Provenance

| Source relationship | Lookup | Kiskadee use | Status |
| --- | --- | --- | --- |
| Compound Brand Rest/Hover/Pressed | `reference(primary, vivid +2/+4/+6)` | Checked track plus Low thumb/icon states | Official adapted |
| Neutral foreground | `reference(switch.neutral, vivid)` | Label and control text | Official adapted |
| Polarity Off/On | `reference(redLike, vivid)` / `reference(greenLike, vivid)` | Polarity thumb and selected track | Kiskadee extension |
| Neutral Background 6 | `exact(switch.neutral, 6, component.switch)` | Disabled track | Retained adaptation |
| Neutral disabled/content stops | `exact(switch.neutral, 26/70, component.switch)` | Disabled thumb, icon, and label | Retained adaptation |
| Neutral track/thumb stops | `exact(primitive.black.v1, 50/55/65/10, component.switch)` | Unchecked border/thumb state rhythm | Retained adaptation |
| White and transparent | `cap(primitive.black.v1, light, 100%/0%)` | Thumb, track, icon, and transparent borders | Physical endpoint |
| On-primary overlay family | `cap(primitive.black.v1, light, 12%..88%)` | Low track, border, disabled text, and state overlays | Kiskadee extension |

The fixed stop set is a closed catalog under evidence ID `component.switch`. Those entries preserve
the established Fluent-adapted state relationships and are not promoted to functional references.
Brand, foreground, and polarity colors use functional anchors so an approved anchor change flows
through the component. White, transparency, and translucent white overlays use physical caps.

The schema resolves this catalog against the Light track because the current Switch contract
publishes only `default.light.onSubtle`. It does not claim Dark, Darker, or independent `onVivid`
coverage. The current Low appearance is the historical on-primary adaptation; separating surface
context from emphasis remains tracked as technical debt.

The closest approved tonal positions intentionally resolve several historical literals to nearby
values: neutral foreground `#21242d`, neutral thumb Hover `#464646`, and neutral track Hover
`#585858`. These adaptations are frozen by the Switch schema test while the upstream revalidation
remains open.

## Schema Mapping

- `e2`: track, border, state surface, and activation-feedback host.
- `e3`: thumb surface.
- `e4`: label using `body-medium`.
- `e5`: optional control text using `body-medium`.
- `e6`: optional 10 px icon using the global icon-size profile.
- `neutral.medium`: standard Fluent-adapted appearance.
- `polarity.medium`: explicit red/off and green/on relationship.
- `neutral.low` and `polarity.low`: Kiskadee on-primary adaptations retained for compatibility.

## Deferred Or Unsupported

- A dedicated Surface Context matrix replacing the overloaded Low on-primary appearance.
- Dark and Darker Switch palettes.
- Revalidation of every fixed stop against the latest upstream Figma component.

## Validation

- The Fluent FRF policy test rejects literals, direct tonal lookups, and undocumented exact stops.
- Exact Switch stops must use evidence ID `component.switch`; physical caps must use
  `primitive.black.v1`.
- Geometry and the 10 px icon viewport remain unchanged by the color-authoring migration.
