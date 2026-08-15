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

## Schema Mapping

- `e1`: opaque elevated Apple Gray surface, subtle border, 14 px rounded corners, and global shadow.
- `e2`: neutral Medium item surface with sparse Hover, Pressed, Selected, and Disabled deltas.
- `e3`: shared 20 px icon viewport and logical gap.
- `e4`: `body-small` principal label.
- `e5`: `label-small` auxiliary content.
- `e6`: 16 px trailing checkmark or submenu affordance.
- `e7`: explicit one-pixel separator using the shared neutral `subtle` separator recipe.

Dropdown groups own their padding and the distance around a separator. `e7` owns only the
full-bleed line; it does not publish margins or render the standalone Separator component. The
shared recipe preserves the existing Apple Gray output documented in
[Separator evidence](separator.md).

The disclosure viewport follows the preset icon-size ramp and the popup remains a separate sibling
surface. A split composition therefore uses two Buttons rather than nesting a second action inside
the first Button.

The schema uses only promoted tonal assets. This opaque Web adaptation must remain separate from any
future Liquid Glass capability.
