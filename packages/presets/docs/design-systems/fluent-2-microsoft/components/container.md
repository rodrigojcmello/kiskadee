# Fluent 2 Container surfaces and companion calibration

Status: user-approved Kiskadee adaptation, 2026-09-23. The companion colors below are not a
claim of exact Microsoft Fluent tokens or a complete official Container component. Fine visual
acceptance remains with the user.

## Source and migration

Container now authors the Rest colors previously published by Card. This is an ownership
migration: the existing segment, theme, input-context, intent and emphasis coordinates retain
their selected strict color locators and resulting colors. Card keeps its border, geometry,
effects and interaction-state changes. The existing [Card source evidence](card.md) and
[achromatic neutral calibration](neutral-surface-calibration.md) still explain the base Rest
choices. The Card artifact incorporates the corresponding Container Rest at build time.

The need for companion regions comes from the user-supplied Windows quick-settings screenshots:
[neutral](../evidence/container/windows-quick-settings-neutral-2026-09-21.png) and
[vivid blue](../evidence/container/windows-quick-settings-vivid-2026-09-22.png). A large panel
contains a distinct bottom region separated by a line. Windows Settings, Teams settings and
Explorer screenshots supplied
in the same design discussion show page/section backgrounds and bounded content regions as
separate roles. Pixel samples from those screenshots are composition evidence, not proof of an
official token name or exact token value. The previous Fluent UI Preview composition is useful
for contrast exploration but is not treated as a rule that every region must be a Card.

## Color and token provenance

Companion colors reuse the approved `card.neutral` and `card.primary` tonal assets through
evidence-backed exact locators. The Darker neutral medium companion uses the physical-black cap.
This moves the source of these Rest colors to Container without changing their values; Card still
uses the corresponding Container Rest at build time.

## Initial paired surfaces

The user approved only these three companion pairs. The base values already exist and are not
recalibrated. Each companion resolves through the preset's existing tonal asset and strict color
locator; the physical-black Darker cap uses the existing cap locator.

| Base -> companion | Light | Dark | Darker |
| --- | --- | --- | --- |
| `neutral.low` -> `neutralComplementary.low` | L1 -> L3 | D6 -> D5 | D2 -> D1 |
| `neutral.medium` -> `neutralComplementary.medium` | L3 -> L4 | D3 -> D2 | D1 -> physical black |
| `primary.highest` -> `primaryComplementary.highest` | L50 -> L55 | D35 -> D30 | D18 -> D14 |

`neutralComplementary` uses the neutral tonal family and produces `onSubtle` for descendants.
`primaryComplementary.highest` uses the segment's Primary family and produces `onVivid` for
descendants. Companions are published in supported input contexts so they can be placed within
their suggested base Card. The Card may also select a companion as its own Rest fill and keeps
the base intent's frame. The pair is a recommendation, not a requirement or a restriction on
nested surfaces. A companion can repeat a color found in the base palette.

No other companion emphasis or preset is inferred from these examples. This calibration does not
change the base emphasis scale or any CardAction interaction recipe.
