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
retain their positions; new High publishes Rest only. High remains onSubtle for descendants,
is included in the canonical surface catalog, and has an optional border. No Light Highest
neutral is introduced. Primary recipes are unchanged.

| Light onSubtle contour | Locator | Published |
| --- | --- | --- |
| Lowest | physical black cap (L100), 5% alpha | #0000000d |
| Low | physical black cap (L100), 9.5% alpha | #00000018 |
| Medium | physical black cap (L100), 18% alpha | #0000002e |

Separator publishes all three levels through the shared contour catalog. Light neutral Card
borders use the shared Low contour, independently of fill emphasis. Border visibility defaults
are unchanged. On 2026-09-20 the user approved replacing the solid L3/L6/L10 contours
with physical black at 5/9.5/18% alpha so dividing lines retain the underlying surface hue.
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
