# Tonal Profiles And Vivid Contrast

This lab separates tonal profiles from scale distributions.

- A tonal profile is the stored recipe for turning one input color into a color curve.
- A scale distribution defines which public slots are emitted for that curve.
- An input strategy defines whether the user-provided color is preserved, used only as a seed, or
  fitted after the scale has already been generated.

## Current Distributions

- `Kiskadee Official (33)` has 33 generated chromatic slots plus absolute `0` and `100` caps. Its
  subtle track is `0..10`, then `12`, `14`, `16`, `18`, `20`, `22`, `24`, `26`, `28`, and `30`.
- `Fluent 2 Official (16)` has the official Fluent public slots:
  `10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160`.
- `Kiskadee Legacy (31)` preserves the earlier lab distribution. Its subtle track is `0..15`,
  `20`, `25`, and `30`.
- The Kiskadee distributions use the same chromatic vivid track:
  `35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95`, plus `100` as the
  absolute dark cap.

The numeric split alone does not prove that a tone is visually or functionally vivid. It only
defines the two scale tracks. A tonal profile may add a stronger vivid contract when it wants the
vivid track to be safe for foreground text.

## Absolute Caps And Chromatic Curve

`K0` and `K100` are absolute neutral caps in the Kiskadee distributions:

- `K0` is emitted as absolute white;
- `K100` is emitted as absolute black;
- they are kept in the scale strip and table so the public slot language still spans the full
  `0..100` range;
- they are not used as chromatic curve endpoints and are not plotted in the curve chart.

The chromatic curve is generated between the first and last non-cap slots. In
`Kiskadee Official (33)`, that means `K1..K95`. This prevents the absolute white and black caps from
pulling the family color toward pure white at the light end or pure black at the dark end. It also
keeps `K95` available as the final very-dark chromatic color instead of making it a near-black
prelude to `K100`.

## Contrast-Gated Vivid

A profile can opt into `vividContrast`. When enabled, the lab treats vivid as a functional track:

- tones below the configured `startTone` are not contrast-corrected;
- chromatic tones from `startTone` through the last non-cap tone must meet the configured contrast
  ratio against the configured foreground;
- the current experimental rule uses `startTone: 35`, `foregroundHex: '#ffffff'`, and
  `minRatio: 3`.

The fixed `3:1` target follows the WCAG threshold used for large text and graphical objects, and is
only an experimental expressive-color compromise. It is not the WCAG 2.2 Contrast (Minimum) AA
threshold for normal text. The profile uses the contrast formula based on relative luminance, not HSL
or OKL lightness. OKLCH is the generation space for commercial profiles, but it does not replace the
contrast formula.

The current experiment uses the same `3:1` vivid target for every input color. The previous
adaptive experiment used `minRatio: 4.5` with `luminousMinRatio: 3`, which kept darker colors near a
stronger target while softening luminous colors such as yellow, orange, and cyan.

The input-fit reading and the vivid contrast target are related but separate decisions. The current
contrast target decides which vivid tones are adjusted for the active foreground. It does not decide
where the input color belongs, and it does not move the profile's structural generation pivot.

## Input Strategies

Profiles must make the role of the input color explicit:

- `seed` treats the input as the hue and chroma/saturation source. The profile decides the lightness
  at the base tone, so the exact input color is not guaranteed to appear in the emitted scale.
- `fixed-anchor` preserves the input at the profile's configured base tone. This is useful when the
  profile represents an external reference scale and the reference color has a known slot.
- `auto-fit` uses the input as a chromatic seed, generates the scale from the profile's structural
  pivot, and only then reports the emitted slot closest to the original input color.

The current auto-fit rule uses nearest RGB distance on the final emitted scale. The fit is a
diagnostic reading, not a generation input. It may land inside the vivid track or the pre-vivid
track depending on the finished colors.

`Balanced` is the current exception because it opts into input preservation. It still starts from the
auto-fit model, but after the functional scale is resolved it inserts the exact input hex at the
nearest legal chromatic slot and re-interpolates the surrounding curve through that point.

## Input Fit Comes Last

The lab deliberately separates the profile pivot from the input fit:

- the profile pivot is a structural tone, currently the profile's `baseTone`;
- the input color provides hue and chroma for the generated family;
- vivid contrast adjusts the generated vivid track;
- the pre-vivid bridge connects the light range to the adjusted vivid start;
- minimum lightness spacing may further separate neighboring emitted slots;
- only after those steps does the lab ask which emitted slot is closest to the original input color;
- a profile may then opt into preserving that input at a legal fit slot, as `Balanced` does now.

The final input fit must not choose the profile pivot. Earlier experiments let contrast-derived auto
anchors move the generation pivot. That made the input color appear intentionally placed, but it also
distorted the rest of the scale: luminous inputs could collide with the `K35` contrast boundary,
while vivid blue could move the pivot to `K70` and stretch the `K40..K70` region into a nearly
linear lightness ramp.

The current `Balanced` preservation model is different: the profile still resolves its structural
scale first, then uses fixed structural points plus the exact input as a local interpolation anchor.
The current structural points are `K1`, `K10`, `K35`, and `K95` for `Kiskadee Official (33)`. `K10`
defines the light-zone boundary for this experiment; `K16` may be tested later if `K10` proves too
tight for luminous brand colors.

The preserved input cannot break the vivid contract. If the input does not reach `3:1` against
white, it is only allowed before `K35`. If the input is lighter than the generated `K10` boundary, it
is only allowed inside the `K1..K10` light zone. After preservation, the vivid range is checked
again.

`Balanced` also applies a node continuity guard after input preservation. The current nodes are
`K10` and `K35`. For each node seam, the guard compares the seam's OKL lightness delta with the
larger of the two neighboring emitted-step deltas. The seam fails when it exceeds that local
reference by more than `1.25x + 0.25` OKL lightness points.

When a seam fails, the generator redistributes the excess through the adjacent segment and validates
again, up to `5` iterations. The exact input anchor remains fixed. The vivid range is reclamped after
redistribution so the `K35..K95` `3:1` contract remains true.

## Structural Pivot Caveat

The commercial auto-fit profiles currently use `K55` as their structural base tone. This is a weak
and deliberately provisional argument:

- `K55` matches the current `vividRest` working point used by the state-mapping notes;
- it also matches where `Fluent 2 Blue` places its base blue when projected into Kiskadee slots;
- those facts make `K55` convenient for comparison, but they do not prove that `K55` is the correct
  perceptual pivot for the final Kiskadee scale.

The only durable conclusion from the current experiments is that the input fit should not choose the
generation pivot. `K55` may move later if practical testing shows that `K50`, `K60`, or another
structural point produces a better family-wide scale.

## Color Findings

The current model came from comparing the same profile across darker and more luminous hues.

- Blue, red, and many greens tolerate a strong white-text contrast target without losing their
  recognizable hue family.
- Yellow, orange, and cyan are much more sensitive to forced darkening. When a yellow or orange ramp
  is pushed to `4.5:1` against white at the first vivid tone, it often reads as brown rather than as
  a vivid version of the original color.
- HSL lightness is not enough to classify this behavior. A color can look like a middle HSL value
  while still having high relative luminance.
- HSL interpolation is also not reliable enough for luminous pre-vivid bridges. Equal HSL lightness
  movement can create uneven OKL lightness, RGB, and contrast movement before `K35`.
- `vivid` should therefore be treated as an expressive color track, not as a guaranteed alias for
  normal-text foreground safety in every hue family.
- Foreground safety is still measured and displayed, but the current expressive profiles intentionally
  use a fixed `3:1` target instead of forcing every vivid tone to normal-text foreground safety.

Example observations for the fixed `3:1` and OKLCH commercial experiment:

- `#0f6cbd` remains the reference blue for comparison. `Fluent 2 Blue` keeps it at `K55`, while
  `Balanced` now preserves it exactly at the nearest legal fit. `Striking` and `Sophisticated` still
  only report their nearest final auto-fit slot.
- `#d4e157` exposed the HSL bridge problem: `K35` was contrast-adjusted, but `K12..K30` reached it
  through HSL interpolation, causing abrupt contrast movement before `K35`.
- `#09b83e`, `#ff990a`, `#25d366`, `#00bcd4`, and `#ffeb3b` are useful regression inputs for
  checking whether luminous hues keep their identity under the fixed `3:1` vivid target.

## Adjustment Strategy

The guard leaves the fine light range untouched. This is distribution-specific:

- `Kiskadee Legacy (31)` preserves `0..15`;
- `Kiskadee Official (33)` preserves `0..10`.

When `bridgeStartTone` is set, the tones between `bridgeStartTone` and `startTone` become a
pre-vivid bridge. In the legacy Kiskadee distribution, tones `20`, `25`, and `30` are interpolated
between tone `15` and the contrast-safe tone `35`. In the official Kiskadee distribution, tones
`12`, `14`, `16`, `18`, `20`, `22`, `24`, `26`, `28`, and `30` are interpolated between tone `10`
and the contrast-safe tone `35`. These bridge tones still do not promise white-text contrast; their
job is to reduce the visual jump into vivid.

The interpolation space is profile-specific. Reference profiles keep the previous HSL behavior so
they remain useful comparison baselines. Commercial auto-fit profiles interpolate this bridge in
OKLCH, which keeps the bridge in the same perceptual foundation used by their generated chromatic
curve.

The bridge is generated from the resolved vivid boundary, not from a forced non-vivid input fit. This
keeps `K30` from becoming a collision point between a preserved input color and the `K35` contrast
rule.

The bridge uses emitted-step progress, not numeric tone distance. For example, the distance from
`30` to `35` in `Kiskadee Official (33)` is treated as one visual step, even though the numeric
tone jump is five positions. This keeps the curve spacing visually balanced when the distribution
uses uneven numeric gaps.

The vivid range now follows the same emitted-step principle. `K35`, `K40`, `K45`, and the remaining
vivid slots are resolved as neighboring emitted steps instead of using raw numeric tone distance.
This avoids switching from the bridge's visual-step ruler to a numeric-tone ruler at exactly `K35`.

The current commercial vivid rule uses `lightnessProgressGamma: 1.1`. This deliberately softens the
first vivid step so `K35 -> K40` does not carry a much larger OKL lightness and contrast jump than
`K30 -> K35`. Each vivid slot is still clamped to the maximum OKL lightness that satisfies the
active contrast target.

## Minimum Lightness Step Experiment

The current commercial auto-fit profiles also enforce a minimum OKL lightness step between
neighboring emitted Kiskadee slots after the contrast guard and pre-vivid bridge have run. The rule
is intentionally simple: one default threshold for the full chromatic scale. It does not define
separate light, medium, dark, luminous-medium, or luminous-dark categories.

Current experimental thresholds:

- every chromatic target from the first non-cap slot through the last non-cap slot uses at least
  `1.5` OKL lightness points from the previous emitted slot;
- the transition from absolute `K0` into `K1` also uses the active spacing threshold so the first
  chromatic color does not visually merge into white;
- `K100` remains an absolute dark cap; the `K95 -> K100` jump is a cap transition and is not used as
  a chromatic-spacing target.

This rule measures OKL lightness delta in the commercial OKLCH profiles, not contrast ratio. Its job
is to reduce visually compressed ramps where adjacent slots look like a single gradient. The contrast
rule still decides whether vivid tones are safe for the active foreground target.

The rule is intentionally experimental and reversible. In auto-fit profiles without input
preservation, it is allowed to move an emitted slot away from the exact input color because the input
fit is only reported after spacing has finished. `Balanced` is now the scoped exception: its exact
input can locally win over the spacing rule after the functional scale is resolved. `fixed-anchor`
profiles remain the external-reference exception when a known slot must survive unchanged.

## Luminous Chroma Ramp Experiment

The commercial OKLCH profiles also have a luminous-only chroma ramp for the first light slots. This
replaces the earlier luminous lightness exception that forced `2` OKL lightness points through
`K16`.

The old lightness exception helped avoid foggy light ramps, but very saturated yellow showed a new
failure mode: sRGB gamut fitting reduced `K1` chroma heavily, then allowed `K2` and `K3` to jump
toward high chroma too quickly. The result felt over-contrasted and neon in the light range even
though the rest of the `Balanced` scale was working.

Current luminous chroma-ramp thresholds:

- an input is luminous when its contrast against white is less than or equal to `2.4:1`;
- the ramp applies only in OKLCH commercial profiles;
- it runs from the first chromatic slot through `K10`;
- it caps initial chroma at `30%` of the input OKL chroma;
- it eases toward `90%` of the input OKL chroma by `K10`;
- it uses `progressGamma: 0.55` so chroma returns early without recreating the abrupt `K1..K3`
  jump.

This currently catches colors such as yellow, cyan, lime, and orange. Non-luminous colors, including
the reference blue `#0f6cbd`, keep the same lightness and chroma behavior they had before this
experiment.

## Source Scale, Profile, And Output Distribution

The Fluent source scale has 16 official slots. The `Fluent 2 Blue` profile stores those source
colors as curve anchors on the normalized `0..100` curve, with Fluent slot `80` anchored at
normalized position `55`. The output distribution then decides how that curve is sampled.

This means the same Fluent-derived profile can be read in two ways:

- `Fluent 2 Blue` plus `Fluent 2 Official (16)` shows the original Fluent slot language.
- `Fluent 2 Blue` plus `Kiskadee Official (33)` projects the Fluent curve into the official
  Kiskadee slot language.

For guarded vivid tones, the generator preserves the profile's hue and chroma/saturation behavior,
then resolves a contrast-safe lightness range:

1. Generate the provisional scale from the active profile and its structural base tone.
2. Find the highest lightness at the vivid start tone that passes the contrast rule.
3. Rescale only `startTone` through the last non-cap tone by emitted-slot progress from that safe
   lightness down to the final chromatic dark endpoint.
4. Clamp each vivid tone again if its hue and chroma/saturation need a lower lightness to pass.
5. If configured, interpolate the pre-vivid bridge from the preserved light range into the safe vivid
   start.
6. If configured, enforce the minimum lightness step threshold in the profile's interpolation space,
   using the same threshold for the full chromatic range.
7. If configured, cap the initial chroma ramp for luminous OKLCH inputs.
8. If configured, preserve the exact input hex at the nearest legal chromatic fit and interpolate
   the surrounding curve through that point.
9. If configured, apply the node continuity guard to smooth structural seams such as `K10` and
   `K35`.
10. Resolve the input color's displayed fit from the final generated scale.

This makes the vivid track testable while keeping the fine light range stable and using the sparse
middle positions as a transition into vivid.

With the fixed `3:1` vivid experiment, the phrase `contrast-safe` means safe for the active profile
target, not safe for WCAG AA normal text. If a future profile reintroduces `luminousMinRatio`, the
table and UI should show the resolved ratio so the visual result is not mistaken for a universal
accessibility guarantee.

## Current Profiles

- `Fluent 2 Blue` preserves the Fluent reference curve and does not opt into `vividContrast`.
  It uses `fixed-anchor` because Fluent slot `80` is mapped to normalized tone `55`. Changing it
  would make the profile stop being a faithful Fluent reference.
- `Linear Lightness` is the pure baseline. It maps lightness directly from tone position and does not
  opt into `vividContrast`. It uses `seed` so it stays a simple baseline instead of a color-preserving
  recipe.
- `Auto Linear + 3:1 Vivid` keeps the distribution's fine light range linear around the profile base
  tone in OKLCH, uses the distribution's bridge tones as a pre-vivid transition, then applies the
  fixed `3:1` contrast-gated vivid contract from tone `35` onward. Its current dark floor is
  `darkFloorLightness: 26`, which keeps the darkest chromatic slots more colorful and less
  black-adjacent than `Balanced`.
- `Auto Soft Dark + 3:1 Vivid` keeps the auto linear lightness model and vivid guard, but bends
  OKL chroma down only after the profile base tone. Its current default lightness controls are
  `lightCeilingLightness: 98.8`, `darkFloorLightness: 20`, `lightLightnessGamma: 1.2`, and
  `darkLightnessGamma: 0.95`: the light gamma gives `K1..K10` more individuality than the previous
  one-point linear ramp, while the shared `1.5` lightness-spacing guard prevents the middle and dark
  chromatic slots from collapsing into a soft gradient. The dark floor keeps `K95` visibly chromatic
  before the absolute `K100` black cap. Its current dark chroma target is `darkMinRatio: 0.25`,
  chosen as an experiment to move the final dark slots closer to Fluent's softer low-chroma dark
  behavior without copying Fluent's exact colors. It is also the only current profile with input
  preservation enabled: the exact input hex becomes a local anchor after the structural scale is
  resolved. For now, the light-zone boundary is `K10`. `Balanced` also guards the `K10` and `K35`
  seams with the node continuity rule so preserved inputs and contrast boundaries do not create
  abrupt local jumps.
- `Auto Mid Peak + 3:1 Vivid` keeps the vivid guard, but uses the profile base tone as the
  chroma peak. Chroma bends down toward both the light and dark ends of the scale. It now shares the
  healthy `darkFloorLightness: 20` endpoint with `Balanced`, but still needs a follow-up calibration
  pass once the new `Balanced` dark-chroma experiment stabilizes.

The guarded profile is experimental. It exists so the lab can show the visual cost and benefit of
making `vivid` a real foreground-safe contract instead of only a numeric range.

## Commercial Profile Names

The auto-fit experimental profiles have UI-facing commercial names in addition to their technical
labels:

- `Striking` maps to `Auto Linear + 3:1 Vivid`.
- `Balanced` maps to `Auto Soft Dark + 3:1 Vivid`.
- `Sophisticated` maps to `Auto Mid Peak + 3:1 Vivid`.

These names are display labels only. The technical profile labels and ids remain the stable
implementation language until the lab promotes a final naming contract.

`Balanced - Auto Soft Dark + 3:1 Vivid` is the current default profile shown when the lab UI loads.

## OKLCH-Shaped Vivid Profiles

The commercial vivid profiles use the OKLCH generation engine documented in
`oklch-generation-engine.md`. They still derive lightness from the same auto linear model used by
`Auto Linear + 3:1 Vivid`; only OKL chroma changes before the contrast guard is applied.

- `Auto Soft Dark + 3:1 Vivid` leaves tones at or above the light side unchanged, then reduces
  chroma from the profile base tone toward the dark end. The current dark endpoint uses
  `darkMinRatio: 0.25`, intentionally closer to Fluent's low-chroma dark behavior.
- `Auto Mid Peak + 3:1 Vivid` reduces chroma toward both ends, making the profile base tone the top
  of the chroma curve. Its exact relationship to `Balanced` is provisional until the balanced
  dark-chroma experiment is validated across practical colors.

These profiles are intended as visual experiments, not final Kiskadee contracts. They let the lab
compare a strict linear chroma baseline against curves that feel closer to design systems whose
deep tones are less chromatic than their middle tones.

## UI Reading

Swatch labels use one visual reading rule across every profile: white text appears on the first
emitted slot that reaches `3:1` contrast against white, and on every darker slot after that. Earlier
slots use dark text. This does not change the generated colors; it only makes the visual scale
comparison use the same white-text threshold for every tonal profile.

Swatch labels do not use text shadow. The lab is meant to reveal the raw relationship between the
foreground label color and the generated background color; shadows would make weak contrast look more
comfortable than it really is.

The comparison table shows generated HSL for quick familiarity, generated OKLCH for the active
commercial engine, and `OKL L delta` as the OKL lightness difference from the previous emitted slot.
This is the same lightness-step dimension used by the commercial minimum lightness step experiment,
not a contrast-ratio measurement.

The curve chart excludes `K0` and `K100` because those slots are absolute caps rather than generated
chromatic colors. The scale strip and comparison table still show them so cap behavior remains
visible. In the comparison table, their vivid-guard status is reported as `absolute cap` instead of
`pass` or `fail`.

The curve chart uses the OKLCH plane: horizontal position is OKL lightness and vertical position is
OKL chroma. This makes the chart useful for judging the commercial OKLCH profiles while still
keeping the reference profiles visible as comparison curves.
