# Carbon Chip Evidence

## Sources

- [Preview Tag specifications](https://preview.carbondesignsystem.com/building-blocks/core/components/tag/specifications), inspected 2026-09-20.
- [Carbon Tag style](https://carbondesignsystem.com/components/tag/style/).
- [Official Tag token implementation](https://github.com/carbon-design-system/carbon/blob/main/packages/styles/scss/components/tag/_tokens.scss).
- [Figma v11](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/?node-id=58-2763), file `MfGzFa79SfhHQ2mKpC3ss4`, entry node `58:2763`.

## Source Coverage And Mapping

| Appearance | Relationship | Status |
| --- | --- | --- |
| Neutral/Primary medium | Gray/Blue dismissible Tag tokens | Official adapted |
| Neutral high | High-contrast Tag | Official adapted |
| Low | Outline Tag | Official adapted |
| Selected | Selectable Tag inverse surface/text | Official adapted |
| Primary high, lowest and OnVivid | Existing Kiskadee emphasis/context completion | Kiskadee extension |

`e2/e5` represent primary/removal surfaces, `e3/e4/e6` label/icons and `e7` the optional badge
relation. Heights are 18/24/32px; both radius modes resolve to the source capsule. Border width is
reserved inside the source padding. The label uses `label-small` at every size.

## Color And Token Provenance

Medium uses `tag-background-gray/blue`, `tag-hover-gray/blue`, and `tag-color-gray/blue`.
High neutral uses `background-inverse`; Primary high borrows the Primary Button token family.
Outline uses `border-inverse` and `text-primary`; selection uses neutral inverse tokens for both
intents. Foregrounds react to their interactive parent through references.
Disabled uses `layer-01`, `text-disabled`, and `border-disabled`.

All exact/cap mappings use the theme-specific `source.tokens` registry;
[token-mapping.json](../colors/token-mapping.json) carries source/generated colors and positions.
No neutral source token is reinterpreted through the Primary family.

## Extensions And State Decisions

Pressed reuses Carbon layer-active/Button-active tokens; neutral high pressed uses inverse-hover.
Lowest is transparent at Rest. OnVivid low/lowest use white foreground and 12%/20% white state
fills. These are **Kiskadee extension**, not additional Carbon variants. Terminal transparent
resets intentionally override selected fills. Focus has no duplicate surface rule; the shared ring
remains responsible for keyboard indication. Neutral high omits redundant selected values.

Generated medium Tag colors require a narrow contrast adaptation for the 12px labels: Dark and
Darker hover use a physical-white cap, Dark pressed also uses white, and Light Primary pressed
uses `text-primary` on `layer-active-01`. These state deltas are **Kiskadee extension** and apply to
the label and icons together. Selected pressed retains `background-inverse-hover`; selected
foreground Hover/Pressed resets are intentionally retained where they must override the regular
medium state deltas. This preserves inverse content on the selected inverse surface.

## Deferred And Validation

**Deferred:** operational Tag popovers, AI labels, and colors outside Chip's two existing intents.
The seven-slot schema passes the Core Chip contract. Render validation belongs to the integrated
preset handoff.
