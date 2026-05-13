# Tonal Scale Lab

`@kiskadee/tonal-scale-lab` is an internal exploration project for color-ramp generation.

The lab can emit multiple scale distributions. A scale distribution defines which public slots
exist; a tonal profile defines how those slots receive color.

Current distributions:

- `Kiskadee Official (33)`: `0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24,
  26, 28, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100`.
- `Fluent 2 Official (16)`: `10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140,
  150, 160`.
- `Kiskadee Legacy (31)`: `0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30,
  35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100`.

`Kiskadee Official (33)` keeps fixed white and black anchors at `0` and `100`; the `(33)` label
counts the generated chromatic slots between those anchors. It keeps one-by-one lightness movement
through tone `10`, then spreads the pre-vivid middle tones every two tone positions before `35`.
`Fluent 2 Official (16)` keeps the original Fluent public labels but maps them onto the same
normalized curve coordinates used by the Kiskadee distributions.

Tonal profiles live in `src/tonal-profiles.ts`. A profile is the stored curve model used by the
generator and the UI selector. Scale distributions live in `src/tonal-scale.ts`. The durable profile,
distribution, input-strategy, and contrast definitions live in
`docs/definitions/tonal-profiles-and-vivid-contrast.md`.

Tonal anchors and state mapping are documented separately in
`docs/definitions/tonal-anchors-and-state-mapping.md`. That document defines the contract between
generated `K<n>` slots and component interaction states such as `rest`, `hover`, `focus`, and
`pressed`.

Current profiles:

- `Fluent 2 Blue`: stores the official 16-position Fluent 2 blue scale, adapts it to the Kiskadee
  range, keeps `0` as absolute white and `100` as absolute black, and anchors `#0f6cbd` at tone
  `55`.
- `Linear Lightness`: keeps hue and saturation constant and maps lightness directly from tone
  position, so tone `0` is `L=100`, tone `5` is `L=95`, and tone `100` is `L=0`.
- `Auto Linear + Adaptive Vivid`: places the input color in the emitted scale according to its
  contrast behavior, uses the pre-vivid middle tones as a bridge into vivid, then applies an adaptive
  white-text contrast target from tone `35` through tone `100`.
- `Auto Soft Dark + Adaptive Vivid`: follows the same auto-anchor and vivid-contrast behavior as
  `Auto Linear + Adaptive Vivid`, but reduces saturation on the dark side so deep tones feel closer
  to the softer Fluent dark blues.
- `Auto Mid Peak + Adaptive Vivid`: follows the same vivid-contrast behavior, but treats the
  resolved input anchor as the saturation peak. Both very light and very dark tones become less
  saturated.

The contrast-gated Kiskadee profiles use `auto-anchor`. If the input color cannot support white text
at the vivid contrast threshold, it is anchored before tone `35` instead of being forced into the
vivid range. This is especially important for luminous hues such as yellow and cyan, where HSL
lightness can look medium while perceived luminance is still high.

The vivid target is adaptive: the strongest target is `4.5:1`, but luminous colors can soften down to
`3:1` so the first vivid tone does not collapse into brown or an overly dark version of the hue.
The input placement and the vivid target are separate decisions: luminous colors can still anchor
before vivid, while the first vivid tone uses the softened target to preserve the hue family.

Current color findings:

- `#388e4a` and `#ff990a` both resolve to `K30` in `Auto Soft Dark + Adaptive Vivid`.
- The green ramp remains visually coherent when moving into `K35`.
- The orange ramp becomes brown if `K35` is forced to `4.5:1` against white, so the adaptive vivid
  rule softens the target toward `3:1`.
- This is why `vivid` is documented as an expressive track first. It is not always the same thing as
  guaranteed WCAG AA normal-text foreground safety.
- The UI removes text shadow from scale labels so the lab shows the real foreground/background
  contrast without visual assistance.

Current state-mapping direction:

- `K<n>` names a Kiskadee tonal slot, not a semantic color family.
- Use role-based anchors such as `vividRest`, not hue- or layer-specific anchors such as
  `primaryVivid` or `greenLikeVivid`.
- The current working default for vivid rest is `K55`.
- Vivid interaction states should derive from the vivid anchor through a small fixed recipe, such as
  `hover = vividRest + 5` and `pressed = vividRest + 10`.
- Subtle interaction states should usually use explicit slots, such as `rest = K1`, `hover = K2`,
  `focus = K2`, and `pressed = K3`.
- Per-color anchor overrides are allowed as explicit exceptions, but one default anchor per color
  layer or hue family should not be the baseline model.

The reference-curve algorithm derives a reusable HSL curve from the active profile:

- lightness follows the reference dark/base/light progression;
- saturation follows the reference ratio relative to the base tone;
- hue follows the reference hue drift relative to the base tone.

The Next.js UI is the primary feedback surface for this project. It shows the generated scale, the
active profile reference scale, and a saturation/lightness chart so curve changes are visible
immediately.
The app uses port `3001` by default so it can run alongside `@kiskadee/showcase` on port `3000`.

The CLI helper accepts an optional profile id after the hex value:

```sh
pnpm --filter @kiskadee/tonal-scale-lab run generate ffcc00 linear-wcag-vivid
```

It also accepts an optional scale distribution id after the profile id:

```sh
pnpm --filter @kiskadee/tonal-scale-lab run generate ffcc00 linear-wcag-vivid kiskadee-official
```

Future work should decide whether the auto-anchor rule should move from HSL editing internals to a
more perceptual color space such as OKLCH.
