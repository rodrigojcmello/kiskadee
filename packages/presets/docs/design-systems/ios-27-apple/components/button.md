# iOS 27 Apple Button Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/ios-27-apple/components/button.schema.ts`.

## Sources

- [macOS 26 Push Buttons](https://www.figma.com/design/37jpyRzTWznKjRhFSF3GD3/macOS-26--Community-?node-id=121-11922): file `37jpyRzTWznKjRhFSF3GD3`, section `121:11922`, set `121:11923`. Inspected 2026-09-08.

- Figma Buttons page:
  [iOS and iPadOS 27 Community — Buttons](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24673)
  - file key: `GeO2lMY65IAFczDmjs6oei`;
  - page node: `507:24673`;
  - Button Content Area component set: `40:58696`;
  - Light examples: `2539:14600`;
  - Dark examples: `2666:16141`;
  - title-and-icon examples: Small `5473:20773`, Medium `40:58693`, Large `40:58695`;
  - Liquid Glass Text component set: `5473:21667`;
  - Liquid Glass Symbol component set: `5522:11866`.
- Preset-wide tonal evidence:
  [`../colors/ios-27-color-evidence.md`](../colors/ios-27-color-evidence.md)
- Exact source-to-tonal de-para:
  [`../colors/figma-to-kiskadee.json`](../colors/figma-to-kiskadee.json)
- Optional brand scale and pack provenance:
  [`@kiskadee/brands`](../../../../../brands/docs/definitions/brand-color-packs.md)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Button Content Area | `40:58696` | Three styles, three label forms, three sizes, enabled/disabled, destructive/non-destructive | Official adapted |
| Light examples | `2539:14600` | Conventional non-glass presentation | Official adapted |
| Dark examples | `2666:16141` | Conventional non-glass presentation | Official adapted |
| Title and icon | `5473:20773`, `40:58693`, `40:58695` | Play symbol, label, 3/4/4 px item spacing, 10/14/20 px horizontal padding | Official exact |
| Connected Button group | Inspected Button component set | No grouped or split composition is authored | Kiskadee extension |
| Liquid Glass Text | `5473:21667` | Capability and material separation confirmed | Deferred |
| Liquid Glass Symbol | `5522:11866` | Capability and material separation confirmed | Deferred |
| Hover, Pressed, Focus, Selected | Content Area variants | No official variants are authored | Kiskadee extension |
| Authentication and social brands | `@kiskadee/brands` pack artifacts | Apple publishes no equivalent matrix | Kiskadee extension |

## Official Contract

The conventional Content Area component exposes these variant axes:

- `Style`: `Bordered - Prominent`, `Bordered`, and `Borderless`;
- `Label Style`: title and icon, icon only, and title only;
- `Size`: Small, Medium, and Large;
- `Is Enabled`: `True` or `False`;
- `Destructive`: `True` or `False`.

The three official styles resolve as follows:

| Apple style | Enabled surface | Enabled foreground | Disabled surface | Disabled foreground |
| --- | --- | --- | --- | --- |
| `Bordered - Prominent` | `Accents/Blue`, or `Accents/Red` when destructive | `Grays/White` | `Fills/Tertiary` | `Labels/Tertiary` |
| `Bordered` | `Fills/Tertiary` when non-destructive; `Miscellaneous/Buttons/BG - Destructive` when destructive | `Accents/Blue`, or `Accents/Red` when destructive | `Fills/Tertiary` | `Labels/Tertiary` |
| `Borderless` | Transparent | `Accents/Blue`, or `Accents/Red` when destructive | Transparent | `Labels/Tertiary` |

The inspected Content Area variants do not author separate Hover, Pressed, Focus, or Selected
appearances. They also do not use a visible stroke or shadow. Focus remains an accessibility
affordance owned by Kiskadee's global focus-ring contract; it is not inferred as an Apple surface
change. The ring uses the Primary family's `vivid` reference independently of the content intent;
that ring color is a Kiskadee accessibility decision, not a value claimed from this Figma component.

### Size Geometry

| Apple size | Height | Horizontal padding | Vertical padding | Label size/line height | Status |
| --- | --- | --- | --- | --- | --- |
| Small | 28 px | 10 px | 4 px | 15/20 px | Official exact |
| Medium | 34 px | 14 px | 7 px | 15/20 px | Official exact |
| Large | 50 px | 20 px | 14 px | 17/22 px | Official exact |

All sizes use a pill radius. Apple authors SF Pro Regular at weight 400. Kiskadee preserves the
weight and uses the Apple system-font stack with platform fallbacks; this is an **Official
adapted** typography mapping. The original iOS Small and current Medium consume `body-small` at
15/20 px with -0.23 px tracking; the current Kiskadee Small mapping is documented below; Large consumes `body-medium` at 17/22 px with -0.43 px tracking.
The metrics live in `global.typography`, as documented in [Text evidence](text.md).

The inspected source confirms the title-and-icon composition but does not expose a reusable symbol
viewport token. Kiskadee therefore applies the preset's shared `global.iconSizes` ramp at 16 px,
20 px, and 24 px for Small, Medium, and Large. This **Kiskadee extension** calibrates the Web
fallback's visual mass while preserving the official Button height, padding, and label metrics.
The Button owns the identity mapping from its component scales to those icon-size references; the
global catalog itself contains no responsive behavior.

Title-and-icon spacing remains separate from the Button's external horizontal padding. The official
variants use a 3 px gap at Small and a 4 px gap at Medium and Large. The Button icon slot authors
those values explicitly so it never inherits the root's 10 px, 14 px, or 20 px padding token as its
content gap.

### Kiskadee Extension: Connected Button Divider

The inspected iOS 27 Button set does not publish a connected or split Button composition.
`Button.Group`, its internal seam, and the default use of that seam are therefore a **Kiskadee
extension**, not a native Apple Button capability inferred from the source.

The first mapping reuses the preset's approved subtle neutral line rather than inventing a new
literal:

| Theme | Existing role | Primitive and tone | Generated value | Kiskadee mapping |
| --- | --- | --- | --- | --- |
| Light | neutral Separator adaptation | Apple Gray `primitive.black.v1`, L10 | `#d1d1d4` | `button.e6.boxColor.neutral.medium.rest` |
| Dark | neutral Separator adaptation | Apple Gray `primitive.black.v1`, D16 | `#38383b` | `button.e6.boxColor.neutral.medium.rest` |

The schema authors that neutral Rest line once as `neutral.medium.rest`. Button composition uses
this branch as the divider fallback for every Button intent and emphasis, avoiding 16 duplicated
paths without narrowing the Core contract's ability to accept future official overrides. The line
does not acquire Hover, Pressed, Focus, Selected, Pending, or Disabled deltas.

`boxWidth` is 1 px at all three Button scales. `boxHeight` follows the shared icon viewport at
16 px, 20 px, and 24 px. The divider has no margin, padding, gap, opacity, or semantic role;
structural Button composition centers it while preserving the existing icon, label, and sibling
spacing.

## Color And Token Provenance

| Source concept | Official Light/Dark value | Kiskadee mapping |
| --- | --- | --- |
| `Accents/Blue` | `#0088ff` / `#0091ff` | `button.primary`, `b.blue.v1`; vivid L28/D65 |
| `Accents/Red` | `#ff383c` / `#ff4245` | `button.destructive`, `r.red.v1`; vivid L26/D65 |
| `Accents/Green` | `#34c759` / `#30d158` | `button.positive`, `g.green.v1`; vivid L20/D65; Kiskadee extension in Button |
| `Grays/Black` family | centralized Apple Grays | `button.neutral`, generated `n.black.v2` → preset `primitive.black.v1`; vivid L90/D95; Kiskadee extension in Button |
| `Grays/White` | `#ffffff` / `#ffffff` | neutral cap L0/D100 |
| `Fills/Tertiary` | base `#767680` at 12% / 24% | neutral L40 at 12% / D55 at 24% |
| `Miscellaneous/Buttons/BG - Destructive` | `#ff383c` at 14% / `#ff4245` at 14% | `button.destructive` vivid L26 at 14% / D65 at 14% |
| `Labels/Tertiary` | base `#3c3c43` at 30% / `#ebebf5` at 30% | neutral L70 at 30% / D95 at 30% |

Apple's Dark Accent values remain official correspondence evidence. The schema consumes the
generated family's Dark functional reference, so a value such as official Blue `#0091ff` can map
to a nearby canonical tone rather than remain byte-exact. This is an **Official adapted** choice,
not loss of source provenance.

## Approved Borderless Hierarchy

The approved hierarchy applies to Primary, Neutral, Destructive and Positive in all three themes.
It is a source-informed **Kiskadee extension**, requested on 2026-09-07, rather than a claim that
Apple publishes this complete emphasis matrix.

| Emphasis | Current onSubtle mapping | Source relationship |
| --- | --- | --- |
| High | Strong intent fill and contrasting content | Existing prominent source mapping retained. |
| Medium | Intent family `subtle` surface with intent-colored content | Tonal adaptation of tinted controls. The preserved destructive 14% source token remains evidence, not the emitted recipe. |
| Low | Neutral `Fills/Tertiary` with intent-colored content and no visible border | Former neutral Medium treatment moved here; generalization across intents is explicit. |
| Lowest | Transparent surface and intent-colored content | Existing plain mapping retained. |

Primary Medium is light blue in Light; Destructive is light red and Positive is light green.
Neutral follows its achromatic family. Dark and Darker resolve their independent Dark-track
subtle anchors. All values come from the approved tonal assets without literal schema colors.

The former Low outline extension is removed from every intent and both Surface Contexts.
The physical 1px border reservation remains transparent to preserve measured geometry and the
existing Builder padding compensation. Keyboard focus is an independent effect and remains
available. High and Lowest retain their previous behavior.

## Shared onSubtle Formula

Offsets below are ordinal movements through the canonical public tone grid, not numeric tone
arithmetic. All three themes and optional Brand Packs consume the same formula; Darker uses Dark.

| Emphasis | Rest surface | Hover | Pressed | Selected | Enabled foreground |
| --- | --- | --- | --- | --- | --- |
| High | vivid +0 | vivid +1 | Light vivid +3 / Dark vivid +2 | vivid +1 | neutral contrast cap |
| Medium | subtle +0 | subtle +1 | Light subtle +3 / Dark subtle +2 | subtle +1 | role vivid |
| Low | neutral `Fills/Tertiary` | neutral L40 alpha 20% / D55 alpha 32% | neutral L40 alpha 28% / D55 alpha 40% | subtle +1 | role vivid |
| Lowest | transparent | neutral cap black/white 8% | neutral cap black/white 15% | subtle +1 | role vivid |

Low and Lowest transient states use neutral feedback derived from macOS bezels. Hover, Dark
and Selected remain explicit Web extensions; iOS variants do not prescribe this matrix.
Focus and Pending remain absent from palette maps. The existing focus effect and operational
Button behavior retain their respective responsibilities.

`Fills/Tertiary` resolves through neutral L40 at 12% in Light and D55 at 24% in Dark/Darker.
Disabled High/Medium/Low restore this neutral fill and use `Labels/Tertiary` content. Lowest
restores transparent and also uses `Labels/Tertiary`. Every border remains transparent.

High keeps the existing white content in both themes, except Neutral High: its dark Light-track
surface uses white, while its light Dark-track surface uses black. No runtime contrast calculation
is introduced. The formula resolves to static values during authoring/build.

## Conventional onVivid Formula

The conventional onVivid matrix is a **Kiskadee extension** over the documented strong Card
canvas. Source materials do not establish this full conventional matrix. Every theme uses the
Light tonal track for the opaque, light-tinted Medium and its dark content.

| Emphasis | Rest / Hover / Pressed surface | Enabled foreground | Outline |
| --- | --- | --- | --- |
| High | White 100% / 92% / 84% | Intent Light vivid +10; Neutral vivid +0 | Transparent |
| Medium | Intent Light subtle / subtle +1 / subtle +2 | Intent Light vivid +10; Neutral vivid +0 | Transparent |
| Low | Black 12% / 20% / 28% | White | Transparent |
| Lowest | Transparent / Black 12% / 20% | White | Transparent |

Medium now exposes the light intent tint in both surrounding contexts. Low receives the former
Medium neutral overlay, preserving contrast with white content. That achromatic paint composites
with the vivid parent; it is not an opaque light-gray button on a blue canvas. High and Lowest
keep their existing treatments. Selected Medium uses subtle +1; Selected Low uses Black 28%.

Disabled High/Medium/Low use White 12% and disabled content uses White 30%. Lowest explicitly
resets to transparent. Children inherit root-owned disabled state. Decorative connected-group
lines retain White 30% onVivid and the approved neutral separator onSubtle; they are not external
Button outlines.

## Optional Brand Color Packs

Third-party colors stay outside Apple's primitive catalog and normal Button artifacts. Brand
Packs are loaded only through an explicit BrandPackBoundary. The shared onSubtle formula now
also gives brand actions a tonal Medium and neutral, borderless Low; High/Lowest are unchanged.

The extension explicitly publishes `default.light`, `default.dark` and `default.darker` for
auth/social. Darker reuses the Dark recipe in container, text and icon projections; consumers
require an exact palette key and do not infer inheritance from Dark. An artifact regression
test verifies the Darker manifests, CSS integrity and complete intent matrices for both packs.

| Brand onVivid emphasis | Rest / Hover / Pressed surface | Enabled foreground |
| --- | --- | --- |
| High | White 100% / 92% / 84% | Brand Light vivid |
| Medium | Brand Light subtle / subtle +1 / subtle +2 | Brand Light L85 |
| Low | White 24% / 32% / 40% | White |
| Lowest | Transparent / White 12% / 20% | White |

Brand Low receives its former Medium neutral overlay. Brand Medium uses a deep L85 family tone
for content: a universal vivid +10 shift is invalid for families whose anchor is already near the
end of the public grid. The build caught that case, so the family-owned public L85 stop is used
without clamping, new colors or changes to tonal assets. Fixed multicolor brand marks preserve
the existing treatment and are not recolored.

Disabled High/Medium/Low restore White 12%; Lowest restores transparent. Disabled content uses
White 30%. Every physical border stays transparent. This complete Brand matrix is an explicit
Kiskadee extension and not an Apple source appearance.

### Kiskadee Extension: Surfaced Brand Marks

Apple does not publish an equivalent reusable icon-region treatment for the conventional Button
matrix inspected above. Kiskadee nevertheless exposes the optional `surface` treatment so a
full-color social mark remains legible over vivid Button surfaces:

- the icon region uses the Apple Gray Light cap (`L0`, white) in both Light and Dark themes;
- its inherited monochrome foreground uses Apple Gray Light `L85`;
- the stable light region is published for both conventional Surface Contexts and all three themes;
- arbitrary brand artwork is neither recolored nor faded;
- the region publishes only Rest; interaction states continue to belong to the Button root;
- `iconSurfaceCorners` defaults to `all`, so the light region keeps the Button-derived radius on
  all four corners instead of flattening the two corners facing the label;
- `plain` remains the preset default, and the Button never chooses a mark presentation
  automatically.

This is a **Kiskadee extension**, not an Apple Button API or an appearance inferred from the source
Figma component.

## Deferred Or Unsupported

- Liquid Glass Text and Symbol are **Deferred**. Their glass materials, textured or scene-relative
  backgrounds, and authored material/effect paints are real upstream capabilities, but the current
  Kiskadee Button schema has no Liquid Glass contract.
- Conventional Button publishes both Surface Contexts. Its onVivid recipe is a Kiskadee
  contrast adaptation over Card's documented strong Primary canvas, not Liquid Glass.
- No texture is flattened into a literal color and no conventional Button style pretends to be
  glass. A future implementation must introduce a deliberate cross-platform material capability.
- Label-and-icon, icon-only, and title-only are official content forms. They remain consumer content
  composition rather than a new preset appearance axis.

## Schema Mapping

- `e1`: Button surface, interaction backgrounds, rounded/pill radius choices, and a fixed 1 px border.
  Every emphasis keeps that border transparent; the former Low outline is removed.
  Compensated padding keeps the official outer geometry stable.
- `e2`: label content; role foreground, disabled foreground, Apple-system typography, and
  size-specific text metrics.
- `e3`: icon content; mirrors `e2` foreground states so interface glyphs and monochrome brand marks
  follow the Button content color. Fixed multicolor marks remain unchanged. Small, Medium, and
  Large reference the shared 16 px, 20 px, and 24 px icon sizes as the documented Web adaptation.
- `e5`: disclosure icon, viewport, color, and content spacing only; it does not own the optional
  internal divider.
- `e6`: decorative Rest-only Button divider with 1 px `boxWidth`, icon-matched `boxHeight`, and one
  canonical `neutral.medium.rest` color consumed as the fallback for every Button composition.
- `components.button.options.groupDivider`: `true`, enabling `e6` at connected Button seams.
- `components.button.options.disclosureDivider`: `false`, so a menu disclosure is not separated
  unless the preset explicitly adopts that visual language later.
- Public `scale`: Small, Medium, and Large map to 24, 34, and 50 px geometry.
  These are explicit scales, not a `components.button.options.size` setting.
- Palette intent and emphasis select the Apple relationship or documented Kiskadee extension; no
  literal HEX is authored in the component schema.


## macOS Compact Geometry And Transient Feedback

Status: **Official adapted**, with the extensions below. The platform boundary is defined in
[Visual Identity And Platform Adaptations](../../../definitions/visual-identity-and-platform-adaptations.md).
The iOS geometry table above preserves source evidence; it is not the current Small mapping.

Push Button variants have a 24 px frame, 6 px radius, centered 13/16 SF Pro Medium text
(variable weight 510), zero tracking and 16 px horizontal padding. The source centers text in a
fixed frame; Kiskadee derives the same height from 16 px content plus 4 px padding on each side.
The shared `body-extra-small` profile uses the existing Medium weight token (500), an explicit
font-weight adaptation. No other typography profile is changed. The 16 px Small icon still fits.

Small replaces the former iOS 28 px mapping. Medium 34 px and Large 50 px remain unchanged.
`rounded` is 6 px; applying that radius to Medium/Large is a **Kiskadee extension**. `pill` stays
25 px and `square` stays zero. Material's explicit compact-to-spacious scale ordering is retained;
there is no automatic OS or breakpoint detection.

### Inspected Light source layers

All rows below are `Active Window=True`, `On=False`. Paints include node opacity, not only fill
opacity. `Controls/Tint` (`VariableID:697:5166`, Light `1:0`) resolves to `#0d6fff` in this file.
That macOS base does **not** replace the existing iOS blue or any Rest appearance.

| Style | Idle node | Clicked node | Source feedback | Mapping |
| --- | --- | --- | --- | --- |
| Default / Preferred | `502:5866` | `502:5978` | Tint plus black 15%; composite approximately `#0b5ed9` | High pressure: apply darkening direction to preserved iOS vivid; Light vivid +3 |
| Bordered Secondary | `502:5854` | `502:5984` | Tint 10%, then black 8% | Medium pressure: Light subtle +3, an approximation retaining family chroma |
| Bordered Neutral | `121:11924` | `502:5915` | Black 5% becomes black 15% | Low retains neutral tertiary pigment and raises alpha to 28% |
| Borderless (Bezel shows On) | `502:5878` | `502:5972` | Transparent becomes black 15% | Lowest Pressed: physical neutral black cap at 15% |
| Borderless | `502:5872` | `502:5975` | No background delta | The bezel variant above is the chosen adaptation, not a claim about every Borderless style |

For Primary High, darkening the preserved iOS `#0088ff` by 15% gives `#0074d9`.
The approved `b.blue.v1` Light vivid +3 is L40 `#0072d7` (RGB delta 0/-2/-2).
Primary Medium uses the same family's subtle +3, L7 `#cce3ff`, preserving a tonal tint rather than
flattening the source's stacked translucent paints. Low uses approved neutral L40 `#737375` at
28%, approximately `#d8d8d8` on white. The source tertiary pigment `#767680` remains
provenance; the approved neutral ramp provides its mapped counterpart. Lowest uses neutral L100 at 15% (`#00000026`).
These are legacy family-reference/cap getter lookups; no new primitive assets or literal schema
colors are introduced. Other intents and optional onSubtle Brand Packs generalize the shared
recipe and are **Kiskadee extensions**, not individually sampled macOS colors.

The inspected set contains Idle/Clicked/Disabled and On/Off variants, but no Hover variant.
Hover is an explicitly weaker Web affordance: existing High/Medium +1 offsets, Low neutral alpha
20% (Light) / 32% (Dark), Lowest neutral cap 8%. Dark and Darker are **Kiskadee extensions**:
High/Medium retain their existing Dark-track offsets; Low increases approved D55 pigment alpha
(`#7a7a7c`) from 24% Rest to 32%/40%, while Lowest uses the D100 white cap at 8%/15%. Dark macOS rendering
is **Not inspected**; no Light offset is copied into Dark as purported official evidence.

Selected, Disabled, the focus ring and every onVivid recipe remain unchanged. The full macOS
On/Off and inactive-window matrix is **Deferred**. Ordinary Rest surface, text, icon, border,
icon-region and divider colors remain unchanged across all existing themes and contexts.

## State Precedence And Validation

Generated Selected selectors can remain active on a disabled root. The onSubtle Low and Lowest
therefore retain explicit Rest-equal Disabled backgrounds; Medium restores the neutral disabled
fill instead of its new tonal Rest. OnVivid Low has a distinct disabled fill and Lowest retains
its transparent Rest-equal reset. The shared Brand helpers follow the same terminal-state rule.

The focused Button/control suites passed 14 tests for this revision. They cover source geometry
contracts, all conventional intents and themes, Medium functional references, neutral Low fills,
transparent borders, Disabled precedence and readable onVivid content. The normal generation
pipeline also covers the participating Brand Packs. Generated artifacts and actual Showcase
presentation are revalidated whenever the shared formula changes.

The approved hierarchy changes preset definitions and the preset-owned Brand projection only.
No Builder, runtime, Headless or structural CSS change is needed. See the
[verification ledger](../polish-verification.md) for rendered checks and remaining consumer limits.

### 2026-09-08 validation

- 26 focused Button, control and foundation tests passed.
- Web Builder build/sync/registry generation passed, including optional Brand Packs.
- Showcase production build passed, including Next.js typechecking and static generation.
- A serialized before/after comparison of every Button element palette confirmed unchanged Rest values.
- In-app browser at `http://localhost:3000/button`: Small/Medium/Large measured approximately
  24/34/50 px, rounded radius 6 px; forced state matrix checked in Light and Dark; no console errors.
- The full preset typecheck reports Fluent errors outside this diff; no iOS 27 diagnostics.
- Pill remains schema- and artifact-verified; the Button Showcase follows the preset default (pill), with explicit radius overrides.
  Mobile viewport and native macOS rendering were not validated.

The preset global radius defaults to `pill`. `rounded` remains an explicit 6 px alternative;
the Showcase defaults to the preset choice rather than overriding it.


### Inline Badge relation (2026-09-09)

`e7` (`button-badge-relation`) enables supported inline Badge composition in Button.
This is a user-approved Kiskadee extension: no Apple visual source was found or used for
this spacing. The existing Fluent relation is the local implementation reference.
Left and right padding are 4 px for Small and 6 px for Medium/Large, keeping a compact
separation between the label and passive metadata. Badge paint and typography remain
owned by Badge; Button root padding and typography are unchanged. Overlay Badges do not
use this relation, and Buttons without inline Badges do not gain a grouping wrapper.
