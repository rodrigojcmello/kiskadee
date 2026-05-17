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
  white-text contrast target from tone `35` through the last chromatic dark slot, eases the vivid
  lightness progression with `lightnessProgressGamma: 1.1`, uses `darkFloorLightness: 26` so the
  darkest chromatic slots keep more visible chroma, and reports the closest input fit after the
  scale is finished.
- `Balanced - Auto Soft Dark + 3:1 Vivid`: follows the same auto-fit and vivid-contrast behavior as
  `Striking - Auto Linear + 3:1 Vivid`, but reduces OKL chroma on the dark side so deep tones feel
  closer to the softer Fluent dark blues. Its current default OKL lightness experiment uses
  `lightCeilingLightness: 98.8`, `darkFloorLightness: 20`, `lightLightnessGamma: 1.2`, and
  `darkLightnessGamma: 0.95` so `K1..K10` separate from the absolute white cap, the shared
  lightness-spacing guard keeps middle and dark chromatic slots from collapsing into a soft
  gradient, and `K95` remains visibly chromatic before the absolute black cap. Its current dark
  chroma experiment uses `darkMinRatio: 0.25` from the profile base tone toward the dark end, so the
  final dark slots move closer to Fluent's softer low-chroma dark blue without copying the exact
  Fluent hex values. `Balanced` also preserves the exact input hex by default: after the functional
  scale is resolved, the input is inserted at the nearest legal chromatic fit and the local curve is
  interpolated through it. The current light-zone boundary for this preservation experiment is
  `K10`; luminous inputs that are lighter than the generated `K10` boundary stay inside `K1..K10`.
  If a non-vivid-safe input would otherwise land on the last pre-vivid emitted slot, `Balanced`
  rewinds the exact input by one emitted slot so that last pre-vivid slot can bridge into the
  contrast-safe `K35`; when this happens, `K35` is resolved as the lightest vivid-start color that
  still passes `3:1` against white.
  Its preserved-anchor continuity guard can then rewind that pre-vivid anchor by up to `2` more
  emitted slots when the average OKL lightness delta after the anchor is more than `3x + 0.25`
  larger than the average before it. If the preserved input is immediately before the vivid start,
  the same guard uses a stricter `1.75x + 0.25` limit to avoid a direct hard edge between the input
  anchor and `K35`. If a non-vivid-safe preserved input is within `2` emitted slots before the vivid
  start, the guard also uses a near-vivid limit of `2.4x + 0.25`; this lets luminous colors such as
  `#00bcd4` settle at `K26` instead of holding the exact color at `K28` and forcing `K28` and `K30`
  to carry the whole bridge into `K35`.
  It also applies a node continuity guard at `K10` and `K35`: each seam is compared against the
  larger neighboring OKL lightness delta and cannot exceed that local reference by more than
  `1.25x + 0.25` OKL lightness points without redistributing the excess through the adjacent segment.
  `K10` has one additional preserved-input entry rule: when the exact input lands immediately before
  `K10`, the seam is judged from the previous light-zone delta rather than the wider `K10..K35`
  bridge rhythm. `K35` has the mirrored preserved-input exit rule: when the exact input lands on the
  vivid-start node, the exit seam is judged from the entry delta rather than the wider dark-side
  rhythm. Node continuity is checked again after chroma-shape smoothing so chroma shoulders cannot
  leave a new lightness seam behind.
  Finally, its chroma shape guard checks the preserved input anchor: when the anchor is a sharp OKL
  chroma summit, nearby emitted slots are raised locally with radius `1` and, only if needed, radius
  `2`, while the input hex remains exact. Near the vivid boundary, this guard uses a lower chroma
  prominence threshold, a smaller allowed chroma drop, and a directional radius into `K35` so small
  pre-vivid chroma spikes become shoulders instead of visible peaks. It also detects narrow dominant
  plateaus around the input, such as red-like `K30/K35` tops, and raises the plateau shoulders so the
  preserved input is less visually obvious without changing the exact input hex. If the exact input
  lands at `K35`, `Balanced` applies a stricter vivid-start shoulder so red-like anchors do not read
  as a one-point chroma summit. If a luminous input lands inside `K1..K10` after a steep chroma rise,
  `Balanced` can lift the following slots into a forward chroma shoulder, so yellow-like anchors do
  not have to remain the local chroma maximum.
- `Sophisticated - Auto Mid Peak + 3:1 Vivid`: follows the same vivid-contrast behavior, but treats
  the profile base tone as the OKL chroma peak. Both very light and very dark tones become less
  chromatic. This profile should be recalibrated again after the `Balanced` dark-chroma experiment
  stabilizes.

For the auto-fit experimental profiles, the first word is a UI-facing commercial name. The
technical profile label after the dash remains the algorithmic description used for implementation
and documentation. The lab UI currently opens with `Balanced - Auto Soft Dark + 3:1 Vivid` selected
by default.

The contrast-gated Kiskadee profiles use `auto-fit`. The input color does not choose the generation
pivot. The profile generates the scale from its structural base tone, resolves the contrast-safe
vivid range and pre-vivid bridge, applies any spacing rules, and only then reports the closest
emitted fit for the input color. This keeps contrast and nearest-color metadata from moving the
profile pivot.

`Balanced` now adds one more scoped step after that functional scale is resolved: it preserves the
exact input hex at the nearest legal chromatic slot and re-interpolates the surrounding curve through
that anchor. The legal-fit rules are: inputs that fail the `3:1` white-text vivid target cannot be
preserved at `K35` or darker, and inputs lighter than the generated `K10` boundary must remain inside
the current `K1..K10` light zone. If a non-vivid-safe input would collide with the last pre-vivid
slot, the input is buffered one emitted slot earlier and the last pre-vivid slot becomes bridge
material. If that still leaves a steep post-anchor lightness slope, the preserved-anchor continuity
guard can rewind the input again and regenerate the local bridge. The node continuity guard then
smooths the `K10` and `K35` connections and reclamps the vivid range. The chroma shape guard then
smooths sharp local chroma summits and short dominant chroma plateaus around the preserved input.
`Striking` and `Sophisticated` do not use these preservation, boundary-buffer, anchor-continuity,
node-continuity, or chroma-shape rules yet.

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
- `K0` is still an absolute light cap, but the transition into `K1` uses the active spacing
  threshold so the first chromatic color does not visually merge into white.
- `K100` is an absolute dark cap; the `K95 -> K100` jump is a cap transition, not a chromatic
  spacing target.
- This is a lightness-spacing rule, not a contrast rule, and it can be revised or removed if the
  visual result proves too rigid.

Luminous inputs, currently input white contrast `<= 2.4:1`, no longer receive a stronger lightness
step. They keep the same `1.5` OKL lightness spacing as every other hue. Instead, the commercial
OKLCH profiles cap the initial chroma ramp through `K10`: chroma starts at `30%` of the input OKL
chroma and eases toward `90%` by `K10` with `progressGamma: 0.55`. This replaced the earlier
`2`-point luminous lightness step because very saturated yellow became too vivid too early in
`K1..K3`, while non-luminous colors such as the reference blue were already reading well.

Current color findings:

- `#0f6cbd` is the reference blue. `Fluent 2 Blue` still preserves it at `K55`, while `Balanced`
  currently preserves it exactly at its nearest legal generated fit.
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
pipeline or remain scoped to the Kiskadee commercial profiles. `Balanced` is now the scoped
color-preservation experiment; future work should decide whether that contract belongs only to
`Balanced`, should become available as a profile option, or should be adapted for `Striking` and
`Sophisticated` after they are recalibrated.
