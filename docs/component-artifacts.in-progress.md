# Component Artifacts In-Progress

## Scope

This handoff tracks KIS-13: splitting Kiskadee generated artifacts by component and loading them
on demand.

It lives in the repository root `docs/` because the demand crosses package boundaries:

- `packages/web-builder` owns artifact generation, file layout, manifest/index metadata, and
  Showcase registry generation.
- `packages/components/react` owns component-facing hooks such as `useSwitchArtifactConfig`.
- `packages/showcase` consumes generated artifacts and validates the runtime loading model.
- `packages/core` may need public artifact types if the split becomes part of the stable contract.

Durable artifact rules should later be promoted into:

- `SCHEMA-BUILD-RUNTIME-RULES.md` for cross-package artifact ownership rules.
- `packages/web-builder/docs/definitions/generated-artifacts.md` for emitted file names and
  responsibilities.
- component package docs when a specific component hook becomes part of the public runtime contract.

## Window Context

- Demand slug: `component-artifacts`.
- Linear issue: `KIS-13`.
- Current direction: use this file as the working source of truth for the refactor plan.
- The problem is not the current number of components. The current payload is small.
- The problem is that the current artifact model does not scale to hundreds or thousands of
  components if every page loads metadata, class maps, or CSS for unrelated components.
- The previous interpretation of KIS-13 as only "move component metadata out of Showcase providers"
  was incomplete. The deeper demand is artifact-level granularity by component.

## Phase 1 Implementation Status

Status: implemented locally for Switch metadata JSON.

Implemented decisions:

- Switch semantic metadata now has a canonical component artifact:
  `components/switch.kiskadee.json`.
- `global.kiskadee.json` still publishes `components.switch` as a temporary compatibility output.
- The new Switch artifact shape is:

  ```json
  {
    "component": "switch",
    "options": {},
    "effects": {},
    "variants": {}
  }
  ```

- `manifest.components.switch.artifacts.metadata` points to
  `components/switch.kiskadee.json` when the artifact exists.
- `useSwitchArtifactConfig` remains the public Switch API. It still returns synchronously, prefers
  the component artifact after it loads, and falls back to `global.components.switch` or defaults.
- `KiskadeeContext` now exposes optional infrastructure fields:
  `artifactVersion` and `loadComponentArtifact`.
- React Components uses a small internal promise cache keyed by design system, artifact version, and
  component name. Concurrent Switch instances share the same promise.
- Showcase loads component metadata through the manifest artifact index. If a design system has no
  Switch metadata artifact, Showcase returns `undefined` without making a 404 request.
- Class maps and CSS remain aggregated in Phase 1.

Changed files:

- `packages/web-builder/src/component-artifacts/switchComponentArtifact.ts`
- `packages/web-builder/src/phase-8-write-extra-artifacts/writeExtraArtifacts.ts`
- `packages/web-builder/src/phase-7-publish-metadata/manifestTypes.ts`
- `packages/web-builder/src/phase-7-publish-metadata/publishMetadata.ts`
- `packages/web-builder/types.ts`
- `packages/components/react/src/contexts/KiskadeeContext.tsx`
- `packages/components/react/src/contexts/componentArtifactCache.ts`
- `packages/components/react/src/Switch/useSwitchArtifactConfig.ts`
- `packages/showcase/app/providers.tsx`
- `packages/showcase/hooks/use-theme-extras.ts`
- `packages/showcase/registry/generated/design-systems.registry.generated.ts`
- Artifact contract docs under `SCHEMA-BUILD-RUNTIME-RULES.md`,
  `packages/web-builder/docs/definitions/`, and `packages/components/react/docs/definitions/`.

Validation notes:

- `node packages/web-builder/src/run-build.ts` completed successfully.
- Generated output inspection confirmed:
  - `global.kiskadee.json` still exists for every design system.
  - `components/switch.kiskadee.json` exists for design systems with Switch metadata.
  - `global.components.switch` and the component artifact are semantically equivalent during dual
    output; the component artifact keeps required empty `effects`/`variants` objects.
  - `manifest.components.switch.artifacts.metadata` is present when the Switch artifact exists.
- `node packages/headless/react/scripts/build.ts --skip-types` completed successfully.
- `node packages/components/react/scripts/build.ts --skip-types` completed successfully.
- `./packages/headless/react/node_modules/.bin/tsc -p packages/headless/react/tsconfig.build.json --emitDeclarationOnly`
  completed successfully.
- `./packages/components/react/node_modules/.bin/tsc -p packages/components/react/tsconfig.build.json --noEmit`
  completed successfully after headless declarations were emitted.
- `./packages/components/react/node_modules/.bin/tsc -p packages/components/react/tsconfig.build.json --emitDeclarationOnly`
  completed successfully.
- `node packages/web-builder/scripts/sync-showcase-artifacts.ts` completed successfully.
- `node packages/web-builder/scripts/generate-showcase-registry.ts` completed successfully.
- `./packages/showcase/node_modules/.bin/tsc -p packages/showcase/tsconfig.json --noEmit`
  completed successfully.
- Showcase `/switch` was validated in the browser:
  - Material Design 3 by Google keeps `Pill (default)`, `Motion Static`, visible Thumb size, and
    rendered Switch states.
  - Carbon by IBM, which has no Switch metadata artifact, falls back without a
    `components/switch.kiskadee.json` 404 after the manifest-index loader change.

Blocked/partial validation:

- `pnpm --filter @kiskadee/web-builder run build` and
  `pnpm --filter @kiskadee/react-components run build` were blocked by the local pnpm
  `ERR_PNPM_IGNORED_BUILDS` guard for native/dependency build scripts. Equivalent package scripts
  and local `tsc` commands were used instead.
- `pnpm --filter @kiskadee/showcase build` was not completed through pnpm for the same environment
  reason. A direct `next build` attempt was started but did not finish in useful time, so the final
  Showcase validation used TypeScript plus browser verification against `next dev`.

## Phase 2 Implementation Status

Status: implemented locally for component-scoped class-map JSON, with Switch as the first runtime
consumer.

Implemented decisions:

- Aggregate class-map files remain as compatibility outputs:
  - `core.kiskadee.json`
  - `<segment>.<theme>.kiskadee.json`
- New component-scoped class-map artifacts are emitted for every generated component branch:
  - `class-maps/core/<component>.kiskadee.json`
  - `class-maps/<segment>.<theme>/<component>.kiskadee.json`
- Component file names use kebab-case slugs, so `textField` becomes `text-field.kiskadee.json`.
- Component class-map artifact shape is:

  ```json
  {
    "component": "switch",
    "classMap": {}
  }
  ```

- `manifest.components.<name>.artifacts.classMaps` indexes the core and palette class-map paths
  when those artifacts exist.
- `KiskadeeContext` now exposes optional `loadComponentClassMap`.
- `useSwitchArtifactConfig` loads and merges Switch core/palette class maps on demand, then falls
  back to `classesMap.switch` if component artifacts are unavailable.
- Showcase resolves component class-map paths from the active manifest.
- Showcase skips the aggregate class-map loader on `/switch`, so the Switch route can validate the
  on-demand class-map path while other routes keep aggregate compatibility.
- CSS remains aggregated; this phase changes JSON class-map loading only.

Changed files:

- `packages/web-builder/src/component-artifacts/componentClassMapArtifacts.ts`
- `packages/web-builder/src/phase-6-persist-build-artifacts/persistBuildArtifacts.ts`
- `packages/web-builder/src/phase-7-publish-metadata/manifestTypes.ts`
- `packages/web-builder/src/phase-7-publish-metadata/publishMetadata.ts`
- `packages/web-builder/src/run-build.ts`
- `packages/web-builder/types.ts`
- `packages/components/react/src/contexts/KiskadeeContext.tsx`
- `packages/components/react/src/contexts/componentArtifactCache.ts`
- `packages/components/react/src/Switch/useSwitchArtifactConfig.ts`
- `packages/components/react/src/index.ts`
- `packages/showcase/app/providers.tsx`
- `packages/showcase/hooks/use-class-map-loader.ts`
- `packages/showcase/registry/generated/design-systems.registry.generated.ts`
- Artifact contract docs under `SCHEMA-BUILD-RUNTIME-RULES.md` and
  `packages/web-builder/docs/definitions/generated-artifacts.md`.

Validation notes:

- `node packages/web-builder/src/run-build.ts` completed successfully.
- Generated output inspection confirmed:
  - aggregate `core.kiskadee.json` and palette JSON files still exist;
  - `class-maps/core/switch.kiskadee.json` exists;
  - `class-maps/default.light/switch.kiskadee.json` exists;
  - `manifest.components.switch.artifacts.classMaps` points to the new files;
  - other generated component branches such as `button`, `tabs`, and `text-field` also receive
    component-scoped class-map artifacts when class maps exist.
- `node packages/web-builder/scripts/sync-showcase-artifacts.ts` completed successfully.
- `node packages/web-builder/scripts/generate-showcase-registry.ts` completed successfully.
- `node packages/headless/react/scripts/build.ts --skip-types` completed successfully.
- `node packages/components/react/scripts/build.ts --skip-types` completed successfully.
- `./packages/headless/react/node_modules/.bin/tsc -p packages/headless/react/tsconfig.build.json --emitDeclarationOnly`
  completed successfully.
- `./packages/components/react/node_modules/.bin/tsc -p packages/components/react/tsconfig.build.json --noEmit`
  completed successfully.
- `./packages/components/react/node_modules/.bin/tsc -p packages/components/react/tsconfig.build.json --emitDeclarationOnly`
  completed successfully.
- `./packages/showcase/node_modules/.bin/tsc -p packages/showcase/tsconfig.json --noEmit`
  completed successfully.
- Showcase `/switch` was validated in the browser against an existing dev server at
  `http://localhost:3000`:
  - Material Design 3 by Google rendered Switch defaults and states correctly.
  - Observed runtime assets included `components/switch.kiskadee.json`,
    `class-maps/core/switch.kiskadee.json`, and
    `class-maps/default.light/switch.kiskadee.json`.
  - Observed runtime assets did not include Material aggregate class-map JSON
    `core.kiskadee.json` or `default.light.kiskadee.json` for `/switch`.
  - Carbon by IBM, which has no Switch class-map artifact, fell back without loading
    `class-maps/**/switch.kiskadee.json`.

Blocked/partial validation:

- `pnpm --filter ... build` commands remain subject to the local pnpm
  `ERR_PNPM_IGNORED_BUILDS` guard. Direct package scripts and local `tsc` commands were used
  instead.
- Starting a new Showcase dev server on port `3014` was not needed because an existing Showcase dev
  server was already running on `3000`.

## Current Artifact Model

The current web-builder output is emitted per design system under
`packages/web-builder/build/<designSystemKey>/` and then synced into Showcase under
`packages/showcase/public/build/<designSystemKey>/`.

### Runtime JSON

| Artifact | Current role | Component-split impact |
| --- | --- | --- |
| `global.kiskadee.json` | Runtime-friendly global metadata plus `components.<name>` options/effects for components such as Tabs, Switch, and TextField. | High. First split target. Keep only truly global data here and move component metadata into component artifacts. |
| `core.kiskadee.json` | Palette-independent class map for all components. | High. Kept as compatibility output while component hooks move to `class-maps/core/<component>.kiskadee.json`. |
| `<segment>.<theme>.kiskadee.json` | Palette/theme class map for all components. | High. Kept as compatibility output while component hooks move to `class-maps/<segment>.<theme>/<component>.kiskadee.json`. |
| `class-maps/core/<component>.kiskadee.json` | Palette-independent class map for one component. | Implemented in Phase 2. First runtime consumer is Switch. |
| `class-maps/<segment>.<theme>/<component>.kiskadee.json` | Palette/theme class map for one component. | Implemented in Phase 2. First runtime consumer is Switch. |
| `manifest.json` | Compact design-system discovery metadata: key, display name, fonts, segments, themes, and high-level component capabilities. | Medium. It should remain small, but gain artifact index information for component-level chunks. |
| `schema.json` | Serializable schema snapshot without `colors`, useful for inspection/tooling. | Medium/low for runtime. Keep aggregated initially unless runtime consumers start loading it eagerly. |
| `core.kiskadee.schema.json` | JSON Schema for `core.kiskadee.json`. | Low/medium. Update only if the class-map artifact shape changes. |
| `segments.json` | Segment/theme metadata. | Low. Not component-specific. |
| `colors.json` | Color artifact index and color model metadata. | Low. Not component-specific. |
| `colors/<scale>.json` | Primitive color scales referenced by `colors.json`. | Low. Not component-specific. |
| `extra.<segment>.<theme>.kiskadee.json` | Extra palette metadata, currently background color. | Low. Not component-specific today. |

### Runtime CSS

| Artifact | Current role | Component-split impact |
| --- | --- | --- |
| `core.kiskadee.css` | Palette-independent CSS for all generated component utilities. | High, but later. Splitting too early can break global dedupe or create too many requests. |
| `<segment>.<theme>.kiskadee.css` | Palette/theme CSS for all generated component color utilities. | High, but later. Useful payload target, with request/waterfall risk. |
| `effects.kiskadee.css` | Effect utilities such as shadow, ripple, and stateful radius effects. | Medium/high. May need shared global effects plus component chunks. |
| `tokens.kiskadee.css` | Truly global CSS variables such as focus width/offset and ripple alpha values. | Low. Keep global unless component-specific tokens appear. |
| `tokens.<segment>.<theme>.kiskadee.css` | Theme CSS variables such as focus color, activation feedback, and ripple colors. | Low/medium. Keep theme-global unless component-specific tokens appear. |

### Showcase Generated Registries

These are not design-system artifacts, but they will need to understand any new artifact layout:

- `packages/showcase/registry/generated/design-systems.registry.generated.ts`
- `packages/showcase/registry/generated/css.registry.generated.ts`
- `packages/showcase/registry/generated/colors.registry.generated.ts`

`colors.registry.generated.ts` probably stays mostly unchanged. The design-system and CSS
registries will need component artifact loaders/URLs as JSON and CSS are split.

## Target Model

The target model is component-demand-driven artifact loading:

1. A page that renders only Switch should not load Tabs/TextField component metadata or class maps.
2. A page with 10 component families should load only the 10 component artifact sets it needs.
3. Multiple instances of the same component should share one cached artifact load.
4. Component hooks, such as `useSwitchArtifactConfig`, are the component-facing API.
5. The cache should be shared above individual component instances, likely through React Query or
   an equivalent artifact cache keyed by design system, segment, theme, artifact type, and component.
6. `KiskadeeContext` should keep environment-level data, not a growing store of all component
   artifacts. Good context data includes selected design system, segment, theme, artifact base path,
   version/hash, and global defaults.

Potential future paths:

```txt
<designSystem>/global.kiskadee.json
<designSystem>/components/switch.kiskadee.json
<designSystem>/components/tabs.kiskadee.json
<designSystem>/components/text-field.kiskadee.json

<designSystem>/class-maps/core/switch.kiskadee.json
<designSystem>/class-maps/default.light/switch.kiskadee.json

<designSystem>/css/core/switch.kiskadee.css
<designSystem>/css/default.light/switch.kiskadee.css
```

The exact paths are still open. The invariant is more important than the path: component-specific
runtime data should not force every page to load every component.

## Refactor Phases

### Phase 1 - Split component metadata JSON

Goal: move component-specific semantic metadata out of `global.kiskadee.json`.

Candidate output:

- Keep `global.kiskadee.json` for truly global data such as fonts, radius, and global effects.
- Add component metadata artifacts for options/effects/variant defaults, starting with Switch.
- Update `manifest.json` or a lightweight artifact index so consumers can discover component
  metadata URLs and hashes.
- Update `useSwitchArtifactConfig` to load Switch metadata on demand and share the result across
  instances through the chosen cache.
- Keep class maps and CSS aggregated in this phase.

Acceptance notes:

- `global.kiskadee.json` no longer grows linearly with every component's runtime metadata.
- Switch is the first reference implementation.
- Showcase and the visual component read the same Switch metadata source.

### Phase 2 - Split class-map JSON by component

Goal: stop loading all component class maps for pages that need only a subset of components.

Candidate output:

- Split `core.kiskadee.json` into component-scoped core class maps.
- Split `<segment>.<theme>.kiskadee.json` into component-scoped palette class maps.
- Add component-aware loaders/registries.
- Preserve class-map responsibility: generated classes only, not semantic capability decisions.

Acceptance notes:

- A component hook can resolve its core and palette class maps independently.
- Merging class maps should happen per component, not by merging all components into one store.
- Existing aggregate files may stay temporarily for compatibility during migration.

### Phase 3 - Split CSS by component where the performance model proves it helps

Goal: reduce CSS loaded for unrelated components without losing the current dedupe benefits.

Candidate output:

- Explore component-scoped `core` and palette CSS chunks.
- Decide whether `effects.kiskadee.css` remains shared, splits by component, or splits by effect
  family plus component.
- Keep `tokens.kiskadee.css` and `tokens.<segment>.<theme>.kiskadee.css` global unless a specific
  component-scoped token need appears.

Acceptance notes:

- Avoid blindly multiplying chunks by every variant/effect permutation.
- Avoid trading one large payload for excessive request waterfalls.
- Measure or at least inspect output size before making CSS split the default.

### Phase 4 - Update registries, sync, and compatibility strategy

Goal: make the generated artifact layout consumable by Showcase and external apps.

Candidate output:

- Update `generate-showcase-registry.ts` to emit component artifact loaders/URLs.
- Update `sync-showcase-artifacts.ts` only if the folder layout requires it.
- Decide whether aggregate artifacts remain as compatibility outputs for one or more releases.
- Document the stable artifact contract in web-builder docs.

Acceptance notes:

- Showcase can load only artifacts needed for the rendered route.
- External consumers have a clear upgrade path.
- The generated registry remains a build artifact, not hand-written source.

## Current Reference Implementation

`useSwitchArtifactConfig` is still the best API shape reference, but its current data source is not
the final model. Today it reads from `global.components.switch` and the already-loaded full
`classesMap`.

The target direction is:

- keep the hook as the Switch-local entry point;
- move semantic Switch metadata into a Switch component artifact;
- later move Switch class maps into component class-map artifacts;
- use shared cache semantics so multiple Switch instances do not duplicate network work;
- keep class maps as class resolution artifacts, not semantic capability metadata.

## Non-Goals

- Do not create separate Linear issues for every phase unless the user explicitly asks later.
- Do not make Showcase-specific hooks the canonical component metadata API.
- Do not move all schema data into per-component runtime artifacts.
- Do not split CSS first.
- Do not remove aggregate artifacts until a compatibility path is decided.
- Do not use `core.kiskadee.json` as the semantic source of truth for component capabilities.

## Validation Plan

Validation should scale with the phase being implemented:

- Metadata JSON split: inspect generated `global.kiskadee.json` and component metadata artifacts;
  run `pnpm --filter @kiskadee/web-builder run build`; run `pnpm --filter @kiskadee/web-builder run generate` if registries change.
- Components/runtime hook changes: run `pnpm --filter @kiskadee/react-components run build`.
- Showcase loading changes: run `pnpm --filter @kiskadee/showcase build` and validate at least the
  Switch route in the browser.
- CSS split: inspect emitted CSS sizes and verify ordering/loading in Showcase before declaring the
  split successful.

## Open Questions

- Should component metadata artifacts be keyed by component name only, or by component plus variant
  when variant metadata grows?
- Should React Query be a hard dependency for runtime artifact caching, or should Kiskadee expose a
  small framework-agnostic artifact cache and let apps adapt it to React Query?
- What compatibility period is needed for aggregate `global.kiskadee.json`, `core.kiskadee.json`,
  and palette class-map files?
- Should `manifest.json` directly list component artifact URLs, or should it point to a separate
  artifact index file?
