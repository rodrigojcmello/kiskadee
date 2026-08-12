# Kiskadee - Purpose and monorepo map

This is the canonical architecture and product-context document for the repository.

Use `CHAT-CONTEXT.md` as the lightweight entrypoint for new chats. Keep `AGENTS.md` focused on
repo rules, and keep task workflows inside skills.

## Project purpose

Kiskadee defines a platform-agnostic visual identity schema based on a formula of colors, scales, decorations, and effects, built to normalize entire design systems. It includes a headless component foundation with accessibility (still small today, but designed for dozens or hundreds of native, cross-platform components). The current focus is Web (utility CSS + class maps), with lean generation and style dedupe to minimize duplication and keep CSS light; for now, these web differentiators live here until other platforms exist. The monorepo separates visual identity, build, behavior, and UI composition to keep the system scalable.

## Project description

Kiskadee is a set of packages that:

- models design systems as data (schema),
- offers official presets (Material, iOS, Fluent, Carbon),
- generates CSS and JSON for web consumption,
- enables dynamic color runtime,
- provides headless components and reference React components,
- includes a showcase for inspection and visual tests.

## Effects vs. Decorations vs. Scales vs. Palettes (colors)

Kiskadee’s schema separates visual concerns so components can opt in to effects without changing their semantic colors or layout rules.

- **Palettes (colors):** The color system (intent, emphasis, state) that drives fills, text, and borders. This is the semantic layer.
- **Scales:** Size/geometry scales (spacing, sizing, radius scales) used to normalize component sizing across a system.
- **Decorations:** Structural, always-on styling rules that shape the base look (e.g., radius mode, border styles, typography mapping).
- **Effects:** Opt-in, additive visuals (e.g., shadows, animated corners) that can be toggled per component without changing base colors.

Reusable typography profiles live in `global.typography`: each preset declares complete recipes
that combine font-role and weight decorations with size, line-height, and optional tracking scales.
Textual component slots reference those recipes by component scale, and Web builders expand the
references into the existing atomic decoration and scale utilities.

Standalone `Text` consumes the same recipes through a dedicated `t` artifact bucket. The bucket
maps compact, stable profile keys to the existing atomic utilities; it does not create composite
CSS selectors or turn typography profiles into component scales.

Typography profiles own text metrics, font role, and weight. Component elements continue to own
their surrounding geometry, including padding, gap, margin, alignment, and height. Presets reuse a
shared profile instead of creating compact or relaxed recipes solely to reproduce a component's
previous local line box.

Icon viewport geometry follows the same schema-to-build principle without introducing a browser
runtime. Each preset declares numeric levels in `global.iconSizes` using the existing element-size
IDs. An icon-bearing component slot maps its own scale and breakpoints to those levels through
`iconSize`; the Web Builder expands the references into the existing atomic `boxWidth` and
`boxHeight` utilities. The catalog answers how large a level is, while each component remains
responsible for when that level applies.

## Options vs. Element values

Component schema also has an important split between:

- **`components.<name>.options`:** behavioral switches or canonical component modes.
- **`components.<name>.elements.<el>.scales/decorations/palettes/effects`:** the actual visual values used when a mode is active.

Practical rule:

- Put "what mode is active" in `options`.
- Put "what value should be used when that mode is active" in the element definition.

Example:

- `tabs.options.tabWidthMode = 'auto' | 'fixed'` chooses the tab width behavior.
- `tabs.variants.<type>.elements.e2.scales.boxWidth` provides the fixed width value.

This matters because not every geometric value is always-on. Some values exist in the schema as available design tokens, but only become active when a component/runtime option selects them.

## Monorepo projects and goals

- `packages/core`
  - Goal: platform-agnostic schema, types, and utilities.
  - Defines tokens for colors, scales, decorations, and effects.
  - Does not include platform resets or structural layout rules.

- `packages/presets`
  - Goal: official design system presets.
  - Contains adaptation and mapping decisions for colors and styles.

- `packages/web-builder`
  - Goal: web pipeline that converts the schema into utility CSS and JSON maps.
  - Also publishes artifacts and metadata used by the showcase.
  - Does not define layout or structural component rules.

- `packages/runtime`
  - Goal: color runtime for dynamic segments.
  - Calculates scales and injects CSS variables in the browser.

- `packages/brands`
  - Goal: portable third-party brand definitions, provenance, optional packs, and standalone tonal
    assets.
  - Keeps brand identity outside preset primitive colors and the three-layer color architecture.

- `packages/fonts`
  - Goal: optional online font-provider adapters, preset integrations, and their lazy public
    catalog.
  - Keeps online preparation separate from preset recommendations and prepares only explicitly
    selected families without redistributing font files.

- `packages/icons`
  - Goal: canonical cross-platform SVG distribution and metadata, organized into visual families.
  - Preserves separately sourced brand artwork and its cross-platform distribution metadata.
  - Generates React adapters while also publishing raw SVG sources for other platform pipelines.
  - Exposes family barrels and direct per-icon imports without coupling icons to component logic.

- `packages/headless`
  - Goal: unstyled components (logic and accessibility).
  - Foundation for composition in React or other layers.

- `packages/components`
  - Goal: visual components for Web.
  - Composes generated CSS + headless + structural CSS Modules.
  - Relevant subfolder: `packages/components/react`.

- `packages/showcase`
  - Goal: Next.js app to inspect presets and artifacts.
  - Consumes builds generated by the web-builder.

## Canonical information flow (source -> consumer)

This is the baseline end-to-end flow for Web:

1. `packages/core`
- Defines platform-agnostic schema/types/contracts (`Schema`, component names, token taxonomy).
- It does not provide a design system instance by itself.

2. `packages/presets`
- Instantiates concrete design systems (for example Material) using `@kiskadee/core` contracts.
- Defines `schema.components.<component>.elements` and token mappings per preset.

3. `packages/web-builder`
- Converts preset schemas into web artifacts (CSS + JSON maps + metadata).
- Writes build output to `packages/web-builder/build/<designSystemKey>/...`.
- May split generated classes into dedicated artifact buckets when runtime/components need conditional opt-in behavior beyond the generic `s` scale bucket.
- May project optional `packages/brands` tonal assets through a preset-owned component formula and
  publish them outside the normal preset artifacts under `brand-packs/`.

4. `packages/web-builder` sync/generate steps
- `sync`: copies artifacts to `packages/showcase/public/build/<designSystemKey>/...`.
- `generate`: regenerates showcase registries based on manifests/artifacts.

5. Runtime consumers
- `packages/components` consumes generated class maps/CSS and composes headless behavior.
- Standalone `Text` resolves profile utilities from the active preset's global `t` bucket without
  requesting the descriptive typography artifact.
- `packages/fonts` optionally supplies online selected-family preparation.
- `packages/icons` provides canonical SVG assets plus generated adapters to platform consumers.
- `packages/showcase` consumes synced artifacts and renders routes/scenarios using those components.

6. Showcase routes
- Each component route (for example `/button`) validates real scenarios in UI.
- Route existence is part of component delivery, not only schema/build success.

Practical reading:

- `core -> presets -> web-builder` defines and compiles visual identity.
- `tonal-scale -> brands -> preset projector -> web-builder` defines optional third-party brand
  appearances without adding them to the preset's primitive or global color layers.
- `sync/generate -> showcase` exposes artifacts for inspection.
- `headless + components + showcase route` validates component usability end-to-end.

Artifact note:

- JSON artifact buckets are not only a transport optimization; they also express runtime intent.
- When a visual value must be applied conditionally by the component layer, it may need a dedicated bucket instead of being merged into the generic scale bucket.
- Example: Tabs tab fixed width uses `w` (width) as an opt-in artifact bucket instead of merging `boxWidth` into `s`.

## Structural CSS naming convention (components layer)

Structural CSS conventions are documented canonically in [STRUCTURAL-CSS.md](STRUCTURAL-CSS.md).

Short version:

- use `k-` as the framework namespace,
- use a 3-letter component id (`tab`, `btn`, etc.),
- use `k-<cmp>-e<n>` for schema-owned elements,
- keep shared element selectors such as `k-tab-e2` and `k-tab-e2a` only in common structural CSS,
- specialize variants with a suffix such as `k-tab-e2-a` or `k-tab-e2a-a`,
- use one-letter element-derived modifiers in alphabetical order,
- keep structural Sass limited to DOM/layout/geometry/browser concerns,
- require short structural comments above selectors because class names are intentionally compact,
- keep design-token values in schema/build artifacts/runtime classes.

## New component rollout (end-to-end)

Defining a new component under `schema.components` (for example `tabs` with `e1`, `e2`, etc.) is necessary, but not sufficient for full product delivery.

What schema-only gives you:

- web-builder can generate utility classes/class maps for the declared elements and tokens.
- artifacts become available for runtime consumption.

What still needs to be implemented for a complete feature:

- `packages/presets`: add component definitions per design system (starting with one preset is valid, but coverage gaps must be explicit).
- `packages/headless`: implement unstyled behavior and accessibility API.
- `packages/components`: implement visual React component that consumes class maps and composes the headless layer.
- `packages/web-builder` metadata: if showcase capability checks are needed (like Button state/scale support), publish component-specific manifest metadata.
- `packages/showcase`: add route/page and examples/documentation for the new component.

Practical rule:

- Build artifacts prove styling/token availability.
- Headless + components + showcase prove component availability for users.

## Relevant documentation

- [SCHEMA-BUILD-RUNTIME-RULES.md](SCHEMA-BUILD-RUNTIME-RULES.md)
  - Operational rules for deciding what belongs in schema, artifacts, runtime, and structural Sass.
  - Includes `components.<name>.options` vs `global` ownership and segment/theme/emphasis artifact mapping.

- [STRUCTURAL-CSS.md](STRUCTURAL-CSS.md)
  - Canonical naming, scope, and selector rules for structural Sass in `packages/components/react`.

- [CROSS-COMPONENT-RULES.md](CROSS-COMPONENT-RULES.md)
  - Durable rules shared across component families, such as focus language, activation feedback,
    and shadow philosophy.

- [packages/web-builder/README.md](packages/web-builder/README.md)
  - Web-only details (border/padding compensation, gradients, states).
  - Radius rules (modes vs effects) and segments.

- [packages/presets/docs/definitions/](packages/presets/docs/definitions/)
  - Preset package definitions, color philosophy, semantic layers, and adaptation rules.
  - Fidelity notes between Figma and Kiskadee.

- [packages/showcase/README.md](packages/showcase/README.md)
  - Build flow and showcase app structure.

- [packages/presets/src/presets/material-3-google/ds-ref/DS-REF.md](packages/presets/src/presets/material-3-google/ds-ref/DS-REF.md)
  - Material 3 references and decisions due to official inconsistencies.

- [packages/presets/src/presets/fluent-2-microsoft/README.md](packages/presets/src/presets/fluent-2-microsoft/README.md)
  - Notes about the official Fluent 2 adaptation.

- [packages/presets/src/presets/carbon-ibm/README.md](packages/presets/src/presets/carbon-ibm/README.md)
  - Notes about button borders in Carbon.

- [packages/presets/src/presets/fluent-2-kiskadee/README.md](packages/presets/src/presets/fluent-2-kiskadee/README.md)
  - Placeholder for preset notes (currently empty).

- [junie.md](junie.md)
  - Internal rules for editing and AI interaction.
