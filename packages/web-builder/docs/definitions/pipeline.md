# Pipeline

Location: `packages/web-builder/src/run-build.ts`

## Phases

1. Phase 1 - Convert schema to style keys
   - Function: `convertElementSchemaToStyleKeys(schema)`.
   - Produces normalized style keys per component and element.
   - Expands typography profile references into atomic decoration and scale keys before the normal
     element conversion.

2. Phase 2 - Map style key usage
   - Function: `mapStyleKeyUsage(styleKeys)`.
   - Collects usage to shorten class names.
   - Includes the atomic utilities for every declared typography profile because the typography
     catalog is itself a CSS consumer.

3. Phase 3 - Shorten class names
   - Function: `shortenCssClassNames(usageMap)`.
   - Produces a dictionary of short class names per style key.

4. Phase 4 - Generate CSS rules (split core vs palettes)
   - Function: `generateCssSplit(styleKeys, shortenMap)`.
   - Production builds always emit projected state selector branches such as `.-h.-a`,
     `.-f.-a`, and `.-s.-a` alongside native branches where applicable.
   - Results: `coreCss`, `effectsCss` and `palettes[paletteName]`.

5. Phase 5 - Generate classNamesMap split
   - Function: `generateClassNamesMapSplit(styleKeys, shortenMap, toneMetadataByPalette)`.
   - Produces the class map per component/element/state/palette.

6. Phase 6 - Persist artifacts
   - Function: `persistBuildArtifacts(cssGenerated, classNamesMapSplit, outDirSlug)`.
   - Writes CSS bundles and maps to disk by preset.

7. Phase 7 - Publish metadata
   - Function: `publishMetadata({ schema, outDirSlug, schemaPath, baseBuildDir })`.
   - Writes `manifest.json`, `schema.json` and `segments.json` under `build/<template-key>`.
   - `segments.json` is derived from `schema.colors.globalSemanticsBySegment`.
   - Publishes only semantic font role IDs under the compact `manifest.fonts` capability.
   - Publishes only the typography artifact path under `manifest.typography`.

8. Phase 8 - Write extra artifacts
   - Function: `writeExtraArtifacts({ schema, outDirSlug, typographyArtifact })`.
   - Writes global and theme token artifacts such as `global.kiskadee.json` and tokens CSS.
   - Preserves the full font catalog in JSON and resolves selected stacks into CSS variables.
   - Writes the dedicated `typography.kiskadee.json` without copying it into global metadata.

## Package scripts

The monorepo uses scripts from this package to keep artifacts and the showcase in sync.

- `pnpm --filter @kiskadee/web-builder run build`
  - Runs `src/run-build.ts` using Node's native TypeScript support.
  - Builds all presets under `packages/presets/src/**`.
  - Writes artifacts to `packages/web-builder/build/<template-key>`.

- `pnpm --filter @kiskadee/web-builder run sync`
  - Runs `scripts/sync-showcase-artifacts.ts`.
  - Copies build output to `packages/showcase/public/build/**`.

- `pnpm --filter @kiskadee/web-builder run generate`
  - Runs `scripts/generate-showcase-registry.ts`.
  - Generates registries under `packages/showcase/registry/generated`.

- `pnpm --filter @kiskadee/web-builder run build-sync-generate`
  - Convenience command to run build, sync and generate in sequence.
