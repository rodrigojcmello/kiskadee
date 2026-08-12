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
| `Bordered` | `Fills/Tertiary` | `Accents/Blue`, or `Accents/Red` when destructive | `Fills/Tertiary` | `Labels/Tertiary` |
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
adapted** typography mapping. The source letter-spacing detail is not added during this migration
because the active Button previously authored no tracking; it can be resolved later in the shared
typography profile without adding a Button-only capability.

The inspected source confirms the title-and-icon composition but does not expose a reusable symbol
viewport token. Kiskadee therefore keeps Small text-relative at 15 px and applies a modest Web
adaptation of 17 px for Medium and 20 px for Large. This **Kiskadee extension** improves the visual
ratio between glyph and Button without changing the official Button height, padding, or label
metrics.

## Color And Token Provenance

| Source concept | Official Light/Dark value | Kiskadee mapping |
| --- | --- | --- |
| `Accents/Blue` | `#0088ff` / `#0091ff` | `button.primary`, `b.blue.v1`; vivid L28/D65 |
| `Accents/Red` | `#ff383c` / `#ff4245` | `button.destructive`, `r.red.v1`; vivid L26/D65 |
| `Accents/Green` | `#34c759` / `#30d158` | `button.positive`, `g.green.v1`; vivid L20/D65; Kiskadee extension in Button |
| `Grays/Black` family | centralized Apple Grays | `button.neutral`, generated `n.black.v2` → preset `primitive.black.v1`; vivid L90/D95; Kiskadee extension in Button |
| `Grays/White` | `#ffffff` / `#ffffff` | neutral cap L0/D100 |
| `Fills/Tertiary` | base `#767680` at 12% / 24% | neutral L40 at 12% / D55 at 24% |
| `Labels/Tertiary` | base `#3c3c43` at 30% / `#ebebf5` at 30% | neutral L70 at 30% / D95 at 30% |

Apple's Dark Accent values remain official correspondence evidence. The schema consumes the
generated family's Dark functional reference, so a value such as official Blue `#0091ff` can map
to a nearby canonical tone rather than remain byte-exact. This is an **Official adapted** choice,
not loss of source provenance.

## Kiskadee Mapping

| Kiskadee appearance | Apple relationship | Status | Decision |
| --- | --- | --- | --- |
| `primary.high` | `Bordered - Prominent`, non-destructive | Official adapted | Primary vivid surface and white foreground. |
| `primary.medium` | No official equivalent | Kiskadee extension | Primary subtle surface and vivid foreground. |
| `primary.low` | `Bordered`, non-destructive | Official adapted | `Fills/Tertiary` surface and Primary vivid foreground. |
| `primary.lowest` | `Borderless`, non-destructive | Official adapted | Transparent surface and Primary vivid foreground. |
| `destructive.high` | `Bordered - Prominent`, destructive | Official adapted | Destructive vivid surface and white foreground. |
| `destructive.medium` | No official equivalent | Kiskadee extension | Destructive subtle surface and vivid foreground. |
| `destructive.low` | `Bordered`, destructive | Official adapted | `Fills/Tertiary` surface and Destructive vivid foreground. |
| `destructive.lowest` | `Borderless`, destructive | Official adapted | Transparent surface and Destructive vivid foreground. |
| `neutral.*` | No official Content Area intent | Kiskadee extension | Shared formula applied to `button.neutral`. |
| `positive.*` | No official Content Area intent | Kiskadee extension | Shared formula applied to `button.positive`. |

## Kiskadee Extensions

Kiskadee completes the matrix for `primary`, `neutral`, `destructive`, and `positive`, each with
High, Medium, Low, and Lowest. This gives every preset the same semantic and emphasis vocabulary
without claiming that Apple publishes all sixteen appearances.

Medium is the tonal companion to Apple's prominent action: it starts at the family's `subtle`
reference while preserving a role-colored foreground. Neutral and Positive reuse the exact same
formula as Primary and Destructive. No role receives hand-tuned state positions, so future color
segments expose tonal-scale differences instead of hiding them in component-specific exceptions.

Hover, Pressed, and Selected are also Kiskadee extensions because the inspected Figma variants only
publish enabled and disabled. Focus is intentionally absent from the palette maps and inherits Rest;
the external focus ring remains the focus affordance and uses the Primary `vivid` reference.

### Kiskadee Extension: Brand Color Packs

Apple does not publish a conventional Button matrix for Kiskadee's third-party authentication and
social brand collection. The optional `auth` and `social` Brand Packs are therefore a **Kiskadee
extension**. Brand membership, official seed provenance, logo construction, and content polarity
remain owned by `@kiskadee/brands`; none of those colors enters the Apple primitive catalog,
`colors.json`, global CSS, or normal Button class map.

On a subtle surrounding surface, every brand is projected through the same iOS Button recipe used
by Primary, Destructive, Positive, and Neutral:

- High uses the brand family's `vivid` reference and its documented content polarity;
- Medium starts at the brand family's `subtle` reference;
- Low uses Apple's `Fills/Tertiary` treatment with brand-colored content;
- Lowest is transparent with brand-colored content;
- Hover, Pressed, Selected, and Disabled preserve the shared iOS formula;
- a Dark `contrast-mirror` vivid reference reverses content polarity during build so monochrome
  black identities never produce white content over a physically light mirrored surface.

For a vivid surrounding surface, the projection uses a separate contrast-safe Kiskadee extension:

| Emphasis | Rest / Hover / Pressed surface | Foreground |
| --- | --- | --- |
| High | White 100% / 92% / 84% | Brand Light `vivid` |
| Medium | White 24% / 32% / 40% | White |
| Low | White 12% / 20% / 28% | White |
| Lowest | Transparent / White 12% / 20% | White |

Disabled visible surfaces use White at 12% and disabled content uses White at 30%. Low omits a
disabled surface delta because its Rest surface already resolves to the same 12% value. Selected
intentionally resolves to the Pressed surface as the persistent active appearance. Focus remains
omitted and inherits Rest while the external focus ring remains independently available.

The optional resources are built under `brand-packs/auth` and `brand-packs/social`. Consumers must
use `BrandPackBoundary`; a missing pack never falls back silently to Primary or Neutral. Brand versus
monochrome artwork remains an explicit JSX choice and is not inferred by the Button formula.

## Shared Formula

All offsets below are ordinal movements through the canonical public tone grid, not numeric tone
arithmetic. For example, `L28 + 1` resolves to the next published position, L30.

| Emphasis | Rest | Hover | Pressed | Selected | Enabled foreground |
| --- | --- | --- | --- | --- | --- |
| High | vivid +0 | vivid +1 | vivid +2 | vivid +1 | neutral contrast cap |
| Medium | subtle +0 | subtle +1 | subtle +2 | subtle +1 | role vivid |
| Low | `Fills/Tertiary` | subtle +0 | subtle +2 | subtle +1 | role vivid |
| Lowest | transparent | subtle +0 | subtle +2 | subtle +1 | role vivid |

High uses the white cap in both themes, except Neutral High: its Light vivid surface is physically
dark and uses white L0, while its Dark vivid surface is physically light and uses black D0. This is
a fixed role exception authored into the preset, not a runtime contrast calculation.

Disabled uses the official Apple treatment wherever the emphasis has a visible surface:

- High, Medium, and Low use `Fills/Tertiary` plus `Labels/Tertiary`;
- Lowest remains transparent and uses `Labels/Tertiary`;
- every disabled border remains absent.

The helper resolves functional references, offsets, theme orientation, alpha, and the Neutral High
polarity exception into static schema colors. Native and web consumers receive final values and do
not execute this formula at runtime.

## Deferred Or Unsupported

- Liquid Glass Text and Symbol are **Deferred**. Their glass materials, textured or scene-relative
  backgrounds, and authored material/effect paints are real upstream capabilities, but the current
  Kiskadee Button schema has no Liquid Glass contract.
- The iOS 27 Card now publishes a Primary High canonical canvas whose descendants should use
  `onVivid`. This fixes background availability for Brand Pack examples, but it does not add an
  `onVivid` palette to the conventional Button. The two contracts remain independent.
- No texture is flattened into a literal color and no conventional Button style pretends to be
  glass. A future implementation must introduce a deliberate cross-platform material capability.
- Label-and-icon, icon-only, and title-only are official content forms. They remain consumer content
  composition rather than a new preset appearance axis.

## Schema Mapping

- `e1`: Button surface; background states and the pill radius. The conventional Apple styles have
  no visible border or shadow.
- `e2`: label content; role foreground, disabled foreground, Apple-system typography, and
  size-specific text metrics.
- `e3`: icon content; mirrors `e2` foreground states so interface glyphs and monochrome brand marks
  follow the Button content color. Fixed multicolor marks remain unchanged. Small remains
  text-relative; Medium and Large publish 17 px and 20 px viewports as the documented Web
  adaptation.
- `components.button.options.size`: Small, Medium, and Large map to the official 28, 34, and 50 px
  geometry within the existing schema.
- Palette intent and emphasis select the Apple relationship or documented Kiskadee extension; no
  literal HEX is authored in the component schema.

## Validation

- Source inspection covered the Content Area set and both Light and Dark example sections.
- Color decisions resolve through promoted tonal assets and the documented de-para; literal schema
  colors are prohibited.
- Sparse interaction maps omit Focus so it inherits Rest, while Hover, Pressed, and Selected remain
  explicit extensions.
- Generated artifacts and browser presentation must be revalidated whenever the shared formula or
  promoted tonal assets change.

## Open Gaps

- Liquid Glass remains intentionally deferred.
- No upstream interaction-state variants exist in the inspected Content Area set; Kiskadee's state
  rhythm is therefore framework-owned and must not be cited as official Apple behavior.
- The conventional Button currently authors only `onSubtle`. Brand Pack `onVivid` projection is a
  separate extension and does not imply conventional Button support.
- The Card publishes a Primary High canonical canvas, so Brand Pack Buttons that already support
  `onVivid` can be validated on a preset-owned background. See [Card evidence](card.md).
