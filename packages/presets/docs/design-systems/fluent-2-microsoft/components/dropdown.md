# Fluent 2 Microsoft Dropdown Evidence

## Sources

- [Fluent 2 Menu usage](https://fluent2.microsoft.design/components/web/react/core/menu/usage)
- [Fluent 2 Button usage](https://fluent2.microsoft.design/components/web/react/core/button/usage)
- Fluent Web Community Figma component `Dropdown list`, under source node `9183:4601`
- Fluent local effect style `Shadow 16`, already recorded in the preset shadow evidence

## Evidence Classification

- **Official adapted**: a Menu is an anchored hidden list of actions; items can be grouped with an
  explicit divider, can contain secondary shortcut content, and use a maximum 300 px content width.
- **Official adapted**: the floating list uses the Fluent `Shadow 16` effect. Kiskadee maps it to
  global shadow level `s:lg:2` rather than copying a shadow into the component.
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

## Schema Mapping

- `e1`: floating Neutral surface, border, 4 px rounded corners, inset padding, and `Shadow 16`.
- `e2`: neutral Medium item surface with sparse Hover, Pressed, Selected, and Disabled deltas.
- `e3`: 20 px leading icon and its logical gap.
- `e4`: Body 1 (`body-medium`) principal label.
- `e5`: Caption 1 (`caption-medium`) auxiliary content.
- `e6`: 16 px trailing checkmark or submenu affordance.
- `e7`: explicit one-pixel divider using the shared neutral `subtle` separator recipe.

Dropdown groups own their padding and the distance around a divider. `e7` owns only the full-bleed
line; it does not publish margins or reuse the standalone Separator component at runtime. The
shared recipe preserves the existing Fluent Neutral output documented in
[Separator evidence](separator.md).

Button disclosure uses the shared Fluent icon-size ramp. It does not duplicate Button palettes or
create a ButtonMenu schema; the single trigger and both split-button halves continue to resolve the
ordinary Button contract.

No color literal is authored in the component schema. All colors resolve through the preset's
promoted Fluent Neutral, Brand, and Cranberry tonal families.
