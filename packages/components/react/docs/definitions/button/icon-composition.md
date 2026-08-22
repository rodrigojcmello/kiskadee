# Button Icon Composition

Status: canonical definition.

Button icon composition has two independent axes:

- `iconLayout`: `inline | edge`
- `iconPlacement`: `leading | trailing`

It also has an independent icon-region treatment:

- `iconTreatment`: `plain | surface`

Surfaced regions have an independent corner policy:

- `iconSurfaceCorners`: `edge | all`

`leading` and `trailing` are logical directions and therefore follow the document direction.

Button also exposes a distinct final disclosure slot, `e5`, through `Button.Disclosure`. It allows
an initial icon, label, and menu affordance to coexist without treating the disclosure as a second
action inside the Button.

## Layouts

`inline` treats the icon and label as one centered group. The schema-owned icon spacing is applied
between the two slots regardless of placement.

`edge` gives the label an independent center track and pins the icon to a logical edge track. This
keeps labels visually aligned across a group of full-width buttons even when their icons have
different shapes. This layout is intended for Buttons with enough inline space to preserve a
comfortable separation between the edge icon and the centered label. Compact compositions should
use `inline`; Kiskadee does not switch layouts automatically from the Button's measured width.

An icon-only Button remains centered in either layout.

## Icon Region Treatments

`plain` preserves the existing composition: `e3` is rendered directly in the Button and receives
the Button icon palette.

`surface` wraps `e3` in the optional schema element `e4`. The region occupies the full internal
Button height and touches the logical edge. Its background, foreground, and padding belong to the
active preset. All four corners derive from the Button radius minus the Button border width. The
`edge` corner policy then flattens the two corners facing the label, while `all` preserves the
derived radius on every corner. Because the panel creates a distinct visual region, the label
centers within the remaining Button surface instead of the complete Button bounds.

The surfaced treatment implies `edge` layout and requires both an icon and a label. An explicit
`iconLayout="inline"` is converted to `edge`. Missing composition or an active preset without
`e4` falls back to `plain`.

The defaults are `plain` and `edge`, including when a preset omits either option. The corner policy
is inert while the active treatment is `plain`.

## Ownership

- `components.button.options` owns the preset defaults.
- React props with the same names may override those defaults per instance.
- `Button.Icon` accepts arbitrary direct children for product and brand artwork.
- Family resolution is explicit composition through `FamilyResolvedIcon`; Button does not interpret
  an icon name.
- Button owns the icon slot's color, accessible relationship, size, spacing, and composition. It
  does not nest a semantic `Icon` component.
- `global.iconSizes` owns the preset's numeric viewport levels. `e3.iconSize` maps the Button's
  scale and breakpoints to those levels; the Builder emits the resulting square geometry into the
  existing scale classes.
- `e4` owns optional icon-region background, foreground, and padding. It is a styled React wrapper
  and does not change the Headless Button topology.
- `e5` owns the size and logical separation of a presentational disclosure glyph. It remains
  `aria-hidden`; the Button or composing semantic owner supplies accessible expanded/menu state.
- `e1` remains the sole source of Button border width and radius. Structural CSS consumes those
  inherited tokens to keep the inset panel concentric with the Button.
- In the surfaced treatment, `e3` omits its Button palette color and inherits the stable `e4`
  foreground. Fixed-paint artwork remains unchanged.
- `e3.paddingRight` remains the schema-owned spacing token. The web build emits it as a structural
  token so the React structural layer can apply it on the correct logical side.
- Structural CSS owns flex/grid composition, logical ordering, and the derived inner-corner
  geometry selected by `iconSurfaceCorners`. For the surfaced treatment, it also owns the
  two-region layout that centers the label within the surface remaining after `e4`. It does not own
  icon size, spacing, color, or Button padding tokens.

The defaults are `inline`, `leading`, `plain`, and `edge` when a preset omits the options.

Icon-region treatments never choose a brand artwork presentation automatically. Consumers remain
responsible for choosing `brand`, `mark`, `monochrome`, or another direct icon representation.
