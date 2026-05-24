# Switch Geometry

The styled React Switch owns local structural geometry that connects generated schema classes to the
actual DOM shape.

## Radius

The public `radius` prop chooses one radius mode for the visual Switch. Track and thumb do not always
consume that mode in the same way:

- `pill` uses the explicit generated radius classes for both track and thumb. Presets should provide
  exact half-height values instead of web-only large-number hacks.
- `square` uses the explicit generated radius classes for both track and thumb.
- `rounded` uses the explicit generated radius class on the track, but the thumb derives its radius
  locally from the inherited track radius and generated block spacing variables.

For `rounded`, the thumb formula is:

```txt
max(0px, track border radius - max(track padding top, track padding bottom))
```

In CSS this consumes the existing generated variables inherited from the track:

- `--k-bdr` for the track border radius.
- `--k-pdt` for generated top padding.
- `--k-pdb` for generated bottom padding.

This keeps the thumb curvature visually related to the track without making the schema duplicate a
derived value for every Switch scale. This is a local React Switch structural rule, not a web-builder
emission-policy change.

These variables are contract variables from generated classes, so the structural selector must not
provide local `var()` fallbacks. Missing variables should surface as broken geometry during
development instead of being hidden by default values.

## Focus Ring

The Switch track draws keyboard-visible focus from structural CSS because the native input is
visually hidden. The selector consumes the global focus contract directly:

- `--k-focus-color` for the outline color.
- `--k-focus-width` for outline thickness.
- `--k-focus-offset` for the gap between the track edge and outline.

These are required contract variables for design systems that expose Switch focus rings. Structural
CSS must not provide local `var()` fallbacks; if a preset expects a focus gap, its root schema must
emit `global.focus.offset`.
