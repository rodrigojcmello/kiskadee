# Achromatic neutral surfaces — 2026-09-19

Status: user-authorized Kiskadee adaptation based on supplied Windows screenshots.
This is not a claim that Fluent Web, Teams and WinUI share identical token recipes.
Visual acceptance of the rendered preset remains user-owned.

## Evidence

Original PNGs are preserved under `../evidence/neutral-surfaces-2026-09-19/`:

| Screenshot | Measured fills | Measured lines |
| --- | --- | --- |
| [Teams chat](../evidence/neutral-surfaces-2026-09-19/teams-chat.png) | #ebebeb, #ffffff, #fbfbfb | #e0e0e0 over gray; #f2f2f2 over white |
| [Teams settings](../evidence/neutral-surfaces-2026-09-19/teams-settings.png) | #ebebeb, #ffffff | #f2f2f2 header, #d1d1d1 group, #e0e0e0 inner line |
| [Explorer](../evidence/neutral-surfaces-2026-09-19/explorer.png) | #f8f8f8, #e8e8e8, #fdfdfd, #ffffff | #d6d6d6, #dadada |
| [Windows settings](../evidence/neutral-surfaces-2026-09-19/windows-settings.png) | #f3f3f3 page, #fbfbfb cards, #eaeaea selection, #f4f4f4 notice | #e5e5e5 |
| [Start menu](../evidence/neutral-surfaces-2026-09-19/start-menu.png) | #eeeeee bands, #f2f2f2 body | #e0e0e0 |

Measurements use encoded RGB samples from the original files, not display-profile conversion.
Explorer's #d9d9d9 selection is an interaction state, excluded from the Rest hierarchy.
Different line colors do not establish different intents for white and gray backgrounds.

## Current mapping

The preset maps global Neutral and all inherited component Neutral roles to `primitive.black.v1`
in both segments and all themes. Primary and shared chromatic families retain their scale samples.
The current recipe removes derived Black v2/v3. The generator's derivation feature is unchanged.

| Light Card Neutral | Target | Locator | Published |
| --- | --- | --- | --- |
| Lowest | #ffffff | physical light cap | #ffffff |
| Low | #fafafa | exact card.neutral L1 | #fbfbfb |
| Medium | #f3f3f3 | exact card.neutral L3 | #f2f2f2 |
| High | #ebebeb | exact card.neutral L5 | #e9e9e9 |

The same Light Rest progression applies onSubtle and onVivid. Existing interaction recipes
were initially retained; the [October 9 Card refinement](card.md#subtle-neutral-interaction-refinement--2026-10-09)
softens Light neutral Hover/Pressed. High now follows the same adjacent-step Hover/Pressed rule. High remains onSubtle for descendants,
is included in the canonical surface catalog, and has an optional border. No Light Highest
neutral is introduced. Primary recipes are unchanged.

| Light onSubtle contour | Locator | Published |
| --- | --- | --- |
| Lowest | physical black cap (L100), 5% alpha | #0000000d |
| Low | physical black cap (L100), 9.5% alpha | #00000018 |
| Medium | physical black cap (L100), 23% alpha | #0000003b |

Separator publishes all three levels through the shared contour catalog. Light neutral Card
borders use the shared Low contour, independently of fill emphasis. Border visibility defaults
are unchanged. On 2026-09-20 the user approved replacing the solid L3/L6/L10 contours
with physical black at 5/9.5/23% alpha so dividing lines retain the underlying surface hue.
The user refined Low to 9.5% on 2026-09-21 after practical visual testing.
This is a Kiskadee extension, not a new upstream Fluent token mapping. The former solid
references were #f2f2f2/#e5e5e5/#d1d1d1; the alpha recipes approximate them over white,
while their composited appearance intentionally changes over other backgrounds.
The asset remains n.black.v1; the FRF locator is cap with dark polarity (Light L100).
Card consumes the shared Low recipe at Rest; component-specific interaction recipes remain intact.
Existing onVivid white-alpha contours are retained. Light Lowest reuses the existing 8% white Low contour in onVivid to satisfy context coverage, without inventing a new opacity.

## Dark and interaction preservation

Dark Card keeps D9/D6/D3; Darker keeps D3/D2/D1 and physical-black Highest. Colors now resolve
through the same achromatic family as Light. Their tone positions, interaction positions and
neutral border opacities (15% white in Dark, 10% in Darker) are retained. The new Light High
surface and Lowest Separator level are not extrapolated into Dark/Darker.

Black v1 Vivid is explicitly locked to L85/D90 in this preset's generator recipe, preserving
previous neutral functional-anchor positions and avoiding out-of-grid positive interaction
offsets. Subtle remains L4/D4. This changes functional metadata, not the grayscale samples or
any generator algorithm. The generated Medium midpoint remains generator-owned.

## Provenance and validation

See [explicit de-para](../colors/neutral-surface-mapping.json),
[current recipe link](../colors/generator-link.md), and the regenerated 0.19.0 manifest.
The preceding tinted-neutral approvals remain historical evidence and are superseded for this
migration. Parity tests verify manifest hashes, classification, functional references and scales;
regression tests cover segment parity, Light catalogs, contour resolution and retained dark recipes.

## Strong contour refinement - 2026-09-21

The user approved increasing Light/onSubtle Medium from 18% to 23% black after
[comparing Windows and Kiskadee samples in Figma](https://www.figma.com/design/ORKFzGqGEJPkxuy2VF3upA/Untitled?node-id=13-65).
The sampled strongest colors were Windows #c1c1c1 and Kiskadee #cecece. Black at
23% over #fbfbfb approximately reproduces the selected Windows sample. This is
an approved visual adaptation, not identification of an official Windows brush:
the exact source element/token of the sampled Windows boundary remains unverified.
The published alpha is quantized to 8-bit #0000003b. Low remains 9.5%, so neutral
Card Rest borders do not darken with this Medium-only adjustment. Surface fills,
Dark/Darker, onVivid and interaction recipes are unchanged.

Follow the advisory [surface and contour composition guidance](../../../definitions/surface-and-contour-composition.md)
when evaluating subsequent presets; this change does not migrate them.

## Solid outlined controls — 2026-10-30

Status: **Kiskadee extension**, approved by the user after reviewing the outlined controls over
Showcase composition headers. Button Low and Select Standard/Outline now reuse **Card Neutral
Low** as their solid Rest surface, instead of inheriting the background through transparency.
The [2026-10-31 Button correction](#context-relative-button-low--2026-10-31) narrows the Button
portion to onSubtle; Select Outline keeps this solid surface in both contexts.

| Theme | FRF lookup (`component.card`) | Primitive asset | Published fill |
| --- | --- | --- | --- |
| Light | `exact card.neutral L1` | `primitive.black.v1` / `colors/n.black.v1.ts` | `#fbfbfb` |
| Dark | `exact card.neutral D6` | same approved achromatic asset | `#202020` |
| Darker | `exact card.neutral D2` | same approved achromatic asset | `#0e0e0e` |

The existing Card recipe is the authority for these positions. No primitive sample, generator
output, global surface role or Card appearance changes. The Button onSubtle Rest surface remains
neutral for every intent, including portable brands; chromatic interaction recipes remain
intent-owned. Owned content paint uses that solid surface as its contrast reference for Button
onSubtle and Select Outline in either ambient context. Outside indicators and Select external
labels/messages still follow their surroundings. The optional Select divider and BrandPack
artifact handoff limitations are recorded in the respective component Open Gaps.

This is not a claim that Fluent's Outline Button is solid. The official Secondary Button and
outlined Select use `colorNeutralBackground1`, while the official Outline Button remains
transparent. Kiskadee intentionally combines its Low contour with the calibrated Card surface;
the inspected tokens, source URLs and Figma nodes are recorded in [Button](button.md#solid-low-control-surface--2026-10-30)
and [Select](select.md#solid-outline-surface--2026-10-30). Other Button emphases, Select modes and
TextField retain their current recipes.

## Context-relative Button Low — 2026-10-31

Status: **Kiskadee extension**, refined by the user after reviewing the Surface contexts example.
The near-white neutral fill remains the approved Low onSubtle surface. A transparent onVivid
candidate was tried, then superseded for Light by the current
[canonical Button hierarchy](button.md#canonical-light-onvivid-hierarchy--2026-10-31).

Light/onVivid Low now uses the existing opaque Primary vivid base, matching the canonical
`Card primary/highest` reference. Its White8%/12% Hover/Pressed composites are resolved as opaque
colors by the preset from strict `exact card.primary L50` (`component.card`). Low Disabled
publishes its existing White4% treatment as an opaque composite over the same base. Medium's
Pressed/Selected instead use a strict physical Black10% overlay, an intentional local
translucency exception to the advisory guidance that darkens the actual supporting surface.
Its Rest White14% and Hover White10% surfaces are unchanged. The later user-approved Medium
Pressed/Selected contour is transparent, including Selected Hover, without removing border width
or padding compensation. Rest/Hover keep White10%, Pending6% and Disabled7% are preserved;
Group neighbors keep their Rest frame. Lowest retains transparent
Rest, no contour and White8%/12% interaction overlays. Selected remains equal to Pressed and
Selected Hover retains the selected fill. Low's opaque base intentionally targets the canonical
Primary host; Medium's translucent state instead darkens the actual supporting surface.
No recipe infers an ancestor's exact color from the onVivid classification.

Low's Light lower Rest contour is White45%; Neutral Hover is a local White50% override.
The shared helper, Card recipe and TextField calibration remain unchanged. These are user-approved
visual decisions, not newly identified official Fluent token values.

Button Low onSubtle keeps the approved L1/D6/D2 solid fills in the table above. Dark/Darker Button
recipes, all other onSubtle emphases, High and Select Outline remain unchanged. No shared neutral
scale, global role or new tonal asset is introduced. The
[Button evidence](button.md#canonical-light-onvivid-hierarchy--2026-10-31) records the current
state, contour, foreground and coverage details.
