# Reference Files

- `packages/web-builder/src/run-build.ts` - orchestrates the pipeline phases.
- `packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/palettes/transformColorKeyToCss.ts` - selector generation rules.
- `packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts` - core vs palettes split.
- `packages/web-builder/src/typography/compileTypography.ts` - typography profile lowering and
  descriptive artifact assembly.
- `packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/typography/transformTypographyMetricKeyToCss.ts`
  - relative line-height and letter-spacing CSS emission.
- `packages/web-builder/src/phase-5-generate-class-names-map/generateClassNamesMap.ts` - classNamesMapSplit generation.
