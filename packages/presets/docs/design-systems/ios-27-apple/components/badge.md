# iOS 27 Apple Badge Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/ios-27-apple/components/badge.schema.ts`.

## Sources

- [Apple HIG: Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Apple HIG: Notifications](https://developer.apple.com/design/human-interface-guidelines/notifications)
- [Apple Style Guide: badge](https://help.apple.com/pdf/applestyleguide/en_US/apple-style-guide.pdf)
- [iOS and iPadOS 27 Tab Bars](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24689)
  - file key: `GeO2lMY65IAFczDmjs6oei`; page: `507:24689`;
  - inspected iPhone tab-button subtree: `5535:23119`;
  - this subtree has an image and label, with no Badge; it supplies no Badge geometry evidence.
- [Approved Apple color variables and mapping](../colors/ios-27-color-evidence.md)
  - color page `0:1746`; collection `Colors`; Light and Dark modes;
  - approved source-to-tonal de-para: [figma-to-kiskadee.json](../colors/figma-to-kiskadee.json).

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Attention badge | Apple HIG Tab bars | Red oval with white count or exclamation point for critical new information | Official adapted |
| Other metadata uses | Apple Style Guide | Counters, item type/state, and warning examples | Official adapted |
| Apple iOS 27 color family | `Colors` collection and approved de-para | Red and neutral endpoints, independent Light/Dark mapping | Official adapted |
| Figma badge geometry | `507:24689`, `5535:23119` | No Badge in inspected inventory/subtree | Not inspected |
| Six scales, other intents/emphases, Mark and Dot | Kiskadee Badge contract | Existing passive metadata capabilities | Kiskadee extension |

## Official Contract

The Apple attention badge is passive metadata: a red oval with white text, commonly a count or
exclamation point. The host supplies the information and decides when to clear it. The preset maps
this appearance to `attention.high` with `pill` radius, matching Kiskadee's existing portability
defaults. It does not turn Badge into an action or inherit interaction states from a Button host.

The inspected Apple guidance does not define a six-intent or emphasis matrix. It also does not
publish the pixel metrics below. Those dimensions are explicit Kiskadee composition choices;
this document does not present them as extracted iOS 27 Badge tokens.

## Color And Token Provenance

The preset uses its existing legacy `c()`/`c.ref()` resolver. All colors come from approved V5
assets, with no literal schema colors or generated-family changes. Functional positions below
are resolved results, not independent exact-tone decisions.

| Source concept | Source value | Lookup | Kiskadee mapping | Rationale |
| --- | --- | --- | --- | --- |
| Apple attention Red | Light `#ff383c`, Dark `#ff4245` | reference: `badge.attention.vivid` | `r.red.v1` L26 `#ff383c`, D65 `#e85752` | Exact Light anchor; approved Dark adaptation, Delta E 0.045893 |
| White Badge label | Physical white | cap: Light endpoint, 100% | Neutral L0, `e2/e4.attention.high` | Preserves the documented white-on-red identity |
| Alternate high surfaces | Apple Accent/Gray families, no official Badge variant | reference: each `badge.<intent>.vivid` | `e1/e5` filled metadata surfaces; `e3` full-bleed artwork | Family-relative Kiskadee extension |
| Medium surface | No official equivalent | reference: each `badge.<intent>.subtle` | Own-theme subtle in `onSubtle`; Light subtle in `onVivid` | A quiet opaque tint without transferring the parent surface |
| Low onSubtle surface | No official equivalent | reference: each `badge.<intent>.vivid`, 10% alpha | `e1/e5.low` | Family tint with the surrounding surface still visible |
| Medium/Low onSubtle text | No official equivalent | reference: Neutral vivid; chromatic vivid +14 Light / +5 Dark | `e2/e4` | Legible foreground over subtle and low-tint fills |
| Medium onVivid text | No official equivalent | reference: Neutral Light vivid; chromatic Light vivid +14 | `e2/e4.medium` | Dark family text on the independently light badge surface |
| Low onVivid surface/text | No official equivalent | cap: dark endpoint 12% / light endpoint 100% | `e1/e5` black overlay, `e2/e4` white | Maintains text contrast on the vivid canonical Card |
| Optional ring/backing | No inspected Apple equivalent | cap: Light endpoint, 100% | `e6` white outline and full-bleed backing | Explicit overlay separation, opt-in through the existing public prop |

The extension family mappings and resolved High / Medium-foreground pairs are:

| Intent | Primitive | High Light / Dark | Medium text Light / Dark |
| --- | --- | --- | --- |
| Neutral | Apple Gray `black.v1` | L90 `#1c1c1e` / D95 `#ebebee` | L90 `#1c1c1e` / D95 `#ebebee` |
| Primary | `blue.v1` | L28 `#0088ff` / D65 `#0088ff` | L95 `#001632` / D90 `#bcdaff` |
| Novelty | `purple.v1` | L30 `#cb30e0` / D65 `#c162ce` | L99 `#010001` / D90 `#f0c9f5` |
| Positive | `green.v1` | L20 `#34c759` / D65 `#00a23d` | L75 `#004214` / D90 `#b5e4ba` |
| Warning | `yellow.v1` | L10 `#ffcc00` / D65 `#a88500` | L50 `#775e00` / D90 `#e9d5a1` |
| Attention | `red.v1` | L26 `#ff383c` / D65 `#e85752` | L90 `#3e0003` / D90 `#ffcac4` |

High Attention always has white content. In Light, Neutral and Novelty High also use white; other
High extension profiles use black. Dark/Darker High extension profiles use black. This avoids
applying white uniformly to bright Yellow, Green, or Blue fills. Source-style white-on-red is
preserved as an Apple adaptation; the 4.5:1 extension contrast test applies to Medium and Low and
does not claim that Apple's source Red with small white text meets that threshold.

## Kiskadee Mapping

| Appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Attention High Pill | Apple notification/tab badge | Official adapted | White content and Red family-relative filled surface |
| Other High intents | No named Apple Badge equivalents | Kiskadee extension | Existing semantic roles preserve metadata portability |
| Medium and Low | No inspected native appearances | Kiskadee extension | Documented tint/surface formulas |
| onVivid | No inspected native matrix | Kiskadee extension | High keeps its semantic identity; Medium owns a pale surface; Low uses white text over a dark overlay |
| Darker | No Apple theme by this name | Kiskadee extension | Same control colors as Dark, over darker surrounding surfaces |
| Mark, Dot, six-scale ramp, square/rounded, separation ring | No source-exact complete matrix | Kiskadee extension | Existing Core anatomies and options only |

## Geometry And Typography

The text geometry is intentionally independent from Dot/Mark geometry. Text never shrinks below
the existing Apple Caption 2 profile merely to fit a tiny notification dot. Nominal height is a
minimum on both axes; longer counts grow horizontally into a pill using the current structural
contract.

| Scale | Text height | Shared typography | Vertical / horizontal padding | Dot/contained Mark size |
| --- | --- | --- | --- | --- |
| `s:sm:3` | 13 | `caption-small`, 11/13 Regular | 0 / 2 | 8 |
| `s:sm:2` | 14 | `caption-small`, 11/13 Regular | 0 / 3 | 10 |
| `s:sm:1` | 15 | `caption-small`, 11/13 Regular | 1 / 3 | 10 |
| `s:md:1` | 16 | `caption-small`, 11/13 Regular | 1 / 4 | 12 |
| `s:lg:1` | 18 | `caption-medium`, 12/16 Regular | 1 / 5 | 16 |
| `s:lg:2` | 20 | `label-small`, 13/18 Regular | 1 / 6 | 20 |

Contained mark icons use existing `global.iconSizes` references for 8/8/8/8/10/12px. Full-bleed
mark viewports use 8/8/8/10/12/20px. No new icon family, downloaded SF Symbols, or runtime glyph
fallback is introduced. Pill radius is 100; Square 0 and Rounded 5 are public Kiskadee extensions.
Optional separation has 1px width through Small and 2px from Medium upward.

## Shared Formula And State Ownership

Badge is Rest-only. It does not emit Hover, Pressed, Focus, Selected, Disabled, or Pending colors,
even inside an interactive host. High fill always follows the participating family's vivid anchor;
Medium uses subtle; Low uses the documented alpha recipes. All palette resolution occurs at schema
authoring/build time. The Badge never infers its surrounding surface from pixel luminance.

## Deferred Or Unsupported

- Exact iOS 27 Figma Badge geometry remains **Not inspected**.
- No special native badge animation, glass material, or notification lifecycle is implemented.
- A static Dot shadow is not authored: Apple badge sources did not establish one.
- Lowest emphasis remains absent, matching the current bounded source-backed coverage strategy.

## Schema Mapping

- `e1`: text badge surface and nominal geometry.
- `e2`: shared typography and text paint.
- `e3`: independent full-bleed Mark viewport and high intent paint.
- `e4`: contained Mark icon viewport and foreground.
- `e5`: independent Dot/contained Mark surface.
- `e6`: optional separation ring and full-bleed backing.

## Validation

Focused tests validate the Core Badge contract, Rest-only palettes, all six intents in both contexts
and all three themes, independent Light/Dark Attention paint, tonal-role remapping, and at least
4.5:1 Medium/Low text contrast against the canonical neutral and vivid test backgrounds. Generated
artifacts, profile references, and browser inspection are validated after preset integration.

## Open Gaps

Exact Figma Badge measurement is still uninspected. The source distinction and the extension
geometry remain explicit until a native component node provides stronger evidence.

## Composition scale recalibration (2026-09-09)

User-approved Kiskadee extension, not new Apple source evidence. The former `sm2` recipe is now
`md`: 16 px surface, 1 px vertical / 4 px horizontal padding, caption-small (11/13 px), and the
corresponding mark, dot and ring recipes. This pairs with an explicitly Medium Button.
The six surface heights are now 13/14/15/16/18/20 px (sm3/sm2/sm/md/lg/lg2).
Small sizes retain caption-small for legibility; lg uses caption-medium and lg2 uses label-small.
Dot diameters are 8/10/10/12/16/20 px. Existing explicit size names therefore render more compactly;
colors, placement rules, default density and Button geometry are unchanged.
Shared Button/Badge composition examples follow preset density defaults, with no preset-specific branch.

## Exact pill geometry (2026-09-10)

Kiskadee adaptation: pill radius is authored per size as half the nominal surface height,
without oversized CSS sentinel values. Square and rounded retain their existing recipes.
Button external Badge anchors consume the Button radius in structural CSS; Badge radius
remains independent. Separation outlines follow the actual Badge surface.
