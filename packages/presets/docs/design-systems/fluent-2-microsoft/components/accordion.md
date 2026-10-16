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
| Geometry and motion calibration | Kiskadee extension | 16px block / 24px inline header padding, independent 16px gap, body-medium text, 12px chevron; library-owned panel speed recipes; independent indicator 180/120ms |
| Native upward expansion | Deferred | First implementation expands downward |
| Exact Accordion Figma recipe | Not inspected | Supplied node is not Accordion evidence |
| Dark/Darker and other presets | Deferred | First delivery is Light only |

## Schema decisions

`components/accordion.schema.ts` authors only trigger padding, title typography,
indicator geometry, coverage options. Motion timing is owned by p-react, not preset Schema.
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

`options.indicatorTransition` is `none` for Fluent. Instances can override it
with rotate, crossfade or none. Accordion `motion` controls panel height only;
the indicator retains its chosen transition independently, respecting reduced
motion. This is a Kiskadee presentation option, not an upstream Fluent variant.

## Windows Settings calibration, October 9

User-provided Windows 11 Settings captures (16:52:19, 16:52:32, 16:54:19,
16:54:50) show a small trailing chevron, generous horizontal insets, and a
stronger bottom edge that disappears while pressed. The user observed an
immediate chevron swap; static captures alone cannot establish motion timing.
The default now uses none; rotate and crossfade remain Kiskadee overrides.
The 24px inline insets, 16px internal gap, and 12px indicator are Kiskadee
visual calibration, not measured Windows design tokens. Trigger marginRight
emits --k-mgr for structural gap, independently of padding. Leading Icon sizing
is unchanged. Bottom-edge interaction is deferred pending Select validation.

## Bounded transition speeds, October 10

Accordion no longer declares or publishes a grow-height effect reference. Panel motion
is a library-owned recipe with normal/fast/slow/debugSlow choices and local group
coordination. Indicator timing is separate; its presentation default stays in options.
These are approved Kiskadee interaction mechanics, not measured Windows timings.
Global presence profiles remain available to their existing consumers.
