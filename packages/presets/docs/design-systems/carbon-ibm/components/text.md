# Carbon Text And Typography Evidence

## Sources

- [Preview typography type sets](https://preview.carbondesignsystem.com/building-blocks/foundations/typography/type-sets), inspected 2026-09-20.
- [Preview color tokens](https://preview.carbondesignsystem.com/building-blocks/foundations/color/tokens).
- [Stable typography](https://carbondesignsystem.com/elements/typography/type-sets/) confirms the same fixed type metrics.
- [Carbon v11 community file](https://www.figma.com/design/MfGzFa79SfhHQ2mKpC3ss4/-v11--Carbon-Design-System--Community-?node-id=58-2763): file `MfGzFa79SfhHQ2mKpC3ss4`, supplied node `58:2763`. Theme variables captured in [figma-theme-tokens.json](../colors/figma-theme-tokens.json).

## Source Coverage

| Area | Status | Decision |
| --- | --- | --- |
| IBM Plex productive body, utility and fixed heading styles | **Official adapted** | Normalize profile IDs while retaining metrics, weights and tracking. |
| Text primary, secondary, helper, disabled and link tokens | **Official adapted** | White, G90 and G100 source tokens resolve through the generated tonal assets. |
| Chromatic family profiles and emphasis decomposition | **Kiskadee extension** | Extend the existing Text contract without adding component behavior. |
| Fluid expressive typography and Plex Serif quotation styles | **Deferred** | This component catalog uses fixed product typography; no fluid behavior is implied. |
| Long-form body and dedicated code typography profiles | **Deferred** | No current Carbon component requires a new profile ID; the existing IBM Plex Mono font role remains available. |

## Typography Mapping

All published profiles use IBM Plex Sans. Values are size/line-height in pixels, weight, then tracking in pixels.

| Kiskadee profile | Carbon token | Metrics |
| --- | --- | --- |
| `label-small` | label-01 / helper-text-01 / legal-01 | 12/16, 400, .32 |
| `body-medium` | body-compact-01 / label-02 | 14/18, 400, .16 |
| `body-medium-strong` | heading-compact-01 | 14/18, 600, .16 |
| `body-large` | body-compact-02 | 16/22, 400, 0 |
| `subtitle-small` | heading-compact-02 | 16/22, 600, 0 |
| `subtitle-large` | heading-02 | 16/24, 600, 0 |
| `heading-small` | heading-03 | 20/28, 400, 0 |
| `heading-medium` | heading-04 | 28/36, 400, 0 |
| `heading-large` | heading-05 | 32/40, 400, 0 |
| `display-small` | heading-06 | 42/50, 300, 0 |
| `display-large` | heading-07 | 54/64, 300, 0 |

Carbon's previous 14/18 weight-500 profile is replaced by its source-backed weight-600 compact heading. Button labels use the regular body profile; the strong profile is for emphasis-bearing content. Equivalent source aliases reuse one profile instead of duplicating identical catalogs.

Micro badge labels `caption-tiny-strong` (6/6), `caption-extra-small-strong` (8/8), `caption-small` and `caption-small-strong` (10/14), and `caption-medium-strong` (12/16, 600) are **Kiskadee extensions**. Carbon does not publish this complete micro-label scale; the smaller sizes only cover existing compact badge geometry.

## Color And Token Provenance

`tokenColor` resolves the upstream semantic token to the preset's promoted primitive and closest independently mapped Light/Dark tonal position. Exact lookups carry `source.tokens` evidence; physical endpoints use `cap`. The source snapshot and preset-wide color evidence preserve the generated values and distances.

| Source token | White | G90 / G100 | Mapping |
| --- | --- | --- | --- |
| text-primary | Gray 100 `#161616` | Gray 10 `#f4f4f4` | neutral standard medium, exact source token |
| text-secondary | Gray 70 `#525252` | Gray 30 `#c6c6c6` | neutral standard low |
| text-helper | Gray 60 `#6f6f6f` | Gray 50 `#8d8d8d` | neutral standard lowest |
| text-disabled | Gray 100 at 25% | Gray 10 at 25% | disabled text in every onSubtle foreground family |
| link-primary | Blue 60 `#0f62fe` | Blue 40 `#78a9ff` | blue standard medium |
| link-primary-hover | Blue 70 `#0043ce` | Blue 30 `#a6c8ff` | blue standard medium Hover |
| link-secondary | Blue 70 `#0043ce` | Blue 30 `#a6c8ff` | blue deep medium |
| text-on-color | white | white | onVivid medium, light cap |
| text-on-color-disabled | Gray 50 `#8d8d8d` | white at 25% | onVivid Disabled |

The preview changes placeholder wording/value from the Figma v11 snapshot; the foreground hierarchy uses `text-helper`, not that unresolved placeholder token. The Figma alias `text--on-color-disabled` is normalized to the official single-hyphen spelling.

## Kiskadee Extensions

- Standard/deep red, green and purple text use their own promoted family's Light `vivid` reference with offsets 0/+3. Orange uses +7/+10 and yellow +12/+15. Dark and Darker use +7/+9 for all five extension families. These are measured foreground adaptations of existing families, not new Carbon semantic tokens.
- Chromatic low and lowest use 68% and 40% of the resolved family color. OnVivid low/lowest use 70%/40% of `text-on-color`.
- Neutral deep uses physical black on Light and white on Dark/Darker. Its lower levels reuse text-primary and text-secondary.
- Pending retains 70% of the original opacity. The source alpha is multiplied, not discarded.
- Only the documented blue-link Hover delta is published. Focus belongs to the shared focus contract; there are no redundant Rest-equal Focus, Hover or Pressed entries.

## Schema Mapping

- `global.typography`: the reusable fixed Carbon type catalog.
- `global.foregrounds`: neutral plus six chromatic standard/deep profiles.
- `text.e1`: publishes the existing neutral and chromatic foreground options without embedding colors.
- `light`, `dark`, `darker`: Carbon White, G90, G100 respectively; both surface contexts are available.

## Validation

Source token values and typography metrics were inspected in preview documentation and the captured Figma variables. The 16 typography profiles passed the existing contract validator without duplicate identities and use existing normalized profile IDs.

Contrast was calculated from the generated sRGB assets with the WCAG relative-luminance formula. Light orange and yellow cannot use their vivid seed as normal-size text: orange `#ff832b` yielded 2.28:1 and yellow `#f1c21b` 1.56:1 on the generated G10 layer `#f6f6f6`. The first darker reference positions passing 4.5:1 on both White and that layer were orange +7 (`#b35400`, 4.64:1 minimum) and yellow +12 (`#826700`, 5.00:1 minimum). Red, green and purple already passed at offset 0. Deep keeps an additional three darker positions on Light.

Dark standard offset +7 yields at least 4.69:1 against generated `#4f4f4f`, covering G90 layer-02 and G100 layer-03; deep +9 increases contrast further. G90 layer-03 `#727272` is outside this guarantee. Forcing every family to meet 4.5:1 there would push these colors almost to white and collapse the intended chromatic hierarchy.

The preserved official blue link mapping targets base and first-layer dark compositions: generated `#71a3ff` gives 5.96:1 on G90 background and 4.68:1 on layer-01, but 3.27:1 on layer-02 and 1.92:1 on layer-03. Reduced-alpha emphases are also intentionally outside the normal-text contrast guarantee. These source/context limitations do not add an adaptive layer runtime or silently change official link tokens.

Artifact generation and rendered validation are performed with the complete preset integration; this document does not claim isolated browser validation.
