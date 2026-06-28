# IBM Carbon Preset Sources

This directory records the source-of-truth evidence used to author the
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
