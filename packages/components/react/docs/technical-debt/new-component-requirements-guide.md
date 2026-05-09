# New Component Requirements Guide

Status: technical debt / missing documentation.

## Context

`@kiskadee/react-components` now has multiple styled component families with different histories:

- `Button`, which started from an older direct-element schema shape;
- `Tabs`, which is variant-driven;
- `TextField`, which uses variant/mode topology and substantial structural runtime behavior;
- `Switch`, which composes headless behavior with generated class maps and structural Sass.

The package has several durable rules spread across repository docs, package scripts, component
source, and prior implementation work. Examples include:

- public exports must stay stable from `src/index.ts`;
- structural Sass must follow `STRUCTURAL-CSS.md`;
- `*.structural.scss` files are source and compile to `*.structural.css`;
- runtime components should consume generated classes and CSS variables instead of inventing token
  values;
- generated artifacts come from schema/web-builder, while React components compose those artifacts;
- validation should match the blast radius and avoid unrelated test churn.

These rules are real, but they are not yet collected into a component-authoring guide for this
package.

## Technical Debt

There is no single documentation entry that tells a contributor or AI agent how to create a new
styled React component in `packages/components/react`.

That makes new component work more fragile:

- each new component has to rediscover package expectations from existing code;
- structural class naming can drift from the repo-wide grammar;
- public props and slot names can be chosen before the schema/headless ownership boundary is clear;
- generated class-map consumption can be implemented inconsistently;
- Sass build expectations can be missed until package build time;
- showcase validation can start too late, after an API shape has already been exposed.

The lack of a guide is especially risky for component families that need both headless behavior and
schema-generated visuals, such as future `Checkbox`, `Radio`, `Slider`, or `Select` variants.

## Desired Documentation

Create a package-level guide for adding styled React components.

Suggested location:

```txt
packages/components/react/docs/definitions/new-component-requirements.md
```

The guide should be practical and checklist-oriented. It should explain the expected sequence, the
required decisions, and the package conventions that must be followed before a new component is
considered ready.

## Proposed Sections

### Component Scope

Document the first decision points:

- whether the component belongs in `@kiskadee/react-components`;
- whether it needs a headless primitive first;
- whether it depends on schema/web-builder support before React work starts;
- which schema topology it consumes: direct elements, variant elements, or variant/mode elements;
- which slots are required for V1 and which slots are intentionally optional.

### Public API Requirements

Define expectations for styled component props:

- semantic state prop names should follow the headless/native vocabulary where possible;
- runtime props should not replace generated design-system values;
- public props should expose real component behavior, not preset-specific workarounds;
- `className` should merge into the root slot without replacing generated classes;
- per-slot `classNames` should remain explicit and typed;
- root IDs, input IDs, labels, and accessibility props must have a clear ownership model.

### Generated Class Consumption

Document how a styled component should consume artifacts:

- resolve the correct component branch from `classesMap`;
- normalize scale keys before reading `s`, `w`, `rr`, `rp`, or `rs` buckets;
- choose intent/emphasis classes from generated color buckets;
- project state through shared activator classes when generated CSS expects them;
- consume generated CSS variables directly in structural CSS when they are part of the contract;
- avoid local token fallbacks that hide missing generated values.

### Structural Sass Requirements

Point authors to `STRUCTURAL-CSS.md` as mandatory preflight and summarize package-local expectations:

- use `*.structural.scss` for structural source files;
- import the compiled `*.structural.css` from the component entry;
- use compact component-scoped structural class names;
- document variant or variant/mode branch letters near the structural CSS;
- keep structural CSS focused on layout, geometry, DOM composition, motion plumbing, and rendering
  workarounds;
- do not encode semantic colors, tokenized spacing, or visual state values in Sass.

### File Layout And Exports

Define the expected file layout for a new component:

```txt
src/<Component>/
  <Component>.tsx
  <Component>.types.ts
  <Component>.class-names.ts
  <Component>.structural.scss
  index.ts
```

Also document when extra runtime files are acceptable and how the package root `src/index.ts`
should export the component and its public types.

### Validation

Define the minimum validation ladder:

- run formatting/checks for touched source files;
- run `pnpm --filter @kiskadee/react-components build` when React component source or structural
  Sass changes;
- run `pnpm --filter @kiskadee/showcase build` when the component is exposed in the showcase;
- run web-builder validation when class-map shape, schema consumption, or generated artifacts are
  involved;
- do not add or modify unit tests unless explicitly requested.

### Showcase Readiness

Define when a component is ready to be shown:

- unchecked/checked or rest/active state coverage where applicable;
- disabled and read-only coverage when the component supports them;
- forced hover/focus/pressed inspection when generated state CSS needs visual confirmation;
- custom label/content scenarios;
- missing-manifest or unsupported-design-system handling when not all presets implement the
  component.

## Boundaries

This guide should not replace:

- `PROJECT-PURPOSE.md` for repository architecture;
- `SCHEMA-BUILD-RUNTIME-RULES.md` for cross-package ownership;
- `STRUCTURAL-CSS.md` for structural Sass grammar;
- component-specific docs for unusual runtime behavior.

The guide should connect those documents to the practical component creation workflow without
duplicating all of their content.

## Triggers

Prioritize this documentation before or during the next new styled component, especially if it is:

- another checkable control such as `Checkbox` or `Radio`;
- a component with native input/form behavior;
- a component with variant/mode topology;
- a component that requires new generated metadata or showcase support;
- a component with structural runtime measurement or motion.

## Expected Outcome

A contributor should be able to open one package-local document and understand:

1. which upstream contracts must exist before starting React work;
2. which files to create;
3. how to name and wire structural CSS;
4. how to consume generated artifacts;
5. how to expose the component publicly;
6. which validations close the task.

This should reduce implementation drift and make future component additions reviewable as a known
workflow instead of a fresh architectural negotiation every time.
