# Fluent 2 Card Evidence

This file records the source evidence and schema decisions for the Fluent 2 Card
mapping in `packages/presets/src/presets/fluent-2-microsoft/components/card.schema.ts`.

## Sources

- Card component set:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9230-4927&t=Uzju4AUhin0NMCn2-11)
- Surface documentation:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9738-4934&t=Uzju4AUhin0NMCn2-11)
- Surface examples:
  [Microsoft Fluent 2 Web Community](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=9738-5044&t=Uzju4AUhin0NMCn2-11)

## Card Decisions

The inspected Card component set uses radius `4` and 1px inside strokes.

Filled Card variants use:

- rest: `#FFFFFF` with `Shadow 04`
- hover: `#F0F5FF` with `Shadow 08`
- pressed: `#DBE0EC` with `Shadow 04`
- selected: `#E6EBF7`, stroke `#B9BDC9`, with `Shadow 04`
- draggable: `#FFFFFF` with `Shadow 08`
- disabled: `#EBF0FC` with `Shadow 04`

Filled alt variants use the same shadow behavior and a slightly tinted base
surface. Outline variants use no base shadow, except draggable, and expose these
stroke colors:

- rest: `#CCD1DD`
- hover: `#C3C7D3`
- pressed: `#AFB3BF`
- selected: `#B9BDC9`
- disabled: `#DBE0EC`

Subtle variants use no fill or stroke at rest. Their interactive backgrounds
match the Filled Card hover and pressed colors:

- rest: transparent
- hover: `#F0F5FF`
- pressed: `#DBE0EC`
- selected: `#E6EBF7`, stroke `#B9BDC9`
- disabled: `#EBF0FC`

## Kiskadee Mapping

The Card component set itself is neutral: the rows are component treatments, not
public Kiskadee intents. Kiskadee does not expose an `outline` Card axis; Card
must be described through `segment`, `intent`, and `emphasis`.

The Fluent Card treatments therefore map to Kiskadee as:

| Fluent Card treatment | Kiskadee bucket | Reason |
| --- | --- | --- |
| Filled | `neutral.low` | White/base Card surface. |
| Filled alt | `neutral.medium` | Light tonal Card surface. |
| Outline | `neutral.low` border behavior | Kiskadee has no `outline` axis; this is the same low/base bucket with the border visible. |
| Subtle | `neutral.lowest` | No own surface at rest. |

This is intentionally lossy for the Filled-vs-Outline split. A Fluent Filled
Card has no visible stroke, while Outline is transparent with a stroke. In the
current Kiskadee Card contract the closest representation is:

- use `neutral.low` for the base/outline family;
- keep the schema border on `neutral.low` so the outline reading is available;
- use `preserveBorderWithShadow={false}` when a raised Filled Card should rely
  on shadow instead of a visible border;
- use `neutral.lowest` for the no-surface/no-border rest treatment.

Primary Card buckets are Kiskadee semantic surface adaptations. They come from
the Fluent surface system, not from the neutral Card rows themselves.

Kiskadee exposes one Card shadow recipe for the root surface. The Fluent preset
therefore maps Card `rest`, `focus`, `pressed`, and `disabled` to `Shadow 04`
(`s:md:1`) and `hover` to `Shadow 08` (`s:lg:1`). The complete Fluent shadow
scale stays available through `fixedLevels` for Showcase and static Card
examples.
