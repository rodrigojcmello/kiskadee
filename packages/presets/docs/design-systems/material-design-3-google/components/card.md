# Material Card evidence

## Sources and coverage

- [Official Material Android Card documentation](https://github.com/material-components/material-components-android/blob/master/docs/components/Card.md), inspected 2026-09-13.
- [Material Card specification](https://m3.material.io/components/cards/overview), linked by the Android documentation.
- Existing Material Figma file Peqe9lNMsuQHLIUZsiTZNg: metadata discovery exposed only the Getting started page; no Card component node was located in this inspection. Card-specific Figma behavior is **Not inspected**.
- Local fallback approved by the user: fluent-2-microsoft/components/card.schema.ts.
- [Approved tonal assets](../colors/README.md).

## Official contract

Material distinguishes filled, outlined and elevated cards by container separation.
The Android documentation describes the same function across these variants:
filled uses surfaceContainerHighest, outlined uses surface plus an outline,
and elevated uses surfaceContainerLow plus elevation. Outline width is 1dp;
elevation is 0dp for filled/outlined and 1dp for elevated.
Checked cards can use secondary for the outline. These are source observations,
not a requirement for a separate Kiskadee secondary intent.

## Kiskadee mapping

Status: **Official adapted** for the surface/border/elevation separation;
**Kiskadee extension** for the tonal recipes, strong surfaces, primary intent,
theme/context completion and state progression.

| Intent | Emphases | Content context |
| --- | --- | --- |
| neutral | lowest, low, medium | onSubtle |
| primary | lowest, medium | onSubtle |
| neutral, primary | highest | onVivid |

These are Card emphasis keys, matching the existing Fluent Card vocabulary.
No new public component option or variant type is introduced.
Both default/dynamic segments and Light/Dark publish these seven canonical surfaces.
Both onSubtle/onVivid inputs are explicitly authored. A strong surface is independent
of the current theme: deep cards are available in Light and Dark.

Outlined presentation defaults to lowest onSubtle. Other soft surfaces default to
no border; highest onVivid defaults to a border to separate adjacent strong surfaces.
The existing border option remains usable independently. Elevation stays an opt-in
effect with the five existing fixed levels. Geometry stays at 16px padding and
12px rounded radius.

## Tonal formula

Every base color uses the approved family through the legacy getter and functional references.
card.primary maps to primary; card.neutral maps to the existing tinted neutral.
No secondary family, new seed, generator change or palette promotion is involved.

- Soft Rest: subtle -3 for lowest, -2 for neutral low, +0 for medium.
- Medium onVivid adds three positions, following Fluent's stronger contextual separation.
- Soft Hover/Focus/Pressed: +1/+2/+3 from Rest.
- Soft Selected: +2 at Rest, +3 Hover, +4 Pressed.
- Highest: Light vivid reference in both themes, keeping a deep surface.
  Hover moves one position toward light; Focus/Pressed two. Highest Selected uses
  one position at Rest and two for Hover/Pressed. The two-position ceiling preserves
  at least 4.5:1 with white on the approved primary and neutral ramps.
- Soft outline: physical theme foreground at 20%; selected 45%.
  Strong outline: physical light cap at 30%; selected 50%.
- Disabled container: theme neutral subtle -1; outline becomes transparent.

The numeric offsets are a Kiskadee adaptation informed by Fluent, not extracted
Material Card state-layer percentages. A broader Figma state matrix was not available.
Hover/Focus/Pressed palette entries all differ from Rest. Selected states retain the
surface's content context; Disabled publishes onSubtle to match its subdued container.
The root e1 owns interactions. Nested controls receive the published content context
rather than inheriting the external backdrop's classification.

The shadow effect uses small at Rest, medium on Hover and explicitly returns to small
on Pressed to reset simultaneous Hover elevation. Disabled removes it.
The existing external focus mechanism remains independent from the surface treatment.
Dragged behavior and checked-icon composition are outside this color-mapping delivery.

## Validation

- Tests check all seven canonical surfaces against palettes and descendant contexts
  across both segments, themes and input surfaces.
- Tests verify medium family isolation, optional border defaults and strong-surface
  contrast with white through active and selected states.
- Web Builder and Showcase artifacts generated successfully.
- Focus/Hover/Pressed sparse-state audits and diff whitespace checked.
- Full preset typecheck retains four pre-existing Fluent errors; no Material errors.
- Visual homologation is user-owned. Arbitrary child colors and consumer backgrounds
  are not covered by the white-on-strong-surface contrast assertion.

## Pure neutral and optional Support (2026-09-15)

User-approved Kiskadee adaptation: Neutral now resolves black.v1 in all segments; Support
Medium resolves the existing supporting color (blue.v2 in Default, purple.v3 in Purple).
The existing subtle-reference/state-offset formula is reused. Primary Highest and its
onVivid descendant context are retained. The Showcase upper-right tile uses published
Support Medium or falls back to Neutral Medium, with stable component identity. The wide
middle tile remains Neutral Medium. No other preset is required to publish Support.

## Pale surface completion (2026-09-15)

Primary Low and Support Lowest/Low are published for Default, Purple and Dynamic in both
themes and contexts. Low uses its family's subtle reference minus two positions; Lowest
uses pure white in Light and subtle minus three in Dark. Existing interaction offsets and
onSubtle descendant contexts apply. Lowest has a default border onSubtle; Low has no default
border. These are user-requested Kiskadee extensions. Medium and Primary Highest are unchanged.
