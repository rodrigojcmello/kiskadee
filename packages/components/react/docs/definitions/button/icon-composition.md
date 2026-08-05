# Button Icon Composition

Status: canonical definition.

Button icon composition has two independent axes:

- `iconLayout`: `inline | edge`
- `iconPlacement`: `leading | trailing`

`leading` and `trailing` are logical directions and therefore follow the document direction.

## Layouts

`inline` treats the icon and label as one centered group. The schema-owned icon spacing is applied
between the two slots regardless of placement.

`edge` gives the label an independent center track and pins the icon to a logical edge track. This
keeps labels visually aligned across a group of full-width buttons even when their icons have
different shapes.

An icon-only Button remains centered in either layout.

## Ownership

- `components.button.options` owns the preset defaults.
- React props with the same names may override those defaults per instance.
- `Button.Icon name="..."` resolves only glyph geometry through the active interface family.
- `Button.Icon` also accepts arbitrary direct children for product and brand artwork.
- Button owns the icon slot's color, accessible relationship, size, spacing, and composition. It
  does not nest a semantic `Icon` component.
- `e3.paddingRight` remains the schema-owned spacing token. The web build emits it as a structural
  token so the React structural layer can apply it on the correct logical side.
- Structural CSS owns only flex/grid composition and logical ordering. It does not own icon size,
  spacing, color, or Button padding.

The defaults are `inline` and `leading` when a preset omits the options.

Any future icon-slot background, divider, padding, or corner treatment belongs to Button schema
and structure. It is not a family attribute, because switching family must alter only glyph
geometry.
