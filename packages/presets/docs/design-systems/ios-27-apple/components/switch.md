# iOS 27 Apple Switch Evidence

This file records the recipe in `components/switch.schema.ts`.

## Sources

- [iOS and iPadOS 27: Toggles](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24690)
  - file key: `GeO2lMY65IAFczDmjs6oei`; page `507:24690`; component set `29:56814`.
  - Idle off/on: `27:68922`, `27:68905`; disabled off/on: `10456:1252`, `10456:1256`.
  - Pressed off/on: `10456:1236`, `10456:1240`.
  - Dark examples: `5433:20196`, `5433:20197`; Light examples: `5433:19060`, `5433:20192`.
- [Apple HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles)
- [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Approved Apple tonal mapping](../colors/figma-to-kiskadee.json)

## Source Coverage

| Source area | Inspected | Status |
| --- | --- | --- |
| Switch component set | Idle, Pressed, On/Off, enabled/disabled | Official adapted |
| Light/Dark examples | Semantic variable definitions and rendered appearance | Official adapted |
| Native Idle dimensions | 64 x 28 track, 38 x 24 knob, 2 px inset | Official exact |
| Pressed glass knob | 58 x 38, outside track, material layers and specular effects | Deferred |
| Other existing scales | Five-size Kiskadee ramp | Kiskadee extension |
| Darker, vivid surface and Low emphasis | No equivalent Apple matrix | Kiskadee extension |

## Official Contract

The normal switch is a capsule with a white Idle knob. Its checked track uses Apple Green;
its unchecked track uses Labels/Tertiary. The component set exposes a 50% group opacity when
disabled and no independent Hover or Focus paint. A pressed enabled knob expands and becomes
Liquid Glass; disabled pressed examples retain the Idle geometry.

The HIG places the switch form in a list row, uses green by default, and permits an application
accent when necessary. The boolean state remains distinguishable by thumb position. Kiskadee's
existing row composition, headless semantics and interaction motion remain authoritative.

## Color And Token Provenance

| Source concept | Official Light / Dark | Lookup | Kiskadee mapping | Rationale |
| --- | --- | --- | --- | --- |
| Accents/Green | `#34c759` / `#30d158` | reference: `greenLike vivid +0` on L/D | Neutral selected track | Approved Green functional reference; Dark is an adapted tonal value |
| Accents/Blue | `#0088ff` / `#0091ff` | reference: `switch.primary vivid +0` on L/D | Primary selected track | HIG permits app accent |
| Labels/Tertiary | `#3c3c43` at 30% / `#ebebf5` at 30% | exact: neutral L70/D95 at 30% | Off track | Approved mapping yields `#3d3d3f` / `#ebebee`; preserves theme-specific alpha |
| White knob | `#ffffff` | cap: neutral Light L0 | Medium thumb | Physical light endpoint in every theme |
| Labels/Primary | black / white | cap: neutral L100/D100 | Optional label | Theme-aware content, independent of control intent |
| Accents/Red | `#ff383c` / `#ff4245` | reference: `redLike vivid +0` | Polarity off track | Kiskadee extension, explicitly semantic |

The preset remains on its established `c()` / `c.ref()` resolver. No primitive asset, seed,
source mapping, or global color role is changed. Darker deliberately reuses Dark control values;
its surrounding base surfaces are defined independently by Card.

## Kiskadee Mapping

| Appearance | Relationship | Status | Decision |
| --- | --- | --- | --- |
| Neutral Medium onSubtle | Native green switch | Official adapted | Source Idle geometry and semantic colors |
| Primary Medium onSubtle | App-accent switch | Official adapted | Blue replaces Green through the same recipe |
| Polarity Medium onSubtle | Red off / Green on | Kiskadee extension | Position still communicates the boolean state |
| Low onSubtle | Reduced surface emphasis | Kiskadee extension | Off rail at 15%; selected rail at 20% of role vivid, selected thumb uses role vivid |
| onVivid Medium/Low | Control over the canonical vivid canvas | Kiskadee extension | White rails/knobs and a darker role-colored selected knob |
| Optional thumb icons | Existing composition affordance | Kiskadee extension | Shared 8/10/12/16/20 px icon catalog references |

## Shared Formula And State Ownership

- `e1` owns selection and disabled state. Track, thumb and icon deltas use `{ ref: ... }`.
- Native Medium has stable Idle paints. Hover and Focus add no palette rule. Existing external
  focus and activation feedback remain available; no flat color claims to reproduce pressed glass.
- Disabled uses per-element colors, because the palette cannot express a selected-disabled color
  submap or group opacity. Track becomes a 15% tertiary neutral, thumb becomes 50% white, and labels
  use tertiary. This **Official adapted** treatment intentionally preserves selected position while
  neutralizing the disabled rail; it is not a pixel-exact rendering of Apple's 50% group opacity.
- Low disabled rail uses tertiary at 10%. Disabled icon colors remain subordinate to the thumb.
- OnVivid Medium uses white rail 32% off / 100% on; Low uses 16% / 72%. The selected thumb uses
  the role's Light `vivid +8`; the selected Low rail is 72% white so even Green retains at
  least 3:1 contrast against the composited rail on the canonical Primary canvas. Labels stay white.
- OnVivid disabled rails use white 12% (Medium) or 8% (Low), thumbs 50%, labels/icons 30%.
- Repeated Rest-equal Hover/Focus/Pressed/Selected entries were removed. Every explicit selected
  delta changes that slot. No component palette masks keyboard focus.

## Geometry And Deferred Capabilities

The existing Medium dimensions match the inspected iOS 27 Idle source and remain unchanged.
Smaller and larger dimensions are retained as documented framework scaling, not iOS measurements.
The optional icon ramp remains catalog-owned. `controlTextVisibility: none` matches the standard
Apple presentation; the label is the row's contextual text.

The native Pressed expansion, refraction and specular material are **Deferred**. The existing
motion and halo are Kiskadee feedback, not Liquid Glass. No Builder, runtime, Sass or new component
capability is introduced.

## Validation

- Figma design context and Light/Dark variable definitions inspected on 2026-09-07.
- Focused regression coverage verifies tonal references, sparse parent-owned states, all three
  themes and both Surface Context palettes.
- Generated artifacts and rendered composition are validated with the integrated preset.

## Open Gaps

Pressed Liquid Glass and exact selected-disabled group compositing remain deferred as described
above. Web icons remain the preset's explicitly named SF Symbols fallback.
