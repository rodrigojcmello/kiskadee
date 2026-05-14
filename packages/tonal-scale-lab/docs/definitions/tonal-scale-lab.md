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

`Kiskadee Official (33)` keeps absolute white and black caps at `0` and `100`; the `(33)` label
counts the generated chromatic slots between those caps. The chromatic curve is generated from `K1`
through `K95`, while `K0` and `K100` remain neutral caps for slot consistency. It keeps one-by-one
lightness movement through tone `10`, then spreads the pre-vivid middle tones every two tone
positions before `35`.
`Fluent 2 Official (16)` keeps the original Fluent public labels but maps them onto the same
normalized curve coordinates used by the Kiskadee distributions.

Tonal profiles live in `src/tonal-profiles.ts`. A profile is the stored curve model used by the
generator and the UI selector. Scale distributions live in `src/tonal-scale.ts`. The durable profile,
distribution, input-strategy, and contrast definitions live in
`docs/definitions/tonal-profiles-and-vivid-contrast.md`.
The current OKLCH generation experiment is documented in
`docs/definitions/oklch-generation-engine.md`.

Tonal anchors and state mapping are documented separately in
`docs/definitions/tonal-anchors-and-state-mapping.md`. That document defines the contract between
generated `K<n>` slots and component interaction states such as `rest`, `hover`, `focus`, and
`pressed`.

Current profiles:

- `Fluent 2 Blue`: stores the official 16-position Fluent 2 blue scale, adapts it to the Kiskadee
  range, keeps `0` as absolute white and `100` as absolute black, and anchors `#0f6cbd` at tone
  `55`.
- `Linear Lightness`: keeps hue and saturation constant across the chromatic slots and maps
  lightness directly from tone position. `K0` and `K100` remain absolute neutral caps rather than
  chromatic endpoints.
- `Striking - Auto Linear + 3:1 Vivid`: uses the input color as a chromatic seed in the commercial
  OKLCH engine, uses the pre-vivid middle tones as a bridge into vivid, applies a fixed `3:1`
  white-text contrast target from tone `35` through the last chromatic dark slot, and reports the
  closest input fit after the scale is finished.
- `Balanced - Auto Soft Dark + 3:1 Vivid`: follows the same auto-fit and vivid-contrast behavior as
  `Striking - Auto Linear + 3:1 Vivid`, but reduces OKL chroma on the dark side so deep tones feel
  closer to the softer Fluent dark blues. Its current default OKL lightness experiment uses
  `lightCeilingLightness: 98.8`, `darkFloorLightness: 8`, `lightLightnessGamma: 1.2`, and
  `darkLightnessGamma: 0.8` so `K1..K10` separate from the absolute white cap, the shared
  lightness-spacing guard keeps middle and dark chromatic slots from collapsing into a soft
  gradient, and `K95` remains visibly chromatic before the absolute black cap.
- `Sophisticated - Auto Mid Peak + 3:1 Vivid`: follows the same vivid-contrast behavior, but treats
  the profile base tone as the OKL chroma peak. Both very light and very dark tones become less
  chromatic.

For the auto-fit experimental profiles, the first word is a UI-facing commercial name. The
technical profile label after the dash remains the algorithmic description used for implementation
and documentation. The lab UI currently opens with `Balanced - Auto Soft Dark + 3:1 Vivid` selected
by default.

The contrast-gated Kiskadee profiles use `auto-fit`. The input color does not choose the generation
pivot. The profile generates the scale from its structural base tone, resolves the contrast-safe
vivid range and pre-vivid bridge, applies any spacing rules, and only then reports the closest
emitted fit for the input color. This keeps contrast and nearest-color metadata from distorting the
curve itself.

The current commercial profiles use `K55` as that structural base tone, but this is intentionally a
weak and provisional choice. It is convenient because it matches the current `vividRest` working
point and the projected `Fluent 2 Blue` base slot, not because the lab has proven `K55` to be the
final perceptual pivot. Future experiments may move that structural point.

The current vivid target experiment uses a fixed `3:1` contrast target for every input color. This
replaces the earlier adaptive experiment that used a stronger `4.5:1` target for darker colors and
softened luminous colors down to `3:1`.

The commercial auto-fit profiles also enforce experimental minimum OKL lightness steps after the
contrast and bridge adjustments:

- Default chromatic spacing: at least `1.5` OKL lightness points from the previous emitted slot
  through the active chromatic range.
- Luminous inputs, currently input white contrast `<= 2.4:1`: at least `2` OKL lightness points
  through `K16`, then the same `1.5` default used by the rest of the chromatic range.
- `K0` is still an absolute light cap, but the transition into `K1` uses the active spacing
  threshold so the first chromatic color does not visually merge into white.
- `K100` is an absolute dark cap; the `K95 -> K100` jump is a cap transition, not a chromatic
  spacing target.
- This is a lightness-spacing rule, not a contrast rule, and it can be revised or removed if the
  visual result proves too rigid.

Current color findings:

- `#0f6cbd` is the reference blue. `Fluent 2 Blue` still preserves it at `K55`, while the commercial
  OKLCH profiles are allowed to fit it wherever the finished generated scale is nearest.
- `#d4e157`, yellow, lime, and cyan motivated the OKLCH engine because HSL interpolation produced
  uneven contrast jumps before the `K35` vivid boundary.
- `#09b83e`, `#ff990a`, and `#25d366` remain useful regression colors for checking whether luminous
  hues still read as their original hue family after the fixed `3:1` vivid target.
- The green ramp remains visually coherent when moving into `K35`.
- The orange ramp becomes brown if `K35` is forced to `4.5:1` against white, which motivated the
  fixed `3:1` experiment.
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

The commercial auto-fit profiles use OKLCH instead: OKL lightness is the lightness axis, OKL chroma
is the chromatic-strength axis, and OKLCH hue interpolation is used for chromatic bridges.

The Next.js UI is the primary feedback surface for this project. It shows the generated scale, the
active profile reference scale, and an OKLCH lightness/chroma chart so curve changes are visible
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

Future work should decide whether the OKLCH commercial engine should replace more of the reference
pipeline or remain scoped to the Kiskadee commercial profiles. Input fit should remain a final
observation unless a future profile explicitly defines a stronger color-preservation contract.
