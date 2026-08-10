# IBM Carbon Source Evidence

This file records the source-of-truth evidence used to author the
`carbon-ibm` preset.

## Primary Sources

- Figma community file:
  [IBM Carbon Design System Community](https://www.figma.com/design/52HHpBaYAUdDKqAdH5vw8Y/IBM-Carbon-Design-System--Community-?node-id=2318-180868&t=qLbIokpcDKtcJ79I-4)
  - file key: `52HHpBaYAUdDKqAdH5vw8Y`
  - Figma metadata available through the MCP capture on 2026-06-28: top-level
    page `0:1` named `Cover`
  - last modified date was not exposed by the MCP metadata response used for
    this capture
- Official documentation:
  [Carbon Design System](https://carbondesignsystem.com/)
  - typography tokens:
    [Carbon type sets](https://carbondesignsystem.com/elements/typography/type-sets/)
  - interface-icon code and package guidance:
    [Carbon Icons](https://carbondesignsystem.com/elements/icons/code/)

## Source Notes

- The community Figma file is the primary source for static component geometry,
  size, and light/default visual values when a matching component exists.
- The official Carbon site is the primary source for interactive examples,
  theme-selector behavior, and cases not represented directly in the community
  Figma file.
- The inspected Figma references used for Switch did not expose a complete dark
  theme treatment. The official Toggle documentation does expose a Gray 100
  themed example, so Kiskadee uses the site evidence for the dark-surface Switch
  palette.
- When Carbon does not document a formal component that Kiskadee needs as a
  reusable showcase surface, document the adaptation in the component file
  instead of encoding the rationale only in schema code.

## Component Evidence

- [Switch](components/switch.md)
- [Card](components/card.md)

## Typography Evidence

Carbon's official productive type set defines `label-01` as IBM Plex Sans Regular at 12/16 and
`body-compact-01` as IBM Plex Sans Regular at 14/18. The preset publishes both as reusable global
profiles under normalized IDs `label-small` and `body-medium`, then maps the two Switch text slots
to them. This is **Official adapted** because the
current schema intentionally preserves its previous output and therefore does not newly introduce
Carbon's documented letter spacing in this migration.

The existing Button recipe uses 14/18 at weight 500. It is retained as
`body-medium-strong`, a **Kiskadee extension** derived from the same metrics rather than a
claim that Carbon publishes that exact weight token. Component spacing and color remain local to
their schemas; the catalog owns only the font role, weight, size, line height, and any future
source-backed tracking.

This is a minimal naming migration. A complete review of Carbon's wider type ramp is **Deferred**.

## Interface Icon Evidence

Carbon publishes its interface icons through `@carbon/icons-react` and documents 16, 20, 24, and
32 pixel source sizes. Kiskadee recommends `carbon` and maps its canonical semantic names to
Carbon's standard React glyphs. The preset records the local variant as `regular`; this is
Kiskadee's stable name for the single complete Carbon profile currently exposed.

This is **Official adapted**: the icon family is official, while Kiskadee chooses the closest
semantic glyph and normalizes it to the active Icon scale. The preset schema contains only the
family and variant recommendation and does not import the upstream package.
