# iOS 27 Apple Progress Evidence

This file records source evidence and schema decisions for
`packages/presets/src/presets/ios-27-apple/components/progress.schema.ts`.

## Sources

- [iOS 27 Progress Indicators page](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24682)
  - file key: `GeO2lMY65IAFczDmjs6oei`; page: `507:24682`;
  - determinate linear set: `9:55875`; 50-percent variant: `9:56148`;
  - Light instance: `5433:20247`; Dark instance: `5433:20646`;
  - track: `495:46297`; filled portion: `495:46298`;
  - circular indeterminate set: `5425:3431`.
- [Apple HIG: Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators)
- [UIKit UIProgressView](https://developer.apple.com/documentation/uikit/uiprogressview/)
- [UIKit progressTintColor](https://developer.apple.com/documentation/uikit/uiprogressview/progresstintcolor)
- [UIKit trackTintColor](https://developer.apple.com/documentation/uikit/uiprogressview/tracktintcolor)
- [Approved Apple color mapping](../colors/figma-to-kiskadee.json)

## Source Coverage

| Source area | Node or reference | Inspected | Status |
| --- | --- | --- | --- |
| Linear progress | `9:55875`, `5433:20247`, `5433:20646` | 0-100 percent variants; Light and Dark 50-percent examples, geometry, variables | Official adapted |
| Source geometry | `495:46297`, `495:46298` | 4px track and fill, radius 100 | Official exact at Large |
| Source color variables | `5433:20646` and approved collection | Accents/Blue and Fills/Primary resolved independently in Light and Dark | Official adapted |
| Circular activity indicators | `5425:3431` | Inventory shows Small 14px, Regular 20px, Large 35px | Deferred |
| Alternate intents and strong surfaces | No equivalent inspected | Existing Kiskadee profiles completed through Apple tonal families | Kiskadee extension |

## Official Contract

Apple separates determinate linear progress from circular indeterminate activity. The source bar
fills from the leading edge and uses independently tintable track and indicator paint. Its optional
label and outer 16px horizontal / 20px vertical spacing belong to its surrounding composition.
Kiskadee Progress has no label or layout-padding slots, so the preset does not add them.

The Figma track and fill are 4px high with 100px radius. `s:lg:1` represents that geometry exactly.
Core fixes `s:md:1` to 2px and `s:lg:1` to 4px; Medium is an explicit compact Kiskadee extension.
No Core, Builder, or runtime change is required.

## Color And Token Provenance

All colors resolve from the approved V5 assets. The existing iOS legacy getter remains in use:
`c.ref()` expresses a family-relative locator, `c()` expresses documented fixed positions or
physical endpoints. No literal color is authored in the schema.

| Source concept | Source value | Lookup | Kiskadee mapping | Rationale |
| --- | --- | --- | --- | --- |
| Light track / Fills/Primary | `#787878`, 20% alpha | exact: Neutral L35 at 20% | `e2.neutral.medium`, `#7b7b7e33`, Delta E 0.012078 before alpha | Approved semantic de-para |
| Dark track / Fills/Primary | `#787880`, 36% alpha | exact: Neutral D55 at 36% | `e2.neutral.medium`, `#7a7a7c5c`, Delta E 0.010313 before alpha | Independent Dark de-para |
| Light indicator / Accents/Blue | `#0088ff` | reference: `progress.primary.vivid` | `b.blue.v1` L28, exact source anchor | Primary is semantically remappable |
| Dark indicator / Accents/Blue | `#0091ff` | reference: `progress.primary.vivid +1` | `b.blue.v1` D70, `#2e92ff`, Delta E 0.013637 | Approved nearest Dark correspondence |
| Positive extension / Accents/Green | Light `#34c759`, Dark `#30d158` | reference: `progress.positive.vivid`, Dark +3 | `g.green.v1` L20/D80, `#34c759`/`#64cd76` | Explicit semantic extension; Dark Delta E 0.052042 |
| Warning extension / Accents/Orange | Light `#ff8d28`, Dark `#ff9230` | reference: `progress.warning.v2.vivid`, Dark +3 | `yr.orange.v1` L18/D80, `#ff8d28`/`#f69d5b` | Existing Orange variant; Dark Delta E 0.034930 |
| Destructive extension / Accents/Red | Light `#ff383c`, Dark `#ff4245` | reference: `progress.destructive.vivid` | `r.red.v1` L26/D65, `#ff383c`/`#e85752` | Existing Red family; Dark Delta E 0.045893 |
| Neutral extension | No official tint profile | reference: `progress.neutral.vivid` | Apple Gray L90/D95 | Neutral fallback without duplicating Blue |
| Strong-surface track | No source equivalent | cap: Light endpoint at 24% | `e2` white overlay | Visible track on a vivid parent |
| Strong-surface indicator | No source equivalent | reference: Light `progress.<intent>.subtle` | `e3` pale family-relative indicator | Preserves family identity and contrast on a vivid parent |

## Kiskadee Mapping

| Kiskadee appearance | Upstream relationship | Status | Decision |
| --- | --- | --- | --- |
| Primary Medium, Light/Dark | Source linear bar and Blue tint | Official adapted | Keep independent track and fill paint |
| Large 4px | Source track thickness | Official exact | Same geometry, existing scale |
| Medium 2px | No inspected source size | Kiskadee extension | Required compact Core scale |
| Neutral, Positive, Warning, Destructive | UIKit permits custom tint; no named iOS variants inspected | Kiskadee extension | Existing semantic roles and approved Apple families |
| `onVivid` | No inspected source treatment | Kiskadee extension | White track overlay plus pale family indicator |
| Darker | No Apple theme by this name | Kiskadee extension | Reuse Dark control colors over the darker canonical surfaces |
| Linear indeterminate | Apple documents this appearance for macOS, not iOS | Kiskadee extension | Existing Web Progress mode; no claim of native iOS fidelity |

## Shared Formula

The track is always `neutral.medium`; the indicator has one `medium.rest` per Core intent.
Dark and Darker consume the Dark tonal track. Indicator offsets follow the approved Accent de-para,
while `onVivid` uses each family's Light subtle anchor. All resolution occurs at schema authoring
or build time, with no runtime color logic.

## Deferred Or Unsupported

- Native iOS circular indeterminate indicators require a component capability outside this task.
- No circular spinner is approximated with a linear bar or source image.
- Optional source label, outer spacing, and layout remain consumer-owned.
- Hover, Pressed, Focus, Selected, Disabled, and Pending are not Progress palette states.

## Schema Mapping

- `e1`: semantic root, name only.
- `e2`: track geometry and Neutral Medium Rest paint.
- `e3`: fill geometry and all five Medium Rest intent paints.
- Progress value and indeterminate mode remain runtime behavior.

## Validation

Focused tests validate the Core contract, both contexts across all three themes, the approved
Fills/Primary de-para, readable separation between fill and track, and role remapping through the
functional-reference getter. Generated artifacts and browser inspection are validated after preset
integration.

## Open Gaps

Native spinner support and Apple-native indeterminate animation remain deferred. Medium 2px and
additional intent profiles remain explicit Kiskadee extensions.
