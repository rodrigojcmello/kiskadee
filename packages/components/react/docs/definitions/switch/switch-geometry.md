# Switch Geometry

The styled React Switch owns local structural geometry that connects generated schema classes to the
actual DOM shape.

## Radius

The public `radius` prop chooses one radius mode for the visual Switch. React keeps schema-generated
artifacts as the source of truth, but the DOM shape means track and thumb cannot always consume the
same variables by inheritance.

- `pill` and `square` use the explicit generated radius classes for both track and thumb. Presets
  should provide exact values for each mode instead of relying on web-only large-number hacks.
- `rounded` uses the generated radius class on the track, then the Switch runtime reads the track
  radius variable and projects the derived thumb radius as `--k-swt-tr` on the shared control
  wrapper. Layout still uses rendered DOM padding, but the rounded radius inset uses the visual
  Switch padding contract: rendered inset, emitted `--k-pdt`/`--k-pdb`, and block border width are
  all considered so compensated padding does not hide the border contribution. The thumb consumes
  that projected value through the branch-local `k-swt-e3a-*` structural modifier.
- When the Switch uses the `thumbSize` effect, the internal `x5` thumb visual consumes the same
  projected `--k-swt-tr` value as the normal `e3` thumb. The effect may reduce visual
  `width`/`height`, but it does not recalculate or replace border radius.

This bridge is needed because the rendered track `e2` and thumb `e3` are siblings. CSS custom
properties emitted on the track do not inherit into the thumb directly, so the runtime that already
measures track/thumb geometry reads the generated track radius variable and carries the derived
rounded radius to the common wrapper.

## Focus Ring

The Switch track draws keyboard-visible focus from structural CSS because the native input is
visually hidden. The selector consumes the global focus contract directly:

- `--k-focus-color` for the outline color.
- `--k-focus-width` for outline thickness.
- `--k-focus-offset` for the gap between the track edge and outline.

These are required contract variables for design systems that expose Switch focus rings. Structural
CSS must not provide local `var()` fallbacks; if a preset expects a focus gap, its root schema must
emit `global.focus.offset`.
