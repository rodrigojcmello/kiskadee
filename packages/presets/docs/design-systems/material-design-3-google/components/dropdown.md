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

## Schema Mapping

- `e1`: neutral surface, four-pixel rounded shape, eight-pixel inset, and global elevation.
- `e2`: neutral Medium row with sparse state-layer-derived visual deltas.
- `e3`: 24 px leading icon with a 12 px logical gap.
- `e4`: `label-large` principal label.
- `e5`: `body-small` auxiliary content.
- `e6`: 24 px trailing indicator.
- `e7`: explicit one-pixel divider using the shared neutral `subtle` separator recipe.

Dropdown groups own their padding and the distance around a divider. `e7` owns only the full-bleed
line; it does not publish margins or render the standalone Separator component. The shared recipe
preserves the existing neutral output documented in [Separator evidence](separator.md).

The first implementation is the minimum official adaptation needed to compose the existing Material
TextField with Autocomplete. It does not introduce a public Dropdown appearance variant.
