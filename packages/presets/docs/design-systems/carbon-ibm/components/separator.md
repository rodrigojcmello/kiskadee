# Carbon Separator And Contour Evidence

## Sources

- [Preview color tokens: Border](https://preview.carbondesignsystem.com/building-blocks/foundations/color/tokens).
- [Stable Carbon color tokens](https://carbondesignsystem.com/elements/color/tokens/).
- [Carbon v11 community file](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/-v11--Carbon-Design-System--Community-?node-id=58-2763): file `MfGzFa79SfhHQ2mKpC3ss4`, supplied node `58:2763`; [captured theme variables](../colors/figma-theme-tokens.json).

## Source Coverage

| Area | Status | Decision |
| --- | --- | --- |
| Subtle and strong border token families | **Official adapted** | Supply one reusable contour catalog for Card boundaries and Separator lines. |
| Universal lowest/low/medium hierarchy | **Kiskadee extension** | Normalize three existing border treatments to existing emphasis levels. |
| OnVivid hierarchy | **Kiskadee extension** | Use explicit white alpha contours where Carbon has no complete corresponding emphasis matrix. |

## Color And Token Provenance

| Kiskadee emphasis | Source token | White | G90 | G100 |
| --- | --- | --- | --- | --- |
| lowest | border-subtle-00 | Gray 20 `#e0e0e0` | Gray 70 `#525252` | Gray 80 `#393939` |
| low | border-subtle-01 | Gray 30 `#c6c6c6` | Gray 60 `#6f6f6f` | Gray 70 `#525252` |
| medium | border-strong-01 | Gray 50 `#8d8d8d` | Gray 50 `#8d8d8d` | Gray 60 `#6f6f6f` |

Each onSubtle value uses `tokenColor` with role `neutral`, which resolves the captured upstream token through a theme-specific, evidence-backed `exact` locator (`source.tokens`). The global color evidence owns exact tonal positions and generated distances. The source's layer-dependent naming is normalized here; changing a contour's emphasis does not introduce an automatic Carbon layer stack.

OnVivid uses the achromatic physical light `cap` at 20%, 35%, and 60% for lowest, low, and medium. These are **Kiskadee extensions** selected to keep boundary strength ordered on colored surfaces; they are not presented as Carbon theme tokens.

## Schema Mapping

- `global.contours.neutral.standard` owns shared boundary paint for all three themes and both contexts.
- `global.separators.subtle` owns a one-pixel line and references the contour catalog.
- `separator.e1` selects that profile for every size. Orientation and layout remain in the existing component contract.
- The catalog is Rest-only. A static divider does not acquire hover, pressed or focus recipes.

## Validation And Limits

Theme border values were checked against the captured source variables. Complete preset generation verifies the contour references. Rendered line behavior is validated during the shared preset integration. This mapping does not add automatic nested-layer selection or a new Divider component.
