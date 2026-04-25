# Tabs

This file collects behavioral guidance, configuration rules, and variant-specific recommendations
for `Tabs`.

For structural slot ownership and naming, see [Tabs.STRUCTURE.md](./Tabs.STRUCTURE.md).

## Composition

`Tabs` are built from these public pieces:

- `Tabs.Root`
- `Tabs.Bar`
- `Tabs.Tab`
- `Tabs.Content`

Default tab composition supports:

- `label`
- `icon`
- fully custom children inside `Tabs.Tab`

## Current Contract

- `Tabs` labels are single-line.
- Labels use truncation with `ellipsis` in constrained width modes.
- `Tabs` currently support icons inline with the label.
- `Tabs` do not model icon-above-label layouts.

## Shared Configuration

These options are shared across the component family, but not every variant uses every option.

### `tabWidth`

Supported by all variants.

- `content`: tab width follows content.
- `fixed`: tab width uses the emitted `e2.boxWidth`.
- `adaptive`: `e2.boxWidth` is a minimum width and the tab may grow with content.
- `distributed`: tabs divide the available inline space while preserving emitted minimum width.

### `separator`

Only meaningful in variants that render runtime separators.

- `box`: supported.
- `segmented`: supported and defaults to `true` when not overridden.
- `line`: ignored.
- `dot`: ignored.
- `bridge`: unsupported.

### `spring`

Shared spring config used by variants that animate indicators at runtime.

- meaningful in `line`, `box`, and `dot` when indicator motion is enabled
- not used by `segmented`
- not used by `bridge`

### `intent`, `emphasis`, `scale`, `classNames`

These are shared styling/runtime inputs across all variants.

- `intent`: semantic color family
- `emphasis`: component emphasis bucket
- `scale`: schema scale lookup key
- `classNames`: local class overrides by element slot

## Icon Slot Ownership

- `e4` owns icon sizing inside `Tabs`.
- Schema `e4.boxWidth` and `e4.boxHeight` define the icon slot box.
- Schema `e4.marginRight` defines the inline gap between icon and label in the default composition.
- Direct `svg` children inside `e4` are normalized by component CSS to fill that slot box.
- This rule exists so asset-level intrinsic sizes such as inline `width` and `height` do not
  silently change tab height.
- Consumers should still provide SVGs with a correct `viewBox`.
- Non-SVG custom content inside `e4` remains consumer-owned.

## Typography And Height

- `e3.textHeight` must not be smaller than the effective icon height used by `e4`.
- If the icon is taller than the label line height, mixed tabs with and without icons can render
  with inconsistent heights.
- When a preset supports icons as part of the default `Tabs` composition, label height and icon
  height should be equalized unless there is a deliberate reason not to.

## Variants

### Line

`line` is the most configurable variant. It exposes the underline indicator as a first-class
surface.

Supported options:

- `tabWidth`
- `indicator.position`: `top | bottom`
- `indicator.shape`: `square | rounded | roundedClip`
- `indicator.width`: `tab | fixed | content`
- `indicator.motion`: `auto | none`
- `indicator.motionStyle`: `direct | stretch`

Not supported:

- `separator`
- `lowerCurve`

Notes:

- `line` is the default variant when no variant is provided.
- `indicator.width="content"` measures the rendered tab content instead of using the full tab box.
- `roundedClip` is structural geometry, not a schema-driven free radius.

### Dot

`dot` keeps the same bar-and-edge language as `line`, but replaces the underline with a centered
dot indicator.

Supported options:

- `tabWidth`
- `indicator.position`: `top | bottom`
- `indicator.motion`: `auto | none`

Not supported:

- `indicator.shape`
- `indicator.width`
- `indicator.motionStyle`
- `separator`
- `lowerCurve`

Notes:

- `dot` does not accept alternate indicator shapes.
- `dot` keeps the tab sizing modes from the shared `tabWidth` contract.

### Box

`box` uses a filled selected shell inside a padded container bar.

Supported options:

- `tabWidth`
- `separator`
- `indicator.shape`: `square | rounded | pill`
- `indicator.motion`: `auto | none`
- `indicator.motionStyle`: `direct | stretch`

Not supported:

- `indicator.position`
- `indicator.width`
- `lowerCurve`

Notes:

- `separator` is runtime-injected between adjacent tabs.
- `pill` and `rounded` depend on schema radius artifacts rather than handwritten structural radii.

### Segmented

`segmented` keeps a fixed outer shell and an inner scrolling tab row.

Supported options:

- `tabWidth`
- `separator`

Not supported:

- `indicator.position`
- `indicator.shape`
- `indicator.width`
- `indicator.motion`
- `indicator.motionStyle`
- `lowerCurve`

Notes:

- `separator` defaults to `true` in the runtime when not explicitly overridden.
- The selected fill is structural to the variant and does not expose the line/box indicator API.

### Bridge

`bridge` reconnects the selected tab shell into the content panel with lower-curve geometry.

Supported options:

- `tabWidth`
- `lowerCurve`: `curved | flush-start | flush-end | flush-both | flush-all`

Not supported:

- `separator`
- `indicator.position`
- `indicator.shape` alternatives
- `indicator.width`
- `indicator.motion`
- `indicator.motionStyle`

Notes:

- `lowerCurve` is `bridge`-only.
- `flush-start`, `flush-end`, `flush-both`, and `flush-all` progressively remove one or both lower
  reconnect shoulders from the bridge shape.
- `bridge` uses extra structural wrappers for overlap, clipping, and stacking, so it should be
  treated as its own geometry model rather than a light variation of `line`.

## Guidance

- Prefer keeping `Tabs` compact and scannable.
- Use `adaptive` when a design needs a width floor without forcing truncation at the same point as
  `fixed`.
- Use `distributed` when the bar should read as one evenly divided control group.
- If a navigation pattern needs stacked icon plus label or multiline labels, model that as a
  separate component instead of stretching `Tabs` beyond its current contract.
