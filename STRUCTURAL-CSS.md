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
- geometry that consumes generated CSS variables such as `--k-bdr`.

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
- it may be styled in a shared structural file or repeated across variant-local files,
- it must stay genuinely shared across all variants for that component.

### 5. Shared element-derived modifier or derived node

Use:

```txt
k-<cmp>-e<n><a-z>
```

Examples:

- `k-tab-e2a`
- `k-tab-e5b`

Use this when the structural node clearly belongs to one schema element.

This includes:

- actual modifiers of that element,
- derived wrappers around that element,
- derived inner layers owned by that element.

Example:

- if a wrapper exists only to support the `tab` element, prefer `e2a`, `e2b`, and so on
- do not create a generic helper for a node that can be clearly owned by `e2`

Rules:

- use one letter only,
- assign letters in local alphabetical order,
- keep this shape restricted to common structural CSS,
- prefer this shape over helper syntax whenever the owner element is obvious,
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

### 8. Variant-specialized element modifier or derived node

Use:

```txt
k-<cmp>-e<n><a-z>-<variant>
```

Examples:

- `k-tab-e2a-a`
- `k-tab-e2a-b`

This is the preferred pattern when:

- a structural node belongs to one schema element,
- and it should only exist for one variant,
- or a structural modifier must not leak across variants.

This pattern is preferred over deeper selectors such as:

- `.k-tab-a .k-tab-e2a`

because it reduces selector depth and prevents style leakage across variants.

### 9. Shared helper without a clear element owner

Use:

```txt
k-<cmp>-h<n>
```

Example:

- `k-tab-h1`

Use this only when a structural helper:

- is stable,
- is shared,
- and cannot be cleanly owned by one schema element.

This should be rare.

If the helper can be reasonably treated as belonging to `e1`, `e2`, `e3`, and so on, do not use
`h<n>`. Use an element-derived name instead.

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
k-<cmp>-h<n>-<variant>
```

Example:

- `k-tab-h1-a`

Use this only when:

- the helper has no clear schema-element owner,
- and it still needs to be isolated to one variant.

### 11. Component runtime state

Use:

```txt
k-<cmp>-<state>
```

Example:

- `k-tab-m`

Use this only for runtime-controlled structural states that:

- are applied at component root scope,
- gate optional structural behavior,
- and do not belong to one schema element.

Current canonical state suffixes:

- `m` = motion

Important:

- `k-<cmp>-m` is a runtime state gate, not an element class,
- it exists to activate motion-specific structural CSS only when motion runtime is actually active,
- do not use this shape for ordinary element styling or variant ownership.

## Selector scoping rules

Prefer selectors that:

- are scoped by component,
- are scoped by variant only when needed,
- and are no deeper than necessary.

Good:

- `.k-tab-e2-a`
- `.k-tab-e2a-a`
- `.k-tab-h1-a`
- `.k-tab-m .k-tab-e5-b`

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

Because the naming system is intentionally compact, comments are mandatory for structural Sass.

The preferred format is:

- one block comment above each element section,
- then short comments only for modifiers, states, or nested special cases.

Format:

```scss
/* element: tab */
.k-tab-e2-b {
  ...

  /* selected state rises above sibling tabs */
  &[aria-selected='true'] {
    ...
  }
}

/* element: indicator / selected shell */
.k-tab-e5-b {
  ...

  /* modifier `j`: disables transition in static mode */
  &.k-tab-e5j-b {
    ...
  }
}
```

Rules:

- write the canonical element name in the block comment,
- do not repeat the selector name in the comment,
- keep comments structural, not visual,
- explain role, not token values,
- keep nested comments short,
- describe modifiers and states only where they appear,
- if a derived selector clearly belongs to one element, open the Sass block at the base element and
  nest the derived selector inside it,
- if a block is not tied to one schema element, use a short structural description instead of an element label.

Preferred:

```scss
.k-tab-e2 {
  /* derived content wrapper keeps the measured slot above the moving indicator */
  &b-c {
    ...
  }
}
```

Avoid when the owner element is obvious:

```scss
.k-tab-e2b-c {
  ...
}
```

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

- use `var(--k-bdr)` to drive `clip-path`,
- use generated shadow variables in `filter: drop-shadow(...)`,
- use runtime platform classes for engine-specific fixes.

Structural CSS should not duplicate the visual values behind those artifacts.

Important:

- when a canonical emitted variable already exists, structural CSS must consume that variable directly,
- structural CSS must not create local alias variables for emitted schema values just to rename or relay them,
- prefer direct overrides such as `padding-left: 0` or `padding-right: calc(var(--k-pdr) + var(--k-bdr))`
  over ad hoc aliases like `--k-foo-left`,
- create new local CSS variables only when they represent genuinely local structural state that cannot be
  expressed directly and is reused enough to justify the indirection.

## Required custom properties

When structural CSS consumes a custom property that is part of the expected component contract,
prefer bare `var(--k-...)` references without a fallback.

Examples:

- prefer `width: var(--k-tab-w)` over `width: var(--k-tab-w, 0px)`
- prefer `padding-right: calc(var(--k-pdr) + var(--k-bdr))` over
  `padding-right: calc(var(--k-pdr, 0px) + var(--k-bdr, 12px))`

Why:

- a missing variable should surface as an obvious structural defect during development,
- that visible defect is useful evidence that the variable was not emitted, not scoped, or not wired correctly,
- a local fallback at the consumption site can hide that contract bug and make diagnosis harder.

Practical rule:

- if the variable is required, do not add a fallback in `var()`,
- if a local default is genuinely intentional, define that custom property at the owning structural scope instead of
  repeating a fallback at each consumption site.

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
