# iOS 27 Text And Foreground Evidence

## Sources

- [Default Dynamic Type](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=224-56261), file `GeO2lMY65IAFczDmjs6oei`, node `224:56261`.
- [Callout Regular](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=0-3178), node `0:3178`; separately rechecked through design context.
- [Text styles and label colors](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5418-17464).
- [Apple Typography HIG](https://developer.apple.com/design/human-interface-guidelines/typography).
- [Stored variable-to-tonal mapping](../colors/figma-to-kiskadee.candidate.json).

## Source Coverage

| Area | Inspected | Status |
| --- | --- | --- |
| Default Dynamic Type | Node `224:56261`, all eleven roles through design context | Official adapted |
| Label hierarchy | Stored centralized Light/Dark label variables | Official adapted |
| Accessibility Dynamic Type sizes | Page metadata only | Deferred |
| Chromatic foregrounds, deep profiles, vivid surfaces | Framework color vocabulary | Kiskadee extension |

## Official Contract And Schema Mapping

`global.typography` owns all metrics. `components.text.e1.foreground` independently selects
`global.foregrounds`; text sizing never changes its foreground. The native Apple system font stack
is retained. SF Pro binaries are not redistributed. The Web `semiBold` weight approximates the
Figma variable weight 590 with the existing normalized weight contract.

| Apple role | Size / line height / tracking (px) | Published profile |
| --- | --- | --- |
| Caption 2 | 11 / 13 / 0.06 | caption-small |
| Caption 1 | 12 / 16 / 0 | caption-medium |
| Footnote | 13 / 18 / -0.08 | label-small |
| Subheadline | 15 / 20 / -0.23 | body-small |
| Callout | 16 / 21 / -0.31 | callout |
| Body | 17 / 22 / -0.43 | body-medium |
| Headline | 17 / 22 / -0.43, semibold | label-medium |
| Title 3 | 20 / 25 / -0.45 | body-large; label-large for emphasis |
| Title 2 | 22 / 28 / -0.26 | heading-small, emphasized |
| Title 1 | 28 / 34 / 0.38 | heading-medium, emphasized |
| Large Title | 34 / 41 / 0.4 | heading-large, bold adaptation |

Strong variants of caption, footnote and subheadline reuse the inspected metrics with semibold.
Heading emphasis and normalized names are **Official adapted**, while the exact source default
column uses Regular except Headline. No duplicate profile aliases are emitted. Tooltip profiles
retain the existing medium-weight Web adaptation but now use Caption 2 and Footnote metrics.

## Color And Token Provenance

Apple Gray is the approved `n.black.v2`, published as `primitive.black.v1`. Existing `c`/`c.ref`
lookup remains the preset's authoring contract; no new resolver or generated color asset is added.

| Source | Source Light / Dark | Lookup and output | Decision |
| --- | --- | --- | --- |
| Labels/Primary | black / white | physical cap via neutral L100 / D100 | Text medium, Official exact |
| Labels/Secondary | #3c3c43 at 60% / #ebebf5 at 70% | exact neutral L70 #3d3d3f / D95 #ebebee, source alpha retained | Text low, Official adapted; Delta E 0.008785 / 0.009598 |
| Labels/Tertiary | same families at 30% | exact L70 / D95, 30% | Text lowest, Official adapted |
| Apple Accents | all ten public chromatic families | family reference vivid, independent L/D | Standard colored text, Official adapted anchor; Dark generation is adaptive |
| Colored text deep | no Apple counterpart | reference vivid +8 Light / +4 Dark | Kiskadee extension for stronger foreground |
| Vivid content | no Apple global label recipe for this canvas | physical white 100/80/50%; chromatic Light subtle -2 at same alpha | Kiskadee extension |

Darker uses Dark label values against the separately authored black Base canvas. It is not a third
Apple palette. On-vivid colors target the preset's dark blue canonical surfaces; they do not claim
universal contrast on arbitrary host colors. Tertiary and disabled-style contrast is intentionally
weaker than primary labels. Standard accent colors retain source identity and are not presented as
a universal small-text contrast guarantee.

## Integration And Deferred Capabilities

The only Showcase change is the existing iOS entry in `showcase-text-profiles.ts`, selecting the
new heading and label profiles. No layout, runtime, Builder or interaction feature is added.
Native Dynamic Type resizing, vibrancy, semantic quaternary text, and scene-relative materials are
**Deferred**. The existing three text emphasis levels map to Primary/Secondary/Tertiary.

## Validation

Verify profile deduplication and references, all three themes and both contexts, label hierarchy,
and text rendered inside selected Cards. Full rendering results are recorded in
[the polish verification ledger](../polish-verification.md).

## Compact Apple Control Profile

`body-extra-small` adds the macOS-derived 13/16 px Medium profile with zero tracking, used by
Small Button. Existing iOS profiles are unchanged. Source node `502:5868` uses variable weight
510; the existing Medium token maps to 500. See [Button evidence](button.md#macos-compact-geometry-and-transient-feedback).
