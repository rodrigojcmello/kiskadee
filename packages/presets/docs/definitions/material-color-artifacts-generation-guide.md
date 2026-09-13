# Material Color Artifact Generation

The Material preset uses the Kiskadee tonal generator and its preset-ready TypeScript export.
The authored recipe, generation manifest, input evidence and promotion instructions live in
[Material tonal assets](../design-systems/material-design-3-google/colors/README.md).

The former `generate-material-color-artifacts` tool, its tests and the direct
`@material/material-color-utilities` dependency were retired on 2026-09-13 after a repository
consumer search found no callers outside the tool's own tests. It must not be used to recreate
the approved scales. This retirement does not regenerate or change any promoted color.

Core still owns the tonal asset contract; `@kiskadee/tonal-scale` owns generation. Presets consume
the exported assets and author semantic roles and component formulas. Source recipes, diagnostics
and provenance remain complementary evidence, outside runtime primitive data.
