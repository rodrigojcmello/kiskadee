# Button Icon Composition

Status: canonical definition.

Button icon composition has two independent axes:

- `iconLayout`: `inline | edge`
- `iconPlacement`: `leading | trailing`

It also has an independent icon-region treatment:

- `iconTreatment`: `plain | surface | surface-divider`

`leading` and `trailing` are logical directions and therefore follow the document direction.

## Layouts

`inline` treats the icon and label as one centered group. The schema-owned icon spacing is applied
between the two slots regardless of placement.

`edge` gives the label an independent center track and pins the icon to a logical edge track. This
keeps labels visually aligned across a group of full-width buttons even when their icons have
different shapes.

An icon-only Button remains centered in either layout.

## Icon Region Treatments

`plain` preserves the existing composition: `e3` is rendered directly in the Button and receives
the Button icon palette.

`surface` wraps `e3` in the optional schema element `e4`. The region occupies the full internal
Button height and touches the logical edge. Its background, foreground, and padding belong to the
active preset. Its outer corners derive from the Button radius minus the Button border width; its
inner corners remain square.

`surface-divider` uses the same region and adds one divider on its logical inner edge. The divider
inherits the Button border width and uses the color emitted by `e4`; it does not affect Button
measurement.

Surfaced treatments imply `edge` layout and require both an icon and a label. An explicit
`iconLayout="inline"` is converted to `edge`. Missing composition or an active preset without
`e4` falls back to `plain`.

The default is `plain`, including when a preset omits `iconTreatment`.

## Ownership

- `components.button.options` owns the preset defaults.
- React props with the same names may override those defaults per instance.
- `Button.Icon name="..."` resolves only glyph geometry through the active interface family.
- `Button.Icon` also accepts arbitrary direct children for product and brand artwork.
- Button owns the icon slot's color, accessible relationship, size, spacing, and composition. It
  does not nest a semantic `Icon` component.
- `e4` owns optional icon-region background, foreground, divider color, and padding. It is a styled
  React wrapper and does not change the Headless Button topology.
- `e1` remains the sole source of Button border width and radius. Structural CSS consumes those
  inherited tokens to keep the inset panel concentric with the Button and to size its divider.
- In surfaced treatments, `e3` omits its Button palette color and inherits the stable `e4`
  foreground. Fixed-paint artwork remains unchanged.
- `e3.paddingRight` remains the schema-owned spacing token. The web build emits it as a structural
  token so the React structural layer can apply it on the correct logical side.
- Structural CSS owns flex/grid composition, logical ordering, and the derived inner-corner
  geometry. It does not own icon size, spacing, color, or Button padding tokens.

The defaults are `inline`, `leading`, and `plain` when a preset omits the options.

Icon-region treatments never choose a brand artwork presentation automatically. Consumers remain
responsible for choosing `brand`, `mark`, `monochrome`, or another direct icon representation.
