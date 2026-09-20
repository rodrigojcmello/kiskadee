# Carbon Switch Evidence

This records source decisions for `components/switch.schema.ts` in the Carbon preset.

## Sources

- [Preview Toggle guidelines](https://preview.carbondesignsystem.com/building-blocks/core/components/toggle/guidelines) and [specifications](https://preview.carbondesignsystem.com/building-blocks/core/components/toggle/specifications), inspected 2026-09-20; Stable with feature flag, updated 2026-08-19.
- [Official Toggle Sass](https://github.com/carbon-design-system/carbon/blob/main/packages/styles/scss/components/toggle/_toggle.scss).
- User-provided [Carbon v11 Figma](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/-v11--Carbon-Design-System--Community-?node-id=58-2763): file key `MfGzFa79SfhHQ2mKpC3ss4`, entry node `58:2763`; shared token capture in [figma-theme-tokens.json](../colors/figma-theme-tokens.json).
- Historical small [Figma node 2599:187956](https://www.figma.com/design/52HHpBaYAUdDKqAdH5vw8Y/IBM-Carbon-Design-System--Community-?node-id=2599-187956), file key `52HHpBaYAUdDKqAdH5vw8Y`. Its old large-thumb and dark-color interpretations are superseded by the current source above.

## Source Coverage

| Source area | Inspected | Status |
| --- | --- | --- |
| Standard and small Toggle, on/off, disabled, read-only | Preview specification and official implementation | Official adapted |
| Reduced label spacing feature flag | Preview guideline and Sass flag | Official adapted |
| Primary and Polarity intents, onVivid | Existing Kiskadee API | Kiskadee extension |
| Future v12 redesign beyond documented flag | Announcement only | Deferred |

## Official Contract

Carbon's default Toggle uses a gray off track and **green** support-success on track. It has no
separate Hover or Pressed color delta; focus is an outline. Read-only retains readable content,
uses a transparent track with an outline and a primary-color thumb. Disabled has dedicated track,
thumb, label and state-text tokens.

| Part | Small | Default |
| --- | --- | --- |
| Track | 32 x 16 | 48 x 24 |
| Thumb | 10 x 10 | 18 x 18 |
| Visual inset | 3 | 3 |
| Pill radius, track / thumb | 8 / 5 | 12 / 9 |
| Label and control-text gap | 8 | 8 |

The current preview/code default thumb is 18px, replacing the earlier Kiskadee 20px extraction.
The recommended v12 feature flag reduces the label/container gap from 16px to 8px. Kiskadee's
existing horizontal label slots apply that 8px spacing on both sides; the preset does not introduce
a new vertical label layout. Label typography is IBM Plex Sans Regular 12/16, state text 14/18.

## Color And Token Provenance

All colors use the strict Carbon resolver. Each exact token includes `source.tokens` evidence;
physical endpoints and their alpha variants use cap locators. Full source aliases, generated
values, alpha and distances are in [token-mapping.json](../colors/token-mapping.json).

| Source token | Light source -> generated | Dark source -> generated | Darker source -> generated |
| --- | --- | --- | --- |
| toggle-off | #8d8d8d -> L28 #8c8c8c | #8d8d8d -> D65 #8a8a8a | #6f6f6f -> D50 #727272 |
| support-success | #24a148 -> L30 #3f9a53 | #42be65 -> D75 #63b672 | #42be65 -> D75 #63b672 |
| button-disabled | #c6c6c6 -> L14 #c2c2c2 | #6f6f6f -> D50 #727272 | #525252 -> D30 #4f4f4f |
| icon-on-color | #ffffff -> cap light | #ffffff -> cap light | #ffffff -> cap light |
| icon-on-color-disabled | #8d8d8d -> L28 #8c8c8c | #ffffff40 -> cap light 25.1% | #ffffff40 -> cap light 25.1% |
| text-secondary | #525252 -> L60 #4f4f4f | #c6c6c6 -> D85 #c5c5c5 | #c6c6c6 -> D85 #c5c5c5 |
| text-primary | #161616 -> L95 #161616 | #f4f4f4 -> D99 #fbfbfb | #f4f4f4 -> D99 #fbfbfb |

Text-disabled preserves the source token's 25.1 percent alpha over the corresponding primary
neutral. The read-only outline follows icon-disabled as in the official Sass; the overview's
border-subtle shorthand is not used to replace the inspected implementation value.

## Kiskadee Mapping

| Appearance | Upstream relationship | Status |
| --- | --- | --- |
| Neutral Medium onSubtle | Standard Carbon Toggle | Official adapted |
| Primary Medium onSubtle | Blue activation using button-primary; neutral off track | Kiskadee extension |
| Polarity Medium onSubtle | support-error off, support-success on | Kiskadee extension |
| All onVivid | White track/colored thumb inversion | Kiskadee extension |

The canonical Core intent is `primary`; no unsupported `accent` intent or new public option is
introduced. Old Light neutral.low represented an implicit dark surface. Explicit onVivid and
theme palettes now carry that responsibility; Medium is the standard emphasis across contexts.

On vivid backgrounds the off track uses physical white at 40 percent, selected track is white,
and the selected thumb carries the intent's Light action color. Polarity also colors the off
thumb red. Disabled track/thumb/text use white at 16/32/25 percent. This authored inversion keeps
the binary state visible without claiming an upstream chromatic-surface token.

## State And Geometry Ownership

- `e1` owns interaction state; all e2-e6 changes are parent references.
- `e2` is the track. Its transparent 1px resting border reserves the existing read-only outline;
  compensated padding preserves the 3px visual inset.
- `e3` is the thumb. There is no shrink effect or invented Hover/Pressed tint.
- `e4` is the accessible label; `e5` the optional state text; `e6` the optional thumb icon.
- Read-only values remain explicit when equal to Rest on vivid surfaces: they reset the selected
  thumb and icon colors. Disabled values similarly suppress selected state.
- Global focus uses the existing 2px ring with 1px offset. The existing optional halo activation
  effect is preserved as a Kiskadee extension; it does not invent interaction color states.
- Compact selects 32 x 16; Regular and Spacious select 48 x 24, the largest official recipe.
  Rounded and square remain optional framework radius choices; Pill is the Carbon default.

## Local Historical Evidence

- [Earlier small Switch capture](../evidence/switch/figma-small-switch.png).
- [Earlier official Gray 100 capture](../evidence/switch/carbon-toggle-gray-100.png).

## Validation

Factory resolution covers three canonical intents in Light, Dark and Darker and both surface
contexts. Focused typechecking reports no Switch-file errors. Generated-artifact and browser
validation belong to the coordinated preset completion pass.
