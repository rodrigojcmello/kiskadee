# Carbon Dropdown Evidence

## Sources

- [Preview Menu specifications](https://preview.carbondesignsystem.com/building-blocks/core/components/menu/specifications), inspected 2026-09-20.
- [Carbon Menu style](https://carbondesignsystem.com/components/menu/style/).
- [Figma v11](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=58-2763), file `MfGzFa79SfhHQ2mKpC3ss4`, entry node `58:2763`; shared `Shadows/Menu` effect.

## Source Coverage

| Area | Relationship | Status |
| --- | --- | --- |
| Menu layer, typography, spacing, hover, disabled | Preview Menu specification | Official adapted |
| Menu shadow | Figma effect: y2, blur6, black30% | Official exact |
| Pressed/selected item fills and auxiliary slots | Existing Kiskadee menu contract using Carbon tokens | Kiskadee extension |

## Schema Mapping

`e1` establishes a square-cornered layer, with 4px vertical outer padding and the global `s:md:1`
shadow. `e2` maps 32/40/48px rows through 7/11/15px vertical padding around 14/18 body text;
horizontal padding is 16px. Icons remain 16px in every density. `e7` consumes the shared subtle
Separator. `e3-e6/e8-e11` cover icons, content, shortcuts, grouping, selection and scrolling.

## Color And Token Provenance

The surface uses `layer-01`. Neutral items use `layer-hover-01`, `layer-active-01`,
`layer-selected-01`, and `layer-selected-hover-01`; text changes from secondary to primary on hover.
The preview specifies `support-error` with on-color text/icons for destructive hover. Its G90/G100
fills are light reds, which produce insufficient contrast with the on-color white content.
The preset therefore uses `button-danger-primary` for hover and `button-danger-active` for pressed,
retaining the corresponding on-color content. This is a **Kiskadee extension** based on Carbon's
danger Button recipe, shared with BottomSheet; it does not redefine the upstream Menu token.
Selected destructive Hover/Pressed explicitly retain those danger fills so Dropdown's selected
background gate does not leave white interactive content on a pale selected layer.
Disabled foregrounds use disabled text/icon tokens and a transparent surface reset. The styled
Dropdown removes its selected state class while disabled, preventing the selected-background
gate from competing with that reset. Focus leaves Hover intact and relies on the shared focus ring.

Exact/cap source locators are registered by `source.tokens`, with all White/G90/G100 de-para values
in [token-mapping.json](../colors/token-mapping.json). Both incoming contexts establish the same
independent overlay layer; they do not recolor the menu after the trigger background.

## Deferred And Validation

**Deferred:** the 24px extra-small row and Carbon's menu width limits are not added as new APIs.
The latest Figma shadow takes precedence over the website's older 20% example. All eleven slots
pass the Core Dropdown contract; integrated render validation is reported separately.
