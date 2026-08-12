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

The schema uses the approved Apple Gray and Blue tonal assets. Generated Apple Gray `n.black.v2`
is published by the preset as its single `primitive.black.v1`. No literal source color appears in
the official preset schema.

| Kiskadee surface | Source concept | Light mapping | Dark mapping | Status |
| --- | --- | --- | --- | --- |
| `neutral.low` | `Backgrounds/Primary - Elevated`; also matches Grouped Secondary | `n.black.v2` → `primitive.black.v1` L0, exact `#ffffff` | `n.black.v2` → `primitive.black.v1` D5, exact `#1c1c1e` | Official adapted |
| `neutral.medium` | `Backgrounds/Secondary - Elevated` | `n.black.v2` → `primitive.black.v1` L3, `#f2f2f4`, Delta E `0.004082` | `n.black.v2` → `primitive.black.v1` D10, exact `#2c2c2e` | Official adapted |
| `primary.high` | `Accents/Blue` used as a local strong canvas | `b.blue.v1` L28, exact `#0088ff` | `b.blue.v1` D70, `#2e92ff`, Delta E `0.013637` from `#0091ff` | Kiskadee extension |

The third Elevated background remains documented but is not emitted as `neutral.high`: its Light
value returns to white, while Kiskadee `high` means a vivid or strongly contrasted own surface.
Apple's nesting vocabulary is preserved in evidence instead of being forced into the wrong public
axis.

## Canonical Surface Catalog

The Card publishes the same ordered catalog for Light and Dark:

```text
neutral.low    -> descendants use onSubtle
neutral.medium -> descendants use onSubtle
primary.high   -> descendants use onVivid
```

The ordering is intentional. The Showcase uses the second canonical entry as its route background,
so iOS 27 starts on Apple's Secondary Elevated surface. Choosing `onVivid` selects the blue Primary
High surface rather than leaving the example container transparent.

The Card surface itself is always authored under `onSubtle`. `contentSurfaceContext` describes the
palette descendants should use; it does not move the Card into an `onVivid` palette.

## Interaction, Border, And Geometry

The inspected background variables define Rest colors, not Card interaction states. Hover,
Pressed, Focus, and Disabled therefore do not receive invented color deltas. Existing shadow
behavior remains the CardAction transient interaction affordance.

Selected is one explicit Kiskadee extension retained from the previous Card contract: Neutral Low
and Neutral Medium promote to the same Primary High surface. This keeps persistent CardAction
selection visible and preserves the consumer's existing light-on-vivid content treatment. Primary
High has no Rest-equal Selected override; it already owns that surface.

The inspected opaque surfaces do not establish one reusable border recipe. The structural
one-pixel border remains for layout compatibility but resolves to transparent in every published
surface. Padding, 28 px radius, and shadow levels remain explicit Kiskadee extensions until a
reusable Apple Card component provides stronger evidence.

## Deferred Or Unsupported

- Liquid Glass, material blur, vibrancy, scene-relative contrast, and effect paints.
- A separate grouped/elevated axis for Card.
- Conventional Button `onVivid`; Card background availability and Button palette availability are
  independent contracts.
- Apple-specific Card states or geometry beyond the existing Kiskadee extension.

## Validation

- `components.card.options.canonicalSurfaces` must reference only emitted Rest surfaces.
- Neutral Selected must resolve to Primary High without redundant selected substates.
- The generated Card component artifact must contain both themes and all three ordered entries.
- Light must resolve to `#ffffff`, `#f2f2f4`, and `#0088ff`.
- Dark must resolve to `#1c1c1e`, `#2c2c2e`, and `#2e92ff`.
- No glass application may be represented by one of these opaque colors as though it were exact.
