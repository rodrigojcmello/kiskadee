# @kiskadee/web-builder

Build pipeline that converts a Kiskadee `Schema` into Web artifacts (utility CSS + JSON maps).

## Border width vs padding (web-only compensation)

On the web, borders contribute to the rendered box size when height/width are `auto`. That means a
button with `paddingTop + textHeight + paddingBottom = 40` and `borderWidth = 1` renders at 42px,
even though the schema is correct for other platforms (where stroke is typically drawn inside the
bounds).

To keep the schema platform‑agnostic while preserving the correct visual size on web, the
web-builder **compensates padding by the border width** at CSS generation time:

- `borderWidth` emits a CSS variable: `--k-bdw`
- each `padding*` emits a base var (`--k-pdt`, `--k-pdr`, `--k-pdb`, `--k-pdl`)
- the actual CSS uses `max(0px, calc(var(--k-pd*) - var(--k-bdw, 0px)))`

This keeps layout stable across platforms without baking web-specific offsets into the schema.

## Gradients: `ResolvedGradient` + smooth transitions on Web

Kiskadee stores gradients in a **platform-agnostic** way (as a `ResolvedGradient` object coming from `@kiskadee/core`).
The Web builder is responsible for converting that data into valid CSS.

### Why gradients do not transition by default

In CSS, `linear-gradient(...)` is treated as an **image**, and browsers generally do not interpolate images.
That means transitions like `transition: background 180ms` typically do **not** animate between gradients.

### Strategy used by Kiskadee (CSS-only, no JS)

For `boxColor` gradients, the Web builder emits:

1) A stable gradient expression that references CSS custom properties:

```css
.myClass {
  background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%);
}
```

2) State-specific rules that only override the variables (instead of swapping the whole gradient):

```css
.myClass { --k-bg0: #AABBCC; --k-bg1: #DDEEFF; background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%); }
.myClass:hover { --k-bg0: #112233; --k-bg1: #445566; }
```

3) Global `@property` registrations (so browsers that support it can interpolate `<color>` values):

- `@property --k-bg0`
- `@property --k-bg1`
- `@property --k-bg2`

Those live in `packages/components/react/src/styles/style.kiskadee.scss`.

### Constraints and fallbacks

- This strategy is implemented only for `boxColor` on Web.
- Animation is enabled only for gradients with **2 or 3 stops**.
- For other gradients (or unsupported browsers), the output remains correct, but transitions may be skipped (progressive enhancement).

### Feature flag: force solid `boxColor` as gradient (showcase)

When switching between Design Systems, CSS cannot interpolate between `background-color` (a color) and
`background-image: linear-gradient(...)` (an image). That can cause a visual “jump” when a DS uses
solid backgrounds and another uses gradients.

To mitigate this (initially for the showcase), the web-builder supports forcing **solid `boxColor`**
to be emitted as a **degenerate 2-stop gradient** (same color on both stops), so the CSS type stays
consistent across DS.

- Flag lives in `packages/web-builder/src/run-build.ts`
- Name: `ENABLE_SOLID_BOXCOLOR_AS_GRADIENT`
- Default: `false`

When enabled, a solid `boxColor` becomes:

```css
.myClass {
  --k-bg0: #AABBCC;
  --k-bg1: #AABBCC;
  background: linear-gradient(180deg, var(--k-bg0) 0%, var(--k-bg1) 100%);
}
```

### Important note about class composition

State rules (like `:hover`, `:active`, `:focus-visible`) only override `--k-bg0/--k-bg1/--k-bg2`.
The base gradient `background: linear-gradient(...)` is emitted on the `rest` rule.
Therefore, the element must carry the base (rest) class for the state override to work.

### Control state (`selected`) vs selected-scoped effects

Kiskadee treats `controlState` (e.g. `selected`) and interaction effects (e.g. stateful `borderRadius`) as **separate, opt-in concerns**.

- `controlState` is a semantic toggle state that is activated by the runtime (e.g. `controlState={true}` on React components).
- Effects are optional, component-level features and must only be applied when the consumer explicitly opts in (e.g. `radiusEffect={true}`, `shadow={true}`).

This distinction matters because some Design Systems (e.g. Material Design 3) author *selected-specific* interaction effects (like “animated corners” under `effects.borderRadius.selected`). Those effects must **not** automatically activate just because `controlState` is on.

**Rule:** interaction keys under `selected:*` remain effects and stay inside the element `e` buckets in `core.kiskadee.json`. They must never be moved into the control-state field (`l`).

Practical implication for consumers: if a DS wants “selected + animated corners”, the component must be rendered with **both** `controlState={true}` and `radiusEffect={true}`.

## Border radius: modes vs effects (rounded / square / pill)

Kiskadee separates **radius mode** (the base shape) from **radius effect** (stateful animated corners).
This keeps the base geometry cross‑platform and allows effects to be opt‑in.

### Radius modes (base geometry)

`radius` is a component prop that accepts:

- `rounded` (default): uses `scales.borderRadius.rounded`.
- `square`: uses `scales.borderRadius.square`.
- `pill`: uses `scales.borderRadius.pill`.

The default mode comes from `schema.global.radius` and is exported in the build artifact `global.kiskadee.json`.
All three modes are **explicit** in the schema, so the web-builder emits concrete classes for each mode
(no runtime hacks like `9999px`).

### Radius effects (animated corners)

`radiusEffect` is a boolean prop that enables the **effects** bucket generated from `effects.borderRadius`:

- `rounded` uses `effects.borderRadius.rounded`
- `pill` uses `effects.borderRadius.pill`
- `square` ignores the radius effect

This is intentional: effects are opt‑in and never applied by default, even if the mode is `rounded` or `pill`.

### Cross‑platform rule

- **Base geometry**: resolved by the renderer per platform using the schema values for each mode.
- **Effects**: always opt‑in via `radiusEffect`, regardless of platform.

### Feature flag: forced interaction states as class selectors (showcase)

For the showcase, it can be useful to display components in a specific interaction state
without relying on native browser pseudos (e.g. you cannot realistically force `:hover`
on a static HTML snapshot).

When enabled, the web-builder emits **additional selectors** for interaction states using
**forced state classes** (e.g. `.-h`, `.-f`) gated by the activator class `.-a`.

Examples (conceptual):

```css
/* Native pseudo */
.myClass:hover { /* ... */ }

/* Forced state (opt-in via classes) */
.myClass.-h.-a { /* ... */ }
```

- Flag lives in `packages/web-builder/src/run-build.ts`
- Name: `ENABLE_FORCED_INTERACTION_STATES`
- Default: `true` (showcase-oriented; change as needed)

## Segment registry vs `segments.json` artifact

Kiskadee no longer uses a `schema.segments` object as a source of truth.

### Source of truth (in presets)

Segments are defined and discovered via:

- `schema.colors.globalSemanticsBySegment`

This is a **segment registry** (metadata + optional overrides):

- `meta.name` is the human-friendly segment label shown in tooling.
- `themes` is optional and only exists when a segment overrides Layer 2 mappings.

Conceptually, runtime resolution works like this:

1) Segment override (if present)
2) Fallback to the global baseline

In code terms:

```ts
override = colors.globalSemanticsBySegment[segment].themes?.[theme]?.[semantic]
base = colors.globalSemantics[theme][semantic]
resolved = override ?? base
```

### Build artifact (`segments.json`)

`segments.json` is a **metadata artifact** published by the web-builder (used by the showcase and other tooling).

Even though the runtime resolver supports fallback/inheritance, artifacts should be **explicit**.
Therefore, `segments.json` is generated by:

- taking the global baseline (`colors.globalSemantics`)
- merging it with per-segment overrides (`colors.globalSemanticsBySegment[segment].themes`)
- writing an explicit `themes` object for **every segment**, including `default`

This means:

- `default.themes` is always fully populated (no “implicit inheritance” in the artifact)
- `dynamic.themes` (or any other segment) contains a fully materialized view (baseline + overrides)

### Why this split exists

- **Runtime config** should stay small and avoid duplication (baseline + overrides).
- **Artifacts** should be easy to inspect and consume without requiring the reader to understand inheritance.

## Web-builder pipeline (phases)

Location: `packages/web-builder/src/index.ts`

1) Phase 1 - Convert schema to style keys
   - Function: `convertElementSchemaToStyleKeys(schema)`
   - Produces normalized style keys per component and element.

2) Phase 2 - Map style key usage
   - Function: `mapStyleKeyUsage(styleKeys)`
   - Collects usage to shorten class names.

3) Phase 3 - Shorten class names
   - Function: `shortenCssClassNames(usageMap)`
   - Produces a dictionary of short class names per style key.

4) Phase 4 - Generate CSS rules (split core vs palettes)
   - Function: `generateCssSplit(styleKeys, shortenMap)`
   - Colors use `transformColorKeyToCss` with `forceState=true`.
   - Results: `coreCss` and `palettes[paletteName]`.

5) Phase 5 - Generate classNamesMap split
   - Function: `generateClassNamesMapSplit(styleKeys, shortenMap)`
   - Produces the class map per component/element/state/palette.

6) Phase 6 - Persist artifacts
   - Function: `persistBuildArtifacts(cssGenerated, classNamesMapSplit, schema.name)`
   - Writes CSS bundles and maps to disk by preset.

7) Phase 7 - Publish metadata
   - Function: `publishMetadata({ schema, outDirSlug, schemaPath, baseBuildDir })`
   - Writes `manifest.json`, `schema.json` and `segments.json` under `build/<template-key>`.
   - `segments.json` is derived from `schema.colors.globalSemanticsBySegment`.

## Style key and interaction state conventions

- Inline keys (`--`)
  - Format: `property--state__value`
  - Apply to the element itself using native pseudos and/or forced classes.

- Reference keys (`==`)
  - Format: `property==state__value`
  - State lives on the parent and applies to the child class.

- Interaction states -> selectors
  - Native pseudos: `hover`, `focus`, `pressed` (mapped in `InteractionStateCssPseudoSelector`).
  - Forced classes: `-h`, `-f`, `-p`, `-s`, `-d` (hover, focus, pressed, selected, disabled).
  - Activator class: `-a` (only apply forced states when explicitly activated).

- Generation rules (summary)
  - Inline
    - Native: does not include `-a`; includes non-native markers (e.g. `-s`) when relevant.
    - Forced: includes all forced classes plus `-a`.
  - Reference (parent -> child)
    - Native: include `-a` on the parent, pseudos on the parent, select the child class.
    - Forced: parent with `-a` and forced classes, select the child class.
  - Disabled: can always generate a forced variant with `-d` and `-a`.

## Generated artifacts

- Core CSS: utilities for decorations/scales/effects (palette-independent).
- Per-palette CSS: color rules only.
- `classNamesMapSplit`: maps classes per component/element/state/palette at runtime.

Metadata per template (under `packages/web-builder/build/<template-key>`):

- `manifest.json`: used by the showcase to discover templates, segments and themes.
- `schema.json` / `segments.json`: raw schema and segment data for inspection or tooling.

## Build, sync and showcase registry scripts

The monorepo uses scripts from this package to keep artifacts and the showcase in sync.

### Package scripts (packages/web-builder/package.json)

- `pnpm --filter @kiskadee/web-builder run build`
  - Runs `src/run-build.ts` using `tsx`.
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

## Typical usage (high level)

1) Choose a preset from `@kiskadee/presets` and run the web-builder to generate CSS and class maps.
2) Consume `core` and palette CSS in the app, and apply classes from `classNamesMapSplit`.
3) Keep layout/structure in component code; the builder should only own visual identity.

## Runtime vs CSS contract

To keep behavior predictable and performance-oriented, Kiskadee follows this contract:

- **Runtime decisions must come from JSON artifacts** (for example: `global.kiskadee.json`, `core.kiskadee.json`).
- **CSS is the final visual layer** (presentation only), not the source of truth for runtime branching.

### What belongs to runtime (JSON)

- Interaction policy and behavior switches:
  - ripple mode selection
  - ripple origin (`center` vs `pointer`)
  - input feedback mode (`pressed` vs `ripple`)
  - pressed visual behavior (`state` vs `overlay`)

### What belongs to CSS

- Final styling values:
  - colors, opacity, shadows, border radius, spacing
  - animation timing/easing values used by style rules

### Rule of thumb

- Runtime must read behavior and runtime animation parameters from JSON artifacts.
- Runtime must not read CSS variables/custom properties to decide runtime behavior or timing.

## Useful reference files

- `packages/web-builder/src/index.ts` - orchestrates the pipeline phases.
- `packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/palettes/transformColorKeyToCss.ts` - selector generation rules.
- `packages/web-builder/src/phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts` - core vs palettes split.
- `packages/web-builder/src/phase-5-generate-class-names-map/generateClassNamesMap.ts` - classNamesMapSplit generation.
