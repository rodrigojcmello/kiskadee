# Kiskadee — Monorepo Overview

This repository hosts the core of Kiskadee: a pipeline that transforms a platform‑agnostic schema (visual identity) into utility CSS (one class per style) and a set of packages that compose components from that core.

Below you’ll find each package/project’s purpose, how they relate, and the artifacts produced.

## Packages and responsibilities

- @kiskadee/core (packages/core)
  - What it is: the platform‑agnostic design schema and core types/utilities. It defines essential visual identity tokens organized by component/element: palettes (colors), decorations, scales (spacing/typography), and effects.
  - What it is NOT: it does not contain platform resets (e.g., HTML widget fixes) nor structural/behavioral rules for components (layout, positioning). It also does not contain CSS — only data (plus schema utilities/types).

- @kiskadee/presets (packages/presets)
  - What it is: a collection of ready‑to‑use schema presets built on top of @kiskadee/core.
  - Examples:
    - templates (e.g., google-material-design, ios-26-kiskadee, material-design-3-google) — schema sources that can be plugged into the Web builder.
    - **Dynamic Segments**: presets now support segments that use CSS variables for their primary color, allowing runtime theming (e.g., "dynamic" segment).

- @kiskadee/web-builder (packages/web-builder)
  - What it is: the pipeline that converts the core schema (and presets) into utility CSS and class maps for runtime consumption. It is Web‑specific in terms of output (CSS), but it does not contain resets/component structure.
  - Main outputs:
    - Core CSS (decoration/scale/effects that do not depend on a palette)
    - Per‑palette CSS (colors only). Generates optimized Hex for static segments (e.g., "default") and CSS variables for dynamic segments (e.g., "dynamic").
    - Class name maps per component/element/state: classNamesMapSplit
  - Where the pipeline lives: src/index.ts organizes phases 1–6.
  - What it is NOT: it does not apply Web normalize/reset, nor define component layout/structure.

- @kiskadee/runtime (packages/runtime)
  - What it is: A lightweight, zero-dependency library for the browser.
  - Purpose: Calculates and injects color scales into CSS variables at runtime. It powers the "dynamic" segment by taking a single source color (e.g., from a color picker or system API) and generating the full Kiskadee tonal palette on the fly.

- @kiskadee/headless (packages/headless)
  - What it is: headless (agnostic) components — logic and accessibility, no styling. E.g., Tabs, Button behavior, etc., without CSS.
  - What it is NOT: it does not apply visual identity or visual structure; it is meant to be styled/structured by the consumer (e.g., @kiskadee/react-components).

- @kiskadee/react-components (packages/components/react)
  - What it is: composition of visual components for the Web, combining:
    - the utility CSS and class map from @kiskadee/web-builder;
    - the logic/accessibility from @kiskadee/headless;
    - local CSS Modules for minimal structure and any component‑specific resets (when needed).
  - Recommendations:
    - Prefer CSS Modules with compose to reuse generated utilities (avoids CSS duplication).
    - Keep structural adjustments here (display, flex/grid, hit area), leaving visual identity to the generated utility CSS.

- @kiskadee/showcase (packages/sandbox)
  - What it is: the documentation and demo app for Kiskadee, built on top of @kiskadee/react-components and the generated CSS/maps. Used to explore templates, palettes, and components in a real Web environment.

## Web‑builder pipeline (Phases)

Location: packages/web-builder/src/index.ts

1) Phase 1 — Convert schema to style keys
   - Function: convertElementSchemaToStyleKeys(schema)
   - Produces normalized “style keys” per component/element.

2) Phase 2 — Map style key usage
   - Function: mapStyleKeyUsage(styleKeys)
   - Optimization: collects frequency/usage to shorten class names.

3) Phase 3 — Shorten class names
   - Function: shortenCssClassNames(usageMap)
   - Produces a dictionary of short classNames per styleKey.

4) Phase 4 — Generate CSS rules (split core vs palettes)
   - Function: generateCssSplit(styleKeys, shortenMap)
   - For colors (palettes), use transformColorKeyToCss with forceState=true to build state selectors.
   - Results: coreCss and palettes[paletteName].

5) Phase 5 — Generate classNamesMap split
   - Function: generateClassNamesMapSplit(styleKeys, shortenMap)
   - Produces the class map per component/element/palette/state for runtime usage.

6) Phase 6 — Persist artifacts
   - Function: persistBuildArtifacts(cssGenerated, classNamesMapSplit, schema.name)
   - Writes CSS bundles and maps to disk (organized by palette and core).

7) Phase 7 — Publish metadata
   - Function: publishMetadata({ schema, outDirSlug, schemaPath, baseBuildDir })
   - Writes a manifest.json, schema.json, segments.json and schema.source.ts per preset directory
     under packages/web-builder/build/<template-key>.
   - Note: `segments.json` is generated from `schema.colors.globalSemanticsBySegment` (segment registry)
     and materializes `themes` for every segment (including `default`).

## Style key and interaction state conventions

- Inline keys (——)
  - Format: property--state__[…HSLA]
  - Affect the element itself: generate selectors like .{class} with combinations of native pseudo‑classes and/or forced classes.

- Reference keys (==)
  - Format: property==state__[…HSLA]
  - The state lives on the “parent” and the style applies to the “child” .{class}. Generates selectors with the parent on the left and the child class on the right.

- Interaction states → selectors
  - Native pseudos: hover, focus, pressed (as mapped in InteractionStateCssPseudoSelector).
  - Forced classes (classNameCssPseudoSelector): suffixes like -h (hover), -f (focus), -p (pressed), -s (selected), -d (disabled).
  - Activator class: -a (activator). Ensures forced styles only apply when explicitly activated.

- Generation rules (summary)
  - Inline
    - With native pseudos: native selector does NOT include -a; it includes non‑native state markers (e.g., -s for selected) when relevant.
    - Forced: includes ALL forced classes of the involved states and ALWAYS includes -a. Example: .abc.-s.-h.-a
  - Reference (parent → child)
    - Native (only emit when there’s at least one native pseudo): always includes -a on the parent, applies pseudos on the parent and adds non‑native state classes; selects the child .{class}. Example: .-a:hover.-s .abc
    - Forced: parent with -a and all forced classes; selects the child. Example: .-a.-s.-h .abc
  - Disabled state: always can generate a forced variant with -d and -a; avoid duplicating the native branch when only non‑native states exist.

## Generated artifacts

- Core CSS: utilities for decorations/scales/effects (palette‑independent).
- Per‑palette CSS: color rules only.
- classNamesMapSplit: structure to apply the correct classes per component/element/state/palette at runtime.

Metadata per template (under packages/web-builder/build/<template-key>):
- manifest.json: central manifest used by the showcase to discover templates, segments and themes.
- schema.json / segments.json: raw schema and segment data for inspection or tooling.

## Architecture guidelines

- core/presets are agnostic: visual identity only. No Web reset/normalize, no component layout/structure.
- web-builder generates utilities and maps: no structural rules or platform resets.
- headless provides accessibility and behavior, with no required CSS.
- react-components composes everything for the Web: minimal structure via CSS Modules and visual identity via generated utilities.

## Build, sync and showcase registry scripts

The monorepo includes a small set of scripts, all driven from the
`@kiskadee/web-builder` package, to keep the **web-builder output**, the
**Next.js showcase public assets** and the **showcase registries** in sync.

### Web‑builder package scripts (packages/web-builder/package.json)

Inside the `@kiskadee/web-builder` package there are helper scripts to drive
this pipeline from the presets:

- `pnpm --filter @kiskadee/web-builder run build`
  - Runs `src/run-build.ts` using `tsx`.
  - For each preset in `packages/presets/src/**` it:
    - runs the full web-builder pipeline (phases 1–7),
    - writes CSS/JSON artifacts into `packages/web-builder/build/<template-key>`.

- `pnpm --filter @kiskadee/web-builder run sync`
  - Executes the `packages/web-builder/scripts/sync-showcase-artifacts.cjs`
    script from the `@kiskadee/web-builder` package root.
  - Mirrors `packages/web-builder/build/**` to
    `packages/showcase/public/build/**`, making the artifacts available as
    static assets for the Next.js app.

- `pnpm --filter @kiskadee/web-builder run generate`
  - Executes the `packages/web-builder/scripts/generate-showcase-registry.cjs`
    script from the `@kiskadee/web-builder` package root.
  - Reads all `manifest.json` files under `packages/web-builder/build/**` and
    generates two TypeScript registries in `packages/showcase/app/registry`:
    - `templates.registry.generated.ts`
    - `css.registry.generated.ts`
  - These generated files are re‑exported by `templates.registry.ts` and
    `css.registry.ts`, allowing the showcase to automatically discover new
    presets/templates without manual updates.

- `pnpm --filter @kiskadee/web-builder run build-sync-generate`
  - Convenience script that chains the three steps above:
    1. Build all presets (`run-build.ts`)
    2. Sync artifacts to the showcase (`sync-showcase-artifacts`)
    3. Regenerate the Next.js registries (`generate-showcase-registry`)
  - This is the recommended command when you want to refresh everything the
    showcase consumes from the presets.

## Typical usage (high level)

1) Choose a schema template from @kiskadee/presets (e.g., google-material-design) and run the web-builder to generate CSS bundles and classNamesMapSplit.
2) In the @kiskadee/react-components package, import the required bundles (core + palette) and compose classes in the markup using classNamesMapSplit together with the component’s interaction states (headless).
3) Add minimal structure with CSS Modules (display, direction, alignment), preferring compose to reuse utilities.

## Useful reference files

- packages/web-builder/src/index.ts — orchestrates the pipeline phases.
- packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/palettes/transformColorKeyToCss.ts — selector generation rules by state (inline and reference).
- packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts — composition of the core vs palettes split.
- packages/web-builder/src/phase-5-generate-class-names-map/generateClassNamesMap.ts — generation of classNamesMapSplit.
- packages/presets/src/templates/* — example schemas.

## Future and extensions

- Tree‑shakeable generation of structural primitives (if adopted in the components package).
- New platforms (Android/iOS/Flutter/React Native) can reuse the schema; the Web builder remains focused on CSS.
