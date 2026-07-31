# Schema, Build Artifacts, and Runtime Rules

This document defines practical ownership rules that already exist in Kiskadee architecture, but were not explicit enough.

## 1) Architectural intent

Kiskadee optimizes for two goals at the same time:

- flexibility: design systems can change by segment, theme, semantic intent, emphasis, and state;
- performance: most visual work is precompiled into CSS/JSON artifacts, leaving runtime focused on composition and behavior.

## 2) Canonical data flow (Web)

1. `schema` (core contracts + preset instances) defines visual semantics.
2. `web-builder` compiles schema into artifacts.
3. artifacts are consumed by runtime/components/showcase.
4. runtime maps current props/state to already-generated classes.

Practical chain:

- `packages/core` -> contracts
- `packages/presets` -> DS-specific schema values
- `packages/web-builder` -> `*.css` + `*.json`
- `packages/components` + `packages/showcase` -> consume artifacts

## 3) What belongs in schema

### 3.0 Architectural rule records

Use this document for durable structural rules that should outlive a single implementation.

Rule records should include:

- context: where the rule applies;
- decision: the invariant;
- reason: why the invariant exists;
- consequence: what code/build/runtime should do because of it.

### 3.1 Schema elements

Use schema `elements` for tokenizable visual values that may vary by design system and/or context.
The exact location is defined by each component topology: some components use top-level
`components.<name>.elements`, while variant-driven components use
`components.<name>.variants.<variantName>.elements`, and when a variant has named modes,
`components.<name>.variants.<variantName>.modes.<modeName>.elements`.

Examples:

- color palettes (`boxColor`, `textColor`, `borderColor`)
- scalable dimensions (`padding`, `textSize`, `boxHeight`, `borderWidth`)
- static decorations (`borderStyle`, `textWeight`)
- optional visual effects (`shadow`, `activationFeedback`, stateful radius effects)

Rule:

- If it can vary by segment/theme/intent/emphasis/state, it belongs in schema elements.

### 3.1.1 Component topology: `elements` vs `variants`

Context:

- Some components have one stable visual topology, while others are variant-driven families whose
  variants have different structural needs.
- `button` has one stable topology.
- `tabs` is a variant-driven family (`line`, `box`, `segmented`, `dot`, `bridge`).
- `textField` is a variant-driven family (`standard`, `floating`).

Decision:

- Component topology is fixed per component contract.
- `components.button` must declare top-level `elements`.
- `components.tabs` must declare `variants`; top-level `elements` is not valid.
- `components.textField` must declare `variants`; top-level `elements` is not valid.
- Variant-driven components put tokenizable visual values under
  `components.<name>.variants.<variantName>.elements`, or under
  `components.<name>.variants.<variantName>.modes.<modeName>.elements` when that variant exposes
  named modes.
- Top-level `options` may still exist on a variant-driven component as shared runtime defaults, but
  top-level `elements` must not be used as shared/base styling.

Reason:

- There is no implicit inheritance or merge between top-level `elements` and variant-owned element
  branches such as `variants.<name>.elements` or `variants.<name>.modes.<mode>.elements`.
- Keeping the two shapes mutually exclusive avoids silent build ambiguity, where shared-looking
  top-level element values could be interpreted as base defaults by one layer and ignored by
- Variant structures are not interchangeable. For example, Tabs `line` and `box`, or TextField
  `standard` and `floating`, need independent element contracts and runtime class-map branches.

Consequence:

- The core contracts reject top-level `components.tabs.elements` and
  `components.textField.elements`.
- Web artifacts use a direct element map for Button and variant-indexed maps for Tabs/TextField.
- Tabs/TextField runtime should resolve classes only from the active variant branch.
- If shared values across variants become necessary, model them explicitly in preset factories or
  introduce a dedicated contract before relying on implicit schema inheritance.

### 3.1.2 Element `name`

Context:

- Schema element keys such as `e1`, `e2`, and `e3` are stable technical slot identifiers.
- Those short keys are intentionally compact for artifacts and runtime APIs, but they are hard to
  read when authoring preset schemas by hand.

Decision:

- Every declared schema element must include a human-readable `name`.
- Put `name` as the first property inside the element object.
- Keep the technical key stable even when the readable name explains the layer.
- Use short, component-local names such as `track`, `thumb`, `label`, `control`, or
  `button-text`.

Reason:

- The schema should remain readable without requiring comments beside every `e<n>` key.
- Comments drift away from the validated contract; `name` stays in the schema object and is checked
  by the component contract.
- The readable name is metadata for humans and tooling. It must not be used to replace the stable
  `e<n>` key in generated class maps or runtime state projection APIs.

Consequence:

- Component element contracts require `name` whenever an element object is declared.
- A non-visual but meaningful schema element should still be represented as `name` only.
- Web-builder style generation continues to use the `e<n>` key as the artifact identity.

### 3.1.3 Activation feedback ownership

Context:

- Activation feedback is shared across components, but each component may need a different default
  profile, origin, paint, layer, tone mapping, or profile size.
- For example, Button commonly uses `ripple` with pointer origin, while Switch commonly uses `halo`
  with center origin.

Decision:

- `global.effects.activationFeedback` defines the shared library: reusable profiles, motion defaults,
  and theme token buckets.
- `components.<name>.effects.activationFeedback` defines the component's default recipe.
- `effects.activationFeedback: true` on an element is compatibility-only and should not be used by
  new presets.
- `profiles` merge deeply by profile, so a component can override only `profiles.halo.size` without
  replacing other global profiles.
- Feedback tone (`subtle` or `vivid`) is selected through `visual.tone`, optionally by component
  emphasis. Component structural Sass must not hardcode semantic feedback colors or opacities.

Reason:

- Runtime components should execute resolved effect configuration instead of hardcoding component
  assumptions such as "Switch low means vivid" or "Switch always uses halo".

Consequence:

- Web-builder resolves activation feedback as `global -> component -> element compatibility`.
- Runtime adapters provide host refs and event/cancel behavior; schema decides profile, origin,
  paint, layer, size, and tone.

### 3.1.4 TextField width ownership

Context:

- TextField is an editable form control whose useful width depends on the surrounding form,
  expected value, grid, breakpoint, and consumer layout.
- Unlike Button, TextField content is often empty at rest, so its own label or value is not a
  reliable sizing source.
- The React TextField structural CSS already makes root, control, and input fill the available
  inline size of the parent container.

Decision:

- TextField width is owned by the parent layout container.
- TextField root elements must not declare `scales.boxWidth`.
- Do not add a TextField-specific runtime width mode unless there is concrete product evidence that
  container-owned sizing is insufficient.

Reason:

- A schema-emitted root width is always-on once generated and conflicts with the structural contract
  that TextField fills its container.
- A minimum or preferred width cannot be safely inferred by the component because field semantics
  such as email, zip code, address, search, and URL have different expected widths.
- Keeping width in the parent preserves responsive layout control without expanding the TextField
  runtime API.

Consequence:

- Presets should size TextFields by composing them inside form/grid wrappers, not by emitting
  `boxWidth` on TextField `e1`.
- Web artifacts should not include TextField root width classes.
- Showcase examples that need bounded fields must constrain their example blocks or wrappers.

### 3.1.5 Surface context ownership

Context:

- A component can appear on the theme's ordinary surface or on a locally strong surface such as a
  brand fill, without changing the global Light, Dark, or Darker theme.
- Emphasis describes the component's prominence. It must not be overloaded to mean that the same
  component is rendered over a different surrounding surface.

Decision:

- Component palettes include the orthogonal `surfaceContext` axis with `onSubtle` and `onVivid`.
- The canonical palette path is
  `segment -> theme -> surfaceContext -> color property -> intent -> emphasis -> state`.
- `onSubtle` is required for every declared segment/theme palette. `onVivid` is optional, but when
  present it must cover the same color-property, intent, and emphasis pairs as `onSubtle`.
- `onVivid` is selected explicitly by the visual component. It is not inferred from theme,
  background color, contrast, DOM ancestry, or runtime color measurement.
- `on-primary` and similar design-system terms are documented source relationships that map to
  `onVivid`; they are not additional Kiskadee intents, themes, or emphasis levels.

Reason:

- `onSubtle` and `onVivid` components must coexist in the same page and even in the same local region.
- Keeping the axis independent preserves the meaning of intent and emphasis while allowing every
  supported appearance to adapt to a strong surrounding surface.
- Precompiling both contexts keeps platform artifacts deterministic and avoids runtime color logic.

Consequence:

- Web artifacts keep one file per segment/theme and publish separate compact color buckets for
  `onSubtle` and `onVivid` inside that file.
- Omitted `surfaceContext` resolves to `onSubtle`. An explicitly requested unsupported `onVivid`
  context must not silently fall back to `onSubtle`.
- Theme and surface-context controls remain independent in inspection tools and consumer APIs.
- Provider inheritance or automatic surface detection requires a separate future contract.

### 3.1.6 External brand intent ownership

Context:

- Third-party brand colors are useful for narrow actions such as authentication or social sharing,
  but they are not part of a design system's primitive, semantic, or component color layers.
- A branded Button still needs the preset's emphasis, state, theme, and surface-context grammar.

Decision:

- Preset schemas author only their closed set of system intents.
- External Button intents use the qualified namespace `brand.<id>` and are projected at build time
  from portable brand tonal assets.
- Public Button consumers may select either a system intent or `brand.<id>`, while preset schema
  contracts continue to reject external intents.
- Qualified role parsing preserves the complete brand ID in `button.brand.<id>`. A final role
  segment is interpreted as paint only when it is exactly `solid` or `gradient`.
- A brand ID replaces only the color-family input. It does not introduce `kind`, `action`,
  `variant`, or `filled` axes and does not replace emphasis or surface context.
- The preset owns the component projection formula. The brand package owns seed identity,
  provenance, content polarity, functional references, and pack membership.
- Brand tonal assets never enter preset `colors.json`, the three color layers, or normal palette
  CSS.

Reason:

- Keeping brand identity external prevents every preset from duplicating the same third-party
  colors and avoids loading rarely used brands throughout an application.
- Reusing the preset formula preserves component behavior while keeping the official brand seed
  independent from the preset Primary color.
- A closed preset-authoring intent set prevents external resources from silently becoming part of
  the canonical design-system contract.

Consequence:

- `@kiskadee/tonal-scale/standalone` generates one portable Light/Dark family per official seed.
- `@kiskadee/brands` publishes definitions, packs, and standalone tonal assets.
- A preset projector converts those assets into `brand.*` component palettes without mutating the
  preset schema.
- A preset module declares that optional build capability through `buildExtensions.brandPacks`.
  Generic builders discover the declaration from the already-loaded preset module; they must not
  identify presets by metadata or import a concrete preset projector.
- The Web Builder emits optional pack artifacts, and consumers load them only through an explicit
  resource boundary.
- Missing packs, unsupported components, and branded intents outside a compatible boundary must
  fail visibly; they never fall back to a system intent.

### 3.2 `components.<name>.options`

Use `options` for component-specific behavior/structure defaults that are not a DS color/scale token.

Examples:

- `tabs.options.indicatorPosition`
- `tabs.options.indicatorShape`

Rule:

- `options` values should map to structural behavior/classes at runtime (usually structural Sass selectors + small runtime branching).
- `options` are defaults; component props may override when that override is intentionally supported.

### 3.2.1 Variant defaults vs variant-local options

Context:

- Variant-driven components may expose a recommended default variant for DS consumers.
- Variant-specific options may still exist for rules that only apply inside one variant branch.

Decision:

- `components.<name>.options.variant` is the place for the design system's recommended default variant.
- `components.<name>.variants.<variantName>.options` must not repeat the `variant` name.
- Inside a variant branch, the variant key itself is the source of truth for that branch identity.

Reason:

- Repeating `variant: "standard"` inside `variants.standard`, or `variant: "bridge"` inside
  `variants.bridge`, adds no new information and creates noisy artifacts.
- Keeping the default variant only at the component root makes it easier for tooling and
  convenience consumers to answer "which variant does this DS recommend?" from one place.

Consequence:

- Component metadata artifacts may expose `components.<name>.options.variant`-equivalent data as
  descriptive DS metadata.
- Variant-local `options` should contain only additional settings that are meaningful within that
  branch (for example Tabs `indicatorShape`, `separator`, `lowerCurve`).
- TextField now uses variant-local `options.mode` as the default named presentation for a given
  variant branch (for example `standard -> outline`, `floating -> notched`).

### 3.2.2 `variant` vs `mode`

Context:

- As the system grows, some components need two levels of named presentation decisions:
  a primary public family and a secondary named style inside that family.
- `TextField` is the current reference case:
  - primary families: `standard`, `floating`
  - secondary standard presentations: `outline`, `underline`, `borderless`
  - secondary floating presentations: `notched`, `inside`
- Future components may face the same pattern, where the second level is too important to be left
  unnamed, but too small to justify promoting every choice into a top-level variant.

Decision:

- Use `variant` for the primary public family of a component.
- Use `mode` for the secondary named presentation inside a variant.
- Do not use `sub-variant` as the canonical term in docs or APIs.
- A mode may be implemented by structural Sass, by small local runtime branching, or by both.
- A mode does not need to become a top-level variant only because its implementation uses slightly
  different structure or positioning rules.

Reason:

- The main distinction is conceptual, not whether the DOM or CSS changes a little.
- Promoting every small presentation difference into a top-level variant creates a noisy API and
  weakens the meaning of `variant`.
- Hiding every meaningful secondary presentation as an unnamed internal trick makes the system hard
  to reason about and hard to scale across dozens of components.
- `mode` gives the system a stable second-level term for named, documented presentations without
  forcing premature schema explosion.
- This is acceptable as long as the complexity stays local, small, and readable inside the
  component/runtime/structural Sass that owns the mode.

Rule:

- A choice should be a `variant` when it defines the primary public family or mental model of the
  component.
- A choice should be a `mode` when it is a named presentation inside a variant and we want it to
  be stable, documented, and reusable.
- A choice should remain implicit styling freedom when naming it would add more ceremony than
  clarity.
- Do not create a new top-level variant only to encode a tiny positional difference that the local
  component can absorb cleanly.
- If supporting a mode would require special-case build extraction, hidden schema semantics, or
  hard-to-follow runtime branching, re-evaluate whether that mode should instead become more
  explicit in the contract.

Consequence:

- Components may have a small amount of mode-specific structural Sass or runtime logic without that
  automatically implying a new top-level variant.
- When evaluating future components, the first question is not "did the structure change?" but
  "is this a primary family (`variant`), a named secondary presentation (`mode`), or just styling
  freedom?".
- `TextField` remains modeled as two real variants (`standard`, `floating`).

### 3.2.3 Canonical Card surface catalogs

Context:

- A preset may expose several Card surfaces, but not every valid Card intent/emphasis pair is a
  recommended surrounding surface.
- Consumers need the preset-authored order and need to know which surface context descendant
  components should use without inferring it from color or luminance.

Decision:

- `components.card.options.canonicalSurfaces[segment][theme]` declares an ordered list of
  `{ intent, emphasis, contentSurfaceContext }` references.
- The referenced visual value remains in
  `components.card.elements.e1.palettes[segment][theme].onSubtle.boxColor`.
- `contentSurfaceContext` describes the context recommended for descendants placed on that Card.
  It does not change the Card's own palette context.
- The Web Builder validates every reference, resolves its `rest` color, and publishes
  `components/card.kiskadee.json`.
- Artifact consumers must preserve the authored order and must not reconstruct the list from
  palette density, luminance, or hardcoded intent/emphasis roles.

Reason:

- The schema remains the preset-owned source of truth while colors remain in the palette taxonomy.
- The generated artifact gives platform consumers a deterministic, already-resolved catalog.
- Explicit descendant context avoids turning strong Brand surfaces into a runtime contrast
  heuristic.

Consequence:

- Presets without `canonicalSurfaces` publish no Card metadata artifact and remain valid.
- A declared reference that lacks a solid `boxColor.<intent>.<emphasis>.rest` fails the build.
- Background-selection tools may offer arbitrary diagnostic colors separately, but those colors
  are not part of the canonical Card contract.
- `TextField.standard` may expose named modes such as `outline`, `underline`, and `borderless`.
- `TextField.floating` may expose named modes such as `notched` and `inside`.
- Those named presentations should be described and evaluated as modes, not as extra top-level
  variants by default.

### 3.3 `global`

Use `global` only for cross-component defaults/shared system behavior.

Examples:

- `global.radius`
- `global.effects.activationFeedback`
- global font stacks/focus tokens

Rule:

- If a value is shared by multiple components, use `global`.
- If a value is specific to one component, keep it in `components.<name>.options` or
  `components.<name>.effects`, depending on whether it is behavior/structure or an effect recipe.

## 4) What belongs in structural Sass

Structural Sass is for layout/positioning/interaction structure, not theming.

Allowed in structural Sass:

- `display`, `position`, `flow`, `z-index`, geometry mechanics
- non-theme structural variants (`-t`, `-b`, `-q`, `-r`, `-c`)
- behavior-oriented transitions

Not allowed in structural Sass:

- DS semantic colors
- theme/segment-dependent values
- emphasis-dependent values

Rule:

- Visual identity must come from generated artifacts, not hardcoded Sass.

## 5) Build artifact model

Artifacts are precompiled by `@kiskadee/web-builder`.

### 5.0 Canonical tonal color ownership

Kiskadee uses one continuous primitive tonal scale. Its public positions are `KISKADEE_TONES`,
and every declared theme contains every position in that grid.

Ownership is intentionally split across packages:

- `@kiskadee/core` owns the grid, HEX/CSS scale types, normalization, validation, and exact tone
  lookup;
- `@kiskadee/tonal-scale` owns the color-generation algorithm and its visual invariants;
- `@kiskadee/presets` owns concrete static or dynamic scale instances;
- `@kiskadee/web-builder` validates, normalizes, deduplicates, and compiles authored values without
  generating or repairing a scale;
- `@kiskadee/runtime` invokes the same tonal generator for dynamic segments and publishes complete
  Light and Dark CSS-variable scales.

Static primitive values are stored as lowercase six- or eight-digit HEX. Dynamic primitive values
are CSS color references such as `var(--k-p-light-24)`. Tone lookup is exact: unsupported positions
are authoring errors and must never be rounded or snapped.

The former primitive `subtle` and `vivid` tracks no longer exist. Those words may still describe
activation-feedback profiles; that effect vocabulary is unrelated to primitive tonal storage.

Main outputs per design system:

- `core.kiskadee.css` / `core.kiskadee.json`
- `effects.kiskadee.css`
- `<segment>.<theme>.kiskadee.css` / `<segment>.<theme>.kiskadee.json`
- `global.kiskadee.json`
- `components/<component>.kiskadee.json`
- `class-maps/core/<component>.kiskadee.json`
- `class-maps/<segment>.<theme>/<component>.kiskadee.json`
- `segments.json`, `manifest.json`, `schema.json`

Optional brand-pack outputs are deliberately separate:

- `brand-packs/<pack>/manifest.json`
- `brand-packs/<pack>/<segment>.<theme>.<hash>.kiskadee.css`
- `brand-packs/<pack>/class-maps/<segment>.<theme>/<component>.<hash>.kiskadee.json`

They are not referenced by normal preset `colors.json`, global CSS, or class maps.

### 5.1 Artifact responsibilities

Use each artifact for a different level of responsibility:

- `schema.json`: serializable reference snapshot of the authored schema structure, excluding the
  `colors` tree. This is the best artifact for inspection, tooling, debugging, and answering
  "what did this preset author actually declare?"
- `manifest.json`: compact discovery metadata. Use it to list design systems, segments, themes,
  fonts, and high-level component capabilities without loading the full schema.
- `global.kiskadee.json`: descriptive runtime-friendly defaults and DS intentions that are useful
  without traversing full component branches. Use it for global defaults such as fonts, radius,
  and activation feedback. Component-specific semantic metadata should move toward component artifacts such as
  `components/switch.kiskadee.json`, `components/tabs.kiskadee.json`, and
  `components/text-field.kiskadee.json`; new artifacts should not add component semantic payloads
  under `global.components.<name>`.
- `class-maps/core/<component>.kiskadee.json` and
  `class-maps/<segment>.<theme>/<component>.kiskadee.json`: component-scoped class resolution
  artifacts. They mirror the component branch from the aggregate class-map files so runtime hooks
  can load only the class data they need.
- `segments.json`: segment registry materialized for tooling and UIs that need segment names and
  theme availability.
- `extra.<segment>.<theme>.kiskadee.json`: lightweight per-palette metadata that complements the
  class maps, such as resolved background information used by consumers like Showcase.
- `core.kiskadee.css`, `<segment>.<theme>.kiskadee.css`, `effects.kiskadee.css`, and token CSS:
  shared utility-style CSS bundles. Keep these aggregated unless measurements prove a component CSS
  split beats the current class reuse/dedupe model.

Rule:

- Do not treat `manifest.json` as a substitute for `schema.json`.
- Do not treat `global.kiskadee.json` as the structural source of truth for variant branches.
- Do not treat `core.kiskadee.json` as semantic capability metadata for UI controls; it remains the
  aggregate generated class map used by legacy/runtime fallback class resolution.
- Do not put semantic component defaults into component class-map artifacts. Class maps carry class
  names only; use component metadata artifacts for options, effects, and variant defaults.
- Do not split generated CSS by component as a default next step. The generated CSS is intentionally
  utility-like and reusable across components, while structural CSS belongs to component packages.
- Runtime components and Showcase controls must use the same component semantic metadata when
  deciding whether a component effect exists.
- Use `global.kiskadee.json` for convenience defaults; use `schema.json` when structural fidelity matters.
- Omit unsupported component effects from component metadata artifacts; do not emit explicit `false`
  values for absent effects.

### 5.2 Segment and theme representation

In schema:

- segment/theme are keys under palettes.

In artifacts:

- segment + theme are primarily encoded in file name (`default.light.kiskadee.css`, `dynamic.dark.kiskadee.json`).
- `segments.json` keeps explicit segment metadata for tooling.

### 5.2.1 Surface context representation

In schema:

- `onSubtle` and optional `onVivid` are keys below each declared segment/theme palette.

In web class-map artifacts:

- both contexts remain in the same segment/theme file so instances can coexist;
- `c.s` stores `onSubtle` semantic color classes;
- `c.v` stores `onVivid` semantic color classes when the preset authors them.

Runtime selects one precompiled bucket. It does not calculate contrast or synthesize a missing
context.

### 5.2.2 Optional brand-pack representation

Brand packs use one CSS file per pack, segment, and theme. Their class maps remain component-scoped.
The pack manifest binds exact `brand.*` intents, components, hashes, and resource paths.

The pack namespace includes the design system, pack, and projection hash so its classes cannot
collide with normal preset artifacts or another pack. A page without an explicit brand-pack
boundary must not request these resources.

The boundary loads CSS and the requested component class map before revealing its children. Its
cache key includes design system, pack, segment, theme, and requested components. Switching
segment or theme therefore loads the target palette before the visual change, while identical
requests reuse the same resource promise.

### 5.3 Emphasis representation

In palette JSON maps, emphasis is encoded in color buckets:

- `h` (high)
- `m` (medium)
- `l` (low)
- `ll` (lowest)

Runtime picks one of these buckets from component emphasis.

### 5.4 Default public component baseline

Public components should expose a canonical baseline whenever the design system supports it:

- default intent: `neutral`
- default emphasis: `medium`

Practical authoring rules:

- If a component has only one emphasis in a preset, that emphasis should be `medium`.
- Add `high` only when there is a genuinely stronger visual presentation of the same semantic family.
- Treat `low` and `lowest` as optional expansions, not mandatory completeness buckets.
- Runtime fallback logic may still exist for resilience, but fallback behavior does not define the architectural contract.

This keeps `neutral.medium` as the default mental model when a component is instantiated without explicit semantic or emphasis overrides.

## 6) Runtime responsibilities

Runtime should compose, not invent design.

Runtime responsibilities:

- read generated class maps;
- resolve classes by `element + intent + emphasis + scale + state`;
- apply control state classes (`selected`, `disabled`, forced interaction states, etc.);
- apply structural option classes from `components.<name>.options` defaults (or allowed props override);
- connect headless behavior/accessibility to visual layer.
- load optional precompiled resources at an explicit feature boundary when the application asks for
  them.

Runtime should not:

- generate new DS color decisions on the fly;
- replace schema-defined token values with arbitrary runtime constants (except explicit behavior options);
- move theme/segment/emphasis logic out of artifacts.
- infer or automatically request a brand pack from the first `brand.*` component instance;
- fall back from a missing `brand.*` class to Primary, Neutral, or any other system intent.

## 7) Decision matrix (quick rule)

Use this before implementing any new value:

1. Does it vary by segment/theme/intent/emphasis/state?
- Yes -> the component's canonical elements location (`components.button.elements` or
  `components.<name>.variants.<variantName>.elements` for variant-driven components, or
  `components.<name>.variants.<variantName>.modes.<modeName>.elements` when the active variant is
  mode-driven).
- No -> continue.

2. Is it shared by multiple components?
- Yes -> `global`.
- No -> continue.

3. Is it component-specific structural behavior/default?
- Yes -> `components.<name>.options` + structural Sass/runtime mapping.
- No -> continue.

4. Is it only layout mechanics with no DS identity?
- Yes -> structural Sass.

## 8) Tabs indicator example (applied)

- Theme color/height -> schema element `tabs.e5` (artifact-driven).
- Shape variant (`square`, `rounded`, `roundedClip`) -> `tabs.options.indicatorShape`.
- Position (`top`/`bottom`) -> `tabs.options.indicatorPosition`.
- Concrete selector behavior -> structural Sass (`k-tab-e5-*`) + runtime class composition.

This split keeps the component flexible while preserving build-time optimization.
