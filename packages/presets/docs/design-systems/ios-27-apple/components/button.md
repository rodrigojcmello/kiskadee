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
adapted** typography mapping. The source letter-spacing detail is not added during this migration
because the active Button previously authored no tracking; it can be resolved later in the shared
typography profile without adding a Button-only capability.

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

## Kiskadee Mapping

| Kiskadee appearance | Apple relationship | Status | Decision |
| --- | --- | --- | --- |
| `primary.high` | `Bordered - Prominent`, non-destructive | Official adapted | Primary vivid surface and white foreground. |
| `primary.medium` | `Bordered`, non-destructive | Official adapted | `Fills/Tertiary` surface and Primary vivid foreground. |
| `primary.low` | No official equivalent | Kiskadee extension | Transparent surface, Primary vivid foreground, and a Primary vivid outline. |
| `primary.lowest` | `Borderless`, non-destructive | Official adapted | Transparent surface and Primary vivid foreground. |
| `destructive.high` | `Bordered - Prominent`, destructive | Official adapted | Destructive vivid surface and white foreground. |
| `destructive.medium` | `Bordered`, destructive; `BG - Destructive` | Official adapted | Destructive vivid surface at 14% and Destructive vivid foreground. |
| `destructive.low` | No official equivalent | Kiskadee extension | Transparent surface, Destructive vivid foreground, and a Destructive vivid outline. |
| `destructive.lowest` | `Borderless`, destructive | Official adapted | Transparent surface and Destructive vivid foreground. |
| `neutral.*` | No official Content Area intent | Kiskadee extension | Medium reuses `Fills/Tertiary`; the remaining emphases follow the shared formula. |
| `positive.*` | No official Content Area intent | Kiskadee extension | Medium applies Apple Green at 14%, mirroring the official destructive tint grammar. |

## Kiskadee Extensions

Kiskadee completes the matrix for `primary`, `neutral`, `destructive`, and `positive`, each with
High, Medium, Low, and Lowest. This gives every preset the same semantic and emphasis vocabulary
without claiming that Apple publishes all sixteen appearances. Primary Medium maps to Apple's
neutral `Fills/Tertiary` Bordered surface, while Destructive Medium maps to the dedicated
`Miscellaneous/Buttons/BG - Destructive` token: Accent Red at 14%. Neutral Medium reuses the neutral
fill as a Kiskadee extension. Positive Medium is also a Kiskadee extension: it applies the official
Apple Green accent at 14%, deliberately mirroring the destructive Button grammar Apple does
publish.

Low is a Kiskadee outline extension. Its Rest surface is transparent, its outline and content use
the intent family's `vivid` reference, and its interaction surfaces reuse the shared semantic
`subtle` rhythm. It must never be presented as Apple's `Bordered` style: the official style has a
neutral translucent fill and no visible stroke. Outside the explicit Medium surface split, all
roles reuse the same functional-reference offsets so future color segments expose tonal-scale
differences instead of hiding them in component-specific exceptions.

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
- Medium uses Apple's neutral `Fills/Tertiary` treatment with brand-colored content;
- Low is transparent with a brand-colored outline and content;
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

This separate Brand Pack `onVivid` projection keeps the fixed 1 px physical border transparent in
all four emphases. Its current Low remains the documented 12% white-overlay treatment rather than
the `onSubtle` outline extension; the conventional `onVivid` Button formula is deferred separately.

The optional resources are built under `brand-packs/auth` and `brand-packs/social`. Consumers must
use `BrandPackBoundary`; a missing pack never falls back silently to Primary or Neutral. Brand versus
monochrome artwork remains an explicit JSX choice and is not inferred by the Button formula.

### Kiskadee Extension: Surfaced Brand Marks

Apple does not publish an equivalent reusable icon-region treatment for the conventional Button
matrix inspected above. Kiskadee nevertheless exposes the optional `surface` treatment so a
full-color social mark remains legible over vivid Button surfaces:

- the icon region uses the Apple Gray Light cap (`L0`, white) in both Light and Dark themes;
- its inherited monochrome foreground uses Apple Gray Light `L85`;
- the stable light region is published for the preset's current conventional `onSubtle` Button
  context; its future `onVivid` adoption must accompany the complete Button formula rather than
  advertise a partial surface context;
- arbitrary brand artwork is neither recolored nor faded;
- the region publishes only Rest; interaction states continue to belong to the Button root;
- `iconSurfaceCorners` defaults to `all`, so the light region keeps the Button-derived radius on
  all four corners instead of flattening the two corners facing the label;
- `plain` remains the preset default, and the Button never chooses a mark presentation
  automatically.

This is a **Kiskadee extension**, not an Apple Button API or an appearance inferred from the source
Figma component.

## Shared Formula

All offsets below are ordinal movements through the canonical public tone grid, not numeric tone
arithmetic. For example, `L28 + 1` resolves to the next published position, L30.

| Emphasis | Rest surface | Hover | Pressed | Selected | Rest outline | Enabled foreground |
| --- | --- | --- | --- | --- | --- | --- |
| High | vivid +0 | vivid +1 | vivid +2 | vivid +1 | transparent | neutral contrast cap |
| Medium, Primary/Neutral | `Fills/Tertiary` | subtle +0 | subtle +2 | subtle +1 | transparent | role vivid |
| Medium, Destructive/Positive | role vivid at 14% | subtle +1 | subtle +2 | subtle +1 | transparent | role vivid |
| Low | transparent | subtle +0 | subtle +2 | subtle +1 | role vivid | role vivid |
| Lowest | transparent | subtle +0 | subtle +2 | subtle +1 | transparent | role vivid |

High uses the white cap in both themes, except Neutral High: its Light vivid surface is physically
dark and uses white L0, while its Dark vivid surface is physically light and uses black D0. This is
a fixed role exception authored into the preset, not a runtime contrast calculation.

Disabled follows the official Apple treatment for the mapped styles and a matching sparse extension
for the outline:

- High replaces its vivid surface with `Fills/Tertiary` and uses `Labels/Tertiary` content;
- Primary and Neutral Medium already rest on `Fills/Tertiary`, so they omit a redundant disabled
  surface delta and change only their content to `Labels/Tertiary`;
- Destructive and Positive Medium replace their semantic 14% Rest tint with `Fills/Tertiary` when
  disabled and use `Labels/Tertiary` content;
- Low replaces its transparent surface with `Fills/Tertiary`, removes its visible outline, and uses
  `Labels/Tertiary` content, matching the disabled treatment of High and Medium;
- Lowest remains transparent and uses `Labels/Tertiary` content.

Pending does not introduce an iOS-specific visual delta in this recipe. It inherits Rest while the
operational Button contract continues to lock activation and expose its accessibility state.

All four emphases reserve the same 1 px physical border. High, Medium, and Lowest keep it
transparent; Low paints it visibly. This prevents emphasis and state changes from altering the
Button's measured geometry. The Web Builder's existing mirrored-border and compensated-padding
policy preserves the authored 28, 34, and 50 px Apple heights without creating a new emission mode.

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

- `e1`: Button surface, interaction backgrounds, the pill radius, and a fixed 1 px border. Official
  Apple styles keep that border transparent; only the documented Kiskadee Low extension paints it.
  Compensated padding keeps the official outer geometry stable.
- `e2`: label content; role foreground, disabled foreground, Apple-system typography, and
  size-specific text metrics.
- `e3`: icon content; mirrors `e2` foreground states so interface glyphs and monochrome brand marks
  follow the Button content color. Fixed multicolor marks remain unchanged. Small, Medium, and
  Large reference the shared 16 px, 20 px, and 24 px icon sizes as the documented Web adaptation.
- `components.button.options.size`: Small, Medium, and Large map to the official 28, 34, and 50 px
  geometry within the existing schema.
- Palette intent and emphasis select the Apple relationship or documented Kiskadee extension; no
  literal HEX is authored in the component schema.

## Validation

- Source inspection covered the Content Area set and both Light and Dark example sections.
- Color decisions resolve through promoted tonal assets and the documented de-para; literal schema
  colors are prohibited.
- Sparse interaction maps omit Focus and Pending so they inherit Rest, while Hover, Pressed, and
  Selected remain explicit extensions. Rest-equal Disabled surface values are also omitted.
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
