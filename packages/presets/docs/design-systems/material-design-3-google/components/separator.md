# Material Design 3 Google Separator Evidence

Updated 2026-09-13 for KIS-110.

## Sources

- [Material Web Divider](https://github.com/material-components/material-web/blob/main/docs/components/divider.md)
- [Material color roles](https://github.com/material-components/material-web/blob/main/docs/theming/color.md)
- Fluent's existing shared contour/Separator authorship, used as the authorized fallback.

## Mapping

Material dividers separate content; the official token uses outline-variant paint and one-pixel
thickness. Kiskadee keeps that thickness and the existing `subtle` separator profile. Full bleed,
inset and orientation remain layout concerns, without new variants or runtime rules.

`global.contours.neutral.standard` now supplies Low and Medium colors in Light/Dark and
onSubtle/onVivid, for both default and dynamic. Neutral vivid at 12%/30% provides subtle-surface
contours; pure white at 12%/30% provides vivid-surface contours. These alpha choices and the
context matrix are **Kiskadee adaptations**, not claimed Material token values.

Standalone Separator and Dropdown group dividers consume the same shared recipe. The former
Light-only, legacy-purple divider mapping is retired. Text and icon foregrounds remain separate
from the contour catalog, as required by existing Core contracts.
