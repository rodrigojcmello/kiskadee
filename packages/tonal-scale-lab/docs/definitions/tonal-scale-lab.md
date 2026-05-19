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
  chroma experiment uses `darkMinRatio: 0.25` from the generation base toward the dark end, so the
  final dark slots move closer to Fluent's softer low-chroma dark blue without copying the exact
  Fluent hex values. `Balanced` also preserves the exact input hex by default: it fits the input by
  OKL lightness, uses the legal preserved-input tone as the generation base, and keeps the exact
  input at that slot while the surrounding curve is resolved. The current light-zone boundary for
  this preservation experiment is `K10`; luminous inputs that are lighter than that boundary stay
  inside `K1..K10`.
  Its current simplification pass keeps the exact input anchor and vivid contrast active while
  leaving the older boundary-buffer, preserved-anchor continuity, early minimum lightness step,
  luminous chroma ramp, and node-continuity repairs disabled. The active shape repair is
  `chromaCurveContinuity`: it reads the OKLCH chart as a curve, detects abrupt turn angles, smooths
  adjustable points by local relaxation, keeps the exact input anchor protected, and then applies
  either a rounded protected-apex shoulder or a forward-apex shoulder. Red and blue inputs at `K35`
  may still use `K35` as the top of the chroma curve, but nearby generated slots are lifted into a
  rounded shoulder. Luminous inputs can keep rising after the exact input anchor before bending back
  toward the vivid range. Because saturated yellow often sits on the sRGB gamut cusp, the forward
  shoulder has a bounded hue-drift rescue so generated slots can gain chroma without changing the
  exact input hex. In `Balanced`, that rescue is intentionally narrow: hue drift is capped at
  `8deg`, and the drifted candidate must gain at least `0.004` OKL chroma over the same-hue
  candidate. The current experiment also runs an explicit `curveShape` model based on five
  virtual graph points rather than existing `K<n>` nodes: graph entry, dark-side arc base, rounded
  chroma apex, light-side arc base, and graph exit. Those virtual points are resolved from the
  chromatic endpoints and dynamic apex in the OKLCH chart, then connected with monotone cubic
  Hermite interpolation so the tails and apex are curved instead of segmented into long straight
  runs or pointed summits. `K10`, `K20`, `K50`, and `K55` are emitted samples on that line, not
  curve-shape nodes. After input preservation, the exact input anchor is promoted into the spline as
  a `preserved-input-anchor` virtual point and wins duplicate-lightness collisions, so the final red
  curve passes through the fixed input instead of treating it as a later deviation. The model can use
  a small bounded lightness drop so colors that are already at their same-L sRGB chroma limit can
  still follow the intended curve. It also applies a minimum arc-lift rule: each virtual arc base
  must sit above the straight chord between its endpoint and apex by a configured bow ratio, with
  separate light-side and dark-side lightness-drop budgets.
  That raises conservative near-straight runs without making `K20`, `K45`, or `K55` special-case
  nodes. The planned curve projection can also insert a local `K1..K10` light-zone shoulder and a
  `K10` exit point, making the extra chroma needed by luminous light tones visible without turning
  that shoulder into the global apex. `Balanced` applies this shape once before exact input
  preservation to define the base structural curve, then again after the exact input is inserted as
  a protected dynamic point and graph constraint. If the exact input already lands on a structural
  node, that preservation step keeps the planned curve instead of redrawing the whole surrounding
  interval. A bounded fairing pass smooths generated
  interior points that would otherwise create one-point subcurves. Final lightness handling is split
  into three layers: a monotonicity guard fixes generated slots that become locally inverted after
  sRGB fitting, `finalLightnessRhythm` redistributes the configured `K1..K10`, `K10..K30`, and
  `K35..K95` zones from protected endpoints, and the same rhythm layer resolves transition deltas
  between separated zone boundaries such as `K30 -> K35`. Final spacing ranges for `K1..K10` and
  `K10..K30` remain as bounded guardrails. The spacing check can iterate within a bounded
  lightness-drop budget to account for OKLCH-to-sRGB quantization, but the desired normal
  distribution now belongs to the zone-rhythm pass rather than to one-point minimum-delta repairs.
- `Sophisticated - Auto Mid Peak + 3:1 Vivid`: follows the same vivid-contrast behavior, but treats
  the profile base tone as the OKL chroma peak. Both very light and very dark tones become less
  chromatic. This profile should be recalibrated again after the `Balanced` dark-chroma experiment
  stabilizes.

For the auto-fit experimental profiles, the first word is a UI-facing commercial name. The
technical profile label after the dash remains the algorithmic description used for implementation
and documentation. The lab UI currently opens with `Balanced - Auto Soft Dark + 3:1 Vivid` selected
by default.

The contrast-gated Kiskadee profiles use `auto-fit`. `Striking` and `Sophisticated` generate the
scale from their structural base tone, resolve the contrast-safe vivid range and pre-vivid bridge,
apply any spacing rules, and only then report the closest emitted fit for the input color.

`Balanced` is the scoped exception: it fits the input by OKL lightness before generation, uses that
legal preserved-input tone as the generation base, and keeps the exact input hex at that anchor. The
legal-fit rules are: inputs that fail the `3:1` white-text vivid target cannot be preserved at `K35`
or darker, and inputs lighter than the `K10` boundary must remain inside the current `K1..K10` light
zone. In the current simplification pass, the older boundary buffer, preserved-anchor continuity
guard, node continuity guard, minimum lightness step, and luminous chroma ramp are intentionally
inactive for `Balanced`, and their old commented snippets are not kept beside the active profile
configuration. The active chroma-curve continuity guard then smooths sharp local curve turns around
the preserved input, including protected apexes, luminous forward apexes, and the configured
five-point virtual `curveShape` used to avoid longer nearly-straight runs.
`Striking` and `Sophisticated` do not use these preservation, boundary-buffer, anchor-continuity,
node-continuity, or chroma-curve continuity rules yet.

`K55` remains a useful state-mapping default such as `vividRest`, and it is still the projected base
slot for the `Fluent 2 Blue` reference. It is no longer the hidden generation center for `Balanced`.

The current vivid target experiment uses a fixed `3:1` contrast target for every input color. This
replaces the earlier adaptive experiment that used a stronger `4.5:1` target for darker colors and
softened luminous colors down to `3:1`.

`Striking` and `Sophisticated` also enforce experimental minimum OKL lightness steps after the
contrast and bridge adjustments:

- Default chromatic spacing: at least `1.5` OKL lightness points from the previous emitted slot
  through the active chromatic range.
- `K0` is still an absolute light cap, but the transition into `K1` uses the active spacing
  threshold so the first chromatic color does not visually merge into white.
- `K100` is an absolute dark cap; the `K95 -> K100` jump is a cap transition, not a chromatic
  spacing target.
- This is a lightness-spacing rule, not a contrast rule, and it can be revised or removed if the
  visual result proves too rigid.

Luminous inputs in those profiles, currently input white contrast `<= 2.4:1`, no longer receive a
stronger lightness step. They keep the same `1.5` OKL lightness spacing as every other hue. Instead,
the commercial OKLCH profiles cap the initial chroma ramp through `K10`: chroma starts at `30%` of
the input OKL chroma and eases toward `90%` by `K10` with `progressGamma: 0.55`. This replaced the
earlier `2`-point luminous lightness step because very saturated yellow became too vivid too early
in `K1..K3`, while non-luminous colors such as the reference blue were already reading well.

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
For profiles with a planned chroma curve, the chart also renders the planned curve as a red
diagnostic overlay. The red line and red virtual points show the post-preservation curve target,
including optional local constraints such as the `K1..K10` light-zone shoulder and the exact
preserved input anchor. The blue points remain the final generated `K<n>` colors.
Structural chromatic nodes are highlighted with `#26C6DA` on top of the generated points. For the
current `Balanced` model this means `K1`, `K10`, `K35`, `K95`, and the dynamic preserved input
anchor. `K55` is not highlighted because it is not a generation node in this model. All chart point
markers use the same `r=4` radius so node status is communicated by color, not marker size.
The UI persists the current base color in `?color=<hex>` without the `#` prefix. When that query
parameter is missing or invalid, the lab falls back to the default Fluent blue; when the user changes
to another valid color, browser refresh and back/forward navigation preserve the color state.
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
