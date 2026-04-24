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

### 3.1 `components.<name>.elements`

Use `elements` for tokenizable visual values that may vary by design system and/or context.

Examples:

- color palettes (`boxColor`, `textColor`, `borderColor`)
- scalable dimensions (`padding`, `textSize`, `boxHeight`, `borderWidth`)
- static decorations (`borderStyle`, `textWeight`)
- optional visual effects (`shadow`, `ripple`, stateful radius effects)

Rule:

- If it can vary by segment/theme/intent/emphasis/state, it belongs in schema elements.

### 3.1.1 Tabs component topology

Context:

- `components.tabs` can model a single visual topology or a variant-driven family such as
  `line`, `box`, `segmented`, `dot`, and `bridge`.
- The Material 3 Google preset is the current source of truth for full Tabs coverage and uses
  `variants`.

Decision:

- A Tabs schema must declare either top-level `elements` or `variants`, but not both.
- `variants.<name>.elements` is the preferred shape for variant-driven Tabs.
- Top-level `elements` remains valid only for a non-variant Tabs definition.

Reason:

- There is no implicit inheritance or merge between top-level `elements` and
  `variants.<name>.elements`.
- Keeping the two shapes mutually exclusive avoids silent build ambiguity, where shared-looking
  top-level element values could be interpreted as base defaults by one layer and ignored by
  another.

Consequence:

- The core Tabs contract rejects `elements + variants`.
- The web builder may continue treating those shapes as separate artifact topologies.
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
- Yes -> `components.<name>.elements`.
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
