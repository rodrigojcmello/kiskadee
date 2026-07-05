# Carbon Switch Evidence

This file records the source evidence and schema decisions for the Carbon Switch
mapping in `packages/presets/src/presets/carbon-ibm/components/switch.schema.ts`.

## Sources

- Figma small Switch reference:
  [IBM Carbon Design System Community, node 2599:187956](https://www.figma.com/design/52HHpBaYAUdDKqAdH5vw8Y/IBM-Carbon-Design-System--Community-?node-id=2599-187956&t=qLbIokpcDKtcJ79I-4)
- Official Toggle documentation:
  [Carbon Toggle usage](https://carbondesignsystem.com/components/toggle/usage/)
- Official React Storybook iframe inspected for Gray 100:
  [components-toggle--default, theme g100](https://react.carbondesignsystem.com/iframe.html?id=components-toggle--default&viewMode=story&globals=theme:g100)

## Local Evidence

- Figma small Switch node:
  `packages/presets/docs/design-systems/carbon-ibm/evidence/switch/figma-small-switch.png`
- Official site Gray 100 Toggle:
  `packages/presets/docs/design-systems/carbon-ibm/evidence/switch/carbon-toggle-gray-100.png`

![Figma small Switch](../evidence/switch/figma-small-switch.png)

![Official Carbon Toggle Gray 100](../evidence/switch/carbon-toggle-gray-100.png)

## Figma-Derived Decisions

The Figma small Switch reference defines the compact Carbon size used by
Kiskadee as `s:sm:1`:

- track: `32 x 16`
- track radius: pill radius `8`
- thumb: `10 x 10`
- thumb radius: pill radius `5`
- thumb inset: `3`
- selected track: `#24A148`
- unselected track: `#8D8D8D`
- disabled track: `#C6C6C6`
- light text: `#161616`
- disabled text: `#C6C6C6`
- focus color: `#0F62FE`

## Additional Toggle Figma Reference

An older extraction inspected the larger Carbon `Toggle` frame:

- [IBM Carbon Design System Community, node 2598:187999](https://www.figma.com/design/52HHpBaYAUdDKqAdH5vw8Y/IBM-Carbon-Design-System--Community-?node-id=2598-187999)
- file key: `52HHpBaYAUdDKqAdH5vw8Y`
- node id: `2598:187999`
- frame: `Toggle`
- inspected on: 2026-06-05

That reference exposes six state symbols: `Toggle State=True|False` across
`State=Default|Active|Disabled`. Kiskadee maps `Toggle State=True` to selected
Switch state and `Toggle State=False` to unselected Switch state.

Extracted values from that larger Toggle reference:

| Carbon token | Value | Kiskadee usage |
| --- | --- | --- |
| `support/support-success` | `#24A148` | selected/on track |
| `miscellaneous/toggle-off` | `#8D8D8D` | unselected/off track |
| `button/button-disabled` | `#C6C6C6` | disabled track |
| `icon/icon-on-color` | `#FFFFFF` | enabled thumb |
| `icon/icon-on-color-disabled` | `#8D8D8D` | disabled thumb |
| `text/text-primary` | `#161616` | enabled control text |
| `text/text-secondary` | `#525252` | enabled label |
| `text/text-disabled` | `#C6C6C6` | disabled label and control text |
| `focus/focus` | `#0F62FE` | global focus color |

Geometry from that reference:

| Part | Value |
| --- | ---: |
| Toggle visual | `48 x 24` |
| Thumb | `20 x 20` |
| Track radius | `12` |
| Thumb radius | `10` |
| Track padding | `2` |
| Control text gap | `8` |
| Focus ring | `2px` outline with `1px` offset |

Typography from that reference:

| Figma style | Value | Kiskadee element |
| --- | --- | --- |
| `productive / label-01` | IBM Plex Sans regular, `12 / 16` | `e4` label |
| `body/body-compact-01` | IBM Plex Sans regular, `14 / 18` | `e5` control text |

## Site-Derived Decisions

The official Toggle docs expose a Gray 100 theme that was not available in the
inspected Figma node. The inspected Gray 100 treatment uses:

- background: `#161616`
- value/control text: `#F4F4F4`
- label text: `#C6C6C6`
- selected track: `#42BE65`
- default large Toggle track: `48 x 24` with pill radius `12`

Kiskadee registers this dark-surface treatment in two equivalent places:

- `default.light`: `switch.neutral.low`
- `default.dark`: `switch.neutral.medium`

This is a preset-authored palette equivalence for Carbon, not a generic
automatic inversion rule.

## Adaptations

- Carbon's Figma Toggle has an optional field label above the control. The
  current Kiskadee Switch primitive only has an inline `label`, so `e4` uses the
  Carbon label typography/color as the closest supported representation.
- Carbon's Figma `Toggle + Text` places the visual toggle before the `On`/`Off`
  text. The current Kiskadee `controlText` feature renders the control text
  before the visual track. The Carbon preset still sets
  `controlTextVisibility: "always"` because this is the closest supported
  mapping for the Carbon state text.
- Carbon's `State=Active` visual is represented by the focus-colored outline in
  the Figma assets. Kiskadee maps this through the normal Switch focus ring
  instead of introducing a Carbon-specific active mode.
- The inspected Carbon Toggle does not expose a distinct state-layer reference.
  The Carbon schema opts into component-level `activationFeedback` with the
  shared Switch halo profile for runtime consistency across presets.
- The current Kiskadee Switch color model does not have a `selected:disabled`
  color branch. Carbon's disabled selected visual is approximated through the
  existing disabled and selected cascade until that state exists in the schema
  contract.
