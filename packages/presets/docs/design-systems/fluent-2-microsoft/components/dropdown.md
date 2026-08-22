# Fluent 2 Microsoft Dropdown Evidence

## Sources

- [Fluent 2 Menu usage](https://fluent2.microsoft.design/components/web/react/core/menu/usage)
- [Fluent UI MenuPopover source](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-menu/library/src/components/MenuPopover/useMenuPopoverStyles.styles.ts)
- [Fluent UI MenuItem source](https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-menu/library/src/components/MenuItem/useMenuItemStyles.styles.ts)
- [Fluent UI light color aliases](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/lightColor.ts)
- [Fluent UI dark color aliases](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/alias/darkColor.ts)
- [Fluent 2 Dropdown usage](https://fluent2.microsoft.design/components/web/react/core/dropdown/usage)
- [Fluent 2 Button usage](https://fluent2.microsoft.design/components/web/react/core/button/usage)
- [Fluent Web Community Figma: Dropdown component set](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9159-2470)
  - file key: `qdtPPQysSX0kHGGcDpEXzw`
  - inspected source instance: `9183:4601`
- [Fluent Web Community Figma: standard Menu](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9361-6145)
  - inspected Menu item: `9361:6242`
- [Fluent Web Community Figma: Menu item states](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9361-10436)
  - inspected state node: `9361:10436`
- [Fluent Web Community Figma: Menu item interaction matrix](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9121-6483)
  - inspected state set: `9121:6483`
- [Fluent Web Community Figma: Menu page](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9121-7573)
  - rich raster reference: `9121:7579`
  - inspectable Divider reference: `9121:6400`
- [Fluent Web Community Figma: Material Acrylic example](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9114-2483)
  - deferred to KIS-79 and not used as the canonical solid surface
- Fluent local effect style `Shadow 16`, already recorded in the preset shadow evidence

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Solid Menu surface | `9361:6145` | Background, padding, radius, item rhythm and Shadow 16 | Official exact |
| Menu item anatomy | `9361:6242` | Leading icon, label, shortcut and trailing content | Official adapted |
| Menu item states | `9361:10436` | Hover item radius and selection affordance geometry | Official adapted |
| Menu interaction matrix | `9121:6483` | Rest, checked, Hover, Pressed, Selected and Disabled variants | Official adapted |
| Dropdown selection | `9159:2470`, `9183:4601` | Shared anchored selection surface | Official adapted |
| Divider | `9121:6400` | NeutralStroke2 and one-pixel line | Official adapted |
| Rich Menu composition | `9121:7579` | Groups, titles, shortcuts and trailing affordances | Official adapted |
| Acrylic material | `9114:2483` | Blur/material treatment only | Deferred |

## Official Contract

- **Official adapted**: a Menu is an anchored hidden list of actions; items can be grouped with an
  explicit divider and can contain secondary shortcut and trailing content.
- **Official exact**: Fluent's MenuPopover uses intrinsic content width, a 138 px minimum, and a
  300 px maximum. Kiskadee adopts these bounds as the shared structural `content` width policy;
  explicit anchor-relative width policies remain mechanical overrides.
- **Official exact**: the solid Menu surface has no border, uses four-pixel padding and radius,
  `Shadow 16`, and two-pixel spacing between items.
- **Official adapted**: the one-line item uses Body 1 at 14/20, six-pixel block padding, a 20 px
  leading icon, and four-pixel icon-to-content spacing. Its nominal 32 px height remains intrinsic
  so enlarged or multiline content can grow.
- **Official adapted**: Fluent exposes check, radio, and submenu affordances as independent Menu
  anatomy. Kiskadee adds a dedicated leading checkmark slot while preserving `e3` for an ordinary
  leading icon and `e6` for trailing content such as a submenu chevron.
- **Official adapted**: the inspected Light item matrix colors the leading icon with Brand-80 in
  Selected/checked Rest, Brand-70 in Hover, and Brand-60 in Pressed. Kiskadee projects those states
  from the item scope owner to `e3` and resolves each source token through the approved Blue ramp.
- **Kiskadee extension**: selected radio and checkbox rows retain a colored Selected background.
  Radio renders a family-mapped filled dot and checkbox renders a check; web semantics remain
  `aria-checked` rather than `aria-selected`.
- **Kiskadee extension**: an open submenu trigger persists the Hover visual while focus/pointer moves
  into its submenu. It retains `aria-expanded` and does not become Selected.
- **Official exact**: Figma node `9361:10436` keeps the hovered item's four-pixel radius. The schema
  already declares that value on `e2`; the React resolver must consume the generated radius class
  instead of flattening it structurally.
- **Official exact**: Fluent MenuItem applies `colorNeutralBackground1Hover` to its root Hover
  state. The official aliases resolve that token to achromatic Grey 96 `#f5f5f5` in Light and Grey
  24 `#3d3d3d` in Dark, rather than the blue-gray Neutral ramp used by the other Dropdown roles.
- **Official adapted**: group headings use Caption 1 Bold at 12/16 with six-pixel inline and
  eight-pixel block padding. Kiskadee intentionally resolves this through
  `caption-medium-strong` Semibold because the typography contract does not support `Stronger`.
- **Official adapted**: the floating list uses `Shadow 16`, mapped to global level `s:lg:2` rather
  than copied into the component.
- **Official adapted**: Menu Button opens the menu with one Button; Split Button exposes a dominant
  action and a separate menu trigger. The dominant action is not repeated in the menu.
- **Official adapted**: the menu trigger uses a trailing disclosure affordance. Kiskadee maps that
  affordance to `Button.e5`; it remains part of Button geometry while the popup uses Dropdown.
- **Kiskadee extension**: `Dropdown` is a shared visual contract also consumed by Select and
  Autocomplete. Fluent documents those as distinct semantic controls; Kiskadee shares only their
  surface and item styling.
- **Kiskadee extension**: rich descriptions and automatic alignment of mixed icon/no-icon items are
  supported by the shared contract. The Fluent Menu source supports icon and secondary-content
  slots, but does not define Kiskadee's CSS `:has()` column policy.
- **Kiskadee extension**: Darker has no upstream Menu theme. It reuses the preset's established
  Darker surface and neutral-separator adaptation.
- **Kiskadee extension**: the 138--300 px Fluent content-width bounds are the initial shared
  Dropdown default for every preset. Preset-specific width catalogs remain deferred until a real
  design-system conflict requires them.
- **Kiskadee extension**: the keyboard-shortcut slot uses the smaller `caption-medium` profile and
  a twelve-pixel visual gap from the principal label. Fluent's rich Menu evidence establishes the
  secondary-content role, but Kiskadee deliberately reduces its prominence.
- **Kiskadee extension**: Fluent Dropdown presence defaults to `fade-translate`. Both that profile
  and the alternative `grow-height` profile are framework-authored because the inspected sources
  do not establish either motion recipe.

## Color And Token Provenance

| Source concept | Source value | Kiskadee mapping |
| --- | --- | --- |
| `colorNeutralBackground1Hover`, Light | Grey 96 `#f5f5f5` | `primitive.black.v1` L2 `#f6f6f6` on `e2.boxColor.neutral.medium.hover`; Delta E OK `0.002995` |
| `colorNeutralBackground1Hover`, Dark | Grey 24 `#3d3d3d` | `primitive.black.v1` D18 `#3c3c3c` on `e2.boxColor.neutral.medium.hover`; Delta E OK `0.003844` |
| Hover surface, Darker | No upstream Darker theme | `primitive.black.v1` D12 `#313131` on `e2.boxColor.neutral.medium.hover`, preserving the established Darker tone as a Kiskadee adaptation |
| Destructive Low Hover, Light | Cranberry L2 `#fff4f2` | `dropdown.destructive` L2 on `e2.boxColor.destructive.medium.hover`; shared tonal coordinate with Button Low Hover, independent component role |
| Leading icon Selected, Light | Brand-80 `#0064b4` | `icon.primary` L50 on `e3.textColor.neutral.medium.selected.rest` |
| Leading icon Hover, Light | Brand-70 `#0055a4` | `icon.primary` L55 `#0059a1` on `e3.textColor.neutral.medium.hover` |
| Leading icon Pressed, Light | Brand-60 `#004694` | `icon.primary` L60 `#045091` on `e3.textColor.neutral.medium.pressed` |
| `colorNeutralForeground3`, Light | Grey 38 `#616161` | `dropdown.neutral` Light L50 `#5d616b` on `e8.textColor.neutral.medium.rest` |
| `colorNeutralForeground3`, Dark | Grey 68 `#adadad` | `dropdown.neutral` Dark/Darker D70 `#8d919c` on `e8.textColor.neutral.medium.rest` |

The hover mappings select the closest available tones from the approved zero-chroma `n.black.v1`
asset. The darker D70 shortcut color is an explicit Kiskadee visual adaptation; it is not presented
as an exact Fluent dark-token match. Existing approved primitive assets supply every tone, so no
literal schema color is introduced.

## Schema Mapping

- `e1`: borderless floating Neutral surface, 4 px rounded corners, 4 px inset, and `Shadow 16`.
- `e2`: neutral Medium item surface with 6/2/6/6 px top/end/bottom/start padding, 2 px inter-item
  spacing, and sparse Hover, Pressed, Selected, and Disabled deltas. Only Hover resolves through
  the achromatic `primitive.black.v1`; the other roles retain the promoted Fluent Neutral family.
  `selected.hover` and `selected.pressed` intentionally repeat Selected Rest to reset the competing
  top-level Hover/Pressed surface while a checked row remains selected. These are documented
  compound-state precedence overrides, not redundant standalone states.
- `e3`: 20 px leading icon and 4 px logical gap. Neutral items use sparse Brand deltas for Hover,
  Pressed, Selected, Selected+Hover, and Selected+Pressed; destructive items retain Cranberry.
- `e4`: Body 1 (`body-medium`) principal label with 2 px horizontal text inset.
- `e5`: Caption 1 (`caption-medium`) auxiliary description with the same text inset.
- `e6`: optional 20 px iconographic trailing content. It does not imply submenu behavior.
- `e7`: explicit one-pixel divider using the shared neutral `subtle` separator recipe.
- `e8`: `caption-medium` end text, such as an informational keyboard shortcut, using the adapted
  NeutralForeground3 relationship at Light L50 and Dark/Darker D70. Its ten-pixel logical-start
  padding combines with the label's two-pixel logical-end padding to produce a twelve-pixel visual
  gap; six pixels remain between the shortcut and trailing icon. This metadata remains neutral even
  when the owning action is destructive; the action label and icon continue to carry intent.
- `e9`: `caption-medium-strong` group heading using NeutralForeground2, mapped to Light L75 and
  Dark/Darker D85, with 6 px inline and 8 px block padding.
- `e10`: optional 20 px leading selection indicator with a 4 px logical gap. Checkbox uses `check`;
  radio uses `radio-selected`. Selection semantics and visibility remain the owning Menu's job.
- `e11`: optional 20 px edge-scroll affordance. It independently repeats the `e6` icon-size and
  foreground references plus the `e1` Rest surface reference. This is a Kiskadee extension for
  long Web menus, not evidence of an official Fluent Dropdown state.

Dropdown groups own their padding and the distance around a divider. `e7` owns only the full-bleed
line; it does not publish margins or reuse the standalone Separator component at runtime. The
shared recipe maps official NeutralStroke2 as documented in [Separator evidence](separator.md).

Button disclosure uses the shared Fluent icon-size ramp. It does not duplicate Button palettes or
create a ButtonMenu schema; the single trigger and both split-button halves continue to resolve the
ordinary Button contract.

No color literal is authored in the component schema. All colors resolve through the preset's
approved pure Black, promoted Fluent Neutral, Brand, and Cranberry tonal families.

## Presence Profiles

- `fade-translate`: default; opacity plus a placement-aware twelve-pixel translation, with 240 ms
  entrance/ease-out and 120 ms exit/ease-in. This stronger Kiskadee calibration keeps the surface
  geometry stable while making both the fade and directional travel visually legible.
- `grow-height`: alternative; measured height from zero to auto, with 180 ms entrance/ease-out and
  120 ms exit/ease-in.

These profiles are **Kiskadee extensions**. They are stored in `global.effects.presence`, while
`components.dropdown.effects.presence.profile` selects the Fluent default. The Web artifact
publishes one resolved Dropdown presence object and does not create CSS utilities, style keys, a
separate artifact, or another request.

## Deferred Or Unsupported

- Acrylic/blur is tracked by KIS-79 and does not change the solid surface in this revision.
- Split menu items and executable shortcut bindings remain deferred. Menu supports exclusive radio
  selection and independent checkbox multi-selection; the Select layer does not yet expose these
  menu semantics.
- Preset-specific Menu width recipes remain deferred. `min-anchor` and `anchor` continue to opt out
  of the shared intrinsic-content bounds when a Select, Autocomplete, or consumer layout requires
  an anchor-relative width.

## Validation

- Verify the solid surface emits no border utility.
- Verify the generated neutral item Hover resolves to Light `#f6f6f6`, Dark `#3c3c3c`, and Darker
  `#313131`, with no chromatic channel divergence.
- Verify full-bleed NeutralStroke2, group heading, shortcut alignment, RTL, and 100%/200% text
  enlargement in generated artifacts and the Showcase.
