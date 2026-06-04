# Switch V2 Optimization In-Progress

## Scope

This handoff tracks optimization work for `SwitchV2` without reverting it to the original `Switch`
architecture.

The demand crosses package boundaries:

- `packages/components/react` owns the `SwitchV2` component, effect modules, hooks, structural CSS,
  and runtime behavior.
- `packages/web-builder` owns generated component artifact metadata that can reduce runtime
  inference.
- `packages/showcase` owns consumer validation for interactive and static states.
- `packages/presets` owns component schema authoring rules such as
  `packages/presets/docs/definitions/schema-rules/switch.schema-rules.md`.

## Current Direction

`SwitchV2` should remain the preferred architecture. Its optimization target is a single composable
component whose optional effects are attached internally through small modules and metadata-driven
gates.

The optimization goal is not to split `SwitchV2` into separate render-path components.

## Non-Negotiable Guardrails

- Keep `SwitchV2` as the single public component boundary.
- Keep `motion?: false`; do not introduce a public `SwitchV2Motion`.
- Keep effects as optional internal modules loaded by hooks.
- Do not add `SwitchV2Core`, `SwitchV2WithEffects`, `SwitchV2MotionCore`, or
  `SwitchV2MotionWithEffects`.
- Do not make Showcase choose between `SwitchV2` and another public Switch V2 renderer.
- Do not duplicate the component tree for every effect combination.
- Use generated metadata, pure helpers, CSS cleanup, and narrower runtime work as the optimization
  levers.

## Optimization Checklist

Status legend:

- `[ ]` not started
- `[~]` needs investigation or design detail
- `[x]` completed
- `[!]` rejected / should not be implemented

### Artifact Metadata

- [ ] Keep `effects.thumbSize` as a generic Switch capability in the component artifact.
- [ ] Do not add per-scale `effectAvailability` for `thumbSize` when schema values can express the
  visual intent directly.
- [ ] Let `SwitchV2` use artifact metadata to decide whether component-level effects such as
  `thumbSize` and `activationFeedback` exist.
- [ ] Keep fallback behavior for older artifacts that do not include the richer metadata.
- [!] Do not add Switch motion geometry to schema or component artifacts now. See
  `docs/rejected/switch-v2-motion-geometry-artifact.md`.

### Schema Rules

- [x] Document the Switch schema rule ledger at
  `packages/presets/docs/definitions/schema-rules/switch.schema-rules.md`.
- [x] Record that `thumbSize` per-scale behavior is schema-owned.
- [x] Record that a scale can neutralize `thumbSize` by repeating the normal thumb size in
  `effects.thumbSize.rest`.
- [!] Do not introduce runtime scale gates just to disable `thumbSize` for very small Switch sizes.

### Hook Shape

- [ ] Keep `useSwitchV2ArtifactConfig` focused on artifact/config resolution.
- [ ] Return booleans and metadata from `useSwitchV2ArtifactConfig`; avoid loading effect modules
  inside the artifact hook.
- [ ] Let `SwitchV2` activate `useSwitchV2MotionEffect`, `useSwitchV2ThumbSizeEffect`, and
  `useSwitchV2ActivationFeedbackEffect` from one component body.

### Motion Runtime

- [x] Preserve runtime DOM measurement for motion geometry.
- [x] Coalesce `ResizeObserver` and `window.resize` geometry resyncs through `requestAnimationFrame`
  so resize bursts do not recalculate geometry more than once per frame.
- [x] Keep the motion controller internal to `SwitchV2`; do not create a separate public motion
  component.
- [x] Continue using the existing `activationMotion` contract for thumb animation behavior instead
  of adding another motion-speed API.

### Class Names

- [ ] Extract pure `resolveSwitchV2ClassNames` and `mergeSwitchV2ClassNames` helpers only if this
  reduces duplication or makes effect composition clearer.
- [ ] Cache merged component class maps by cache key so repeated Switch instances do not recompute
  the same core+palette merge.
- [ ] Avoid using class-name presence as the primary way to infer semantic effect availability when
  artifact metadata can provide that information directly.

### CSS And Structural Runtime

- [ ] Remove permanent `will-change` from static paths unless a measured performance issue proves it
  is needed.
- [ ] Avoid redundant `k-trn` classes on internal effect layers when structural CSS already owns the
  transition.
- [ ] Keep `x5` as the optional internal visual layer for `thumbSize`; do not replace the `e3`
  carrier.
- [ ] Keep structural selectors local to `SwitchV2` branch names and effect classes.

## Rejected Direction

- [!] Do not split `SwitchV2` into `Core`, `WithEffects`, `Motion`, and `MotionWithEffects`.
- [!] Do not export `SwitchV2Motion`.
- [!] Do not make `SwitchV2` mirror the original v1 render-path matrix.
- [!] Do not use `Suspense` as a switch between separate `SwitchV2` component implementations.

This direction was rejected because it recreates the main architectural problem that `SwitchV2` is
trying to avoid: separate component implementations for each combination of static, motion, and
effect behavior.

## Suggested Execution Order

1. Normalize the artifact contract and fallback behavior.
2. Refactor `useSwitchV2ArtifactConfig` to return metadata without loading effect modules.
3. Move effect activation decisions into the single `SwitchV2` component body.
4. Add class-map merge caching.
5. Apply CSS cleanup for transition and `will-change` behavior.
6. Validate `SwitchV2` in Showcase across motion on/off, thumbSize on/off, state tiles, and at
   least Material 3 plus one design system without Switch metadata.

## Validation Expectations

For implementation work, use the narrowest relevant checks first:

- `pnpm --filter @kiskadee/react-components run build`
- `pnpm --filter @kiskadee/web-builder run build`
- `pnpm --filter @kiskadee/web-builder run sync`
- `pnpm --filter @kiskadee/web-builder run generate`
- `pnpm --filter @kiskadee/showcase build`

Browser validation should confirm:

- `SwitchV2` renders through a single public component.
- Motion enabled and disabled both work through `motion`.
- `thumbSize` can be disabled per instance.
- `activationFeedback` only starts from the intended visual control area.
- No public `SwitchV2Motion` path is introduced.

## Current Status

- This handoff was created after an optimization proposal accidentally moved `SwitchV2` back toward
  the original v1 render-path matrix.
- The current worktree was rolled back by the user before this handoff was created.
- `SwitchV2` now accepts `controlText` again through the single component boundary.
- `controlText` is isolated in `packages/components/react/src/components/SwitchV2/features/control-text`
  so viewport gating, state-text rendering, `e5` class patching, and structural CSS do not live in
  the core `SwitchV2.tsx` body.
- The restored `controlText` structure uses a `k-sw2-x2-a` wrapper to keep state text and the
  rendered control together as one visual flex item, while preserving the current V2 track/thumb
  nesting used by static and motion paths.
- The Showcase `/switch-v2` route passes `On` / `Off` control text to the interactive and state
  examples so the user can validate this before the future v1 removal step.
- Validation passed:
  - `pnpm --filter @kiskadee/react-components run build`
  - `pnpm --filter @kiskadee/showcase build`
