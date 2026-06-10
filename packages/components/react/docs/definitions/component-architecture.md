# React Component Architecture

Status: living definition.

Use this document as the canonical implementation architecture for styled React
components in `@kiskadee/react-components`.

The current reference implementation is `Switch`. `Button` predates this
architecture and should be migrated toward it incrementally; it is not the
reference shape for new components.

This document complements:

- [`new-component-starting-definition.md`](../../../../../docs/definitions/new-component-starting-definition.md)
- [`effect-runtime-strategy.md`](./effect-runtime-strategy.md)
- [`STRUCTURAL-CSS.md`](../../../../../STRUCTURAL-CSS.md)

## Goal

A styled React component should have one stable public component that composes
generated artifacts, structural CSS, optional features, and optional effects.

The default render path must stay cheap. A component should not eagerly load
runtime state, auxiliary DOM, event handlers, animation code, or effect-specific
logic for a feature or effect that is not active for the current artifact and
props.

## Canonical Shape

Prefer this shape for new components:

```txt
src/components/<Component>/
  <Component>.tsx
  <Component>.types.ts
  <Component>.class-names.ts
  <Component>.structural.scss
  hooks/
    use<Component>ArtifactConfig.ts
  effects/
    <effect>/
      <Component><Effect>.loader.ts
      <Component><Effect>.controller.ts
      <Component><Effect>.effect.ts
      <Component><Effect>.structural.scss
  features/
    <feature>/
      <Component><Feature>.feature.tsx
```

Not every component needs every folder. Add an `effects/` or `features/` module
only when there is real optional behavior or optional DOM to isolate.

## Public Component Responsibility

`<Component>.tsx` is the single public render path.

It should:

- compose the headless primitive when one exists;
- resolve generated classes from the current class map;
- read component artifact metadata through `use<Component>ArtifactConfig`;
- normalize public props such as `variant`, `mode`, `intent`, `emphasis`, size,
  radius, and motion before class lookup;
- call optional feature and effect loaders only after the cheap availability gate;
- merge feature and effect class-name patches into the element slots;
- render the final DOM once.

It should not:

- fork the whole component into `ComponentWithEffect` variants for every effect;
- duplicate generated class resolution across alternate component files;
- keep effect-specific runtime hooks in the core path when the effect is absent;
- infer component capability from visual class maps when artifact metadata owns
  the capability.

## Class Name Model

`<Component>.class-names.ts` owns local class-name resolution helpers, defaults,
and typed element keys.

The component should treat generated classes as the visual source of truth and
structural classes as local layout/runtime plumbing. Optional modules should
return class-name patches instead of mutating the core class-name object
in-place.

A class-name patch is a partial update to the component element slots, for
example:

```ts
type ClassNamePatch = Partial<Record<ComponentElementName, string>>;
```

This keeps effects and features composable without forcing the component to
materialize every possible combination.

## Component Artifact Config

`hooks/use<Component>ArtifactConfig.ts` is the component-local bridge to
generated component metadata.

It should expose the artifact decisions the React component needs, such as:

- component options;
- variant or mode options;
- enabled effects;
- global effect configuration when the component consumes a shared effect.

Fallbacks should be explicit and local. The generated class map remains the
source of truth for styling, but artifact metadata owns whether a component
option or effect exists when that metadata is available.

## Features

A feature is optional component functionality that may add DOM, labels, slots,
or composition behavior. Examples include optional control-state text, labels
with special placement rules, or other component-owned visual affordances.

A feature module should own:

- feature-specific DOM;
- feature-specific class-name patches;
- feature-specific prop normalization when it is not part of the public core;
- feature-specific preservation rules.

Feature modules should not become a second component implementation. They plug
into the public component render path.

## Effects

An effect is optional visual or runtime behavior driven by schema/artifact
configuration. Effects may be pure CSS, runtime-only, or mixed.

Use the split below when an effect has meaningful runtime or structural cost:

- `loader`: lazy import gate and cached module access.
- `controller`: runtime hooks, refs, state machines, event handlers, and cleanup.
- `effect`: static resolution from artifact/config/props into class-name patches
  or controller input.
- `structural.scss`: component-local bridge only.

Pure CSS effects do not need a loader or controller if generated classes are
sufficient.

## Shared Effect Profiles

Reusable effects should be designed as shared profiles before they become
component-specific implementations.

For example, `activationFeedback` should be treated as a shared effect with
profiles such as an overflow-static profile. A component adapter should only
identify the target element and pass the profile inputs. The shared profile
should own the generic runtime hook, state machine, CSS variable contract, and
profile-level structural CSS.

This avoids creating 200 slightly different component runtimes when 200
components need the same effect.

Component-local effect CSS is still valid when it maps the shared profile to a
component slot, adapts local geometry, or applies a component-specific emphasis
override. It should not duplicate the generic effect host, pseudo-element, state
machine classes, or CSS variable contract.

## CSS Ownership

Structural Sass is not a token source.

Component structural CSS should own:

- DOM layout;
- geometry plumbing;
- slot positioning;
- component-specific rendering workarounds;
- local bridges from generated variables to DOM structure.

Shared effect structural CSS should own:

- profile host classes;
- profile pseudo-elements or auxiliary DOM classes;
- profile state classes;
- shared CSS variable names;
- reusable interaction rendering.

Generated CSS and token artifacts own semantic color, state, typography, radius,
spacing, and effect token values. Local Sass may hardcode a value only when the
component has an explicit local design decision and the decision is documented.

## Lazy Loading And Runtime Cost

Lazy loading should be scoped to runtime cost, not to every visual option.

Use lazy modules when an effect or feature adds:

- state machines;
- gesture or pointer coordination;
- measurement;
- animation runtime code;
- auxiliary DOM that is absent from the core path;
- non-trivial event handling.

Do not lazy-load a whole alternate component just to change colors, borders,
radius, or generated classes. Those should remain artifact-driven class
resolution or small class-name patches.

## Button Effect Runtime Note

`Button` follows this architecture for its main runtime shape:

- one public `Button.tsx` render path;
- `Button.class-names.ts`;
- `hooks/useButtonArtifactConfig.ts`;
- `hooks/useButtonBase.ts`;
- `effects/activation-feedback`.

`useButtonArtifactConfig` is the local bridge for generated Button classes and
Button-relevant global decisions. Button internals should consume its `options`
and `globalEffects` instead of reading the raw Kiskadee global context directly.

Button consumes `activationFeedback` directly. Local geometry, target-element,
or tone-selection behavior belongs in the Button activation-feedback controller
and effect module, not in a second public effect name.

`useButtonFeedbackEffect` from `ButtonFeedback.loader.ts` remains the lazy
boundary for effect CSS and class-name patching. `Button.tsx` passes
activation-feedback availability, while the effect package owns the final
class-name patch through `ButtonFeedback.effect.ts`. `Button.tsx` should not
call methods from loaded modules directly.

## New Component Checklist

Before implementing a new styled component, define:

- the headless primitive boundary;
- the canonical element map;
- the public prop surface;
- the component artifact options;
- the effect list and which effects are pure CSS versus runtime effects;
- the feature list and which features add optional DOM;
- the generated class consumption path;
- the structural CSS class naming plan;
- the lowest-cost core render path;
- the lazy-loading gates for optional runtime behavior.

If this checklist forces a component to create multiple full render variants,
revisit the design before implementation. The preferred model is one public
component with composable feature and effect modules.
