# Tabs Structural Layers

## Purpose

This document explains how structural CSS is organized inside `Tabs`.

Current rule:

- there is no `Tabs.common.scss`
- each variant owns its structural CSS inside its own `.scss` file
- each variant also owns its runtime structural descriptor in its own `.structural.ts` file
- shared runtime slot names such as `k-tab-e1` and `k-tab-e2` still exist, but their layout rules now
  live in the variant files

## Variant letter registry

Tabs structural CSS uses the following local variant letters:

- `a` = bridge
- `b` = box
- `c` = dot
- `d` = line
- `e` = segmented

These letters are local to `Tabs`.

Examples:

- `k-tab-e1-a`
- `k-tab-e5-b`
- `k-tab-e2-d`
- `k-tab-e5a-e`

## How to read the variant suffix

The trailing variant letter in Tabs structural classes is defined by the registry above.

Examples:

- `k-tab-e5-b`
  - `tab` = Tabs component
  - `e5` = indicator / selected shell element
  - `b` = box variant

- `k-tab-e2-a`
  - `tab` = Tabs component
  - `e2` = tab element
  - `a` = bridge variant

- `k-tab-e5-c`
  - `tab` = Tabs component
  - `e5` = indicator / selected shell element
  - `c` = dot variant

- `k-tab-e5a-b`
  - `e5` = indicator / selected shell element
  - `a` = first modifier for `e5`
  - `b` = box variant

- `k-tab-e1a-b`
  - `e1` = bar element
  - `a` = first modifier for `e1`
  - `b` = box variant

- `k-tab-e6b-b`
  - `e6` = separator element
  - `b` = second modifier for `e6`
  - `b` = box variant

Practical rule:

- the last letter is the variant
- the letter before the last hyphen belongs to the element modifier chain
- for Tabs specifically, trailing `a` after the last hyphen always means `bridge`
- for Tabs specifically, trailing `b` after the last hyphen always means `box`
- for Tabs specifically, trailing `c` after the last hyphen always means `dot`
- for Tabs specifically, trailing `d` after the last hyphen always means `line`
- for Tabs specifically, trailing `e` after the last hyphen always means `segmented`

## Current file ownership

Structural CSS is now fully local to each variant:

- `line/Tabs.line.scss`
- `dot/Tabs.dot.scss`
- `box/Tabs.box.scss`
- `segmented/Tabs.segmented.scss`
- `bridge/Tabs.bridge.scss`

Runtime structural descriptors are also local to each variant:

- `line/Tabs.line.structural.ts`
- `dot/Tabs.dot.structural.ts`
- `box/Tabs.box.structural.ts`
- `segmented/Tabs.segmented.structural.ts`
- `bridge/Tabs.bridge.structural.ts`

Each file is responsible for its own:

- bar geometry
- trigger layout
- width-mode behavior
- label and icon containment
- indicator shell
- separators, when the variant has them
- extra structural nodes, when the variant needs them
- panel wrapper, when the variant needs local layering

## Shared runtime classes still exist

The runtime still emits shared semantic slot classes such as:

- `k-tab-x1`

Currently `k-tab-x1` remains shared because indicator content measurement still queries that wrapper
across variants. The remaining structural ownership stays variant-local.

In practice:

- the runtime keeps one shared measurement hook where it is still useful
- the structural ownership lives in the variant-local Sass files
- the runtime-side structural lookup data also lives with each variant descriptor
- variant-owned modifiers such as distributed bar width use the same trailing variant suffix

## Why Tabs no longer has a common structural file

`Tabs.common.scss` started as a shared primitive layer, but the variants no longer shared enough
truly universal layout behavior.

The main failure mode was this:

- a rule added to `common` looked generic
- but it actually matched only some variants
- another variant then had to override that shared rule

That made the architecture harder to reason about.

Current preference:

- if a structural rule is not genuinely universal, keep it in the variant file
- duplication across variants is acceptable when it prevents cross-variant leakage

## Practical guidance

When changing Tabs structural CSS:

- start in the active variant file
- only duplicate behavior into another variant if that variant truly needs the same structure
- do not recreate a shared Tabs structural layer unless the behavior is universal enough to stay
  stable across every variant

When adding new extra structural nodes:

- keep `e*` for schema elements and their modifiers
- use `x*` for extra DOM layers that are not schema elements
- attach the variant suffix at the end
- keep the numbering stable across the Tabs family when the same extra role repeats

## Mental model

Tabs now follows this model:

- shared runtime contract
- variant-local structural Sass

That means layout bugs should usually be fixed in the active variant file, not in a shared Tabs
stylesheet.
