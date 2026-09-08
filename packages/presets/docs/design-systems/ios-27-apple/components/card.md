# iOS 27 Apple Card And Surface Evidence

This file records the source evidence and schema decisions for
`packages/presets/src/presets/ios-27-apple/components/card.schema.ts`.

## Sources

### Canonical opaque backgrounds

- [Backgrounds swatch grid — node `5532:7801`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5532-7801)
  - primary source for `Backgrounds/Primary`, `Secondary`, `Tertiary`, and their Elevated modes;
  - includes Light, Dark Base, and Dark Elevated values.
- [Grouped Backgrounds swatch grid — node `5532:8370`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5532-8370)
  - supporting source for the grouped Primary, Secondary, and Tertiary nesting sequence;
  - includes Light, Dark Base, and Dark Elevated values.

### Opaque-background applications

- [Context Menu — node `754:46405`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=754-46405)
- [Context Menu — node `754:46443`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=754-46443)
- [Grouped Table View section — node `5433:15705`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5433-15705)
- [Window examples — node `5589:23685`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5589-23685)

These nodes confirm that the same semantic background variables are used in real compositions.
They do not define a reusable Apple component named Card.

### Glass and material applications

- [Alert — node `754:43708`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=754-43708)
- [Action Sheet — node `5580:104363`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5580-104363)
- [Color Picker — node `5584:62551`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5584-62551)
- [Material sample — node `510:82533`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=510-82533)
- [Action Sheet application — node `5446:10266`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=5446-10266)
- [Activity View — node `10460:19805`](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=10460-19805)

These applications use translucent fills, blur, material paints, or scene-relative composition.
They are evidence for a future material capability and are not flattened into opaque Card colors.

## Source Coverage

| Source area | Evidence | Status | Decision |
| --- | --- | --- | --- |
| Standard backgrounds | `5532:7801` | Official exact | Primary source for opaque Light, Dark Base, and Dark Elevated surfaces. |
| Grouped backgrounds | `5532:8370` | Official exact | Preserved as nesting evidence; not introduced as a Card axis. |
| Opaque applications | Context Menu, Grouped Table View, Window nodes | Official adapted | Confirm use of semantic backgrounds in compositions. |
| Primary vivid canvas | `Accents/Blue` from the centralized color variables | Kiskadee extension | Exposed as a strong Card surface for descendants using `onVivid`. |
| Glass and material | Alert, Action Sheet, Color Picker, Material, Activity View nodes | Deferred | Requires a material/effect contract; no opaque approximation is emitted. |
| Card geometry and interaction states | No reusable Apple Card component inspected | Kiskadee extension | Existing padding, radius, and shadow remain framework-owned. |

## Official Background Contract

Apple publishes two related semantic stacks rather than one monotonic emphasis ramp.

### Standard backgrounds

| Variable | Light | Dark Base | Dark Elevated |
| --- | --- | --- | --- |
| Primary | `#ffffff` | `#000000` | `#1c1c1e` |
| Secondary | `#f2f2f7` | `#1c1c1e` | `#2c2c2e` |
| Tertiary | `#ffffff` | `#2c2c2e` | `#3a3a3c` |

### Grouped backgrounds

| Variable | Light | Dark Base | Dark Elevated |
| --- | --- | --- | --- |
| Primary | `#f2f2f7` | `#000000` | `#1c1c1e` |
| Secondary | `#ffffff` | `#1c1c1e` | `#2c2c2e` |
| Tertiary | `#f2f2f7` | `#2c2c2e` | `#3a3a3c` |

Primary, Secondary, and Tertiary describe nesting order. They are not stronger Card emphases. In
Light mode several entries intentionally repeat, so mapping every Apple name to a different
Kiskadee emphasis would create duplicate surfaces and would misuse the emphasis axis.

## Source-To-Tonal Mapping

The approved Apple Gray `n.black.v2` is published as `primitive.black.v1`. Exact background
stops below follow the inspected variables. Darker maps Apple's Dark Base appearance to the
existing third Kiskadee theme; it does not invent a third Apple color ramp.

| Surface | Light | Dark (Elevated) | Darker (Base) | Status |
| --- | --- | --- | --- | --- |
| neutral.lowest | L0 white | D10 #2c2c2e | D5 #1c1c1e | Official adapted raised container, optional border on by default |
| neutral.low | L3 #f2f2f4 | D5 #1c1c1e | D0 black | Official adapted grouped/base route canvas |
| neutral.medium | L0 white | D16 #38383b | D10 #2c2c2e | Official adapted higher opaque content container |
| primary.medium | Blue Light subtle reference | Blue Dark subtle reference | Blue Dark subtle reference | Kiskadee extension tinted content surface |
| primary.high | Blue Light vivid +4 | same Light-track reference | same Light-track reference | Kiskadee extension strong surface |
| primary.highest | Blue Light vivid +8 | same Light-track reference | same Light-track reference | Kiskadee extension strongest surface |

Source Secondary Light #f2f2f7 maps to L3 with Delta E 0.004082. Source Elevated Tertiary
#3a3a3c maps to D16 #38383b. Both source values remain stored in the color evidence. Light
lowest/medium intentionally share opaque white but differ in their default boundary. This
represents a bordered container and a grouped content surface without inventing another gray.

Strong Primary no longer uses the raw light Accent L28. The source Accent is designed for tint,
not a general canvas of white text. `vivid +4` resolves to #0069c8 and `vivid +8` to #004588;
these family-relative offsets preserve the tonal scale and establish a readable strong canvas.
Both are explicit extensions, not Apple background tokens. Dark and Darker use the same Light
track for these surfaces so their descendants consistently use light foregrounds.

## Canonical Surfaces And Content Context

Light and Dark publish all six canonical entries. Darker publishes five, omitting Neutral Medium
from the canonical suggestions while retaining its full palette and runtime support. The existing
Showcase preference resolves to Neutral Low (black) when Medium is absent; this makes Darker a
Base canvas without changing Showcase selection logic. Medium remains available to explicitly
configured nested Cards. Opaque neutral/tinted entries publish `onSubtle`; Primary High/Highest
publish `onVivid`.

Card explicitly publishes `contentSurfaceContext` in both input contexts. Opaque Neutral and
Primary Medium reset descendants to `onSubtle`; their Selected state switches to Primary High
and `onVivid`. High/Highest always publish `onVivid`. The catalog alone does not perform this
runtime transition. Nested Cards consume the matching contextual border while retaining their
own opaque source-backed surface.

## Interaction, Border, And Geometry

Rest background colors are source-backed; Apple background variables do not define Card states.
No Hover/Pressed/Focus fill is invented. The existing optional shadow effect supplies transient
CardAction elevation. Selected promotes Neutral and Primary Medium to Primary High as a
**Kiskadee extension**, paired with the explicit descendant-context transition.

The optional border consumes `global.contours.neutral.standard.low`. This shares the inspected
nonopaque separator paint; its use as a Card boundary is an explicit extension. Lowest enables
the border by default; other opaque surfaces leave it off. High/Highest enable their boundary
on a vivid parent to keep equal-color nested surfaces identifiable. Border controls can override
these defaults without changing the fill. Geometry stays at 16px padding, 28px rounded radius,
1px border box and the existing shadow scale. These remain Kiskadee extensions.

## Deferred Or Unsupported

Liquid Glass, blur, vibrancy, scene-relative materials, and a separate grouped/elevated axis
remain **Deferred**. No opaque Card claims to render Apple's glass. Square mode, selection and
optional elevation are existing framework capabilities configured by this preset.

## Validation

Regression coverage checks canonical entries against emitted palettes, every content transition
in all themes and input contexts, and neutral foreground contrast on canonical surfaces. Generated
artifacts and visual inspection must confirm the complete chain. See
[polish verification ledger](../polish-verification.md) for actual command and browser results.
