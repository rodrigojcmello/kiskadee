# iOS 27 Apple Slider Evidence

This file records the recipe in `components/slider.schema.ts`. The iOS 27 source below supersedes
the provisional iOS 26/macOS 26 color and standard-size provenance.

## Sources

- [iOS and iPadOS 27: Sliders](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24685)
  - file key: `GeO2lMY65IAFczDmjs6oei`; page `507:24685`; component set `7:53847`.
  - Idle 50%: `520:49524`; Disabled 50%: `10456:2247`; Pressed 50%: `10456:2061`.
  - Light examples: `5430:1471`; Dark examples: `5430:2054`, instances `5430:2055`, `5430:2056`.
  - Shared rail: `5428:5456`; fill: `5441:3942`; ticks: `5430:5333`.
  - Idle knob: `520:49468`, visible body `5437:1568`.
- [Apple HIG: Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders)
- [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Build a UIKit app with the new design](https://developer.apple.com/videos/play/wwdc2025/284/?time=1087)
- [Approved Apple tonal mapping](../colors/figma-to-kiskadee.json)

## Source Coverage

| Source area | Inspected | Status |
| --- | --- | --- |
| Standard Slider | Idle and Disabled at 50%, full source variant inventory | Official adapted |
| Light/Dark source colors | Primary fill, secondary labels, quaternary ticks, accents | Official adapted |
| Standard geometry | 6 px rail, 38 x 24 knob, 12 px endpoint gap, 32 px symbol region | Official exact |
| Pressed knob | Enlarged Liquid Glass, shadow, glass and specular layers | Deferred |
| Optional ticks / neutral origin | Native API capability and source ticks | Official adapted |
| Compact scale, range, field labels, tooltip, thumb icon | Existing framework features | Kiskadee extension |
| Darker and onVivid | Framework appearance completion | Kiskadee extension |

## Official Contract

The native slider fills the rail from the leading minimum toward the thumb. End symbols are
optional. Its Idle thumb is opaque white and has no border. The current source defines ticks,
Idle, Pressed and Disabled, with a 50% group opacity for disabled content. Apple also documents
neutral-origin fill and tick configuration in UIKit. The default remains continuous with no marks;
consumers opt into the existing marks/origin features.

## Color And Token Provenance

| Source concept | Official Light / Dark | Lookup | Kiskadee mapping | Rationale |
| --- | --- | --- | --- | --- |
| Fills/Primary | `#787878` at 20% / `#787880` at 36% | exact: neutral L35@20% / D55@36% | `e8` rail | Approved mapping gives `#7b7b7e` / `#7a7a7c`; replaces unrelated black 5% |
| Accents/Blue | `#0088ff` / `#0091ff` | reference: `slider.primary vivid +0`, L/D independently | `e9` fill | Functional reference replaces arbitrary Light tone 50 |
| White | `#ffffff` | cap: neutral Light L0 | `e10` knob | Opaque Idle surface in both native themes |
| Labels/Secondary | `#3c3c43` at 60% / `#ebebf5` at 70% | exact: neutral L70@60% / D95@70% | `e6`, `e7`, `e17` | Source endpoint symbol treatment; adapted supporting text |
| Labels/Quaternary | `#3c3c43` at 18% / `#ebebf5` at 16% | exact: neutral L70@18% / D95@16% | `e15` marks | Source tick variable, alpha retained independently |
| Labels/Primary | black / white | cap: neutral L100 / D100 | Field labels and origin mark | Kiskadee semantic adaptation |
| Labels/Tertiary | `#3c3c43` / `#ebebf5` at 30% | exact: neutral L70/D95@30% | Optional/disabled text | Shared source semantic mapping |

Every exact numeric lookup above comes from the approved local de-para through the preset's
established legacy `c()` resolver. Family-relative paint uses `c.ref()`. No literal schema color
or primitive asset is introduced. Darker uses Dark control values over independently authored
Darker surfaces.

## Kiskadee Mapping And Formula

- `e8` keeps a 6 px rounded rail. `e9` uses the same geometry and the Primary vivid reference for
  Neutral and Primary appearances, matching the conventional accent-filled slider.
- `e10` uses opaque white with no stroke. The shared `s:sm:2` shadow already contains the source
  0/0.5/4 and 0/6/13 layers, each at 12% physical black; it is retained.
- `e11` remains visually empty. An invented inner material is not emitted.
- `e15` uses round 4 px ticks under the rail; `e18` remains the separate 2 x 4 neutral-origin mark.
  Origin identity is an existing Kiskadee adaptation of the documented native neutral origin.
- `e6` retains the source's 32 px standard endpoint region via `global.iconSizes`; the glyph uses
  the preset's explicit Web fallback. The 20 px compact endpoint and 20 x 16 compact thumb are
  framework scaling rather than verified iOS 27 sizes.
- Field labels, value summaries, labels on ticks, helper text, tooltip and optional thumb icon are
  **Kiskadee extensions**. They reuse the shared typography/icon profiles. The white tooltip has a
  dark neutral foreground; thumb icons use dark neutral in every theme because the thumb is white.
- OnVivid uses white fill/thumb, white rail at 30%, white secondary content at 85%, and white marks
  at 60%, over the canonical strong canvas. This is a **Kiskadee extension**, not a native material.

## States And Disabled Adaptation

Idle fill stays stable on Hover/Focus. Pressed glass is deferred; the native/runtime thumb and
focus affordances still communicate interaction. Removed arbitrary darkened/transparent Hover
colors and all Rest-equal Focus or border entries.

`e1` owns whole-control disabled state, so dependent slots use parent references. Disabled rail
and fill use half of their authored alpha; thumb uses 50% white; marks halve their source alpha.
This translates Apple's group opacity into existing per-element palette fields and is **Official
adapted**, not exact compositing of overlapping track/knob pixels. Supporting disabled text uses
source tertiary roles. No selected state is needed for below-track ticks: they remain visible on
both sides and do not change with the active interval.

## Deferred Or Unsupported

- Enabled Pressed Liquid Glass, material refraction/specular layers, and its expanded knob are
  **Deferred**. The normal white knob now maps an actual iOS 27 Idle source and is not described as
  an approximation of glass.
- Exact disabled group compositing is **Deferred**. No Builder/runtime capability is added.
- The Figma row separator is owned by the surrounding list composition; Slider does not duplicate
  that separator inside its component schema.

## Validation

- iOS 27 design context and explicit Dark variables inspected on 2026-09-07.
- Regression coverage checks source rail alpha, functional tint, physical white knob, removal of
  the false border, and three themes / both Surface Contexts.
- Generated artifacts and rendered composition are validated with the integrated preset.

## Open Gaps

Pressed material and exact disabled group compositing remain deferred. Optional content and the
compact scale retain explicitly documented framework adaptations.
