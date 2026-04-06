# Structural TypeScript in Kiskadee

## Purpose

This document defines the TypeScript-side structural pattern used by components with multiple
visual variants.

It complements `STRUCTURAL-CSS.md`.

Use this document when the problem is not CSS geometry itself, but rather:

- how shared runtime code locates structural class names,
- how variant-owned wrappers are described to shared parts,
- how to avoid coupling one variant to the structural names of every other variant.

## Core rule

When structural class metadata is variant-specific, the shared runtime must not own a global
registry containing all variants.

Prefer this model:

- each variant owns its own structural descriptor,
- the variant entrypoint passes that descriptor into the shared factory/runtime,
- shared helpers read only the active descriptor.

Avoid this model:

- one shared runtime file imports a registry that knows the structural class names of every
  variant of the component.

## Why

The per-variant descriptor model improves:

- ownership: the variant is the source of truth for its structural class names,
- isolation: shared runtime stops depending on classes from unrelated variants,
- evolvability: adding or refactoring one variant does not require expanding a global table,
- bundling: a variant entrypoint can bring only the descriptor it actually uses.

The main benefit is architectural. Bundle-size improvement is secondary.

## Descriptor contents

A structural descriptor should contain only structural lookup data.

Good contents:

- structural element class names,
- variant-local modifier class names,
- optional separator state classes,
- optional static-indicator classes,
- optional variant-only structural mode maps.

Bad contents:

- design tokens,
- schema values,
- arbitrary runtime behavior,
- business logic,
- DOM measurement logic.

Practical rule:

- descriptors name structure,
- runtime code performs behavior.

## Injection path

Preferred flow:

1. define one descriptor file beside the variant implementation
2. pass that descriptor into the component factory or runtime constructor
3. store the active descriptor in the visual/runtime context
4. shared parts, enhancers, and class resolvers read from that active descriptor

This keeps the dependency direction correct:

- variant -> shared runtime

Instead of:

- shared runtime -> all variants

## File placement

Preferred placement:

- shared structural types/helpers in a component-local file such as `Component.structural.ts`
- one descriptor per variant beside the variant files, such as:
  - `Component.line.structural.ts`
  - `Component.box.structural.ts`
  - `Component.segmented.structural.ts`

The descriptor should stay physically close to the variant that owns it.

## Shared runtime guidance

Shared runtime code may:

- accept a structural descriptor as a parameter,
- place it in context,
- use it to resolve variant-owned structural class names.

Shared runtime code should not:

- import every variant descriptor directly,
- centralize all variant structural names in one global registry,
- use a large conditional tree only to map variant names to structural classes.

## Behavioral branching

Not every variant difference belongs in the descriptor.

Keep real behavior outside the descriptor when the difference is about:

- animation strategy,
- measurement logic,
- variant-only geometry rules,
- control flow.

The descriptor is for data lookup, not for hiding all branching.

## Tabs example

`Tabs` follows this pattern now:

- shared descriptor helpers live in
  `packages/components/react/src/Tabs/Tabs.structural.ts`
- each variant owns its descriptor in its own folder
- `createTabsComponent(...)` receives the descriptor
- the active descriptor is exposed through `TabsVisualContext`
- shared parts and enhancers consume only that active descriptor

This replaces the old model where shared runtime imported one cross-variant registry.

## Review rule

When reviewing a new component or variant:

- if a structural lookup table contains entries for multiple variants,
- and shared runtime imports that whole table,
- treat that as a design smell unless there is a strong reason not to inject the active
  descriptor instead.
