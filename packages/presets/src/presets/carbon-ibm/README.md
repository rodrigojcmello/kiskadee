# Carbon by IBM

One Carbon v11 preset, authored against the current preview documentation and the inspected
Carbon v11 Figma kit. The upcoming Carbon Next/v12 announcement does not create another preset.

The root schema composes global profiles and twelve component factories. Colors follow three
layers and a strict preset-owned resolver. Generated primitive assets live in `colors/default/`;
`carbon-ibm.tokens.ts` contains the source-backed tonal coordinates.

Source evidence, recipe, generated bundle verified with SHA-256, mapping distances and adaptations:
[`packages/presets/docs/design-systems/carbon-ibm/source-evidence.md`](../../../docs/design-systems/carbon-ibm/source-evidence.md).

Light maps White, Dark maps G90, and Darker maps G100. Card canonical surfaces provide the
nearby layers, including G10. Carbon geometry/state rules remain distinct from Fluent; Fluent
is the coverage reference. Capability gaps outside the existing schema are documented rather
than implemented as framework changes.
