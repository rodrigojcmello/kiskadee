# iOS 27 Apple Dropdown Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/ios-27-apple/components/dropdown.schema.ts`.

## Sources

- [iOS and iPadOS 27 Community: horizontal Context Menu](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=754-46405)
  - file key: `GeO2lMY65IAFczDmjs6oei`; node: `754:46405`.
- [Vertical Context Menu](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=754-46443)
  - node: `754:46443`; source component set: `125:58750`.
- [Menus page and Dark example](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5908-8448)
  - page: `507:24676`; Dark menu: `5908:8448`; Dark selected item: `5854:8781`; Dark section title: `5855:4982`.
- [Apple HIG: Menus](https://developer.apple.com/design/human-interface-guidelines/menus)
- [Apple HIG: Context menus](https://developer.apple.com/design/human-interface-guidelines/context-menus)
- [Apple HIG: Pull-down buttons](https://developer.apple.com/design/human-interface-guidelines/pull-down-buttons)
- [Approved Apple tonal mapping](../colors/figma-to-kiskadee.json)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Context Menu examples | `754:46405`, `754:46443` | Light horizontal/vertical placement, ordinary/disabled/destructive rows, submenu, separators | **Official adapted** |
| Toggled items | Apple HIG Menus, `5854:8781` | Leading checkmark with separate optional content icon; no persistent row fill | **Official adapted** |
| Menu details | `5908:8448`, `5854:8781`, `5855:4982` | Dark rendered sample, optional 13/18 subtitle, 15/20 shortcut, 13/15 section title | **Official adapted** |
| Light and Dark semantic colors | Approved Figma color-variable mapping | Elevated background, normal labels/fills, destructive Red, non-opaque separator | **Official adapted** |
| Native material and top control group | Context Menu examples | Liquid Glass layers and three icon-over-label controls | **Deferred** |
| Darker | Kiskadee theme | Reuses Dark elevated presentation and independently addresses global profiles | **Kiskadee extension** |

The two Context Menu instances are both Light; vertical placement is not a Dark sample. The
Menus page supplies a separate verified Dark screenshot. Generated reference code sometimes contains
Light fallback literals even for Dark screenshots; the approved variable collection is the authority
for each theme, rather than those fallback literals.

## Official Contract

Apple menus collect related commands, options, and toggled states. The HIG recommends useful icons
with consistent treatment within a group and a checkmark for an active attribute. The inspected
Figma examples show an unavailable row, a red destructive action, group separators, and a submenu
chevron. Dropdown models the vertical list; it does not emit the horizontal top control group.

## Color And Token Provenance

All literal values in this table are evidence, not schema literals. Apple Gray is the promoted
`n.black.v2` asset exposed as `primitive.black.v1`; both Dropdown intents retain their existing
semantic mapping. Exact positions below use the preset's existing legacy `c` getter.

| Source concept | Source Light / Dark | Lookup and generated mapping | Decision |
| --- | --- | --- | --- |
| `Backgrounds/Primary - Elevated` | `#ffffff` / `#1c1c1e` | Light physical white cap L0; Dark exact D5, exact in both tracks | Opaque neutral surface; glass remains deferred |
| `Labels/Primary` | `#000000` / `#ffffff` | `fg:neutral.standard.<theme>.onSubtle.medium`; caps L100/D100 | Normal labels replace vibrant labels because the surface is opaque |
| `Labels/Secondary` | `#3c3c43` 60% / `#ebebf5` 70% | Global `low`; L70 `#3d3d3f` 60% / D95 `#ebebee` 70% | Descriptions, end text, and group labels |
| `Labels/Tertiary` | Same source hues at 30% / 30% | Parent-state global `lowest`; L70/D95 at 30% | Disabled label and icon paint, including destructive items |
| `Fills/Tertiary` | `#767680` 12% / `#767680` 24% | Exact L40 `#737375` 12% / D55 `#7a7a7c` 24% | Web Hover; opt-in Selected background |
| `Fills/Secondary` | `#787880` 16% / `#787880` 32% | Exact L35 `#7b7b7e` 16% / D55 `#7a7a7c` 32% | Web Pressed |
| `Accents/Red` | `#ff383c` / `#ff4245` | `dropdown.destructive` reference `vivid +0`; L26 `#ff383c` / D65 `#e85752` | Source-backed destructive identity; Dark remains the approved tonal adaptation |
| `Separators/Non-opaque` | Physical black 12% / white 17% | `contour:neutral.standard.<theme>.onSubtle.low` | Hairline popup contour; group boundaries consume global `subtle` separator |
| Transparent Rest/Disabled | Physical black 0% | Light black cap L100, alpha 0 | No row fill in Rest; terminal Disabled reset |
| Native exterior shadow | Physical black 25% | Global outer `s:lg:4`: `0 8 48 0` | Reuses the source's exterior shadow without material highlights |

The complete source/generated distances are retained in the approved mapping; no primitive asset
is changed. Dynamic states use normal semantic fills as an explicit opaque Web adaptation, not
unverified native hover tokens. Auxiliary text stays neutral even within a destructive item so that
the action label, rather than every detail, carries the destructive meaning.

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Neutral and Destructive Medium rows | Menu actions | **Official adapted** | Neutral normal label or Apple Red; same neutral interaction fill |
| Persistent selection | HIG checkmark | **Official adapted** | `selectedItemBackground: false`; checkmark is the default selected signal |
| Opt-in selected row background | Web presentation option | **Kiskadee extension** | Retains a tertiary-fill recipe for consumers explicitly enabling it |
| Opaque popup | Elevated Apple background with menu geometry | **Kiskadee extension** | Legible counterpart within the current surface contract |
| Shared Select/Autocomplete presenter | Native controls are semantically distinct | **Kiskadee extension** | Reuses the existing Dropdown visual topology only |
| Square radius | No inspected native counterpart | **Kiskadee extension** | Existing framework radius mode stays available |

## Schema Mapping

- `e1`: 34 px radius from the source menu; 10 px inset and a 0.5 px contour. The source's 16 px
  list inset plus row inset is normalized to 10 px popup plus 12 px row inset, preserving 22 px
  leading label inset without creating another structural owner. Popup width stays content-owned.
- `e2`: 10 px vertical padding, 12 px horizontal padding, and 24 px hover radius. The hover radius
  is a Kiskadee concentric inset adaptation (`34 - 10`), not a measured native hover state.
- `e3`: existing 20 px icon viewport and 8 px text gap. Native SF Symbol glyph boxes are not copied
  into the portable icon implementation.
- `e4`: global `body-medium`, 17/22 Regular. The source menu's 17/20 label is normalized to Apple's
  shared Body profile to preserve the existing typography system.
- `e5`: `label-small`, matching the source subtitle at 13/18 Regular.
- `e8`: `body-small`, matching the 15/20 shortcut size while normalizing its Medium weight to the
  existing Regular global profile.
- `e9`: `label-small-strong`, normalizing the source 13/15 Medium heading to 13/18 Semibold;
  4 px top and 10 px bottom padding preserve the source section-title spacing.
- `e6`, `e10`, `e11`: existing 16 px trailing/checkmark/scroll affordance viewports.
- `e7`: shared `subtle` separator, automatically emitted between typed groups. Its geometry remains
  the existing full-bleed group boundary; the source's extra 10 px above/below each separator is
  **Deferred** because this slot exposes only a separator-profile reference.
- `leadingIconComposition: item-and-selection` preserves the separate optional content icon and
  checkmark observed in `5854:8781`; icon viewports remain adapted to the global ramp.

## Shared Formula And State Ownership

Rows own Hover/Pressed/Selected/Disabled. Child foreground Disabled entries use `fg.parentState`.
Hover plus Pressed resolves to Pressed; Focus contributes the existing global keyboard focus ring
without a duplicate component fill. The explicit transparent Disabled row is a Rest-equal terminal
reset, preventing transient or selected fill from surviving a disabled compound state.

`Dropdown.Content` resets descendants to `onSubtle` because the popup owns an opaque surface.
All three theme palettes are authored; Darker uses Dark elevated colors rather than disappearing
into the darker page background. The scroll affordance repeats the popup's Rest background.

## Deferred Or Unsupported

Liquid Glass, vibrancy, inner glass highlights, scene-relative contrast, the top control group,
and native context preview/gesture presentation are not approximated. Subtitle, shortcut, and section-title typography were inspected; their normalization differences
are described above.

## Validation

- Figma design context and rendered reference images inspected for the cited Light/Dark menus and focused detail nodes.
- Focused preset tests cover all themes, surface roles, semantic destructive identity, and
  intentional disabled resets; aggregate build and Showcase verification accompany integration.
