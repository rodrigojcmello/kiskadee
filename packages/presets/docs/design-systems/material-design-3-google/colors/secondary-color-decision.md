# Material secondary color decision

Accepted: 2026-09-12. Status: **Kiskadee extension**.

## Decision

This Material preset does not require a separate secondary color family or a
secondary Button intent. This is a deliberate Kiskadee adaptation, not a claim
that Material lacks secondary colors or that another product cannot need them.

The Button model separates meaning from visual prominence:

- Intent identifies the action's role: primary, neutral, destructive or positive.
- Emphasis determines its prominence: high, medium, low or lowest.

A primary action can therefore be visually quiet, and a neutral action can have
a strong filled presentation. Neutral is an intent, not another name for medium
or for a less important primary action.

## Why a second blue is not enough

Two related blue hues do not, by themselves, explain two different action meanings.
Naming one primary and the other secondary inside a design system does not teach
that distinction to the person using the product.

The design rationale here is to communicate through the label, placement, context,
fill and contrast together. A subtle hue difference may read as decoration or
inconsistency rather than a meaningful distinction. We should not require users
to learn an arbitrary color distinction solely because the upstream palette offers it.
This is the agreed design rationale, not a reported usability study.

For the buttons in this preset, emphasis already provides the lighter or less
repetitive presentation sought from a supporting color. A separate family should
have a product purpose beyond being another available palette.

## Neutral remains a separate visual decision

The preset retains canonical pure grayscale n.black.v1 and the explicitly authored
tinted neutral n.black.v2. The latter uses the approved #001D35 input adapted from
a Google supporting color role. It is not evidence that the resulting ramp is
perceptually achromatic or that Google classifies this input as neutral.

In the reviewed Light Button result, neutral high looks like a blue-black while
neutral medium looks visibly pale blue. Its internal neutral name does not guarantee
that users perceive a supporting, discreet color. That appearance remains a matter
for visual homologation; accepting the absence of secondary does not automatically
approve the neutral's chroma or require changing the generator.

Primary and neutral keep their distinct roles even when both lean blue. The neutral
must earn its supporting role through the rendered result, not just its identifier.
A tinted neutral remains a neutral variant rather than being reclassified as a
chromatic family based only on its hue.

## Scope and future changes

Material interaction behavior can be adapted without copying its full palette
organization. The current Button uses each intent's own family for its tonal
presentation; it does not introduce a second shared blue for all medium buttons.

An additional family may be appropriate when a product supplies a distinct,
consistent purpose, such as another product identity or information category.
Emphasis is not a universal replacement for every use of multiple colors. Such a
requirement should be evaluated explicitly rather than inherited automatically
from Material's secondary role.

This decision does not introduce a new alias, change assets, alter interaction
formulas, or require a third neutral ramp.

## Evidence and implementation

- [Material Button source and adaptations](../components/button.md):
  Figma file Peqe9lNMsuQHLIUZsiTZNg, section 57994:696.
- [Current tonal recipe and layer mapping](README.md).
- [Preset source evidence](../source-evidence.md).

Historical CorePalette and secondary-to-primary.v2 mappings in the source evidence
describe the earlier implementation and do not supersede this decision.
