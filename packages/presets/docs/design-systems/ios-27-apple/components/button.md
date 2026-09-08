# iOS 27 Apple Button Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/ios-27-apple/components/button.schema.ts`.

## Sources

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
adapted** typography mapping. Small and Medium consume the shared `body-small` profile at
15/20 px with -0.23 px tracking; Large consumes `body-medium` at 17/22 px with -0.43 px tracking.
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
| High | vivid +0 | vivid +1 | vivid +2 | vivid +1 | neutral contrast cap |
| Medium | subtle +0 | subtle +1 | subtle +2 | subtle +1 | role vivid |
| Low | neutral `Fills/Tertiary` | subtle +0 | subtle +2 | subtle +1 | role vivid |
| Lowest | transparent | subtle +0 | subtle +2 | subtle +1 | role vivid |

The Low transient states keep the former non-prominent tonal transitions. These and Selected
are explicit Web extensions; source variants do not prescribe the complete interaction matrix.
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

- `e1`: Button surface, interaction backgrounds, the pill radius, and a fixed 1 px border. Official
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
- `components.button.options.size`: Small, Medium, and Large map to the official 28, 34, and 50 px
  geometry within the existing schema.
- Palette intent and emphasis select the Apple relationship or documented Kiskadee extension; no
  literal HEX is authored in the component schema.

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
