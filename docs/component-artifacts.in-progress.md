# Component Artifacts In-Progress

## Scope

This handoff tracks the component artifact refactor started in KIS-13 and continued in KIS-31:
splitting Kiskadee generated artifacts by component and loading them on demand.

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
- Foundation Linear issue: `KIS-13` (closed as the Switch reference implementation and artifact
  architecture foundation).
- Current rollout Linear issue: `KIS-31`.
- Current direction: use this file as the working source of truth for the remaining component
  artifact rollout.
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
- `global.kiskadee.json` initially published `components.switch` as a temporary compatibility
  output; Phase 3 removes this legacy output for newly generated artifacts.
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
  the component artifact after it loads, and keeps a `global.components.switch` fallback only for
  older generated artifacts.
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
  - `global.components.switch` and the component artifact were semantically equivalent during dual
    output; Phase 3 removes the legacy `global.components.switch` output.
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

## Phase 3 Implementation Status

Status: implemented locally for revised Phase 3.

Implemented decisions:

- Phase 3 is no longer a CSS split phase.
- Generated CSS remains aggregated because it is utility-like and optimized for cross-component
  class reuse, similar to Tailwind. Component structural CSS remains owned by component packages.
- Keep these CSS artifacts shared:
  - `core.kiskadee.css`
  - `<segment>.<theme>.kiskadee.css`
  - `effects.kiskadee.css`
  - `tokens.kiskadee.css`
  - `tokens.<segment>.<theme>.kiskadee.css`
- Stop emitting the Switch semantic metadata compatibility payload at
  `global.components.switch`.
- Continue emitting `components/switch.kiskadee.json` as the canonical Switch metadata artifact.
- Keep the runtime fallback in `useSwitchArtifactConfig` for older generated artifacts that still
  contain `global.components.switch`.
- Keep aggregate class-map JSON outputs for compatibility while Switch validates the component
  class-map path.

Changed files:

- `packages/web-builder/src/component-artifacts/switchComponentArtifact.ts`
- `packages/web-builder/src/phase-8-write-extra-artifacts/writeExtraArtifacts.ts`
- `SCHEMA-BUILD-RUNTIME-RULES.md`
- `packages/web-builder/docs/definitions/generated-artifacts.md`
- `packages/web-builder/docs/definitions/border-radius.md`
- `docs/component-artifacts.in-progress.md`

Validation notes:

- `node packages/web-builder/src/run-build.ts` completed successfully.
- `node packages/web-builder/scripts/sync-showcase-artifacts.ts` completed successfully.
- `node packages/web-builder/scripts/generate-showcase-registry.ts` completed successfully.
- Generated output inspection confirmed:
  - `global.kiskadee.json` still exists for every design system.
  - `global.components.switch` is absent from generated global artifacts.
  - `components/switch.kiskadee.json` still exists for design systems with Switch metadata.
  - non-migrated component metadata, such as Tabs/TextField where still used, remains under
    `global.components`.
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
- Local HTTP validation against the existing Showcase dev server at `http://localhost:3000`
  confirmed:
  - `/switch` returns `200`.
  - `/build/material-design-3-google/components/switch.kiskadee.json` returns `200`.
  - `/build/material-design-3-google/global.kiskadee.json` returns `200` and has no
    `components.switch`.

Blocked/partial validation:

- Browser validation could not be completed in this pass because the Codex Browser session reported
  that no browser route was available. HTTP and artifact inspection covered the output contract.
- `pnpm --filter ... build` commands remain subject to the local pnpm
  `ERR_PNPM_IGNORED_BUILDS` guard. Direct package scripts and local `tsc` commands were used
  instead.

## KIS-31 Rollout Implementation Status

Status: implemented locally for Tabs/TextField metadata artifacts and Button/Tabs/TextField
component class-map consumption.

Implemented decisions:

- KIS-13 was closed in Linear as the architecture foundation and Switch reference implementation.
- KIS-31 now tracks the remaining rollout: `Migrar componentes restantes para artefatos sob
  demanda`.
- Tabs semantic metadata now has a canonical component artifact:
  `components/tabs.kiskadee.json`.
- TextField semantic metadata now has a canonical component artifact:
  `components/text-field.kiskadee.json`.
- `manifest.components.tabs.artifacts.metadata` and
  `manifest.components.textField.artifacts.metadata` point to the new component metadata artifacts
  when they exist.
- Newly generated `global.kiskadee.json` no longer emits `global.components.tabs` or
  `global.components.textField`.
- The runtime still keeps legacy `global.components.tabs/textField` fallback support for older
  generated artifacts or external consumers that still provide those fields.
- Button has a component-local `useButtonArtifactConfig` hook for class-map access, but no metadata
  artifact in this phase because Button has no component-specific semantic metadata to split out of
  `global.kiskadee.json`.
- Button, Tabs, and TextField now consume component-scoped class maps through the shared component
  class-map loader/cache.
- Switch now also uses the shared component class-map loader/cache, replacing the earlier local
  class-map merge helper from the first reference implementation.
- Showcase no longer loads aggregate class maps on `/button`, `/text-field`, `/switch`, or
  `/tabs/*`.
- Showcase no longer models Tabs/TextField component metadata in `useThemeExtras`; pages that need
  schema defaults use `useTabsArtifactConfig` or `useTextFieldArtifactConfig`.
- Generated CSS remains aggregated/shared; this rollout is JSON metadata and JSON class-map only.

Changed files:

- `packages/web-builder/src/component-artifacts/tabsComponentArtifact.ts`
- `packages/web-builder/src/component-artifacts/textFieldComponentArtifact.ts`
- `packages/web-builder/src/phase-8-write-extra-artifacts/writeExtraArtifacts.ts`
- `packages/web-builder/src/phase-7-publish-metadata/publishMetadata.ts`
- `packages/components/react/src/contexts/useComponentClassMap.ts`
- `packages/components/react/src/Tabs/useTabsArtifactConfig.ts`
- `packages/components/react/src/TextField/useTextFieldArtifactConfig.ts`
- Button, Tabs, and TextField runtime files in `packages/components/react/src/`
- Showcase providers/routes/hooks that previously depended on aggregate component metadata
- `packages/showcase/registry/generated/design-systems.registry.generated.ts`

Validation notes:

- `pnpm --filter @kiskadee/web-builder run build` completed successfully.
- `pnpm --filter @kiskadee/react-components run build` completed successfully after restoring the
  TextField class-map type import.
- `pnpm --filter @kiskadee/web-builder run sync` completed successfully.
- `pnpm --filter @kiskadee/web-builder run generate` completed successfully.
- `pnpm --filter @kiskadee/showcase build` completed successfully, including
  `web-builder build-sync-generate`, React component builds, TypeScript, and Next static route
  generation.
- Generated output inspection confirmed:
  - `components/tabs.kiskadee.json` exists when Tabs metadata exists.
  - `components/text-field.kiskadee.json` exists when TextField metadata exists.
  - `manifest.components.tabs.artifacts.metadata` points to `components/tabs.kiskadee.json`.
  - `manifest.components.textField.artifacts.metadata` points to
    `components/text-field.kiskadee.json`.
  - `global.kiskadee.json` has no `components` payload for Material Design 3 by Google.
- HTTP validation against the existing Showcase dev server at `http://localhost:3000` confirmed
  `200 OK` for:
  - `components/tabs.kiskadee.json`
  - `components/text-field.kiskadee.json`
  - `class-maps/core/button.kiskadee.json`
  - `class-maps/core/tabs.kiskadee.json`
  - `class-maps/core/text-field.kiskadee.json`
- Browser validation against the same dev server confirmed the expected route headings rendered for:
  `/button`, `/text-field`, `/tabs/line`, `/tabs/dot`, `/tabs/box`, `/tabs/bridge`,
  `/tabs/segmented`, and `/switch`.

Blocked/partial validation:

- The Codex Browser runtime did not expose `window.performance`, so direct resource-entry
  inspection of loaded network artifacts was not available. The no-aggregate behavior was validated
  through code path inspection, generated manifest/artifact inspection, successful route rendering,
  and HTTP artifact availability.

## Current Artifact Model

The current web-builder output is emitted per design system under
`packages/web-builder/build/<designSystemKey>/` and then synced into Showcase under
`packages/showcase/public/build/<designSystemKey>/`.

### Runtime JSON

| Artifact | Current role | Component-split impact |
| --- | --- | --- |
| `global.kiskadee.json` | Runtime-friendly global metadata. | High. Switch, Tabs, and TextField metadata have moved out; newly generated artifacts should not include `global.components.switch`, `global.components.tabs`, or `global.components.textField`. |
| `core.kiskadee.json` | Palette-independent class map for all components. | High. Kept as compatibility output while component hooks move to `class-maps/core/<component>.kiskadee.json`. |
| `<segment>.<theme>.kiskadee.json` | Palette/theme class map for all components. | High. Kept as compatibility output while component hooks move to `class-maps/<segment>.<theme>/<component>.kiskadee.json`. |
| `class-maps/core/<component>.kiskadee.json` | Palette-independent class map for one component. | Implemented in Phase 2. Runtime consumers now include Switch, Button, Tabs, and TextField. |
| `class-maps/<segment>.<theme>/<component>.kiskadee.json` | Palette/theme class map for one component. | Implemented in Phase 2. Runtime consumers now include Switch, Button, Tabs, and TextField. |
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
| `core.kiskadee.css` | Palette-independent CSS for all generated utility classes. | Keep aggregated. The CSS layer is utility-like and benefits from cross-component class reuse/dedupe. |
| `<segment>.<theme>.kiskadee.css` | Palette/theme CSS for generated utility classes. | Keep aggregated unless measurements prove a split is better. |
| `effects.kiskadee.css` | Effect utilities such as shadow, activation feedback, and stateful radius effects. | Keep shared for now. Effects can be reused and have ordering/runtime implications. |
| `tokens.kiskadee.css` | Truly global CSS variables such as focus width/offset and shared effect values. | Low. Keep global unless component-specific tokens appear. |
| `tokens.<segment>.<theme>.kiskadee.css` | Theme CSS variables such as focus color and activation feedback colors. | Low/medium. Keep theme-global unless component-specific tokens appear. |

### Showcase Generated Registries

These are not design-system artifacts, but they need to understand the component artifact layout:

- `packages/showcase/registry/generated/design-systems.registry.generated.ts`
- `packages/showcase/registry/generated/css.registry.generated.ts`
- `packages/showcase/registry/generated/colors.registry.generated.ts`

`design-systems.registry.generated.ts` now carries component metadata/class-map paths from
`manifest.json`. `css.registry.generated.ts` and `colors.registry.generated.ts` stay mostly
unchanged while generated CSS remains aggregated.

## Target Model

The target model is component-demand-driven artifact loading:

1. A page that renders only Switch should not load Tabs/TextField component metadata or class maps.
2. A page with 10 component families should load only the 10 component artifact sets it needs.
3. Multiple instances of the same component should share one cached artifact load.
4. Component hooks, such as `useSwitchArtifactConfig`, are the component-facing API.
5. The cache is shared above individual component instances through the internal artifact cache,
   keyed by design system, segment, theme, artifact type, and component. React Query can still be
   adopted by consumers later, but it is not a runtime dependency now.
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

CSS stays in shared aggregate artifacts for now.
```

The JSON paths above are now the implemented convention. The invariant remains more important than
the path: component-specific runtime data should not force every page to load every component.

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

### Phase 3 - Consolidate JSON contract and keep CSS aggregated

Goal: finish the Switch JSON migration while preserving the current generated CSS model.

Candidate output:

- Remove `global.components.switch` from newly generated artifacts.
- Keep `components/switch.kiskadee.json` as the canonical Switch semantic metadata source.
- Keep aggregate class-map JSON as compatibility while component hooks migrate one by one.
- Explicitly document that generated CSS remains aggregated because it is utility-like and
  intentionally reused across components.

Acceptance notes:

- `global.kiskadee.json` no longer grows with Switch semantic metadata.
- Switch still renders through the canonical component metadata and class-map artifacts.
- CSS artifacts are not split by component in this phase.

### Phase 4 - Update registries, sync, and compatibility strategy

Goal: make the generated artifact layout consumable by Showcase and external apps.

Status: implemented for the current JSON rollout.

Implemented output:

- `generate-showcase-registry.ts` emits manifest-backed component artifact paths.
- `sync-showcase-artifacts.ts` copies the component artifact folders without special casing.
- Aggregate class-map JSON remains as a compatibility output while consumers migrate.
- Stable generated artifact rules are documented in web-builder docs.

Acceptance notes:

- Showcase can load only artifacts needed for the rendered route.
- External consumers have a clear upgrade path.
- The generated registry remains a build artifact, not hand-written source.

## Current Reference Implementation

`useSwitchArtifactConfig` is still the best API shape reference. Tabs and TextField now have the
same component-local metadata hook pattern, and Button/Tabs/TextField share the component class-map
loader/cache path.

The target direction is:

- keep component hooks as local entry points, such as `useSwitchArtifactConfig`,
  `useTabsArtifactConfig`, and `useTextFieldArtifactConfig`;
- keep semantic component metadata in component metadata artifacts;
- keep component class maps in component class-map artifacts;
- use shared cache semantics so multiple component instances do not duplicate network work;
- keep class maps as class resolution artifacts, not semantic capability metadata.
- keep generated CSS aggregated unless later measurements clearly justify a split.

## Non-Goals

- Do not create separate Linear issues for every component unless the user explicitly asks later.
- Do not make Showcase-specific hooks the canonical component metadata API.
- Do not move all schema data into per-component runtime artifacts.
- Do not split CSS by component without measurements that beat the current utility-like shared CSS
  output.
- Do not remove aggregate artifacts until a compatibility path is decided.
- Do not use `core.kiskadee.json` as the semantic source of truth for component capabilities.

## Validation Plan

Validation should scale with the phase being implemented:

- Metadata JSON split: inspect generated `global.kiskadee.json` and component metadata artifacts;
  run `pnpm --filter @kiskadee/web-builder run build`; run `pnpm --filter @kiskadee/web-builder run generate` if registries change.
- Components/runtime hook changes: run `pnpm --filter @kiskadee/react-components run build`.
- Showcase loading changes: run `pnpm --filter @kiskadee/showcase build` and validate at least the
  Switch route in the browser.
- CSS split: deferred. First measure payload and ordering impact; do not assume component CSS chunks
  are better than the current utility-like shared CSS output.

## Open Questions

- Should component metadata artifacts be keyed by component name only, or by component plus variant
  when variant metadata grows?
- What compatibility period is needed for aggregate `global.kiskadee.json`, `core.kiskadee.json`,
  and palette class-map files?
- Should React Query remain only a consumer-level integration option, or should a later package add
  an adapter on top of the current internal cache?
