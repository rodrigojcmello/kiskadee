# Fluent 2 Accordion Evidence

## Sources

- [Fluent Accordion](https://fluent2.microsoft.design/components/web/react/core/accordion/usage): closed defaults, optional multiple expansion, consistent chevron placement and button headers.
- [Windows Expander](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/expander): persistent header and expansion in document flow.
- [WAI-ARIA Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/): headings, expanded/controls relationships and native keyboard behavior.
- User Windows 11 screenshot, 2026-10-02: rounded continuous frame, trailing chevron and internal divider. Visual reference only; screenshot pixels are not design-token measurements.
- [Original community Figma reference](https://www.figma.com/design/qdtPPQysSX0kHGGcDpEXzw/Microsoft-Fluent-2-Web--Community-?node-id=8911-3189): file `qdtPPQysSX0kHGGcDpEXzw`, node `8911:3189`. Card context only; no Accordion node was verified there.

## Source coverage

| Area | Status | Mapping |
| --- | --- | --- |
| Expansion semantics | Official adapted | Single-open default, optional multiple-open, all may close |
| Heading/button relationship | Official adapted | Header button with expanded/controls, native keyboard activation |
| Downward normal-flow expansion | Official adapted | Measured height; no collapsed space |
| Neutral Card emphasis and combined Web/Windows presentation | Kiskadee extension | All four Card neutral emphases map directly; panel emphasis, divider, border and shadow are independent |
| Geometry and motion calibration | Kiskadee extension | 16px header padding, body-medium text, 20px chevron; global grow-height 180/120ms |
| Native upward expansion | Deferred | First implementation expands downward |
| Exact Accordion Figma recipe | Not inspected | Supplied node is not Accordion evidence |
| Dark/Darker and other presets | Deferred | First delivery is Light only |

## Schema decisions

`components/accordion.schema.ts` authors only trigger padding, title typography,
indicator geometry, coverage options and its explicit presence-profile reference.
Root, item and panel are name-only composition slots. Existing Card/Container
recipes supply surfaces and content foreground; Separator and Icon retain their
own authorship. No colors are copied or introduced by Accordion.

The approved October 8 refinement uses Card neutral `lowest`, `low`, `medium`
and `high` with identical names and colors. There is no low-to-lowest remapping.
CardAction provides header states; Card consumes its neutral Rest surfaces from Container.
`panelEmphasis` inherits the main emphasis unless explicitly supplied.
Both regions retain one rounded Card frame with independent border/shadow contracts.

`options.divider: true` is the common Fluent default for every emphasis; each
instance can override it. The line uses the frame's neutral contour (low onSubtle,
medium onVivid). The Showcase configuration divider remains low emphasis.
No preset colors change; no primary intent is exposed.
These emphasis mappings are approved Kiskadee adaptations, not Microsoft labels.

The schema does not restore Card padding. Panel spacing belongs to consumer
Layout. Runtime Motion is internal to Accordion, not an additional schema variant.

## Validation

Focused contract, Headless, React/Motion and artifact tests; Fluent generation;
component and Showcase builds; desktop/mobile browser checks including keyboard,
RTL, dynamic content and unsupported theme/preset handling.

## Indicator transition default

`options.indicatorTransition` is `rotate` for Fluent. Instances can override it
with rotate, crossfade or none. Accordion `motion` controls panel height only;
the indicator retains its chosen transition independently, respecting reduced
motion. This is a Kiskadee presentation option, not an upstream Fluent variant.
