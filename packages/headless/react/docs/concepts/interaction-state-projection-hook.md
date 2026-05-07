# Interaction State Projection Hook

Status: active concept.

## Context

`useStateProjection` is the headless runtime helper for projecting real component state into slot
props.

It was introduced during the TextField interaction-state projection pilot, after the interaction
state model started separating:

- native DOM state;
- semantic `data-*` helpers;
- Kiskadee projected state classes;
- selector/effect metaclasses such as `-a` and `-i`.

The hook lives in `packages/headless/react` because the headless package owns the real interaction
state for its primitives. It does not know the Kiskadee CSS vocabulary.

## Ownership

`@kiskadee/react-headless` owns:

- slot names such as `e1`, `e2`, `e3`;
- real component state such as `focused`, `filled`, `disabled`, and `readOnly`;
- projection mechanics into slot props;
- semantic attributes such as `data-focused` or `data-filled`.

`@kiskadee/react-components` owns:

- Kiskadee class vocabulary such as `-f`, `-v`, `-d`, `-r`, `-a`, and `-i`;
- component-specific projection presets;
- styled runtime integration.

## Core Rule

The projection target says where the state is applied, not where the state originates.

For TextField:

- focus originates in the input slot;
- visual state is projected onto the root slot;
- descendants react through generated descendant selectors.

Example:

```txt
real focus source: input/e4
projected state:   root/e1
visual selector:   .k-txf-e1.-f.-a .k-txf-e2
```

## Current Hook Shape

The first implementation intentionally keeps the API small:

- the generic hook requires an explicit default `target`;
- TextField provides `e1` as its component-level default;
- projection targets use slot names;
- one target per rule;
- supports class projection;
- supports attribute projection;
- supports optional activator and interactive class names;
- does not support arrays of targets yet.

Array targets are intentionally deferred because they make it easy to return to the old pattern of
spreading state across dependent children.

## TextField Pilot

TextField is the pilot component for this model.

The headless TextField computes real state and uses `useStateProjection` to keep existing semantic
`data-*` attributes on root and control slots.

The styled TextField supplies a Kiskadee projection preset that puts the visual state on `e1`:

```txt
focused  -> -f
filled   -> -v
disabled -> -d
readOnly -> -r
active state owner -> -a
native hover anchor -> -i
```

The styled runtime no longer owns a duplicate `focused` state.

## Target Defaults

The generic hook must not silently invent a slot name. It requires a default `target` so callers make
slot ownership explicit.

Component integrations can still provide their own defaults. TextField defaults to `e1` because its
root is the stable state scope owner for label, control, input, indicator, and message descendants.

## Non-goals

- Do not import `@kiskadee/core` into the hook.
- Do not hardcode `stateActivator` inside `@kiskadee/react-headless`.
- Do not force native hover through JavaScript unless a component proves that it is necessary.
- Do not add multi-target projection before a concrete component requires it.

## When To Revisit

Revisit the API after TextField Sass, Button, and Tabs have all gone through the projection model.
Those components should tell us whether the generic hook shape is stable or whether each component
needs a narrower preset/helper.
