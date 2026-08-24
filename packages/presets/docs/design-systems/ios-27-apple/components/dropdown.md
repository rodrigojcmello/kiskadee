# iOS 27 Apple Dropdown Evidence

## Sources

- [Apple Human Interface Guidelines: Menus](https://developer.apple.com/design/human-interface-guidelines/menus)
- [Apple Human Interface Guidelines: Pull-down buttons](https://developer.apple.com/design/human-interface-guidelines/pull-down-buttons)
- iOS and iPadOS 27 Community color and opaque-background evidence recorded by this preset

## Evidence Classification

- **Official adapted**: Apple describes menus as compact lists of commands, options, or states;
  labels may include helpful symbols, unavailable regular-menu items remain visible, and separators
  can distinguish explicit logical groups.
- **Official adapted**: a pull-down button reveals commands directly related to the button purpose.
- **Kiskadee extension**: the Web pull-down trigger maps its trailing chevron to `Button.e5` so one
  Button can contain a leading icon, label, and disclosure without making the icon interactive.
- **Kiskadee extension**: the current Web preset uses an opaque Apple Gray surface. It does not claim
  to reproduce Liquid Glass, blur, translucency, or a native iOS menu material.
- **Kiskadee extension**: the same `Dropdown` appearance is reused for Select and Autocomplete on the
  Web. Native Apple controls remain semantically distinct.
- **Kiskadee extension**: rich descriptions, mixed icon alignment, Web hover, and the selected row
  treatment complete the shared cross-platform contract where the inspected source is silent.
- **Kiskadee extension**: a dedicated leading checkmark slot is inspired by the state column used
  by macOS menus. It completes the shared Web topology without claiming an exact iOS 27 Menu
  measurement or native selection behavior.
- **Kiskadee extension**: independent options control whether the ordinary leading-icon column is
  retained beside the selection indicator and whether a Selected row receives its authored
  background. The initial preset explicitly preserves the current two-track highlighted treatment.

## Schema Mapping

- `e1`: opaque elevated Apple Gray surface, subtle border, 14 px rounded corners, and global shadow.
- `e2`: neutral Medium item surface with sparse Hover, Pressed, Selected, and Disabled deltas.
- `e3`: shared 20 px icon viewport and logical gap.
- `e4`: `body-small` principal label.
- `e5`: `label-small` auxiliary content.
- `e6`: 16 px generic trailing icon.
- `e7`: automatic one-pixel group boundary using the shared neutral `subtle` separator recipe.
- `e8`: `label-small` auxiliary end text, reusing the existing auxiliary palette.
- `e9`: `label-small-strong` group heading with item-aligned padding.
- `e10`: 16 px leading checkmark with a 10 px logical gap, reusing the existing text palette.
- `e11`: optional 16 px edge-scroll affordance, independently repeating `e6` foreground/size and
  the `e1` Rest surface. It is a Kiskadee extension for long Web menus, not a native Apple Menu API.

`options.leadingIconComposition` is `item-and-selection` and
`options.selectedItemBackground` is `true`. The latter gates only Selected `e2.boxColor`; it does
not remove checked semantics, indicators, or Selected foreground colors.

Typed Dropdown groups emit `e7` automatically. Structural CSS suppresses the leading boundary so a
collection with `n` groups paints `n - 1` dividers; consumers cannot insert ad hoc dividers inside
a group. `e7` owns only the full-bleed line and preserves the existing Apple Gray output documented
in [Separator evidence](separator.md). This automatic-boundary policy is a Kiskadee extension.

The disclosure viewport follows the preset icon-size ramp and the popup remains a separate sibling
surface. A split composition therefore uses two Buttons rather than nesting a second action inside
the first Button.

The schema uses only promoted tonal assets. This opaque Web adaptation must remain separate from any
future Liquid Glass capability.

The end-text, group-heading, leading-checkmark, and scroll-affordance slots are **Kiskadee extensions** added to keep
the shared Dropdown topology complete. They do not claim fidelity to inspected iOS Menu shortcut,
group-title, or checkmark measurements.
