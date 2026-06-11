# Switch Geometry

The styled React Switch owns local structural geometry that connects generated schema classes to the
actual DOM shape.

## Radius

The public `radius` prop chooses one radius mode for the visual Switch. React keeps schema-generated
artifacts as the source of truth, while structural CSS adapts the generated track values to the
actual nested DOM shape.

- `pill` and `square` use the explicit generated radius classes for both track and thumb. Presets
  should provide exact values for each mode instead of relying on web-only large-number hacks.
- `rounded` uses the generated radius class on the track and does not apply the generated rounded
  radius class to the thumb. The track computes `--k-swt-tr` from emitted CSS variables:
  `--k-bdr` minus the maximum visual inset from `--k-pdt`, `--k-pdr`, `--k-pdb`, `--k-pdl`, and
  `--k-bdw`. This matches the `switch.standard.e2` emission contract: border width is mirrored and
  padding is compensated, so structural CSS can use the declared visual padding variables without a
  radius runtime.
- The thumb consumes that track-derived value through the branch-local `k-swt-e3a-*` structural
  modifier. This works by normal CSS inheritance because the rendered track wraps the thumb.
- When the Switch uses the `thumbShrink` effect, the same `e3` thumb consumes `--k-swt-tr` and
  receives the effect dimensions directly. The effect may reduce thumb `width`/`height`, but it does
  not recalculate or replace border radius.

The runtime motion path measures track/thumb dimensions to compute thumb travel. When the thumb is
smaller than the track content height, motion uses a square alignment box based on that content
height. This preserves the same visual inset that the large thumb would have had while still keeping
`e3` as the only rendered thumb. The runtime must not project rounded radius values; rounded radius
is a structural CSS calculation based on the emitted track variables.

## Focus Ring

The Switch track draws keyboard-visible focus from structural CSS because the native input is
visually hidden. The selector consumes the global focus contract directly:

- `--k-focus-color` for the outline color.
- `--k-focus-width` for outline thickness.
- `--k-focus-offset` for the gap between the track edge and outline.

These are required contract variables for design systems that expose Switch focus rings. Structural
CSS must not provide local `var()` fallbacks; if a preset expects a focus gap, its root schema must
emit `global.focus.offset`.
