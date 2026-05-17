# Interaction State Projection Hook

Status: stable TextField pilot; reusable helper with narrow adoption.

## Context

`useStateProjection` is the headless runtime helper for projecting real component state into slot
props.

It was introduced during the TextField interaction-state projection pilot, after the interaction
state model started separating:

- native DOM state;
- semantic `data-*` helpers;
- Kiskadee projected state classes;
- selector/effect metaclasses such as `-a` and `-i`.

The hook lives in `packages/headless/react/src/hooks/state-projection` because the headless package
owns the real interaction state for its primitives. It does not know the Kiskadee CSS vocabulary.

After the first migration pass, TextField is the only component in this plan that adopts the hook.
Button and Tabs were aligned through correct schema references and runtime state ownership, without a
new projection hook call.

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

The current implementation intentionally keeps the API small:

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

## Post-pilot Outcome

The Button and Tabs review did not require broader hook adoption:

- Button already has `e1` as both native interactive element and state scope owner, so native hover
  and pressed selectors can remain native.
- Tabs selected state belongs to the trigger/item scope, so label and icon styles can depend on the
  trigger through generated reference selectors.
- The hook remains a compositional helper for state projection, not a mandatory state layer for every
  component.

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

Revisit the API when another composed component proves a concrete need that TextField does not cover,
such as a second component preset, a state projected outside the default owner, or a real multi-target
case.

Do not broaden the hook just because a component has hover, active, or selected styling. Schema
references plus the correct state scope owner may be enough.
