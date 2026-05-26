# Structural CSS in Kiskadee

For structural TypeScript/runtime ownership patterns, see `STRUCTURAL-TS.md`.

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
- responsive breakpoint thresholds,
- responsive token substitutions that belong to schema scales,
- intent/emphasis styling,
- visual state styling that already exists in generated artifacts.

Practical rule:

- structural CSS may consume schema-generated values,
- structural CSS must not redefine schema-owned values as hardcoded design tokens.
- if a component needs responsive structural changes, those changes must come from schema-emitted
  classes and variables rather than handwritten viewport breakpoints in structural Sass.

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
- it may be styled in a shared structural file or repeated across branch-local files,
- it must stay genuinely shared across all structural branches for that component.

Practical rule:

- the absence of a component-level shared Sass file does not forbid unsuffixed `e<n>` selectors,
- but their ownership must still be intentionally shared across branches rather than inherited by
  accident from copy-pasted rules.

### 5. Shared element modifier

Use:

```txt
k-<cmp>-e<n><a-z>
```

Examples:

- `k-tab-e2a`
- `k-tab-e5b`

Use this when a structural modifier clearly belongs to one schema element.

This includes actual modifiers of that element.

Example:

- if a distributed-width modifier is the first modifier on the bar element, prefer `e1a`
- if a selected-state modifier belongs to the indicator element, prefer `e5a`

Rules:

- use one letter only,
- start at `a` and continue in local alphabetical order without gaps for that modifier family,
- assign letters in local alphabetical order,
- keep this shape restricted to common structural CSS,
- use this shape for modifiers, not for extra DOM layers,
- if the selector is not truly shared, it must be specialized by branch.

### 6. Structural branch letter registry

Structural branch letters are intentionally compact and local to each component family.

A branch letter may represent:

- a public visual `variant`,
- a compound branch such as `variant + mode`,
- or an implementation boundary such as `static + motion`.

The branch letter is a structural CSS boundary. It does not automatically create or imply a public
schema variant, component prop, or generated artifact dimension.

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
- new branches append in alphabetical order.

Some component families need more than one structural branch axis, such as `variant + mode`.

Example:

```txt
TextField
    a = floating / notched
    b = standard / outline
    c = floating / inside
    d = standard / underline
    e = standard / borderless
```

In those cases:

- the trailing letter still represents one concrete structural branch,
- the branch may be defined by a compound registry entry rather than by `variant` alone,
- the registry must document every axis needed to resolve that branch,
- structural selectors continue to use the same suffix position even when the registry entry maps to
  `variant + mode`.

Runtime model can also be a structural branch axis when it changes DOM ownership, pointer behavior,
or the animation engine enough that shared selectors would need to undo each other.

Example:

```txt
Switch
    a = static
    b = motion
```

In this case:

- `static` and `motion` are implementation paths, not public schema variants,
- `Switch` and `SwitchMotion` may share the semantic component contract while using different
  structural branches,
- branch-specific selectors such as `k-swt-e3-a` and `k-swt-e3-b` are preferred over shared element
  selectors plus root gates when the two paths should not cascade into each other,
- duplicated structural CSS is acceptable when it keeps the branch boundary explicit.

### 7. Branch-specialized element

Use:

```txt
k-<cmp>-e<n>-<branch>
```

Example:

- `k-tab-e2-a`

Use this when a shared schema element needs a selector that is safely restricted to one structural
branch.

If a component uses a compound branch registry such as `variant + mode`, the trailing suffix still
uses the concrete branch letter selected by that registry.

This is the preferred base for branch-owned structural rules.

This shape is preferred over root-level branch scoping such as:

- `.k-tab-a .k-tab-e2`

because it keeps the selector flatter and makes the element ownership explicit.

### 8. Branch-specialized element modifier

Use:

```txt
k-<cmp>-e<n><a-z>-<branch>
```

Examples:

- `k-tab-e2a-a`
- `k-tab-e2a-b`

This is the preferred pattern when:

- a structural modifier belongs to one schema element,
- and it should only exist for one structural branch,
- or a structural modifier must not leak across branches.

If a component uses a compound branch registry such as `variant + mode`, the trailing suffix still
uses the concrete branch letter selected by that registry.

Rules:

- use one letter only,
- start at `a` and continue in local alphabetical order without gaps for that modifier family,
- keep the modifier letter local to that element family before the trailing branch suffix,
- if the first branch-local modifier on the bar is distributed width, prefer `e1a-<branch>`,
- if a second branch-local modifier is added later to the same element family, continue with `b`,
- do not skip to an arbitrary letter such as `h` unless `a` through the previous letter already
  exist in that same modifier family.

This pattern is preferred over deeper selectors such as:

- `.k-tab-a .k-tab-e2a`

because it reduces selector depth and prevents style leakage across structural branches.

Do not use this shape for extra DOM layers. Use `x<n>` instead.

### 9. Shared extra structural node

Use:

```txt
k-<cmp>-x<n>
k-<cmp>-x<n><a-z>
```

Examples:

- `k-tab-x1`
- `k-tab-x1a`

Use this when an extra structural DOM node:

- is stable,
- is shared,
- and is not itself a schema element.

This should be rare.

If the need is only to modify one schema element, do not use `x<n>`. Use an element modifier
instead.

Do not use semantic helper names such as:

- `k-tab-shell`
- `k-tab-list`
- `k-tab-panel`

Important:

- shared extras must stay truly shared across all branches,
- if an extra has branch-specific behavior or geometry, it must be specialized by branch.
- if a component family no longer keeps shared structural Sass, prefer branch-specialized extras
  by default even when the DOM role is conceptually shared.
- use unsuffixed `x<n>` only when one selector is intentionally reused unchanged across branches.

### 10. Branch-specialized extra structural node

Use:

```txt
k-<cmp>-x<n>-<branch>
k-<cmp>-x<n><a-z>-<branch>
```

Examples:

- `k-tab-x1-a`
- `k-tab-x1a-b`

Use this only when:

- the extra node is not a schema element,
- and it still needs to be isolated to one structural branch,
- or a modifier on that extra node must stay branch-local.

Practical rule:

- when structural Sass is authored only in branch files, `x<n>-<branch>` is usually the correct
  default for extra nodes that need styling.

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
- do not belong to one schema element,
- and are not stable branch ownership.

Current canonical state suffixes:

- `m` = runtime motion gate

Important:

- `k-<cmp>-m` is a runtime state gate, not an element class,
- it exists to activate motion-specific structural CSS only when motion runtime is actually active,
- do not use this shape for ordinary element styling or branch ownership,
- when `static` and `motion` are separate component boundaries, prefer structural branch selectors
  such as `k-<cmp>-e<n>-a` and `k-<cmp>-e<n>-b` over a root motion gate.

## Selector scoping rules

Prefer selectors that:

- are scoped by component,
- are scoped by branch only when needed,
- and are no deeper than necessary.

Good:

- `.k-tab-e2-a`
- `.k-tab-e2a-a`
- `.k-tab-x1-a`
- `.k-tab-m .k-tab-e5-b`

Avoid:

- selectors that repeat the full DOM path,
- selectors that depend on semantic helper names,
- selectors that rely on broad unscoped shared element modifiers when a branch-specific class is
  available,
- root-level branch scoping when a suffix form can express the same ownership.

Bad:

- `.k-tab-a .k-tab-e2`
- `.k-tab-a .k-tab-e2a`
- `.k-tab.k-tab-a > .k-tab-x1-a > .k-tab-e2a > .k-tab-e2`

Practical rule:

- prefer the smallest selector that still protects the component and variant boundary.
- prefer selectors that can be read linearly without mentally reconstructing the final class name.

## Selector formatting

Prefer explicit selectors in structural Sass.

Good:

- `.k-tab-e2-a.k-tab-e2b`
- `.k-tab-e2-a[aria-selected='true']`
- `.k-tab-e5-d.k-tab-e5c-d`
- `.k-tab-e2-a { &.k-tab-e2b { ... } }`
- `.k-tab-e2-a { &[aria-selected='true'] { ... } }`
- `.k-tab-e1a-a { > .k-tab-x2-a { ... } }`
- `.k-tab-m { &.k-tab-e1-b { ... } }`

Avoid when readability is worse:

- `&-a`
- `&a-b`
- `.k-tab-e5 { &-b { ... } }`
- `.k-tab-e1 { &a-a { ... } }`

Exception:

- a shared scope gate such as `.k-tab-m` may wrap related rules once,
- inside that block, keep the inner selector explicit relative to the scope gate.

Practical rule:

- keep nesting when it reuses one explicit base selector and the resulting selector can still be
  read linearly,
- do not flatten everything by default if the nested form is clearer,
- only nest when the resulting selector is intentionally a descendant, state, or compound of that
  explicit base selector,
- if a selector is meant to remain standalone, keep it standalone instead of moving it into another
  block and accidentally changing the match.

Good:

```scss
.k-tab-m {
  .k-tab-e5-b {
    ...
  }

  .k-tab-e2-b[aria-selected='true'] {
    ...
  }
}
```

Avoid:

```scss
.k-tab-m {
  .k-tab-e5 {
    &-b {
      ...
    }
  }

  .k-tab-e2-b {
    &[aria-selected='true'] {
      ...
    }
  }
}
```

Also avoid:

```scss
.k-tab-e6-b {
  &.k-tab-e6a-b {
    ...
  }
}
```

when `k-tab-e6a-b` is emitted and matched as a standalone class rather than as a compound selector.

## Structural comments

Because the naming system is intentionally compact, comments are mandatory for structural Sass.

The preferred format is:

- one block comment above each structural selector section,
- comments for complex descendant selectors, state selectors, and support-gated selectors as well,
- a two-line comment format that identifies ownership first and explains the selector shape second.

Format:

```scss
/*
 * element tab / e2
 * Owns the tab shell and its structural width behavior.
 */
.k-tab-e2-b {
  ...
}

/*
 * element tab / e2
 * The selected state rises above sibling tabs.
 */
.k-tab-e2-b[aria-selected='true'] {
  ...
}

/*
 * element indicator / e5
 * Owns the selected shell and indicator geometry.
 */
.k-tab-e5-b {
  ...
}

/*
 * element indicator modifier 'a' / e5a
 * Disables transition in static mode.
 */
.k-tab-e5a-b {
  ...
}
```

Rules:

- every structural selector must have a comment immediately above it,
- the first line must identify the owned target using the structural id,
- for schema elements, use `element <name> / e<n>`,
- for schema element modifiers, use `element <name> modifier '<a>' / e<n><a>`,
- for extra structural elements, use `extra element for e<n> / x<n>`,
- if one extra element primarily supports another extra element, still anchor it to the nearest
  meaningful schema element rather than inventing a semantic helper name,
- the second line must explain the selector purpose or why the selector needs to be this specific,
- for descendant or positional selectors, explain the reason for the path, such as `first-of-type`,
  `last-of-type`, `aria-selected`, or support-gated geometry,
- keep comments structural, not visual,
- explain role, not token values,
- keep the second line short and specific,
- describe modifiers, states, and scoped special cases only where they appear,
- if a modifier clearly belongs to one explicit base selector, nesting is allowed when the nested
  selector still shows the full modifier or state clearly,
- avoid nesting forms that hide the resulting class name behind opaque fragments such as `&-a`,
  `&a-b`, or `&-b`,
- if a shared scope gate such as `.k-tab-m` improves grouping, keep that one outer block and write
  the inner selectors explicitly relative to that scope,
- if nesting would silently turn a standalone emitted class into a compound selector, keep that
  rule outside the parent block,
- if a selector is not tied to one schema element, use the closest structural ownership that makes
  the relationship obvious instead of falling back to a generic label.

Preferred:

```scss
/*
 * element tab / e2
 * Owns the trigger shell and its base structural behavior.
 */
.k-tab-e2-c {
  ...

  /*
   * element tab modifier 'a' / e2a
   * Fixed-width tabs keep the emitted schema width.
   */
  &.k-tab-e2a {
    ...
  }

  /*
   * element tab / e2
   * The selected state rises above sibling tabs.
   */
  &[aria-selected='true'] {
    ...
  }
}
```

Preferred for an extra structural element:

```scss
/*
 * extra element for e2 / x1
 * Groups icon and label into one measured content slot.
 */
.k-tab-x1-c {
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
- shared global motion tokens,
- shared runtime state classes.

Examples:

- use `var(--k-bdr)` to drive `clip-path`,
- use shared motion tokens such as `var(--k-dur-int)` and `var(--k-ease-out)` for structural transitions,
- use generated shadow variables in `filter: drop-shadow(...)`,
- use runtime platform classes for engine-specific fixes.

Structural CSS should not duplicate the visual values behind those artifacts.

Important:

- when a canonical emitted variable already exists, structural CSS must consume that variable directly,
- when a shared framework motion token already exists, structural CSS should consume that token
  instead of hardcoding a new duration or easing value,
- structural CSS must not create local alias variables for emitted schema values just to rename or relay them,
- prefer direct overrides such as `padding-left: 0` or `padding-right: calc(var(--k-pdr) + var(--k-bdr))`
  over ad hoc aliases like `--k-foo-left`,
- create new local CSS variables only when they represent genuinely local structural state that cannot be
  expressed directly and is reused enough to justify the indirection.
- do not handwrite responsive `@media` blocks with hardcoded viewport thresholds in structural Sass
  when that behavior belongs to schema-emitted scales.

This includes structural motion plumbing such as:

- `transition-duration: var(--k-dur-int)`
- `transition-timing-function: var(--k-ease-out)`

These shared motion tokens are currently defined in the framework root stylesheet:

- `packages/components/react/src/styles/style.kiskadee.scss`

Use these as shared framework motion contracts, not as a signal that arbitrary global variables are
implicitly approved for structural use.

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
- `--k-txf-rbt`
- `--k-txf-ris`
- `--k-txf-riw`
- `--k-txf-rts`
- `--k-txf-rth`

For compact purpose suffixes, prefer short structural abbreviations that stay understandable in the
owning branch.

Example:

- `--k-txf-rts` = `textField` / `rest text size`
- `--k-txf-rth` = `textField` / `rest text height`
- `--k-txf-rbt` = `textField` / `rest block top`
- `--k-txf-ris` = `textField` / `rest inline start`
- `--k-txf-riw` = `textField` / `rest inline width`

Do not use runtime structural variables to relay schema tokens that already exist as emitted variables.

## Shared vs branch-specific structure

For a component family such as Tabs:

- shared structure stays in shared files,
- branch-specific structure stays in branch files,
- branch letters define the boundary between those layers.

Practical rule:

- if the rule applies to every structural branch, keep it shared,
- if the rule exists because one branch has unique geometry, DOM, runtime, or pointer needs, keep it
  branch-specific.

## Normative direction

This document defines the desired naming standard.

If existing structural classes do not follow this grammar, the correct long-term direction is to
refactor them to the standard instead of preserving ad hoc naming.
