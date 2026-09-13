# Material Design 3 Google Switch Evidence

This document records the source evidence and the schema decisions for
`packages/presets/src/presets/material-3-google/components/switch.schema.ts`.

## Sources

- [Material 3 Design Kit Community](https://www.figma.com/design/Peqe9lNMsuQHLIUZsiTZNg/Material-3-Design-Kit--Community-?node-id=54446-25289), file key `Peqe9lNMsuQHLIUZsiTZNg`, page `Switch`, component set node `54446:25289`; inspected 2026-09-13.
- [Material 3 Switch overview](https://m3.material.io/components/switch/overview); the page is client-rendered, so the Android Compose reference below is the executable official documentation used for the behavioral contract.
- [Android Compose Material 3 Switch](https://developer.android.com/develop/ui/compose/components/switch?hl=en) and [Switch API](https://developer.android.com/reference/kotlin/androidx/compose/material3/Switch.composable).
- Local fallback: [Fluent 2 Microsoft Switch evidence](../../fluent-2-microsoft/components/switch.md).

The Figma set exposes `Selected=True|False`, `State=Enabled|Hovered|Focused|Pressed|Disabled`,
and `Icon=True|False` (20 variants). The official Compose contract confirms a checked/unchecked
thumb and track, an enabled flag, and optional thumb content. Kiskadee keeps those concepts in
the existing switch contract; it does not add a new runtime capability.

## Coverage status

| Area | Status | Decision |
| --- | --- | --- |
| Track and handle geometry | **Official exact** | Preserve the source `52 x 32` component, 2px stroke, 4px inset, 24px selected handle, 16px rest shrink, and 16px icon viewport. |
| Enabled, hover, focus, pressed, disabled | **Official adapted** | The source state layers are expressed as sparse state maps. Pressed geometry remains the stable 24px carrier because the existing contract has no state-specific geometry. |
| Selected precedence | **Official adapted** | Selected track removes the unchecked stroke. On vivid surfaces, selected states reset the inherited white hover/pressed overlays. |
| Light and dark on subtle | **Official adapted** | Figma tonal values are resolved through the Material tonal families and the approved Kiskadee blue, red, green, and tinted neutral assets. |
| Light and dark on vivid | **Kiskadee extension** | Fluent's existing on-vivid treatment supplies white caps and selected-state precedence while retaining the Material geometry. |
| `neutral` and `polarity` intents | **Kiskadee extension** | `neutral` uses the mapped `switch.neutral` primary family; `polarity` uses the approved `redLike` off family and `greenLike` selected family. |
| Selected-disabled colors | **Deferred** | The current switch contract has no `selected.disabled` branch. The ordinary disabled branch remains authoritative. |

## Geometry mapping

| Contract element | Material source | Schema mapping |
| --- | --- | --- |
| `e1` root | Switch component | `switch` |
| `e2` track | `52 x 32`, pill, 2px border, 4px inset | `boxWidth: 52`, `boxHeight: 32`, `borderWidth: 2`, pill radius `16`, padding `4` |
| `e3` thumb | Selected/icon handle `24 x 24`; unselected rest handle `16 x 16` | `24 x 24` carrier with `thumbShrink.rest` set to `16 x 16`; pill radius `12` |
| `e4` label | Material body-medium label with 12px separation | `body-medium`, left/right margins `12` |
| `e6` icon | Figma `Icon` viewport `16 x 16` | `global.iconSizes` reference `s:sm:1` |

The source focus indication is a 56 x 36 outer focus frame around the 52 x 32 component. The
existing global focus contract owns that outline, so this component keeps the existing halo effect
with size `8` instead of creating a second focus mechanism.

## Color mapping

The schema contains no literal source colors. Every value is produced by the existing
`PresetColorGetter` (`c` or `c.ref`). Source literals are recorded here only as evidence:

| Visual | Figma observation | Schema resolution |
| --- | --- | --- |
| Unselected track | `#E6E1E9` | `c.ref(..., 'neutral', 'subtle')` |
| Unselected stroke | `#79757F` in Figma; `#C9C4CF` was the prior Kiskadee calibration | `c.ref(..., 'neutral'/'redLike', 'medium')` |
| Selected track | Historical purple `#615690` | `c.ref(..., 'switch.neutral', 'vivid')` for `#0B57D0`, or `c.ref(..., 'greenLike', 'vivid')` for polarity |
| Unselected polarity | No separate Material polarity recipe | `c.ref(..., 'redLike', 'subtle'/'medium')` |
| Selected polarity | No separate Material polarity recipe | `c.ref(..., 'greenLike', 'vivid')` |
| White and disabled caps | Figma white/black state-layer alphas | `c(..., 'primitive.black.v1', 0 or 100, alpha)` |

The `switch.neutral` component intent is intentionally the existing `primary` mapping. Root
integration therefore needs no new switch intent mapping for the neutral recipe. The polarity
recipe resolves the global `redLike` and `greenLike` semantics directly, so it does not require a
new shared color layer.

On subtle surfaces the selected track is chromatic and the selected thumb is white. On vivid
surfaces the selected track is a white cap and the selected thumb is chromatic; this prevents the
two layers from disappearing into each other and follows the existing Fluent fallback.

## State rules

- Rest is authored directly; state references are added only where the visual changes.
- Hover, focus, and pressed change the unselected thumb. The Material track remains stable on
  subtle surfaces, matching the source state-layer placement.
- Selected hover/focus/pressed references are retained on the thumb. On vivid surfaces, selected
  track and border references explicitly reset inherited hover/pressed overlays.
- Disabled values use the approved physical black/white caps with Material-style alpha values.
- The icon follows its parent thumb family and remains white when it sits on a chromatic selected
  thumb.
