# Container and Card surface ownership

Status: canonical cross-package decision.

## Problem and composition

One Card recipe used to author its Rest fill together with border and elevation. That made an
ordinary page region, a Card, and an internal header/footer appear to be the same component.
Applications also need a continuous themed region without Card geometry or elevation.

`Container` is the public passive region for a continuous background. It owns the Rest fill and
the surface context produced for descendants. It can cover a page, a section, or a region within
a Card. It adds no spacing, border, corner radius, shadow, interaction, or Headless behavior.

`Card` remains the public bounded content unit. Its single root uses Container's authored Rest
surface at build time, while Card authors its own border, geometry, shadow and, for `CardAction`,
interaction colors. A Card does not render a Container. An explicit Container nested in a Card is
another real region, such as a full-width footer. `CardAction` remains a native button; it owns
the interactive state changes and has no Container child in its implementation.

This is component-level surface authorship, not a global background profile. Neither Container
nor Card becomes the source for every background in the design system; other components keep
their own visual responsibilities.

## Schema and handoff

Presets author `components.container.e1` Rest box colors by segment, theme, input surface
context, intent and emphasis. Container also authors the resulting descendant surface context and
the canonical surface catalog.
`components.card.surfaceSource: 'container'` declares that Card uses those Rest colors. The Core
contract rejects a Card coordinate whose Container Rest color is missing. Web Builder resolves
the relation before generating Card styles, capabilities and metadata, so the Card artifact is
self-contained at runtime. The Card artifact retains the resolved canonical entries that also
have a Card recipe for existing consumers; Container-only entries stay in Container's catalog.
Source authorship is in Container. This does not make Card depend on
Container's React component or on a second runtime artifact.

The authored Card schema retains border colors, scales, decorations, effects and the color changes
of interactive states. Container has no interaction palette. A static Card may select a surface
without interactive colors; a CardAction may select only a coordinate with authored interactive
recipes.

## Complementary surface intents

`neutralComplementary` and `primaryComplementary` are optional surface intents in Container.
Their emphasis identifies the base surface for which the companion is recommended. For example,
`neutralComplementary.low` is the suggested internal region color for `neutral.low`; it is not
necessarily the next color in the neutral tonal scale. A complement may repeat a color published
under a base intent. It may also be used alone, inside another intent, or on a static Card.
Neither Core nor React enforces a particular parent/child pair.

These intents are composition guidance, not a new universal emphasis axis. A preset publishes
only pairs it has calibrated; missing pairs remain unsupported. The Fluent initial pairs are
documented with their evidence under its preset documentation. Existing base surface colors are
not recalibrated by this decision.

## Framework and Showcase

React shares a private context-resolution hook between Container, Card and CardAction. Each
component keeps its own root (`div`, `div`, and `button`, respectively). Static Card's
`flushContent` option removes its internal padding and clips its content to its corners, allowing
consumer-composed Container bands to reach the Card edges. The content inside each band owns its
own spacing. `flushContent` does not apply to CardAction.

Showcase compositions use the public components and preset artifacts for all colors. Local CSS
may arrange and space them but does not supply substitute surface colors. A composition remains
available for every preset with the required recipes; the optional vivid and complementary
branches are shown only when supported.

## Validation

Migration must preserve each existing Card Rest color and interaction state. Core rejects missing
surface references; generated Card output remains self-contained; React verifies inherited and
explicit contexts, transparent Rest, theme switching, native CardAction behavior, nested surfaces,
and flush bands. Fluent companion colors are a Kiskadee calibration based on existing tonal
assets, with fine visual acceptance left to the user.
