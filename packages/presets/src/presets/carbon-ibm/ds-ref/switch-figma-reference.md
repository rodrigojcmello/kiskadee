# Carbon Switch Figma Reference

## Source

- File: IBM Carbon Design System Community
- URL: https://www.figma.com/design/52HHpBaYAUdDKqAdH5vw8Y/IBM-Carbon-Design-System--Community-?node-id=2598-187999
- File key: `52HHpBaYAUdDKqAdH5vw8Y`
- Node: `2598:187999`
- Frame: `Toggle`
- Frame size: `260 x 271`
- Inspected on: 2026-06-05

## Variant Axes

The inspected frame exposes six symbols:

| Toggle State | State |
| --- | --- |
| `True` | `Default` |
| `False` | `Default` |
| `True` | `Active` |
| `False` | `Active` |
| `True` | `Disabled` |
| `False` | `Disabled` |

Kiskadee maps `Toggle State=True` to `controlState=true` / selected and `Toggle State=False` to
`controlState=false` / unselected.

## Extracted Tokens

The values below came from the Figma variable definitions returned for node `2598:187999`.

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

## Geometry

| Part | Value |
| --- | ---: |
| Toggle visual | `48 x 24` |
| Thumb | `20 x 20` |
| Track radius | `12` |
| Thumb radius | `10` |
| Track padding | `2` |
| Control text gap | `8` |
| Focus ring | `2px` outline with `1px` offset |

The focused/active Figma assets render the `48 x 24` toggle visual inside an image expanded `3px`
outward on each side (`inset: -12.5% -6.25%`). Kiskadee renders the focus indicator through the
shared Switch focus contract, so Carbon uses `focus.width = 2` and `focus.offset = 1` to match that
external `3px` footprint.

## Typography

| Figma style | Value | Kiskadee element |
| --- | --- | --- |
| `productive / label-01` | IBM Plex Sans regular, `12 / 16` | `e4` label |
| `body/body-compact-01` | IBM Plex Sans regular, `14 / 18` | `e5` control text |

Figma also carries letter spacing (`0.32` for label and `0.16` for body compact), but the current
schema does not expose letter-spacing for Switch text elements.

## Kiskadee Adaptation Notes

- Carbon's Figma Toggle has an optional field label above the control. The current Kiskadee Switch
  primitive only has an inline `label`, so `e4` uses the Carbon label typography/color as the closest
  supported representation.
- Carbon's Figma `Toggle + Text` places the visual toggle before the `On`/`Off` text. The current
  Kiskadee `controlText` feature renders the control text before the visual track. The Carbon preset
  still sets `controlTextVisibility: "always"` because this is the closest supported mapping for the
  Carbon state text.
- Carbon's `State=Active` visual is represented by the focus-colored outline in the Figma assets.
  Kiskadee maps this through the normal Switch focus ring instead of introducing a Carbon-specific
  active mode.
- The inspected Carbon Toggle does not expose a state-layer or activation feedback effect. The
  Carbon schema therefore does not opt into `effects.activationFeedback`.
- The current Kiskadee Switch color model does not have a `selected:disabled` color branch. Carbon's
  disabled selected visual is approximated through the existing disabled and selected cascade until
  that state exists in the schema contract.
