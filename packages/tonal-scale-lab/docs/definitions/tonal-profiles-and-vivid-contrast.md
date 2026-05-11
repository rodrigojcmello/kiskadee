# Tonal Profiles And Vivid Contrast

This lab separates tonal profiles from scale distributions.

- A tonal profile is the stored recipe for turning one input color into a color curve.
- A scale distribution defines which public slots are emitted for that curve.

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
  `minRatio: 4.5`.

This follows the WCAG 2.2 Contrast (Minimum) AA threshold for normal text. The profile uses the
contrast formula based on relative luminance, not HSL lightness. HSL lightness remains useful for
editing the curve, but it does not describe perceived luminance well enough to define accessibility.

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

## Current Profiles

- `Fluent 2 Blue` preserves the Fluent reference curve and does not opt into `vividContrast`.
  Changing it would make the profile stop being a faithful Fluent reference.
- `Linear Lightness` is the pure baseline. It maps lightness directly from tone position and does not
  opt into `vividContrast`.
- `Linear + WCAG Vivid` keeps the distribution's fine light range linear, uses the distribution's
  bridge tones as a pre-vivid transition, then applies the contrast-gated vivid contract from tone
  `35` onward.

The guarded profile is experimental. It exists so the lab can show the visual cost and benefit of
making `vivid` a real foreground-safe contract instead of only a numeric range.

## UI Reading

When a profile has `vividContrast`, swatch labels intentionally use dark text before the vivid start
and white text from the vivid start onward. This mirrors the profile contract instead of picking the
most legible foreground for every tone.
