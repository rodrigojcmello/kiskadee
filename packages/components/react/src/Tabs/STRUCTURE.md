# Tabs Structural Layers

## Purpose

This document explains how structural CSS is split inside `Tabs`, especially the boundary between:

- `Tabs.common.scss`
- variant-specific structural files such as `line`, `box`, `dot`, `segmented`, and `bridge`

This file exists because `Tabs.common.scss` is shared by every variant at import time, but not every
variant depends on it in the same way.

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

- `k-tab-e5a-b`
  - `tab` = Tabs component
  - `e5` = indicator / selected shell element
  - `a` = first modifier for `e5`
  - `b` = box variant

- `k-tab-e6b-b`
  - `tab` = Tabs component
  - `e6` = separator element
  - `b` = second modifier for `e6`
  - `b` = box variant

Practical rule:

- the last letter is the variant
- the letter before the last hyphen belongs to the element modifier chain
- for Tabs specifically, `a` always means `bridge`
- for Tabs specifically, `b` always means `box`

## What `Tabs.common.scss` is

`Tabs.common.scss` is the shared structural primitive layer for `Tabs`.

It owns the base shape of shared slots such as:

- `k-tab-e1`
- `k-tab-e2`
- `k-tab-e2a`
- `k-tab-c`
- `k-tab-e3`
- `k-tab-e4`
- `k-tab-e5` and its shared modifiers
- `k-tab-p`

These selectors are the common building blocks that all variants may reuse.

Important:

- `common` does not mean every variant uses every shared selector
- `common` means the file defines structural primitives that are allowed to be shared

## Variants that heavily depend on the common layer

The following variants are built mostly on top of the shared `Tabs.common.scss` model:

- `line`
- `box`
- `dot`
- `segmented`

These variants strongly depend on the shared bar, trigger, content, and indicator structure,
especially the shared `k-tab-e5` indicator model.

## Bridge is an intentional exception

`bridge` imports `Tabs.common.scss`, but only consumes a subset of the shared layer.

In practice, `bridge` still reuses:

- `k-tab-e1` as the shared base bar slot
- `k-tab-e2` and `k-tab-e2a` as the shared trigger base
- `k-tab-c`
- `k-tab-e3`
- `k-tab-e4`
- `k-tab-p`

But `bridge` does not follow the shared indicator and bar structure used by the other variants.

It owns its own structural geometry in `bridge/Tabs.bridge.scss`, including:

- outer shell layering for the bar
- inner scrolling bar
- per-tab wrapper for overlap and shadow projection
- clipped trigger geometry
- lower-curve mode behavior

So the correct mental model is:

- `line`, `box`, `dot`, and `segmented` are primarily "common-first" variants
- `bridge` is a "variant-first" implementation that reuses only selected common primitives

## Structural rule

When changing `Tabs.common.scss`, assume:

- changes may affect every Tabs variant
- but `bridge` may ignore large parts of that shared model

When changing `bridge`, assume:

- its unique geometry belongs in `bridge/Tabs.bridge.scss`
- shared slot primitives should only stay in `Tabs.common.scss` if they are genuinely reusable

## Practical guidance

Use `Tabs.common.scss` for:

- shared slot primitives
- shared trigger base behavior
- shared content-slot behavior
- shared label and icon slot behavior
- shared indicator primitives used by more than one variant

Use variant files for:

- variant-only geometry
- variant-only wrappers
- variant-only overlap, clipping, or stacking rules
- variant-only motion or indicator behavior

## Documentation note

If a future Tabs variant behaves like `bridge` and uses only a small subset of the common layer,
that is acceptable.

The requirement is not that every variant must use the same amount of `common`.

The requirement is that `Tabs.common.scss` stays limited to genuinely shared primitives, and that
variant files stay responsible for their own unique structure.
