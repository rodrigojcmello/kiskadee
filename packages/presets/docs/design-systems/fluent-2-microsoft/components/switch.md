# Fluent 2 Microsoft Switch Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/fluent-2-microsoft/components/switch.schema.ts`.

## Sources

- [Fluent 2 Switch usage](https://fluent2.microsoft.design/components/web/react/core/switch/usage)
- [Fluent UI React Switch styles](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-switch/library/src/components/Switch/useSwitchStyles.styles.ts)
- [User-supplied Windows 11 quick-settings screenshot](../evidence/switch/windows-11-quick-settings-on-vivid.png)
- Promoted Fluent tonal evidence in
  [`fluent-tonal-scale-evidence.md`](../colors/fluent-tonal-scale-evidence.md)

## Source Coverage

| Source area | Inspected | Status |
| --- | --- | --- |
| Standard track, thumb, label, and checked state | Fluent usage and React styles | Official adapted |
| Hover, Pressed, Focus, and Disabled state rhythm | Existing Kiskadee schema; latest upstream comparison pending | Retained adaptation |
| Polarity presentation | No single upstream semantic variant | Kiskadee extension |
| onVivid Neutral/Primary presentation | User-supplied Windows 11 quick-settings reference; no inspectable Figma context matrix | Kiskadee extension |
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
| Compound Brand Rest/Hover/Pressed | `reference(primary, vivid +2/+4/+6)` | Checked track and selected thumb states | Official adapted |
| Neutral foreground | `reference(switch.neutral, vivid)` | Label and control text | Official adapted |
| Polarity Off/On | `reference(redLike, vivid)` / `reference(greenLike, vivid)` | Polarity thumb and selected track | Kiskadee extension |
| Neutral Background 6 | `exact(switch.neutral, 6, component.switch)` | Disabled track | Retained adaptation |
| Neutral disabled/content stops | `exact(switch.neutral, 26/70, component.switch)` | Disabled thumb, icon, and label | Retained adaptation |
| Neutral track/thumb stops | `exact(primitive.black.v1, 50/55/65/10, component.switch)` | Unchecked border/thumb state rhythm | Retained adaptation |
| White and transparent | `cap(primitive.black.v1, light, 100%/0%)` | Thumb, track, icon, and transparent borders | Physical endpoint |
| On-vivid overlay family | `cap(primitive.black.v1, light, 8%..88%)` | Unchecked track, border, disabled text, and state overlays | Kiskadee extension |

The fixed stop set is a closed catalog under evidence ID `component.switch`. Those entries preserve
the established Fluent-adapted state relationships and are not promoted to functional references.
Brand, foreground, and polarity colors use functional anchors so an approved anchor change flows
through the component. White, transparency, and translucent white overlays use physical caps.

The schema publishes Light, Dark and Darker in both surface contexts. Physical onVivid
overlays resolve on the Light track; the onSubtle chromatic recipes use each theme's
track. The original Low on-primary experiment has been superseded by the context
axis and the intent mapping below.

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
- `neutral.medium`: standard Fluent-adapted appearance on subtle surfaces, and the
  Windows-inspired light-blue selected track on vivid surfaces.
- `primary.medium`: the same onSubtle appearance, with a white selected track
  and brand-colored thumb on vivid surfaces.
- `polarity.medium`: explicit red/off and green/on relationship.

## Deferred Or Unsupported

- Revalidation of every fixed stop against the latest upstream Figma component.

## Neutral and Primary on vivid (2026-09-26)

The default intent remains Neutral. The previous `accent` onVivid treatment is now
Neutral: transparent unchecked track, Light-track Primary `subtle +10/+12/+14`
selected track (`#68baff` Rest for Microsoft Blue) and a physical dark selected
thumb. The previous Neutral treatment is now Primary: translucent unchecked
track, white selected track and segment Primary selected thumb. Both use the same
published geometry and have identical onSubtle recipes. Polarity is unchanged.

This remaps an existing Kiskadee experiment to the user's Windows 11 composition
semantics. It is not an upstream Fluent token mapping. The physical overlays use
`cap(primitive.black.v1, light/dark)` and the brand colors use functional
`reference(primary, subtle/vivid + offset)` locators; no new primitive is introduced.

## Validation

- The Fluent FRF policy test rejects literals, direct tonal lookups, and undocumented exact stops.
- Exact Switch stops must use evidence ID `component.switch`; physical caps must use
  `primitive.black.v1`.
- Geometry and the 10 px icon viewport remain unchanged by the color-authoring migration.

## Large Size Extension (2026-09-09)

The user-approved Large size is a **Kiskadee extension**, not an official Fluent size.
It uses the multi-size geometry pattern from the local
`ios-27-apple/components/switch.schema.ts` as an implementation reference, while retaining
Fluent's circular thumb and 2:1 track proportions. No new upstream visual evidence was used.

| Geometry | Medium (retained) | Large (extension) |
| --- | --- | --- |
| Track | 40 x 20 px | 64 x 32 px |
| Thumb | 14 x 14 px | 24 x 24 px |
| Track pill radius | 10 px | 16 px |
| Thumb pill radius | 7 px | 12 px |
| Vertical / horizontal track padding | 1 / 3 px | 3 / 4 px |
| Icon viewport | 10 px | 16 px |

Large is explicitly selected with `size="lg"`; Compact continues to resolve to Medium.
Typography, colors, interaction states, and the default density are retained. This enlarges
visual geometry; it does not introduce a separate minimum touch-target contract.
The Showcase Sizes section lists the sizes published by the active preset.
