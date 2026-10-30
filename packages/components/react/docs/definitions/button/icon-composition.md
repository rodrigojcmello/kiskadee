# Button Icon Composition

Status: canonical definition.

Button icon composition has two independent axes:

- `iconLayout`: `inline | edge | stacked`
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

`stacked` places an icon above a single-line label and centers both. It requires both content
slots and a complete stacked recipe for the effective size and radius. Logical `iconPlacement` has no effect
in this layout. Labels keep the existing no-wrap behavior; intrinsic width and height remain
content-driven, without a square constraint or a fixed control height.

The optional stacked anatomy uses
[alternate element recipes for one rendered part](../../../../../../docs/definitions/composition-strategies.md#alternate-element-recipes-for-one-rendered-part),
with explicit replacement by property domain on the same native elements:

- `e8` replaces the root's complete scales and radius buckets, retaining `e1` decorations,
  palettes and effects. It owns padding, border width, radius and optional `_boxHeight` inspection
  metadata; it does not introduce another DOM wrapper.
- `e9` replaces the label's typography/decorations and scales, retaining `e2` palettes and effects.
  Its ordinary `marginTop` supplies the icon-to-label separation.
- `e10` replaces the icon's dimensions through the existing `iconSize` catalog, retaining `e3`
  palettes and effects. The existing artwork normalization still applies.

These are complete substitutions within the listed domains, not additive classes: retaining horizontal
root scales or label typography would create conflicts depending on CSS emission order. Horizontal icon gap
classes and the label-height fitting projection are omitted in stacked layout.

Missing content or an unavailable effective-size recipe preserves the ordinary inline layout and
emits a development warning. Surfaced icon regions keep their existing edge layout. Disclosure
and inline Badge compositions remain horizontal in this first release, with a warning when stacked
is requested; overlay Badges and Progress preserve their existing contracts. Capability is resolved
from the Builder's `layouts.stacked.sizesByRadius` metadata plus published element and radius
classes, not the preset identifier. The requested radius follows the connected group's contract,
then an explicit standalone prop, the global radius, and the Rounded default. Stacked accepts only
Rounded and Square: `resolveButtonStackedRadiusMode` preserves those modes and resolves Pill to
Rounded before capability lookup. An explicit standalone Pill request emits a development warning.
The effective shape is shared by geometry, radius effects and the state indicator. `e8` rejects
Pill in both the Schema type and validation; it does not borrow numeric radii from `e1`.
See the [Core stacked geometry contract](../../../../../core/docs/definitions/button-stacked.md).
Each radius list
intersects required geometry, typography, icon recipes and that radius's baseline values. A class
that exists only at a larger breakpoint cannot establish baseline support. The aggregate
`layouts.stacked.sizes` remains the union across authored radius modes, not permission to use every
radius at those sizes; the legacy Pill list remains empty. Missing radius metadata keeps the horizontal fallback until regeneration;
missing radius classes never borrow ordinary `e1` geometry for a stacked control.
Shared border or gap classes alone do not establish support. Old presets remain valid without
`e8`, `e9` or `e10`, and their default layout remains unchanged.

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
  fixed scales to those levels; the Builder emits the resulting square geometry into the existing
  scale classes. Adaptive density selects a complete recipe, including its icon geometry.
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

## Artwork dimensions

Plain icon fitting uses the label's authored line height as the vertical contribution limit.
Button `e2` retains typography ownership. SEP exposes its `textHeight` as `--k-txh`; when a
typography profile is used, the Builder also retains the existing unitless line-height utility.
SUP publishes the token-only utility under `e2.p.lh`, without copying the profile's other classes.
The runtime attaches that projection and modifier `k-btn-e3a` to a plain `e3` with authored scales,
even when no label is rendered. Absent projection means absent compensation, with no fallback.

Structural CSS computes `min(0px, (textHeight - iconHeight) / 2)` as the icon's block margins.
The viewport and artwork remain unchanged. This is derived structural geometry, not CSC: it does
not combine independently authored spacing values. No size selector, nominal-height metadata,
browser measurement, or JavaScript calculation participates. The label consumes its height token
for legacy scale-based typography; profile-based line-height utilities remain in normal resolution.
Surfaced and stacked icons keep their independent geometry and do not receive this modifier.

`Button.Icon` consumes the Builder's existing width and height tokens, both resolved from one
`iconSize` reference. Structural CSS fits direct SVG, `img`, and `picture > img` children into
that viewport. Raster images use `object-fit: contain`; SVG artwork retains its own viewBox and
aspect-ratio policy. Intrinsic image dimensions and SVG width/height attributes do not determine
the slot size. Transparent margins within an asset remain part of that artwork.

Direct font glyphs (text, `span`, or `i`) inherit the viewport height as their font size and use a
unit line height. Consumers provide the font family, glyph and font loading; family-resolved
glyphs remain supported. Font metrics can give different optical ink bounds even in equal boxes.
Custom wrappers must forward this sizing contract to their artwork. Explicit consumer CSS or
inline style overrides remain consumer-owned; the slot does not use `!important` to defeat them.

The Showcase's Icon formats section compares one Google artwork as SVG, PNG, JPEG and WebP,
alongside a direct Material Symbols font glyph. JPEG's opaque white canvas is an asset property.

Icon-region treatments never choose a brand artwork presentation automatically. Consumers remain
responsible for choosing `brand`, `mark`, `monochrome`, or another direct icon representation.
