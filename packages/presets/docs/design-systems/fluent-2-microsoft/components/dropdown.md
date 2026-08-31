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
| Divider | `9121:6400` | NeutralStroke2 source geometry and one-pixel line | Official adapted geometry; Kiskadee color adaptation |
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
- **Official adapted**: the Medium one-line item uses Body 1 at 14/20, six-pixel block padding, and
  a 20 px leading icon. Its nominal 32 px height remains intrinsic so enlarged or multiline
  content can grow.
- **Kiskadee extension**: Large uses body Regular at 16/22, nine-pixel block padding, and 24 px
  icons for a nominal 40 px item. The default `s:md:1` resolves to Large below `bp:lg:1` and
  Medium from that breakpoint onward; explicit `s:lg:1` remains Large at every viewport.
- **Kiskadee extension**: a principal label or description consumes six pixels at an empty logical
  start edge and ten pixels at an empty logical end edge. Combined with surface and item padding,
  either empty edge reaches 16 px. A reserved icon, selection, shortcut, or trailing track owns its
  own gap instead, so these insets do not stack with auxiliary content.
- **Kiskadee extension**: a group heading adds its independently authored six-pixel complementary
  start margin only when no item in that group reserves an ordinary-icon or selection track. This
  uses Kiskadee's CSC pattern; the value is not calculated from another slot.
- **Official adapted**: Fluent exposes check, radio, and submenu affordances as independent Menu
  anatomy. Kiskadee adds a dedicated leading checkmark slot while preserving `e3` for an ordinary
  leading icon and `e6` for trailing content such as a submenu chevron.
- **Official adapted**: the inspected Light item matrix colors the leading icon with Brand-80 in
  Selected/checked Rest, Brand-70 in Hover, and Brand-60 in Pressed. Kiskadee projects those states
  from the item scope owner to `e3` and resolves each source token through the approved Blue ramp.
- **Kiskadee extension**: selected radio and checkbox rows retain a colored Selected background.
  Radio renders a family-mapped filled dot and checkbox renders a check; web semantics remain
  `aria-checked` rather than `aria-selected`.
- **Kiskadee extension**: the Light Selected surface uses the lighter `n.black.v2` L3 rather than
  L5. This reduces the prominence of the persistent selection background while preserving the
  neutral check/radio indicator and the independently Brand-colored semantic-icon behavior.
- **Kiskadee extension**: the preset explicitly selects `item-and-selection` leading composition
  and enables the Selected item background. Both are runtime-overridable presentation axes; turning
  off the background leaves checked semantics, indicators, and Selected foreground colors intact.
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
- **Kiskadee extension**: the shared `subtle` separator keeps the official one-pixel geometry but
  replaces the blue-gray NeutralStroke2 color with the approved achromatic Black v1 ramp.
- **Kiskadee extension**: typed menu groups emit their `e7` boundary automatically. Structural CSS
  suppresses the leading boundary so a collection with `n` groups paints `n - 1` dividers;
  consumers cannot insert ad hoc dividers inside a group.
- **Kiskadee extension**: Fluent Dropdown presence defaults to `fade-translate`. Both that profile
  and the alternative `grow-height` profile are framework-authored because the inspected sources
  do not establish either motion recipe.

## Color And Token Provenance

| Source concept | Source value | Lookup | Kiskadee mapping |
| --- | --- | --- | --- |
| `colorNeutralBackground1Hover`, Light | Grey 96 `#f5f5f5` | `reference(primitive.black.v1, subtle -2)` | L2 `#f6f6f6` on `e2.boxColor.neutral.medium.hover`; Delta E OK `0.002995` |
| `colorNeutralBackground1Hover`, Dark | Grey 24 `#3d3d3d` | `reference(primitive.black.v1, subtle +10)` | D18 `#3c3c3c` on `e2.boxColor.neutral.medium.hover`; Delta E OK `0.003844` |
| Hover surface, Darker | No upstream Darker theme | `reference(primitive.black.v1, subtle +7)` | D12 `#313131` on `e2.boxColor.neutral.medium.hover`, preserving the established Darker tone as a Kiskadee adaptation |
| Destructive Low Hover, Light | Cranberry L2 `#fff4f2` | `exact(dropdown.destructive, 2, component.dropdown)` | `e2.boxColor.destructive.medium.hover`; shared tonal coordinate with Button Low Hover, independent component role |
| Selected surface, Light | Kiskadee presentation extension | `reference(dropdown.neutral, subtle -1)` | L3 `#eef2fc` on `e2.boxColor.neutral.medium.selected`; intentionally lighter than the previous L5 `#e4e9f5` |
| Leading icon Selected, Light | Brand-80 `#0064b4` | `reference(icon.primary, vivid)` | L50 on `e3.textColor.neutral.medium.selected.rest` |
| Leading icon Hover, Light | Brand-70 `#0055a4` | `reference(icon.primary, vivid +1)` | L55 `#0059a1` on `e3.textColor.neutral.medium.hover` |
| Leading icon Pressed, Light | Brand-60 `#004694` | `reference(icon.primary, vivid +2)` | L60 `#045091` on `e3.textColor.neutral.medium.pressed` |
| `colorNeutralForeground3`, Light | Grey 38 `#616161` | `reference(dropdown.neutral, vivid -7)` | L50 `#5d616b` on `e8.textColor.neutral.medium.rest` |
| `colorNeutralForeground3`, Dark | Grey 68 `#adadad` | `reference(dropdown.neutral, vivid -4)` | D70 `#8d919c` on `e8.textColor.neutral.medium.rest` |

The destructive fixed-state catalog is closed under evidence ID `component.dropdown`: Light uses
tones 2/9/7 for Hover/Pressed/Selected and Dark/Darker uses 14/9/7. These exact stops are not
reusable functional anchors. All other entries above are functional references or physical caps.
The hover mappings select the closest available positions from the approved
zero-chroma `n.black.v1` asset. The darker D70 shortcut color is an explicit Kiskadee visual
adaptation; it is not presented as an exact Fluent dark-token match. Existing approved primitive
assets supply every tone, so no literal schema color is introduced.

## Schema Mapping

- `e1`: borderless floating Neutral surface, 4 px rounded corners, 4 px inset, and `Shadow 16`.
- `e2`: neutral Medium item surface with 6/2/6/6 px top/end/bottom/start padding; Large changes the
  block padding to 9 px while preserving the inline geometry. Both keep 2 px inter-item spacing
  and sparse Hover, Pressed, Selected, and Disabled deltas. Only Hover resolves through
  the achromatic `primitive.black.v1`; the other roles retain the promoted Fluent Neutral family.
  `selected.hover` and `selected.pressed` intentionally repeat Selected Rest to reset the competing
  top-level Hover/Pressed surface while a checked row remains selected. These are documented
  compound-state precedence overrides, not redundant standalone states.
- `e3`: 20 px Medium or 24 px Large leading icon and 6 px logical gap. Neutral items use sparse Brand deltas for Hover,
  Pressed, Selected, Selected+Hover, and Selected+Pressed; destructive items retain Cranberry.
- `e4`: Body 1 (`body-medium`) in Medium or body Regular 16/22 (`body-large`) in Large. Its 6 px
  start and 10 px end insets are token-only and apply only when the corresponding auxiliary track
  is absent.
- `e5`: Caption 1 (`caption-medium`) auxiliary description with the same conditional edge insets.
- `e6`: optional 20 px Medium or 24 px Large iconographic trailing content with a 6 px gap. It does
  not imply submenu behavior.
- `e7`: automatic one-pixel group boundary using the shared achromatic `subtle` separator recipe.
- `e8`: `caption-medium` end text, such as an informational keyboard shortcut, using the adapted
  NeutralForeground3 relationship at Light L50 and Dark/Darker D70. Its twelve-pixel logical-start
  padding produces the complete visual gap because the label's end inset is suppressed when the
  track is present; six pixels remain between the shortcut and trailing icon. This metadata remains neutral even
  when the owning action is destructive; the action label and icon continue to carry intent.
- `e9`: `caption-medium-strong` group heading using NeutralForeground2, mapped to Light L75 and
  Dark/Darker D85, with 6 px inline and 8 px block padding. Its independent 6 px start margin is a
  token-only CSC complement consumed only by groups without a leading track.
- `e10`: optional 20 px Medium or 24 px Large leading selection indicator with a 6 px logical gap. Checkbox uses `check`;
  radio uses `radio-selected`. Selection semantics and visibility remain the owning Menu's job.
- `e11`: optional 20 px Medium or 24 px Large edge-scroll affordance. Its overlay strip has no
  independent padding and therefore has exactly the resolved icon height. It independently repeats the `e6` icon-size and
  foreground references plus the `e1` Rest surface reference. This is a Kiskadee extension for
  long Web menus, not evidence of an official Fluent Dropdown state.

`options.leadingIconComposition` is `item-and-selection` and
`options.selectedItemBackground` is `true`, preserving the current two-track highlighted
presentation. These options are configurable Kiskadee extensions rather than claims that Fluent
defines the same runtime matrix.

Dropdown groups own their padding and the distance around a boundary. `e7` owns only the
full-bleed line automatically emitted before each group; structural CSS suppresses the first one.
The shared recipe adapts official NeutralStroke2 geometry to an achromatic color as documented in
[Separator evidence](separator.md).

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
- Verify full-bleed achromatic separators, group heading, shortcut alignment, RTL, and 100%/200% text
  enlargement in generated artifacts and the Showcase.
- Verify 16 px from the surface edge to text when either logical side has no auxiliary track, while
  icon, selection, shortcut, and trailing tracks preserve their independent gaps.
- Verify group headings align to the leading track when one exists and to item text when it does
  not, in both LTR and RTL.
- Verify `s:md:1` produces 40 px items below 1152 px and 32 px items from 1152 px onward, while
  `s:lg:1` stays at 40 px and scroll affordance strips stay at 24/20 px respectively.
