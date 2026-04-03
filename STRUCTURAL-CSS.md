# Structural CSS in Kiskadee

## What structural CSS is

Structural CSS is the layer in `packages/components/react` that defines:

- DOM composition,
- layout and flow,
- stacking and clipping,
- structural geometry,
- browser and engine-specific rendering workarounds.

It connects:

- headless behavior,
- generated schema classes and CSS variables,
- the final DOM shape required by the visual component.

Structural CSS is not the source of truth for design tokens.

## What structural CSS may control

Structural CSS may define:

- display, flex/grid flow, alignment, and gap relationships,
- positioning, z-index, overflow, and clip-path geometry,
- structural wrappers required by a component type,
- structural motion plumbing,
- platform-specific rendering fixes guarded by runtime classes,
- geometry that consumes generated CSS variables such as `--k-br`.

## What structural CSS must not own

Structural CSS must not become the source of truth for:

- semantic colors,
- tokenized spacing values,
- tokenized radius values,
- tokenized shadow values,
- intent/emphasis styling,
- visual state styling that already exists in generated artifacts.

Practical rule:

- structural CSS may consume schema-generated values,
- structural CSS must not redefine schema-owned values as hardcoded design tokens.

## Core naming goals

Structural classes must be:

- short,
- predictable,
- component-scoped,
- variant-safe,
- cheap to select,
- commentable.

The system intentionally favors compact naming over mnemonic naming.

## Canonical naming grammar

### 1. Namespace

Always start with `k-`.

Examples:

- `k-tab`
- `k-btn`

### 2. Component id

Use a 3-letter component id immediately after `k-`.

Examples:

- `tab` for Tabs
- `btn` for Button

### 3. Component root

Use:

```txt
k-<cmp>
```

Example:

- `k-tab`

This is the root structural scope for the component family.

### 4. Shared schema element

Use:

```txt
k-<cmp>-e<n>
```

Examples:

- `k-tab-e1`
- `k-tab-e2`
- `k-tab-e3`

Use this for nodes that directly represent schema elements in shared structural CSS.

Important:

- `k-<cmp>-e<n>` is the shared base element shape,
- it exists for common structural files such as `Tabs.common.scss`,
- it must stay genuinely shared across all variants for that component.

### 5. Shared element-derived modifier or helper

Use:

```txt
k-<cmp>-e<n><a-z>
```

Examples:

- `k-tab-e2a`
- `k-tab-e5b`

Use this only when the modifier or helper is truly shared across all variants of the component.

Rules:

- use one letter only,
- assign letters in local alphabetical order,
- keep this shape restricted to common structural CSS,
- if the selector is not truly shared, it must be specialized by variant.

### 6. Variant letter registry

Variant letters are intentionally compact and local to each component family.

Example:

```txt
Tabs
    a = bridge
    b = box
    c = dot
    d = line
    e = segmented
```

Rules:

- letters are assigned in local alphabetical order for that component,
- letters are component-local, not global across the framework,
- the registry must be documented near the component structural CSS or in component-local
  documentation,
- new variants append in alphabetical order.

### 7. Variant-specialized element

Use:

```txt
k-<cmp>-e<n>-<variant>
```

Example:

- `k-tab-e2-a`

Use this when a shared schema element needs a selector that is safely restricted to one variant.

This is the preferred base for variant-owned structural rules.

This shape is preferred over root-level variant scoping such as:

- `.k-tab-a .k-tab-e2`

because it keeps the selector flatter and makes the element ownership explicit.

### 8. Variant-specialized element modifier or helper

Use:

```txt
k-<cmp>-e<n><a-z>-<variant>
```

Examples:

- `k-tab-e2a-a`
- `k-tab-e2a-b`

This is the preferred pattern when:

- a helper belongs to one schema element,
- and it should only exist for one variant,
- or a structural modifier must not leak across variants.

This pattern is preferred over deeper selectors such as:

- `.k-tab-a .k-tab-e2a`

because it reduces selector depth and prevents style leakage across variants.

### 9. Shared helper without a clear element owner

Use:

```txt
k-<cmp>-h<a-z>
```

Example:

- `k-tab-ha`

Use this only when a structural helper:

- is stable,
- is shared,
- and cannot be cleanly owned by one schema element.

This should be rare.

Do not use semantic helper names such as:

- `k-tab-shell`
- `k-tab-list`
- `k-tab-panel`

Important:

- shared helpers must stay truly shared across all variants,
- if a helper has variant-specific behavior or geometry, it must be specialized by variant.

### 10. Variant-specialized shared helper

Use:

```txt
k-<cmp>-h<a-z>-<variant>
```

Example:

- `k-tab-ha-a`

Use this only when:

- the helper has no clear schema-element owner,
- and it still needs to be isolated to one variant.

## Selector scoping rules

Prefer selectors that:

- are scoped by component,
- are scoped by variant only when needed,
- and are no deeper than necessary.

Good:

- `.k-tab-e2-a`
- `.k-tab-e2a-a`
- `.k-tab-ha-a`

Avoid:

- selectors that repeat the full DOM path,
- selectors that depend on semantic helper names,
- selectors that rely on broad unscoped shared element modifiers when a variant-specific class is
  available,
- root-level variant scoping when a suffix form can express the same ownership.

Bad:

- `.k-tab-a .k-tab-e2`
- `.k-tab-a .k-tab-e2a`
- `.k-tab.k-tab-a > .k-tab-ha > .k-tab-e2a > .k-tab-e2`

Practical rule:

- prefer the smallest selector that still protects the component and variant boundary.

## Structural comments

Because the naming system is intentionally compact, comments are mandatory for structural selectors.

Each selector block in structural Sass should have one short English comment immediately above it.

Format:

```scss
/* `k-tab-e2a-a`: bridge trigger wrapper for overlap and shadow projection. */
.k-tab-e2a-a {
  ...
}
```

Rules:

- keep comments structural, not visual,
- explain role, not token values,
- keep them short,
- use the exact class name inside backticks,
- add comments for helper selectors and variant-specific selectors,
- shared selectors may use one comment for a small grouped block when the role is truly identical.

## Structural CSS and runtime platform flags

Structural Sass may consume global runtime flags for browser-specific workarounds.

Current canonical runtime flags are:

- `k-os-*`
- `k-engine-*`

Example:

- `.k-os-macos.k-engine-blink .k-tab-e2-a`

Use these only for rendering quirks and platform fixes.

Do not use them as a general-purpose styling system.

## Structural CSS and generated artifacts

Structural CSS may consume:

- generated utility classes,
- generated effect classes,
- generated CSS variables,
- shared runtime state classes.

Examples:

- use `var(--k-br)` to drive `clip-path`,
- use generated shadow variables in `filter: drop-shadow(...)`,
- use runtime platform classes for engine-specific fixes.

Structural CSS should not duplicate the visual values behind those artifacts.

Important:

- when a canonical emitted variable already exists, structural CSS must consume that variable directly,
- structural CSS must not create local alias variables for emitted schema values just to rename or relay them,
- prefer direct overrides such as `padding-left: 0` or `padding-right: calc(var(--k-pr) + var(--k-br))`
  over ad hoc aliases like `--k-foo-left`,
- create new local CSS variables only when they represent genuinely local structural state that cannot be
  expressed directly and is reused enough to justify the indirection.

## Runtime structural variables

Structural CSS may also consume variables injected by runtime logic when those variables represent
local structural state rather than schema-owned tokens.

Example:

- `--k-tab-z`

Use this pattern when:

- the value is produced by runtime logic,
- the value is local to one component instance or subtree,
- the value controls structural behavior such as stacking, geometry, or measurement,
- and there is no schema-owned emitted variable that already represents the same concept.

Important:

- runtime structural variables are different from emitted schema variables,
- emitted schema variables come from style emission and are the canonical source for token values,
- runtime structural variables exist only to connect render-time state to structural CSS.

Naming rule:

- runtime structural variables should stay component-scoped,
- prefer the form `--k-<cmp>-<purpose>`,
- keep the purpose short and structural.

Examples:

- `--k-tab-z`
- `--k-tab-x`
- `--k-tab-w`

Do not use runtime structural variables to relay schema tokens that already exist as emitted variables.

## Shared vs variant-specific structure

For a component family such as Tabs:

- shared structure stays in shared files,
- variant-specific structure stays in variant files,
- variant letters define the boundary between those layers.

Practical rule:

- if the rule applies to every variant, keep it shared,
- if the rule exists because one variant has unique geometry or DOM needs, keep it variant-specific.

## Normative direction

This document defines the desired naming standard.

If existing structural classes do not follow this grammar, the correct long-term direction is to
refactor them to the standard instead of preserving ad hoc naming.
