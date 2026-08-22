---
name: kiskadee-architecture
description: Architecture specialist for the Kiskadee monorepo. Use when tasks involve package boundaries, token taxonomy decisions (palettes/scales/decorations/effects), web-builder generation flow, headless React composition patterns, or preserving consistency across core, presets, runtime, components, and showcase.
---

# Kiskadee Architecture Skill

Use this skill to make architecture decisions and implementation plans that stay consistent with
Kiskadee's package responsibilities.

## Primary sources

Read only what the task needs, in this order:

1. `../../docs/definitions/project-governance.md` for project authority and handoffs
2. `../../PROJECT-PURPOSE.md` for product context and the architecture overview
3. `references/monorepo-map.md` as a quick routing summary
4. `references/taxonomy-rules.md`
5. `../../SCHEMA-BUILD-RUNTIME-RULES.md`
6. `../../packages/web-builder/docs/definitions/structural-utility-projections.md` when an existing
   token-only scale utility may be conditionally reused by a different structural owner
7. `../../STRUCTURAL-CSS.md` when structural Sass is involved
8. `references/headless-react-patterns.md` for headless React work
9. `references/testing-checklist.md` for validation planning

## Follow this workflow

1. Identify the requested change and classify it:
- token modeling
- preset adaptation
- web build/generation
- runtime behavior
- headless behavior/accessibility
- visual component composition
- native platform adaptation
- resource integration
- showcase integration

2. Determine the correct project authority before proposing code. Identify its allowed inputs,
   published handoff, transformers, and consumers for the concern being changed.

   For repository-governance surfaces, identify the nearest normative definition and verify that
   summaries, bootstrap documents, agent rules, and skills remain derived from it.

3. Validate taxonomy fit using `references/taxonomy-rules.md`.

4. Validate project ownership using `../../docs/definitions/project-governance.md`. Use
   `references/monorepo-map.md` only for quick routing.

5. If the task involves schema/build/runtime placement, validate ownership using
   `../../SCHEMA-BUILD-RUNTIME-RULES.md`.

6. If a generated token-only scale utility may be applied to a wrapper or different structural
   owner, apply
   `../kiskadee-structural-utility-projections/SKILL.md` before proposing a new bucket or runtime
   class reuse.

7. If the task involves React headless components, apply `references/headless-react-patterns.md`.

8. If the task is "new component", apply the rollout checklist below.

9. End with a verification plan from `references/testing-checklist.md`.

## Hard constraints

- Follow project authority and handoffs from `../../docs/definitions/project-governance.md`.
- Treat imports and implementation responsibilities as consumption evidence, not as transfer of
  authority.
- Treat cross-project definitions, root architecture documents, agent instructions, and skills as
  repository-governance surfaces rather than implementation projects. They must preserve the
  precedence defined in `../../docs/definitions/project-governance.md`.
- A downstream adapter may translate platform mechanics but must not re-author upstream semantics.
- Treat schema declaration as necessary but not sufficient for "component done".
- When evaluating architecture tradeoffs, distinguish build-time tooling/runtime-in-Node from
  browser runtime. Prefer simplicity, correctness, and maintainability in build-only code even if
  that means extra dependencies or heavier validation; optimize aggressively only for generated
  artifacts and code that executes in the browser.
- For structural Sass in `packages/components/react`, follow
  [STRUCTURAL-CSS.md](../../STRUCTURAL-CSS.md).
- Put behavioral switches in `components.<name>.options` and keep the corresponding numeric/visual
  values in `components.<name>.elements`.
- If a schema value must exist but only apply when a runtime/component option enables it, do not
  assume the generic artifact scale bucket is enough; verify whether `packages/web-builder` needs a
  dedicated opt-in bucket.
- If an already emitted token-only scale utility must be applied independently to a different
  structural DOM owner, evaluate the Structural Utility Projection Registry before creating another
  dedicated bucket. Keep it distinct from Style Emission Policy.
- Structural utility projections use only
  `element.p[artifactKey][scaleKey] = className`; `p` never stores raw values or semantic metadata.
- The Structural Utility Projection Registry currently projects optional `Button.e6.boxWidth` to
  `Button.e1.p.gd` for connected-group seam-overlap compensation.
- Migration of Tabs fixed width remains a future candidate, not an active `p` consumer.
- For fixed-geometry component types (for example `tabs.segmented`), keep the public type unique
  and prefer narrowing generic schema keys via type-specific Zod/contracts over inventing ad hoc
  schema properties or builder-only exceptions.
- When a fixed-geometry type needs rounded shells/items, keep the radius values in the
  participating schema elements themselves and let structural CSS only flatten the corners that
  must be straight; avoid cross-element radius inheritance or arithmetic in the component layer.

## Comment pattern

When adding explanatory comments above functions, use this exact structure:

```ts
/**
 * What
 *     Briefly describe what the function does.
 * Why
 *     Briefly describe why the function exists or where the runtime depends on it.
 */
```

- Keep comments in English.
- Keep the text visually compact and wrap long lines with the same indentation style.
- Keep each comment line at 100 characters maximum.
- Keep `What` to 3 lines maximum.
- Keep `Why` to 3 lines maximum.
- Prefer one short `What` paragraph and one short `Why` paragraph per function comment.

## Schema and artifact decision rules

Use these rules before proposing a schema or builder change:

1. If the change answers "which behavior/mode is active?", prefer `components.<name>.options`.
2. If the change answers "what is the value for that behavior?", prefer the relevant element
   `scales/decorations/palettes/effects`.
3. If the value is always-on once generated, the generic artifact bucket is usually enough.
4. If the value is conditionally applied to its normal schema element, check whether the existing
   component artifact contract already provides the required opt-in bucket.
5. If one already emitted token-only scale utility must instead be applied to a different structural
   owner, apply the Structural Utility Projection Registry eligibility test.

Current example and future candidate:

- Button divider thickness projects optional `Button.e6.boxWidth` to `Button.e1.p.gd` with
  `retainSource: true`; Button.Group activates it only with an authored divider.
- Tabs fixed width may eventually migrate from its specialized `w` bucket to the generic `p`
  contract.

Do not register the Tabs candidate without a separate implementation and validation task.

## New component rollout checklist

When adding a component (for example `tabs`), validate all layers:

1. Schema/preset layer:
- Add `components.<name>.elements` in the preset schema.
- Confirm taxonomy usage (palettes/scales/decorations/effects).

2. Build artifacts layer:
- Confirm class maps/CSS artifacts generate for the component.
- Confirm any required metadata is published for showcase capability checks.

3. Headless layer:
- Implement behavior + accessibility primitives in `packages/headless`.
- Add unit tests for semantics, keyboard flow, and state transitions.

4. Visual component layer:
- Implement React visual wrapper in `packages/components` consuming class maps + headless API.
- Expose public exports/types.

5. Showcase layer:
- Add route/page and practical examples.
- Validate against manifest-driven capability behavior when applicable.

## Decision output format

When giving architecture recommendations, structure the output as:

1. `Decision`
2. `Why`
3. `Where` (exact package/path)
4. `Impact`
5. `Validation`

## Reference files

- `../../PROJECT-PURPOSE.md`
- `../../docs/definitions/project-governance.md`
- `../../SCHEMA-BUILD-RUNTIME-RULES.md`
- `../../STRUCTURAL-CSS.md`
- `references/monorepo-map.md`
- `references/taxonomy-rules.md`
- `references/headless-react-patterns.md`
- `references/testing-checklist.md`
