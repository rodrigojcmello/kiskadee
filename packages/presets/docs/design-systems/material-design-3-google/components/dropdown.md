# Material Design 3 Google Dropdown Evidence

## Sources

- [Material Design 3 Menus overview](https://m3.material.io/components/menus/overview)
- [Material Design 3 Menus specifications](https://m3.material.io/components/menus/specs)
- [Material Design 3 Split button](https://m3.material.io/components/split-button/overview)
- Existing Material 3 color, typography, radius, and elevation evidence in this preset

## Evidence Classification

- **Official adapted**: the Material Menu is an elevated anchored surface containing selectable or
  actionable rows. Kiskadee maps the standard menu shape, item rhythm, 24 px leading icon viewport,
  and elevation through existing global tokens.
- **Official adapted**: the principal item label uses the existing Material `label-large` recipe;
  auxiliary text reuses `body-small`.
- **Official adapted**: the split-button composition keeps its main action and menu trigger as two
  controls. Kiskadee publishes the trailing disclosure viewport through `Button.e5` without
  introducing a separate ButtonMenu visual schema.
- **Kiskadee extension**: `Dropdown` is the visual contract shared by Menu, Select, and Autocomplete.
  Their ARIA roles, focus policies, value semantics, and keyboard behavior remain independent.
- **Kiskadee extension**: the first shared contract supports rich two-line items and automatically
  aligns mixed icon/no-icon rows with CSS `:has()`.
- **Kiskadee extension**: selection presentation is configurable through independent leading-icon
  composition and Selected-background options. The initial preset explicitly preserves two leading
  tracks and the highlighted Selected row.
- **Kiskadee extension**: typed menu groups emit their `e7` boundary automatically. Structural CSS
  suppresses the leading boundary so a collection with `n` groups paints `n - 1` dividers; consumers
  cannot insert ad hoc dividers inside a group.

## Schema Mapping

- `e1`: neutral surface, four-pixel rounded shape, eight-pixel inset, and global elevation.
- `e2`: neutral Medium row with sparse state-layer-derived visual deltas.
- `e3`: 24 px leading icon with a 12 px logical gap.
- `e4`: `label-large` principal label.
- `e5`: `body-small` auxiliary content.
- `e6`: 24 px generic trailing icon.
- `e7`: automatic one-pixel group boundary using the shared neutral `subtle` separator recipe.
- `e8`: `body-small` auxiliary end text, reusing the existing auxiliary palette.
- `e9`: `label-medium` group heading with item-aligned padding.
- `e10`: 24 px leading checkmark with a 12 px logical gap, reusing the existing text palette.
- `e11`: optional 24 px edge-scroll affordance, independently repeating `e6` foreground/size and
  the `e1` Rest surface. It is a Kiskadee extension for long Web menus, not an official Material
  Menu height or scroll-control token.

`options.leadingIconComposition` is `item-and-selection` and
`options.selectedItemBackground` is `true`. Disabling the background gates only Selected
`e2.boxColor`; checked semantics, the `e10` indicator, and Selected foreground colors remain.

Dropdown groups own their padding and the distance around a boundary. `e7` owns only the
full-bleed line automatically emitted before each group; structural CSS suppresses the first one.
The shared recipe preserves the existing neutral output documented in
[Separator evidence](separator.md).

The first implementation is the minimum official adaptation needed to compose the existing Material
TextField with Autocomplete. It does not introduce a public Dropdown appearance variant.

The end-text, group-heading, leading-checkmark, and scroll-affordance slots are a **Kiskadee extension** in this
minimum migration. Their values reuse existing Material typography, color, icon sizing, and item
geometry until a dedicated official Menu review is completed.
