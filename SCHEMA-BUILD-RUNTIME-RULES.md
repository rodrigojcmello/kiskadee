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
- optional visual effects (`shadow`, `ripple`, stateful radius effects)

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

- `global.kiskadee.json` may expose `components.<name>.options.variant` as descriptive DS metadata.
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
- `TextField.standard` may expose named modes such as `outline`, `underline`, and `borderless`.
- `TextField.floating` may expose named modes such as `notched` and `inside`.
- Those named presentations should be described and evaluated as modes, not as extra top-level
  variants by default.

### 3.3 `global`

Use `global` only for cross-component defaults/shared system behavior.

Examples:

- `global.radius`
- `global.effects.ripple`
- global font stacks/focus tokens

Rule:

- If a value is shared by multiple components, use `global`.
- If a value is specific to one component, keep it in `components.<name>.options`.

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

Main outputs per design system:

- `core.kiskadee.css` / `core.kiskadee.json`
- `effects.kiskadee.css`
- `<segment>.<theme>.kiskadee.css` / `<segment>.<theme>.kiskadee.json`
- `global.kiskadee.json`
- `segments.json`, `manifest.json`, `schema.json`

### 5.0 Artifact responsibilities

Use each artifact for a different level of responsibility:

- `schema.json`: serializable reference snapshot of the authored schema structure, excluding the
  `colors` tree. This is the best artifact for inspection, tooling, debugging, and answering
  "what did this preset author actually declare?"
- `manifest.json`: compact discovery metadata. Use it to list design systems, segments, themes,
  fonts, and high-level component capabilities without loading the full schema.
- `global.kiskadee.json`: descriptive runtime-friendly defaults and DS intentions that are useful
  without traversing full component branches. Use it for global defaults such as fonts, radius,
  ripple, and recommended component options like a default variant.
- `segments.json`: segment registry materialized for tooling and UIs that need segment names and
  theme availability.
- `extra.<segment>.<theme>.kiskadee.json`: lightweight per-palette metadata that complements the
  class maps, such as resolved background information used by consumers like Showcase.

Rule:

- Do not treat `manifest.json` as a substitute for `schema.json`.
- Do not treat `global.kiskadee.json` as the structural source of truth for variant branches.
- Use `global.kiskadee.json` for convenience defaults; use `schema.json` when structural fidelity matters.

### 5.1 Segment and theme representation

In schema:

- segment/theme are keys under palettes.

In artifacts:

- segment + theme are primarily encoded in file name (`default.light.kiskadee.css`, `dynamic.dark.kiskadee.json`).
- `segments.json` keeps explicit segment metadata for tooling.

### 5.2 Emphasis representation

In palette JSON maps, emphasis is encoded in color buckets:

- `h` (high)
- `m` (medium)
- `l` (low)
- `ll` (lowest)

Runtime picks one of these buckets from component emphasis.

### 5.3 Default public component baseline

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

Runtime should not:

- generate new DS color decisions on the fly;
- replace schema-defined token values with arbitrary runtime constants (except explicit behavior options);
- move theme/segment/emphasis logic out of artifacts.

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
