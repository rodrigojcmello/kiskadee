# Tonal Profiles And Vivid Contrast

This lab separates tonal profiles from scale distributions.

- A tonal profile is the stored recipe for turning one input color into a color curve.
- A scale distribution defines which public slots are emitted for that curve.
- An input strategy defines how the user-provided color is placed into the curve before the rest of
  the scale is generated.

## Current Distributions

- `Kiskadee Official (33)` has 33 generated chromatic slots plus fixed `0` and `100` anchors. Its
  subtle track is `0..10`, then `12`, `14`, `16`, `18`, `20`, `22`, `24`, `26`, `28`, and `30`.
- `Fluent 2 Official (16)` has the official Fluent public slots:
  `10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160`.
- `Kiskadee Legacy (31)` preserves the earlier lab distribution. Its subtle track is `0..15`,
  `20`, `25`, and `30`.
- The Kiskadee distributions use the same vivid track:
  `35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100`.

The numeric split alone does not prove that a tone is visually or functionally vivid. It only
defines the two scale tracks. A tonal profile may add a stronger vivid contract when it wants the
vivid track to be safe for foreground text.

## Contrast-Gated Vivid

A profile can opt into `vividContrast`. When enabled, the lab treats vivid as a functional track:

- tones below the configured `startTone` are not contrast-corrected;
- tones from `startTone` through `100` must meet the configured contrast ratio against the configured
  foreground;
- the current experimental rule uses `startTone: 35`, `foregroundHex: '#ffffff'`, and
  `minRatio: 4.5`;
- for luminous input colors, the current experimental rule may soften the active target down to
  `luminousMinRatio: 3`.

The upper target follows the WCAG 2.2 Contrast (Minimum) AA threshold for normal text. The softened
`3:1` target follows the WCAG threshold used for large text and graphical objects, and is only an
experimental expressive-color compromise. The profile uses the contrast formula based on relative
luminance, not HSL lightness. HSL lightness remains useful for editing the curve, but it does not
describe perceived luminance well enough to define accessibility.

The active contrast target is resolved per input color by clamping the input color's contrast against
the configured foreground between `luminousMinRatio` and `minRatio`. This keeps blue/red/green colors
that can naturally support a stronger vivid contrast near `4.5:1`, while preventing yellow, orange,
and cyan ramps from becoming brown or overly dark at the first vivid slot.

The auto-anchor gate and the vivid contrast target are intentionally different decisions. The current
auto-anchor placement still uses the stronger `minRatio` as the gate for deciding whether an input
color belongs inside the vivid range. The adaptive target is only used after placement, when the
profile resolves how dark the protected vivid tones need to become. This lets a luminous orange stay
anchored before vivid while still allowing `K35` to be expressive instead of collapsing into brown.

## Input Strategies

Profiles must make the role of the input color explicit:

- `seed` treats the input as the hue/saturation source. The profile decides the lightness at the
  base tone, so the exact input color is not guaranteed to appear in the emitted scale.
- `fixed-anchor` preserves the input at the profile's configured base tone. This is useful when the
  profile represents an external reference scale and the reference color has a known slot.
- `auto-anchor` places the input in the emitted distribution according to its contrast behavior.
  Colors that do not meet the vivid white-text contrast threshold are placed before `35`; colors
  that do meet it are placed in the vivid range according to their white contrast.

The current auto-anchor rule uses the WCAG contrast ratio against white as the primary gate. If the
input does not reach the vivid threshold, it cannot be placed in the vivid range, even if its HSL
lightness looks like a middle color. This matters for luminous hues such as yellow and cyan: they
can have a medium HSL lightness while still being too bright for white foreground text.

When a non-vivid input color lands inside the pre-vivid bridge, the bridge is split around that
anchor. This keeps the input color intact while still connecting the preserved light/subtle range to
the contrast-safe vivid start. When a vivid input color lands inside the vivid range and already
passes the contrast rule, the vivid range is split around that anchor too, so the contrast guard does
not unnecessarily replace the original color.

## Color Findings

The current model came from comparing the same profile across darker and more luminous hues.

- Blue, red, and many greens tolerate a strong white-text contrast target without losing their
  recognizable hue family.
- Yellow, orange, and cyan are much more sensitive to forced darkening. When a yellow or orange ramp
  is pushed to `4.5:1` against white at the first vivid tone, it often reads as brown rather than as
  a vivid version of the original color.
- HSL lightness is not enough to classify this behavior. A color can look like a middle HSL value
  while still having high relative luminance.
- `vivid` should therefore be treated as an expressive color track, not as a guaranteed alias for
  normal-text foreground safety in every hue family.
- Foreground safety is still measured and displayed, but the expressive profiles intentionally allow
  the vivid target to soften for luminous colors.

Two example observations currently define the adaptive behavior:

- `#388e4a` resolves to `K30`; the adaptive vivid target stays close to the input's white contrast,
  and `K35` remains visually green.
- `#ff990a` also resolves to `K30`; a fixed `4.5:1` vivid target makes the first vivid tone feel
  brown, so the adaptive target softens toward `3:1` and keeps `K35` orange.

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

The bridge uses emitted-step progress, not numeric tone distance. For example, the distance from
`30` to `35` in `Kiskadee Official (33)` is treated as one visual step, even though the numeric
tone jump is five positions. This keeps the curve spacing visually balanced when the distribution
uses uneven numeric gaps.

## Source Scale, Profile, And Output Distribution

The Fluent source scale has 16 official slots. The `Fluent 2 Blue` profile stores those source
colors as curve anchors on the normalized `0..100` curve, with Fluent slot `80` anchored at
normalized position `55`. The output distribution then decides how that curve is sampled.

This means the same Fluent-derived profile can be read in two ways:

- `Fluent 2 Blue` plus `Fluent 2 Official (16)` shows the original Fluent slot language.
- `Fluent 2 Blue` plus `Kiskadee Official (33)` projects the Fluent curve into the official
  Kiskadee slot language.

For guarded vivid tones, the generator preserves hue and saturation, then resolves a contrast-safe
lightness range:

1. Generate the scale from the active profile.
2. Find the highest lightness at the vivid start tone that passes the contrast rule.
3. Rescale only `startTone..100` from that safe lightness down to the final dark endpoint.
4. Clamp each vivid tone again if its hue/saturation needs a lower lightness to pass.
5. If configured, interpolate the pre-vivid bridge from the preserved light range into the safe vivid
   start.

This makes the vivid track testable while keeping the fine light range stable and using the sparse
middle positions as a transition into vivid.

With adaptive vivid, the phrase `contrast-safe` means safe for the active profile target, not always
safe for WCAG AA normal text. If a profile sets `luminousMinRatio`, the table and UI should show the
resolved ratio so the visual result is not mistaken for a universal accessibility guarantee.

## Current Profiles

- `Fluent 2 Blue` preserves the Fluent reference curve and does not opt into `vividContrast`.
  It uses `fixed-anchor` because Fluent slot `80` is mapped to normalized tone `55`. Changing it
  would make the profile stop being a faithful Fluent reference.
- `Linear Lightness` is the pure baseline. It maps lightness directly from tone position and does not
  opt into `vividContrast`. It uses `seed` so it stays a simple baseline instead of a color-preserving
  recipe.
- `Auto Linear + Adaptive Vivid` keeps the distribution's fine light range linear around the resolved
  input anchor, uses the distribution's bridge tones as a pre-vivid transition, then applies the
  adaptive contrast-gated vivid contract from tone `35` onward.
- `Auto Soft Dark + Adaptive Vivid` keeps the auto linear lightness model and vivid guard, but bends
  saturation down only after the resolved input anchor. This is the closest experiment to Fluent's
  softer dark blues while preserving a linear light side.
- `Auto Mid Peak + Adaptive Vivid` keeps the vivid guard, but uses the resolved input anchor as the
  saturation peak. Saturation bends down toward both the light and dark ends of the scale.

The guarded profile is experimental. It exists so the lab can show the visual cost and benefit of
making `vivid` a real foreground-safe contract instead of only a numeric range.

## Saturation-Shaped Vivid Profiles

The saturation-shaped vivid profiles still derive lightness from the same auto linear model used by
`Auto Linear + Adaptive Vivid`; only saturation changes before the contrast guard is applied.

- `Auto Soft Dark + Adaptive Vivid` leaves tones at or above the light side unchanged, then reduces
  saturation from the resolved input anchor toward the dark end.
- `Auto Mid Peak + Adaptive Vivid` reduces saturation toward both ends, making the resolved input anchor
  the top of the saturation curve.

These profiles are intended as visual experiments, not final Kiskadee contracts. They let the lab
compare a strict linear saturation baseline against curves that feel closer to design systems whose
deep tones are less chromatic than their middle tones.

## UI Reading

When a profile has `vividContrast`, swatch labels intentionally use dark text before the vivid start
and white text from the vivid start onward. This mirrors the profile contract instead of picking the
most legible foreground for every tone.

Swatch labels do not use text shadow. The lab is meant to reveal the raw relationship between the
foreground label color and the generated background color; shadows would make weak contrast look more
comfortable than it really is.
