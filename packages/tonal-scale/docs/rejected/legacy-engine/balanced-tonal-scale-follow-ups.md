# Balanced Tonal Scale Follow-Ups

The current `Balanced` profile is documented in the tonal-scale-lab definition
docs. This file keeps only open follow-ups that still need design or
implementation work.

## Open Follow-Ups

- Define a true generic node transition model. Every structural node, including
  shared-boundary nodes such as `K10`, should resolve a target delta between the
  rhythm before the node and the rhythm after the node.
- Reassess local apex shoulders after zone rhythm redistribution. If the graph
  model can own this smoothly, fold `protectedApexShoulder` and
  `forwardApexShoulder` into the generic curve model.
- Treat every structural anchor with the same node mechanics. Current structural
  anchors for `Kiskadee Official (33)` are `K1`, `K10`, `K35`, `K95`, and the
  dynamic preserved input anchor. `K0` and `K100` remain absolute caps, not
  chromatic nodes.
- Consolidate luminous-color handling. Yellow, lime, cyan, and light green still
  need special care, but the rules should share the same anchor/node/curve-shape
  model where possible.
- Separate final invariants from repair passes. Name the final invariants first,
  then decide which pass owns each invariant.
- Keep absolute caps and chromatic endpoints distinct. `K0` and `K100` are
  absolute white/black caps; `K1` and `K95` are chromatic endpoints.
- Reassess rule ordering after node transitions. Later chroma and contrast rules
  must not silently invalidate lightness rhythm assumptions.
- Rework the `#ff1744` `K35` transition with a real transition delta instead of
  local correction.
- Recalibrate `Sophisticated` after the `Balanced` dark-chroma experiment
  stabilizes.
- Support multiple colors in the lab UI and export flow so full preset color
  families can be configured together.
